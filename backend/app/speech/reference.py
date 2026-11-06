"""Analysis of a recording (trimmed to its speech) and the frame range of every syllable in the sample."""

from dataclasses import dataclass

import numpy as np

from .audio import HOP, SR, frame_db, smooth, speech_span
from .prosody import mfcc, pitch_scale, pitch_track
from .syllables import Syl, syllables


@dataclass
class Track:
    """One recording, trimmed to its speech, with the features the scorer needs."""

    y: np.ndarray
    db: np.ndarray
    st: np.ndarray  # pitch in semitones, NaN where unvoiced
    feats: np.ndarray
    start: int  # first frame of the trimmed part in the original recording
    centre: float  # pitch centre / range used to compare speakers
    scale: float

    @property
    def n(self) -> int:
        return len(self.db)


def analyse(y: np.ndarray, pad: int = 6) -> Track | None:
    """Features for the speech part of `y` (with a little padding); None if there is no speech."""
    span = speech_span(frame_db(y))
    if span is None:
        return None
    a, b = max(span[0] - pad, 0), span[1] + pad
    seg = y[a * HOP : (b + 1) * HOP]
    st = pitch_track(seg)
    centre, scale = pitch_scale(st)
    return Track(seg, frame_db(seg), st, mfcc(seg), a, centre, scale)


def boundary_prior(words: list[dict], n: int) -> tuple[list[float], list[int]] | None:
    """Rough times (s) of the n-1 boundaries between syllables from the service's word timings, plus which of
    them are word edges. None when the words do not add up to n syllables."""
    counts = [len(syllables(w["text"])) for w in words]
    if sum(counts) != n:
        return None
    spoken = [(w, c) for w, c in zip(words, counts) if c]
    times: list[float] = []
    edges: list[int] = []
    for wi, (w, c) in enumerate(spoken):
        end = w["start"] + w["dur"]
        times += [w["start"] + w["dur"] * i / c for i in range(1, c)]
        if wi + 1 < len(spoken):
            times.append((end + spoken[wi + 1][0]["start"]) / 2)
            edges.append(len(times) - 1)
    return times, edges


def segment(track: Track, n: int, words: list[dict] | None) -> list[int]:
    """Frame boundaries (n + 1 values, relative to the track) of the n syllables of the sample.

    The service's word timings give the rough boundary positions (they run 50-100 ms early and only
    know words), so they are shifted to the best-fitting offset and then snapped to the nearest energy
    valley. Syllables inside a word are spread evenly before snapping.
    """
    first, last = 0, track.n
    if n <= 1:
        return [first, last]
    energy = smooth(track.db, 3)
    prior = np.linspace(first, last, n + 1)[1:-1]  # fallback: evenly spread
    found = boundary_prior(words, n) if words else None
    if found:
        times, edges = found
        t0 = track.start * HOP / SR
        raw = (np.array(times) - t0) * 100  # frames relative to the track

        def valley_depth(shift: float) -> float:
            idx = np.clip(np.round(raw[edges] + shift * 100).astype(int), 0, track.n - 1)
            return float(np.mean(energy[idx]))

        shifts = np.arange(0.0, 0.16, 0.01)
        best = float(shifts[np.argmin([valley_depth(s) for s in shifts])]) if edges else 0.07
        prior = np.clip(raw + best * 100, first + 3, last - 3)
    bounds = [first]
    for k, p in enumerate(prior, start=1):
        lo = int(max(bounds[-1] + 5, round(p) - 6))
        hi = int(min(last - 5 * (n - k), round(p) + 6))
        if hi < lo:
            bounds.append(lo)
            continue
        cand = np.arange(lo, hi + 1)
        bounds.append(int(cand[np.argmin(energy[cand] + 0.4 * np.abs(cand - p))]))
    bounds.append(last)
    return bounds
