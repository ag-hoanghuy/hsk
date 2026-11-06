"""Speaking speed and pauses, measured on the trimmed recordings."""

import numpy as np

from .audio import smooth
from .reference import Track

PAUSE_FRAMES = 30  # 300 ms of silence inside the speech counts as a pause
LONG_PAUSE_FRAMES = 80


def pauses(track: Track) -> list[tuple[float, float]]:
    """(start, length) in seconds of silent stretches strictly inside the speech."""
    db = smooth(track.db, 3)
    peak = float(np.percentile(db, 95))
    floor = float(np.percentile(db, 5))
    thr = max(floor + 6, peak - 32)
    quiet = db < thr
    quiet[:8] = False  # padding at both ends is not a pause
    quiet[-8:] = False
    out = []
    i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if j - i >= PAUSE_FRAMES:
                out.append((i / 100, (j - i) / 100))
            i = j
        else:
            i += 1
    return out


def speed_score(ratio: float) -> float:
    """100 for a natural pace (learners are allowed to be a bit slower than the sample)."""
    if ratio < 0.6:
        return 70.0
    if ratio < 0.8:
        return 85.0 + 15 * (ratio - 0.6) / 0.2
    if ratio <= 1.5:
        return 100.0
    if ratio <= 2.5:
        return 100.0 - 45 * (ratio - 1.5)
    return 40.0


def assess(ref: Track, usr: Track) -> dict:
    ref_p, usr_p = pauses(ref), pauses(usr)
    ratio = usr.n / max(ref.n, 1)
    extra = max(0, len(usr_p) - len(ref_p))
    long_pauses = sum(1 for _, n in usr_p if n * 100 >= LONG_PAUSE_FRAMES) - sum(1 for _, n in ref_p if n * 100 >= LONG_PAUSE_FRAMES)
    penalty = min(40.0, 10.0 * extra + 10.0 * max(0, long_pauses))
    return {
        "score": int(round(max(0.0, min(100.0, speed_score(ratio) - penalty)))),
        "ratio": round(ratio, 2),
        "usr_seconds": round(usr.n / 100, 2),
        "ref_seconds": round(ref.n / 100, 2),
        "pauses": len(usr_p),
        "extra_pauses": extra,
    }
