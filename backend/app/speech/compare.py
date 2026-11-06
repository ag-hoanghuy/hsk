"""Frame-level comparison of a learner recording with the sample, summarised per syllable."""

from dataclasses import dataclass

import numpy as np

from .prosody import contour, dtw_path, project
from .reference import Track


@dataclass
class SylMetrics:
    voiced: int  # voiced reference frames in the syllable
    coverage: float  # share of them where the learner is voiced too
    level: float | None  # mean (learner - sample) pitch difference, in "range" units
    shape: float | None  # mean abs difference of the contours after removing each one's mean
    ref_slope: float | None  # sample pitch movement across the syllable (range units, + = rising)
    usr_slope: float | None
    acoustic: float  # mean spectral distance along the warp path (lower = closer)
    usr_frames: tuple[int, int]  # learner frame range matched to the syllable


@dataclass
class Comparison:
    syllables: list[SylMetrics]
    mapping: np.ndarray  # learner frame matched to each reference frame
    path: np.ndarray
    local_cost: np.ndarray


def slope(x: np.ndarray) -> float:
    """Last third minus first third of a contour."""
    k = max(len(x) // 3, 1)
    return float(np.mean(x[-k:]) - np.mean(x[:k]))


def compare(ref: Track, bounds: list[int], usr: Track) -> Comparison:
    path, local = dtw_path(ref.feats, usr.feats)
    mapping = project(path, ref.n)
    out: list[SylMetrics] = []
    for a, b in zip(bounds[:-1], bounds[1:]):
        sel = (path[:, 0] >= a) & (path[:, 0] < b)
        acoustic = float(local[sel].mean()) if sel.any() else 0.0
        c, d = (int(path[sel, 1].min()), int(path[sel, 1].max()) + 1) if sel.any() else (0, 0)
        voiced = int(np.sum(~np.isnan(ref.st[a:b])))
        r = contour(ref.st, a, b, ref.centre, ref.scale)
        u = contour(usr.st, c, d, usr.centre, usr.scale)
        if r is None or u is None:
            out.append(SylMetrics(voiced, 0.0 if u is None else 1.0, None, None, None, None, acoustic, (c, d)))
            continue
        out.append(
            SylMetrics(
                voiced,
                1.0,
                float(np.mean(u - r)),
                float(np.mean(np.abs((u - u.mean()) - (r - r.mean())))),
                slope(r),
                slope(u),
                acoustic,
                (c, d),
            )
        )
    return Comparison(out, mapping, path, local)
