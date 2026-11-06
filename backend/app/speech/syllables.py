"""Text -> expected syllables (pinyin, tone, tone sandhi) and pinyin similarity helpers."""

import re
from dataclasses import dataclass, field

from pypinyin import Style, pinyin

HAN = re.compile(r"[一-鿿]+")

INITIALS = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "r", "z", "c", "s", "y", "w"]
# Initial / final pairs that learners (and speech recognisers) commonly mix up.
CONFUSABLE_INITIALS = [{"zh", "z"}, {"ch", "c"}, {"sh", "s"}, {"n", "l"}, {"r", "l"}, {"j", "q"}, {"q", "x"}, {"j", "x"}, {"f", "h"}, {"b", "p"}, {"d", "t"}, {"g", "k"}]
CONFUSABLE_FINALS = [{"an", "ang"}, {"en", "eng"}, {"in", "ing"}, {"uan", "uang"}, {"ian", "iang"}, {"o", "uo"}, {"e", "ie"}]


@dataclass
class Syl:
    index: int
    hanzi: str
    pinyin: str  # tone-marked, as printed in textbooks
    base: str  # toneless letters, e.g. "zhou"
    initial: str
    final: str
    tone: int  # dictionary tone 1-4, 0 = neutral
    surface: set[int] = field(default_factory=set)  # tones that may actually be spoken after sandhi
    erhua: bool = False  # a trailing 儿 was merged into this syllable
    word: int = 0  # index of the run of characters the syllable belongs to
    pos: int = 0  # index of the character in the text


def initial_of(base: str) -> str:
    return next((i for i in INITIALS if base.startswith(i)), "")


def split_syllable(tone3: str) -> tuple[str, int]:
    """'zhou1' -> ('zhou', 1); the neutral tone ('me5' or no digit) is 0."""
    m = re.fullmatch(r"([a-zü]+?)([1-5])?", tone3)
    if not m:
        return tone3, 0
    tone = int(m.group(2)) if m.group(2) else 0
    return m.group(1), 0 if tone == 5 else tone


def syllables(text: str) -> list[Syl]:
    """One entry per spoken syllable of the Chinese characters in `text` (punctuation and other scripts are ignored)."""
    out: list[Syl] = []
    for word, m in enumerate(HAN.finditer(text)):
        run = m.group()
        marked = pinyin(run, style=Style.TONE)
        numbered = pinyin(run, style=Style.TONE3, neutral_tone_with_five=True)
        start = len(out)
        for i, (ch, mk, nb) in enumerate(zip(run, marked, numbered)):
            base, tone = split_syllable(nb[0])
            if ch == "儿" and base == "er" and tone == 0 and out:
                out[-1].erhua = True  # 一会儿, 哪儿: spoken as an r-coloured previous syllable
                continue
            ini = initial_of(base)
            out.append(Syl(len(out), ch, mk[0], base, ini, base[len(ini) :], tone, word=word, pos=m.start() + i))
        apply_sandhi(out[start:])
    return out


def apply_sandhi(run: list[Syl]) -> None:
    """Fill `surface` for one run of consecutive characters."""
    for k, s in enumerate(run):
        nxt = run[k + 1].tone if k + 1 < len(run) else None
        s.surface = {s.tone}
        if s.tone == 3 and nxt == 3:
            s.surface = {2, 3}
        elif s.hanzi == "不" and nxt == 4:
            s.surface = {2}
        elif s.hanzi == "一" and nxt is not None and not (k > 0 and run[k - 1].hanzi == "第"):
            s.surface = {2 if nxt == 4 else 4, 1}


def similarity(exp_base: str, got_base: str) -> float:
    """1.0 same syllable, 0.8 a typical confusion, 0.5 shares an initial or final, 0 unrelated."""
    if exp_base == got_base:
        return 1.0
    ei, gi = initial_of(exp_base), initial_of(got_base)
    ef, gf = exp_base[len(ei) :], got_base[len(gi) :]
    same_i = ei == gi or {ei, gi} in CONFUSABLE_INITIALS
    same_f = ef == gf or {ef, gf} in CONFUSABLE_FINALS
    if same_i and same_f:
        return 0.8
    if ei == gi or ef == gf:
        return 0.5
    return 0.0


def readings(ch: str) -> list[tuple[str, int]]:
    """Every (base, tone) reading of one character, the most common first."""
    return [split_syllable(r) for r in pinyin(ch, style=Style.TONE3, neutral_tone_with_five=True, heteronym=True)[0]]


def recognised(text: str) -> list[tuple[str, list[tuple[str, int]]]]:
    """(hanzi, readings) for each Chinese character of a recognised transcript; the first reading is the in-context one."""
    out = []
    for run in HAN.findall(text):
        for ch, nb in zip(run, pinyin(run, style=Style.TONE3, neutral_tone_with_five=True)):
            ctx = split_syllable(nb[0])
            out.append((ch, [ctx] + [r for r in readings(ch) if r != ctx]))
    return out
