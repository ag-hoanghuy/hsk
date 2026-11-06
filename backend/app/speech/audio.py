"""Decoding/encoding and short-time energy helpers. Everything is 16 kHz mono float32, 10 ms frames."""

import io
from math import gcd
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

SR = 16000
HOP = SR // 100  # 10 ms
WIN = 2 * HOP + HOP // 2  # 25 ms analysis window


def decode(source: bytes | Path | str) -> np.ndarray:
    """Read wav/mp3 bytes or a file into a mono 16 kHz signal."""
    data, fs = sf.read(io.BytesIO(source) if isinstance(source, bytes) else str(source), dtype="float32", always_2d=True)
    y = data.mean(axis=1)
    if fs != SR:
        g = gcd(SR, fs)
        y = resample_poly(y, SR // g, fs // g).astype(np.float32)
    return y


def encode_wav(y: np.ndarray) -> bytes:
    buf = io.BytesIO()
    sf.write(buf, y, SR, format="WAV", subtype="PCM_16")
    return buf.getvalue()


def n_frames(y: np.ndarray) -> int:
    return len(y) // HOP + 1


def frames(y: np.ndarray, win: int = WIN) -> np.ndarray:
    """Overlapping windows centred on i * HOP, shape (n_frames, win)."""
    pad = np.pad(y, (win // 2, win))
    idx = np.arange(n_frames(y))[:, None] * HOP + np.arange(win)[None, :]
    return pad[idx]


def frame_db(y: np.ndarray) -> np.ndarray:
    """Short-time energy in dB per frame."""
    rms = np.sqrt((frames(y) ** 2).mean(axis=1))
    return 20 * np.log10(rms + 1e-5)


def smooth(x: np.ndarray, n: int) -> np.ndarray:
    return np.convolve(np.pad(x, (n // 2, n - 1 - n // 2), mode="edge"), np.ones(n) / n, mode="valid")


def speech_span(db: np.ndarray) -> tuple[int, int] | None:
    """First and last frame (inclusive) that carry speech, or None when it is only noise/silence."""
    floor = max(float(np.percentile(db, 10)), -70.0)
    peak = float(np.percentile(db, 98))
    if peak - floor < 15 or peak < -50:
        return None
    thr = max(floor + 0.2 * (peak - floor), peak - 38)
    loud = np.flatnonzero(smooth(db, 3) > thr)
    if len(loud) < 8:
        return None
    return int(loud[0]), int(loud[-1])
