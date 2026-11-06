import asyncio
import hashlib
import json
import os
from pathlib import Path

import edge_tts

AUDIO_DIR = Path(os.environ.get("AUDIO_DIR", "/audio"))
TTS_DIR = AUDIO_DIR / "tts"
VOICE = "zh-CN-XiaoxiaoNeural"
RATE_NORMAL = "+0%"
RATE_SLOW = "-30%"
MAX_CHARS = 400

_locks: dict[str, asyncio.Lock] = {}


def cache_path(text: str, slow: bool) -> Path:
    rate = RATE_SLOW if slow else RATE_NORMAL
    key = hashlib.sha1(f"{VOICE}|{rate}|{text}".encode("utf-8")).hexdigest()
    return TTS_DIR / f"{key}.mp3"


def words_path(mp3: Path) -> Path:
    return mp3.with_suffix(".words.json")


async def _generate(path: Path, text: str, slow: bool) -> None:
    """Write the mp3 and a sidecar with the word timings the service reports (start/duration in seconds)."""
    rate = RATE_SLOW if slow else RATE_NORMAL
    for attempt in range(3):
        audio = bytearray()
        words: list[dict] = []
        try:
            async for chunk in edge_tts.Communicate(text, VOICE, rate=rate, boundary="WordBoundary").stream():
                if chunk["type"] == "audio":
                    audio += chunk["data"]
                elif chunk["type"] == "WordBoundary":
                    words.append({"text": chunk["text"], "start": chunk["offset"] / 1e7, "dur": chunk["duration"] / 1e7})
            break
        except edge_tts.exceptions.NoAudioReceived:  # the service occasionally answers with nothing; asking again works
            if attempt == 2:
                raise
            await asyncio.sleep(1 + attempt)
    if not audio:
        raise RuntimeError("TTS returned no audio")
    tmp = path.with_suffix(".tmp")
    tmp.write_bytes(bytes(audio))
    words_path(path).write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
    tmp.replace(path)


async def synthesize(text: str, slow: bool = False, with_words: bool = False) -> Path:
    """Return the mp3 for `text`, generating (and caching on disk) on first request.

    `with_words` also guarantees the word-timing sidecar exists (older cache entries are regenerated).
    """
    path = cache_path(text, slow)
    if path.exists() and (not with_words or words_path(path).exists()):
        return path
    TTS_DIR.mkdir(parents=True, exist_ok=True)
    lock = _locks.setdefault(path.name, asyncio.Lock())
    async with lock:
        if not path.exists() or (with_words and not words_path(path).exists()):
            await _generate(path, text, slow)
    return path


def read_words(mp3: Path) -> list[dict]:
    return json.loads(words_path(mp3).read_text(encoding="utf-8"))
