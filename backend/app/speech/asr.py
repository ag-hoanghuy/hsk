"""Offline speech recognition (faster-whisper). Used to hear what the learner actually said and to ask
the model how well the audio fits the expected sentence compared with slightly different pronunciations."""

import logging
import os
import threading
from pathlib import Path

import ctranslate2
import numpy as np
from faster_whisper import WhisperModel
from faster_whisper.audio import pad_or_trim
from faster_whisper.tokenizer import Tokenizer
from pypinyin import Style, pinyin

from .syllables import split_syllable

log = logging.getLogger("speech.asr")

MODEL_DIR = Path(os.environ.get("MODEL_DIR", "/models"))
MODEL_NAME = os.environ.get("WHISPER_MODEL", "small")
# A simplified-Chinese prompt keeps the transcript in simplified characters without telling it the answer.
PROMPT = "以下是普通话的句子。"


class Engine:
    """Loads the model on a background thread at startup so the first recording does not wait for the download."""

    def __init__(self) -> None:
        self.state = "idle"  # idle | loading | ready | error
        self.error: str | None = None
        self.model: WhisperModel | None = None
        self.tok: Tokenizer | None = None
        self.by_pron: dict[tuple[str, int], list[str]] = {}
        self._thread: threading.Thread | None = None
        self._silence: tuple[ctranslate2.StorageView, int] | None = None
        self._ready = threading.Event()
        self._run_lock = threading.Lock()  # one recognition at a time keeps CPU use predictable

    def start(self) -> None:
        if self._thread is None:
            self.state = "loading"
            self._thread = threading.Thread(target=self._load, name="whisper-load", daemon=True)
            self._thread.start()

    def _load(self) -> None:
        try:
            MODEL_DIR.mkdir(parents=True, exist_ok=True)
            threads = max(2, min(8, os.cpu_count() or 4))
            self.model = WhisperModel(MODEL_NAME, device="cpu", compute_type="int8", cpu_threads=threads, download_root=str(MODEL_DIR))
            self.tok = Tokenizer(self.model.hf_tokenizer, self.model.model.is_multilingual, task="transcribe", language="zh")
            self.by_pron = common_characters(self.tok)
            self.state = "ready"
            log.info("speech model %s ready", MODEL_NAME)
        except Exception as exc:  # no internet on first run, disk full, ...
            self.state = "error"
            self.error = f"{type(exc).__name__}: {exc}"
            log.exception("speech model failed to load")
        finally:
            self._ready.set()

    def wait(self, timeout: float | None = None) -> bool:
        """True once the model is usable."""
        self.start()
        self._ready.wait(timeout)
        return self.state == "ready"

    def status(self) -> dict:
        return {"state": self.state, "model": MODEL_NAME, "error": self.error}

    # ---- recognition ---------------------------------------------------------------------------

    def transcribe(self, y: np.ndarray) -> dict:
        assert self.model is not None
        with self._run_lock:
            segs, _ = self.model.transcribe(
                y,
                language="zh",
                beam_size=3,
                temperature=0.0,
                condition_on_previous_text=False,
                initial_prompt=PROMPT,
                vad_filter=False,
                # Without timestamp tokens decoding is faster and the transcript sticks closer to what was
                # said (with them, "大算" came back as the more likely "打算").
                without_timestamps=True,
            )
            segs = list(segs)
        text = "".join(s.text for s in segs).strip()
        return {
            "text": text,
            "avg_logprob": float(np.mean([s.avg_logprob for s in segs])) if segs else None,
            "no_speech": float(max((s.no_speech_prob for s in segs), default=1.0)),
        }

    def encode(self, y: np.ndarray) -> tuple[ctranslate2.StorageView, int]:
        """Encoder output for the recording (first 30 s) and its number of mel frames."""
        assert self.model is not None
        feats = self.model.feature_extractor(y)
        return self.model.encode(pad_or_trim(feats[:, :3000])), min(feats.shape[-1] - 1, 3000)

    def silence(self) -> tuple[ctranslate2.StorageView, int]:
        """Encoder output for three seconds of silence: what the model expects before it has heard anything."""
        if self._silence is None:
            self._silence = self.encode(np.zeros(3 * 16000, dtype=np.float32))
        return self._silence

    def log_likelihoods(self, enc: ctranslate2.StorageView, frames: int, texts: list[str]) -> list[float]:
        """log P(text | audio) for each candidate text (teacher forced), computed in one batch."""
        assert self.model is not None and self.tok is not None
        toks = [self.tok.encode(t) for t in texts]
        batch = ctranslate2.StorageView.from_array(np.ascontiguousarray(np.repeat(np.array(enc), len(toks), axis=0)))
        with self._run_lock:
            res = self.model.model.align(batch, self.tok.sot_sequence, toks, [frames] * len(toks), median_filter_width=7)
        return [float(np.sum(np.log(np.maximum(np.array(r.text_token_probs), 1e-9)))) for r in res]


def common_characters(tok: Tokenizer) -> dict[tuple[str, int], list[str]]:
    """Frequent Chinese characters by (toneless pinyin, tone). Whisper's vocabulary order roughly follows
    frequency, so single-character tokens give a ready list of everyday characters."""
    table: dict[tuple[str, int], list[str]] = {}
    for i in range(tok.eot):
        s = tok.decode([i])
        if len(s) == 1 and "一" <= s <= "鿿":
            reading = pinyin(s, style=Style.TONE3, neutral_tone_with_five=True)[0][0]
            table.setdefault(split_syllable(reading), []).append(s)
    return table


engine = Engine()
