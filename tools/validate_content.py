#!/usr/bin/env python3
"""Validate lesson content under content/: structure, answer consistency and pinyin vs hanzi.

Run (no local Python needed):
    docker run --rm -v "%CD%:/work" -w /work python:3.12-slim sh -c "pip install -q pypinyin && python tools/validate_content.py"

Errors fail the run (exit 1). Warnings need a human look (tone differences that tone sandhi,
neutral tones and 一/不 do not explain, missing meanings, ...).
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

from pypinyin import Style, pinyin

CONTENT = Path(__file__).resolve().parent.parent / "content"
HAN = re.compile(r"[一-鿿]+")
STRIP_ZH = re.compile(r"[\s，。！？、：；“”‘’（）《》【】,.!?:;\"'()\[\]…—\-·~]")
TONE_MARK = {"̄": 1, "́": 2, "̌": 3, "̀": 4}
PAIRS = [("hanzi", "pinyin"), ("example_zh", "example_pinyin"), ("zh", "pinyin"), ("text_zh", "pinyin")]

errors: list[str] = []
warnings: list[str] = []


def err(where: str, msg: str) -> None:
    errors.append(f"{where}: {msg}")


def warn(where: str, msg: str) -> None:
    warnings.append(f"{where}: {msg}")


# ---- pinyin ---------------------------------------------------------------------------------


def letters(text: str) -> list[tuple[str, int]]:
    """Written pinyin -> [(base letter, tone)], ignoring spaces, apostrophes and punctuation."""
    out: list[tuple[str, int]] = []
    for ch in unicodedata.normalize("NFD", text.lower()):
        if ch in TONE_MARK:
            if out:
                out[-1] = (out[-1][0], TONE_MARK[ch])
        elif unicodedata.combining(ch):
            continue  # diaeresis of ü
        elif ch.isalpha():
            out.append((ch, 0))
    return out


Syl = tuple[str, str, list[str]]  # (hanzi, default reading in context, other dictionary readings)


def expected(text: str) -> list[Syl]:
    """One entry per Chinese character; each run is converted separately for context."""
    out: list[Syl] = []
    for run in HAN.findall(text):
        default = pinyin(run, style=Style.TONE)
        for ch, d in zip(run, default):
            every = pinyin(ch, style=Style.TONE, heteronym=True)[0]  # all readings of the single character
            out.append((ch, d[0], [r for r in every if r != d[0]]))
    return out


def tone_of(el: list[tuple[str, int]]) -> int:
    return max((t for _, t in el), default=0)


def compare(exp: list[Syl], written: str, where: str) -> None:
    written = re.sub(r"(^|\s)[AB][:：]\s*", " ", written)
    w = letters(written)
    pos = 0
    for i, (ch, syl, alts) in enumerate(exp):
        if ch == "儿" and letters(syl) and [b for b, _ in letters(syl)] == ["e", "r"] and pos < len(w) and w[pos][0] == "r":
            pos += 1  # erhua is written as a bare "r" (nàr)
            continue
        # Candidate readings whose letters fit the written pinyin here, default reading first.
        fits = []
        for cand in [syl, *alts]:
            el = letters(cand)
            base = [b for b, _ in el]
            seg = w[pos : pos + len(base)]
            if [b for b, _ in seg] == base:
                fits.append((cand, tone_of(el), tone_of(seg), len(base)))
        if not fits:
            rest = "".join(b for b, _ in w[pos : pos + 8])
            err(where, f"'{ch}' (syllable {i + 1}) should be '{syl}' but pinyin has '{rest}…'")
            return
        # Prefer the reading whose tone also matches what was written.
        cand, etone, wtone, n = next((f for f in fits if f[1] == f[2]), fits[0])
        pos += n
        if cand != syl and ch not in "一不":  # 一/不 tone changes are regular sandhi
            warn(where, f"'{ch}' written as {cand}, dictionary default here is {syl} (check the reading)")
        if wtone == etone or ch in "一不" or (wtone == 0 and etone != 0):
            continue
        next_tone = tone_of(letters(exp[i + 1][1])) if i + 1 < len(exp) else 0
        if etone == 3 and wtone == 2 and next_tone == 3:
            continue  # third-tone sandhi
        warn(where, f"tone of '{ch}': dictionary says {cand}, pinyin has tone {wtone}")
    if pos != len(w):
        err(where, f"pinyin has extra syllables: '{''.join(b for b, _ in w[pos:pos + 8])}…'")


def check_pair(zh: str, py: str, where: str) -> None:
    zh = re.sub(r"[AB][：:]", "", zh)
    compare(expected(zh), py, where)


# ---- structure helpers ----------------------------------------------------------------------


def norm_zh(s: str) -> str:
    return STRIP_ZH.sub("", s)


def can_build(target: str, words: list[str]) -> bool:
    if not target:
        return not words
    for i, w in enumerate(words):
        if target.startswith(w) and can_build(target[len(w):], words[:i] + words[i + 1:]):
            return True
    return False


def check_choice(q: dict, where: str, field: str = "options") -> None:
    opts = q[field]
    if len(set(opts)) != len(opts):
        err(where, "duplicate options")
    if not 0 <= q["answer"] < len(opts):
        err(where, "answer index out of range")


def check_question(q: dict, where: str, vocab: set[str]) -> None:
    t = q.get("type")
    for key in ("id", "tag", "prompt_vi"):
        if not q.get(key):
            err(where, f"missing {key}")
    tag = q.get("tag", "")
    if tag.startswith("v:") and tag[2:] not in vocab:
        warn(where, f"tag {tag} is not a vocab word of this lesson")
    if t not in ("match",) and not q.get("explanation_vi"):
        warn(where, "no explanation_vi")
    if t in ("choice", "listen_choice", "listen_fill"):
        check_choice(q, where)
    elif t == "order":
        for a in q["answers"]:
            if not can_build(norm_zh(a), [norm_zh(w) for w in q["words"]]):
                err(where, f"answer '{a}' cannot be built from the words")
    elif t == "match":
        zs, vs = [p["zh"] for p in q["pairs"]], [p["vi"] for p in q["pairs"]]
        if len(set(zs)) != len(zs) or len(set(vs)) != len(vs):
            err(where, "duplicate pair side")
    elif t == "fill":
        if "____" not in q["sentence_zh"]:
            err(where, "sentence_zh has no ____ blank")
    elif t == "listen_fill":
        if "____" not in q["sentence_zh"]:
            err(where, "sentence_zh has no ____ blank")
    elif t == "translate_zh_vi":
        if not q.get("keywords"):
            warn(where, "no keywords (only exact answers accepted)")
    elif t not in ("dictation", "translate_vi_zh"):
        err(where, f"unknown question type {t!r}")
    if "audio_text" in q and not HAN.search(q["audio_text"]):
        err(where, "audio_text has no Chinese")


def check_ids(items: list[dict], where: str) -> None:
    ids = [i.get("id") for i in items]
    if len(set(ids)) != len(ids):
        err(where, "duplicate ids")


# ---- lesson ---------------------------------------------------------------------------------


def check_reading(passages: list[dict], where: str, vocab: set[str]) -> None:
    check_ids(passages, where)
    for p in passages:
        pw = f"{where}/{p.get('id')}"
        for pi, para in enumerate(p["paragraphs"]):
            tokens = para["tokens"]
            text = "".join(t[0] for t in tokens)
            exp = expected(text)
            cursor = 0
            for ti, tok in enumerate(tokens):
                tw = f"{pw}/p{pi + 1}/{tok[0]}"
                n = len(HAN.findall(tok[0])) and sum(len(r) for r in HAN.findall(tok[0]))
                if n == 0:
                    if len(tok) > 1:
                        warn(tw, "punctuation token carries extra fields")
                    continue
                if len(tok) < 2:
                    err(tw, "word token has no pinyin")
                    cursor += n
                    continue
                if len(tok) < 3 or not tok[2]:
                    warn(tw, "word token has no meaning")
                compare(exp[cursor : cursor + n], tok[1], tw)
                cursor += n
            if not para.get("vi"):
                err(f"{pw}/p{pi + 1}", "missing Vietnamese translation")
        for q in p.get("questions", []):
            check_question(q, f"{pw}/{q.get('id')}", vocab)
        check_ids(p.get("questions", []), pw)


def check_listening(passages: list[dict], where: str, vocab: set[str]) -> None:
    check_ids(passages, where)
    for p in passages:
        pw = f"{where}/{p.get('id')}"
        check_pair(p["text_zh"], p["pinyin"], pw)
        if not p.get("vi"):
            err(pw, "missing Vietnamese translation")
        if len(p["text_zh"]) > 380:
            err(pw, "text_zh too long for one TTS request (limit 400)")
        for q in p.get("questions", []):
            check_question(q, f"{pw}/{q.get('id')}", vocab)
        check_ids(p.get("questions", []), pw)


def walk_pairs(obj, where: str) -> None:
    if isinstance(obj, dict):
        for zk, pk in PAIRS:
            if isinstance(obj.get(zk), str) and isinstance(obj.get(pk), str) and HAN.search(obj[zk]):
                check_pair(obj[zk], obj[pk], f"{where}/{obj.get('id', zk)}:{zk}")
        for k, v in obj.items():
            if k in ("reading", "listening"):
                continue  # handled with token-level checks
            walk_pairs(v, where)
    elif isinstance(obj, list):
        for v in obj:
            walk_pairs(v, where)


def check_lesson(path: Path, curriculum: dict[tuple[int, int], dict]) -> None:
    where = f"{path.parent.name}/{path.name}"
    data = json.loads(path.read_text(encoding="utf-8"))
    key = (data["level"], data["number"])
    if key not in curriculum:
        err(where, f"HSK{key[0]} lesson {key[1]} is not in curriculum.json")
    c = data["content"]
    vocab = {v["hanzi"] for v in c.get("vocab", [])}
    check_ids(c.get("vocab", []), f"{where}/vocab")
    for v in c.get("vocab", []):
        if not (v.get("meaning_vi") and v.get("example_zh") and v.get("example_vi")):
            err(f"{where}/vocab/{v.get('hanzi')}", "missing meaning/example")
    walk_pairs(c, where)
    for section in ("exercises", "test"):
        items = c.get(section, [])
        check_ids(items, f"{where}/{section}")
        for q in items:
            check_question(q, f"{where}/{section}/{q.get('id')}", vocab)
    grammar_quiz = c.get("quiz", {}).get("grammar", [])
    check_ids(grammar_quiz, f"{where}/quiz")
    for q in grammar_quiz:
        check_question(q, f"{where}/quiz/{q.get('id')}", vocab)
    check_reading(c.get("reading", []), f"{where}/reading", vocab)
    check_listening(c.get("listening", []), f"{where}/listening", vocab)


def main() -> int:
    curriculum_list = json.loads((CONTENT / "curriculum.json").read_text(encoding="utf-8"))
    curriculum = {(i["level"], i["number"]): i for i in curriculum_list}
    if len(curriculum) != len(curriculum_list):
        err("curriculum.json", "duplicate (level, number)")
    for level in (3, 4):
        nums = sorted(n for (lv, n) in curriculum if lv == level)
        if nums != list(range(1, 21)):
            err("curriculum.json", f"HSK{level} lessons are not 1..20: {nums}")

    files = sorted(CONTENT.glob("hsk*/lesson-*.json"))
    for f in files:
        check_lesson(f, curriculum)

    for w in warnings:
        print("WARN ", w)
    for e in errors:
        print("ERROR", e)
    print(f"\n{len(files)} lesson file(s) checked: {len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
