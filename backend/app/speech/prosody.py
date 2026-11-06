"""Spectral features, pitch tracking and dynamic time warping."""

import numpy as np
import parselmouth
from scipy.fft import dct, rfft
from scipy.signal import medfilt
from scipy.spatial.distance import cdist

from .audio import HOP, SR, WIN, frames, n_frames

N_MELS = 40
N_CEPS = 13
NFFT = 512


def _mel_filterbank() -> np.ndarray:
    def hz_to_mel(f):
        return 2595 * np.log10(1 + f / 700)

    def mel_to_hz(m):
        return 700 * (10 ** (m / 2595) - 1)

    pts = mel_to_hz(np.linspace(hz_to_mel(80), hz_to_mel(7600), N_MELS + 2))
    bins = np.floor((NFFT + 1) * pts / SR).astype(int)
    fb = np.zeros((N_MELS, NFFT // 2 + 1))
    for m in range(1, N_MELS + 1):
        lo, mid, hi = bins[m - 1], bins[m], bins[m + 1]
        for k in range(lo, mid):
            fb[m - 1, k] = (k - lo) / max(mid - lo, 1)
        for k in range(mid, hi):
            fb[m - 1, k] = (hi - k) / max(hi - mid, 1)
    return fb


_FB = _mel_filterbank()
_WINDOW = np.hanning(WIN)


def mfcc(y: np.ndarray) -> np.ndarray:
    """MFCCs (n_frames, N_CEPS) with per-utterance mean/variance normalisation, c0 included."""
    emph = np.append(y[:1], y[1:] - 0.97 * y[:-1])
    spec = np.abs(rfft(frames(emph) * _WINDOW, n=NFFT, axis=1)) ** 2
    ceps = dct(np.log(spec @ _FB.T + 1e-8), type=2, axis=1, norm="ortho")[:, :N_CEPS]
    return (ceps - ceps.mean(axis=0)) / (ceps.std(axis=0) + 1e-6)


# ---- pitch -------------------------------------------------------------------------------------


def pitch_track(y: np.ndarray) -> np.ndarray:
    """Pitch in semitones (re 100 Hz) per 10 ms frame, NaN where unvoiced."""
    snd = parselmouth.Sound(y.astype(np.float64), sampling_frequency=SR)
    pitch = snd.to_pitch_ac(time_step=HOP / SR, pitch_floor=75, pitch_ceiling=500)
    f0 = pitch.selected_array["frequency"]
    idx = np.round(pitch.xs() / (HOP / SR)).astype(int)
    out = np.full(n_frames(y), np.nan)
    ok = (f0 > 0) & (idx >= 0) & (idx < len(out))
    out[idx[ok]] = 12 * np.log2(f0[ok] / 100)
    return clean_pitch(out)


def clean_pitch(st: np.ndarray, min_run: int = 4) -> np.ndarray:
    """Drop tiny voiced islands, undo octave jumps and apply a light median filter."""
    st = st.copy()
    voiced = ~np.isnan(st)
    i = 0
    runs: list[tuple[int, int]] = []
    while i < len(st):
        if voiced[i]:
            j = i
            while j < len(st) and voiced[j]:
                j += 1
            if j - i < min_run:
                st[i:j] = np.nan
            else:
                runs.append((i, j))
            i = j
        else:
            i += 1
    # octave jumps inside and between runs (gap up to 6 frames)
    prev = None
    for a, b in runs:
        seg = st[a:b]
        for k in range(1, len(seg)):
            d = seg[k] - seg[k - 1]
            if abs(d) > 6.5:
                seg[k:] -= 12 * np.round(d / 12)
        if prev is not None and a - prev[1] <= 6:
            d = st[a] - st[prev[1] - 1]
            if abs(d) > 6.5:
                st[a:b] -= 12 * np.round(d / 12)
        prev = (a, b)
    for a, b in runs:
        if b - a >= 5:
            st[a:b] = medfilt(st[a:b], 5)
    return st


def pitch_scale(st: np.ndarray) -> tuple[float, float]:
    """(centre, range) used to put every speaker on the same scale; range is clamped to a plausible 5-12 semitones."""
    v = st[~np.isnan(st)]
    if len(v) < 10:
        return 0.0, 8.0
    p10, p50, p90 = np.percentile(v, [10, 50, 90])
    return float(p50), float(np.clip(p90 - p10, 5.0, 12.0))


def contour(st: np.ndarray, a: int, b: int, centre: float, scale: float, k: int = 10) -> np.ndarray | None:
    """Normalised pitch of frames [a, b) resampled to k points over its voiced extent, or None if too little is voiced."""
    seg = st[max(a, 0) : max(b, 0)]
    idx = np.flatnonzero(~np.isnan(seg))
    if len(idx) < 4:
        return None
    seg = seg[idx[0] : idx[-1] + 1]
    ok = ~np.isnan(seg)
    x = np.arange(len(seg))
    filled = np.interp(x, x[ok], seg[ok])
    return np.interp(np.linspace(0, len(seg) - 1, k), x, (filled - centre) / scale)


# ---- dynamic time warping ----------------------------------------------------------------------


def dtw_path(ref: np.ndarray, usr: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Align two feature sequences (frames x dims). Returns the warp path (ref idx, usr idx) and the per-step local cost."""
    cost = cdist(ref, usr)
    n, m = cost.shape
    acc = np.full((n + 1, m + 1), np.inf)
    acc[0, 0] = 0.0
    back = np.zeros((n, m), dtype=np.int8)
    for i in range(1, n + 1):
        diag = acc[i - 1, :-1] + 2 * cost[i - 1]
        up = acc[i - 1, 1:] + cost[i - 1]
        best = np.minimum(diag, up)
        choice = np.where(diag <= up, 0, 1)
        row = acc[i]
        for j in range(1, m + 1):
            left = row[j - 1] + cost[i - 1, j - 1]
            if left < best[j - 1]:
                row[j] = left
                back[i - 1, j - 1] = 2
            else:
                row[j] = best[j - 1]
                back[i - 1, j - 1] = choice[j - 1]
    i, j = n, m
    path = []
    while i > 0 and j > 0:
        path.append((i - 1, j - 1))
        step = back[i - 1, j - 1]
        if step == 0:
            i, j = i - 1, j - 1
        elif step == 1:
            i -= 1
        else:
            j -= 1
    path.reverse()
    p = np.array(path)
    return p, cost[p[:, 0], p[:, 1]]


def project(path: np.ndarray, n_ref: int) -> np.ndarray:
    """For every ref frame, the (mean) usr frame it is matched with."""
    out = np.zeros(n_ref)
    cnt = np.zeros(n_ref)
    np.add.at(out, path[:, 0], path[:, 1])
    np.add.at(cnt, path[:, 0], 1)
    return out / np.maximum(cnt, 1)
