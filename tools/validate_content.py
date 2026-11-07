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


def count_range(n: int, lo: int, hi: int, where: str, what: str) -> None:
    if not lo <= n <= hi:
        warn(where, f"{what}: {n} (expected {lo}-{hi})")


TEST_TYPES = ["choice", "match", "order", "fill", "listen_choice", "dictation", "translate_vi_zh", "translate_zh_vi"]
REQUIRED = ["objectives", "vocab", "extra_vocab", "grammar", "dialogue", "exercises", "quiz", "test", "reading", "listening", "speaking", "review"]


def check_structure(c: dict, level: int, where: str) -> None:
    """The lesson layout every lesson must follow (see content/_example/README.md)."""
    for key in REQUIRED:
        if not c.get(key):
            err(where, f"missing section {key!r}")
    count_range(len(c.get("objectives", [])), 3, 4, where, "objectives")
    count_range(len(c.get("vocab", [])), 15, 20, where, "core vocab")
    count_range(len(c.get("extra_vocab", [])), 5, 40, where, "extra vocab")
    count_range(len(c.get("grammar", [])), 2, 4, where, "grammar points")
    for g in c.get("grammar", []):
        gw = f"{where}/grammar/{g.get('id')}"
        if len(g.get("examples", [])) < 3:
            warn(gw, f"only {len(g.get('examples', []))} examples (expected 3)")
        if not g.get("mistakes_vi"):
            warn(gw, "no mistakes_vi (common mistakes of Vietnamese learners)")
    count_range(len(c.get("dialogue", {}).get("lines", [])), 8, 10, where, "dialogue lines")
    count_range(len(c.get("exercises", [])), 12, 14, where, "exercises")
    if len(c.get("quiz", {}).get("grammar", [])) != 6:
        warn(where, f"quiz.grammar has {len(c.get('quiz', {}).get('grammar', []))} questions (expected 6)")
    types = [q.get("type") for q in c.get("test", [])]
    for t in TEST_TYPES:
        if types.count(t) != 2:
            err(where, f"test must have 2 questions of type {t}, has {types.count(t)}")
    lo, hi = (80, 150) if level == 3 else (150, 250)
    for p in c.get("reading", []):
        n = sum(len(r) for para in p.get("paragraphs", []) for t in para.get("tokens", []) for r in HAN.findall(t[0]))
        count_range(n, lo, hi, f"{where}/reading/{p.get('id')}", "characters")
        qs = p.get("questions", [])
        count_range(len(qs), 4, 5, f"{where}/reading/{p.get('id')}", "questions")
        if not any(q.get("options") == ["对", "错"] for q in qs):
            warn(f"{where}/reading/{p.get('id')}", "no true/false (对/错) question")
    for p in c.get("listening", []):
        count_range(len(p.get("questions", [])), 3, 4, f"{where}/listening/{p.get('id')}", "questions")
    count_range(len(c.get("speaking", [])), 5, 8, where, "speaking drills")
    check_ids(c.get("speaking", []), f"{where}/speaking")
    for s in c.get("speaking", []):
        if not (s.get("vi") and s.get("tip_vi")):
            err(f"{where}/speaking/{s.get('id')}", "missing vi or tip_vi")
    review = c.get("review", {})
    count_range(len(review.get("remember", [])), 5, 5, where, "review.remember")
    count_range(len(review.get("mistakes", [])), 3, 3, where, "review.mistakes")
    for g in c.get("glossary", []):
        if g.get("kind") not in ("base", "beyond") or not g.get("meaning_vi"):
            err(f"{where}/glossary/{g.get('hanzi')}", "glossary entry needs kind base|beyond and meaning_vi")


# ---- HSK word lists (content/reference) ---------------------------------------------------


class Lists:
    """New-HSK levels (word -> lowest level) from the 2025 exam syllabus (falling back to GF 0025-2021) and old HSK 2.0
    levels, when the reference files exist."""

    def __init__(self) -> None:
        self.new: dict[str, int] = {}
        self.old: dict[str, int] = {}
        self.targets: dict[int, set[str]] = {}  # level -> main spellings whose lowest level is that level
        ref = CONTENT / "reference"
        self.source = "hsk2025_words.json" if (ref / "hsk2025_words.json").exists() else "hsk30_words.json"
        for name, table in ((self.source, self.new), ("hsk20_words.json", self.old)):
            path = ref / name
            if not path.exists():
                continue
            for item in json.loads(path.read_text(encoding="utf-8")):
                for form in [item["hanzi"], *item.get("variants", [])]:
                    form = (form["hanzi"] if isinstance(form, dict) else form).strip()
                    if form and (form not in table or item["level"] < table[form]):
                        table[form] = int(item["level"])
        self.longest = max((len(w) for w in self.new), default=1)
        if (ref / self.source).exists():
            for item in json.loads((ref / self.source).read_text(encoding="utf-8")):
                if self.new.get(item["hanzi"]) == item["level"]:
                    self.targets.setdefault(int(item["level"]), set()).add(item["hanzi"])

    @property
    def available(self) -> bool:
        return bool(self.new)

    def segment(self, text: str, extra: set[str]) -> list[str]:
        """Forward maximum matching over the HSK 3.0 list plus the given words; unknown characters come out one by
        one. A measure word right after a numeral is split off (一个人 = 一 + 个 + 人, not 一 + 个人), and names such
        as 小王 / 老李 / 王老师 are dropped."""
        out: list[str] = []
        for run in HAN.findall(text):
            i = 0
            while i < len(run):
                if run[i] in DIGITS:  # 二十, 一百五十: a number is one token (and not 十分 "very")
                    j = i
                    while j < len(run) and run[j] in DIGITS:
                        j += 1
                    if j - i > 1 or (j < len(run) and run[j] in MEASURES):
                        out.append(run[i:j])
                        i = j
                        continue
                if i > 0 and run[i - 1] in NUMERALS and run[i] in MEASURES:
                    w = run[i : i + 2] if run[i : i + 2] in UNIT_WORDS else run[i]
                    out.append(w)
                    i += len(w)
                    continue
                if run[i] in "小老" and i + 1 < len(run) and run[i + 1] in SURNAMES and run[i : i + 2] not in self.new:
                    i += 2  # 小王, 老李
                    continue
                if run[i] in SURNAMES and any(run.startswith(t, i + 1) for t in TITLES):
                    i += 1  # 王老师, 李经理
                    continue
                n = self._longest(run, i, extra)
                # 不安全 = 不 + 安全, not 不安 + 全: after a function character prefer the longer word that follows
                if n >= 2 and run[i] in FUNCTION_CHARS and 1 + self._longest(run, i + 1, extra) > n:
                    n = 1
                out.append(run[i : i + n])
                i += n
        return out

    def _longest(self, run: str, i: int, extra: set[str]) -> int:
        for n in range(min(max(self.longest, 4), len(run) - i), 0, -1):
            if n == 1 or run[i : i + n] in self.new or run[i : i + n] in extra:
                return n
        return 0


DIGITS = set("零一二三四五六七八九十百千万两")
NUMERALS = DIGITS | set("几半每这那哪")
MEASURES = set("个口本张件条只位次场块双杯碗瓶家岁天年些点分号月")
UNIT_WORDS = {"分钟", "点钟", "个月", "年级"}  # measure + word that do belong together after a number
FUNCTION_CHARS = set("不没很也都就还又再才更最太")
SURNAMES = set("王李张刘陈杨赵黄周吴徐孙马朱胡林郭何高罗郑梁谢宋唐许邓冯韩曹曾彭萧蔡潘田董袁于余叶蒋杜苏魏程吕丁沈任姚卢钟姜崔谭廖范汪陆金石戴贾韦夏邱方侯邹熊孟秦白江薛尹段雷黎史龙陶贺顾毛郝龚邵万钱严武莫孔汤常温康施文牛葛邢安齐乔伍庞颜倪庄聂章鲁岳")
TITLES = ("老师", "先生", "女士", "小姐", "经理", "医生", "阿姨", "叔叔", "大夫", "师傅", "同学", "教授")


def splits_into(word: str, known: set[str]) -> bool:
    """True when `word` can be cut into two or more pieces that are all known words."""
    def ok(s: str, parts: int) -> bool:
        if not s:
            return parts >= 2
        return any(s[:n] in known and ok(s[n:], parts + 1) for n in range(1, len(s) + 1) if parts > 0 or n < len(word))
    return ok(word, 0)


def assumed_known() -> set[str]:
    """Obvious compounds of old HSK 1-2 words (这个, 你们, 早饭 …) that are treated as known instead of taught."""
    path = CONTENT / "plan" / "assumed-known.json"
    return set(json.loads(path.read_text(encoding="utf-8"))["words"]) if path.exists() else set()


def lesson_texts(c: dict) -> list[str]:
    texts = [l["zh"] for l in c.get("dialogue", {}).get("lines", [])]
    texts += [e["zh"] for g in c.get("grammar", []) for e in g.get("examples", [])]
    texts += [v.get("example_zh", "") for v in c.get("vocab", []) + c.get("extra_vocab", [])]
    texts += ["".join(t[0] for para in p.get("paragraphs", []) for t in para.get("tokens", [])) for p in c.get("reading", [])]
    texts += [p.get("text_zh", "") for p in c.get("listening", [])]
    texts += [s.get("zh", "") for s in c.get("speaking", [])]
    return texts


def check_levels(lessons: list[tuple[str, dict]], lists: Lists) -> None:
    """Taught words belong to the lesson's HSK 3.0 level, are taught once, and every word the texts use that the
    learner cannot be expected to know (HSK 3.0 level 1-2 beyond old HSK 1-2, or not taught yet) is in the glossary."""
    taught_at: dict[str, str] = {}
    known: set[str] = {w for w, lv in lists.old.items() if lv <= 2} | assumed_known()
    # Texts may use HSK 3.0 level-1 words freely: every sentence is shown with full pinyin and translation anyway;
    # the glossary is for level-2 words and anything beyond.
    readable = known | {w for w, lv in lists.new.items() if lv == 1}
    # Lessons are written in parallel, so words planned for earlier lessons count as taught even if the file is not there yet.
    plan_path = CONTENT / "plan" / "allocation.json"
    planned: dict[tuple[int, int], set[str]] = {}
    if plan_path.exists():
        for lv, by_num in json.loads(plan_path.read_text(encoding="utf-8")).items():
            for num, words in by_num.items():
                planned[(int(lv), int(num))] = set(words.get("core", [])) | set(words.get("extra", []))
    for where, data in lessons:  # sorted by level, number
        c, level = data["content"], data["level"]
        earlier_plan = set().union(*(w for k, w in planned.items() if k < (level, data["number"]))) if planned else set()
        core = [v["hanzi"] for v in c.get("vocab", [])]
        extra = [v["hanzi"] for v in c.get("extra_vocab", [])]
        words = core + extra
        own_plan = planned.get((level, data["number"]), set())
        for w in words:
            lv = lists.new.get(w)
            if w in own_plan:
                pass  # the allocation decided where this word is taught (e.g. a grammar word taught early)
            elif lv is None:
                warn(where, f"taught word {w} is not in the new-HSK list")
            elif lv == level or (lv <= 2 and w not in known):
                pass  # a word of this level, or a base word the learner does not know yet
            else:
                warn(where, f"taught word {w} is new-HSK level {lv}{' and already known (old HSK 1-2)' if w in known else ''}, lesson is level {level}")
        for w in words:
            if w in taught_at:
                warn(where, f"word {w} is already taught in {taught_at[w]}")
        if planned.get((level, data["number"])) and set(words) != planned[(level, data["number"])]:
            p = planned[(level, data["number"])]
            if set(words) - p:
                warn(where, f"words not in this lesson's allocation: {', '.join(sorted(set(words) - p))}")
            if p - set(words):
                warn(where, f"allocated words not taught: {', '.join(sorted(p - set(words)))}")
        for w in words:
            taught_at.setdefault(w, where)
        glossary = {g["hanzi"] for g in c.get("glossary", [])}
        seen = set(taught_at) | readable | earlier_plan
        missing: dict[str, str] = {}
        usable = seen | glossary
        for text in lesson_texts(c):
            for w in lists.segment(text, usable):
                if w in usable:
                    continue
                lv = lists.new.get(w)
                if lv is None:
                    continue  # names and characters outside the lists
                if splits_into(w, usable):
                    continue  # 难得多 = 难 + 得 + 多, 说的话 = 说 + 的 + 话: the segmenter cannot tell, so do not complain
                missing[w] = "base" if lv <= 2 else "beyond"
        if missing:
            listed = ", ".join(f"{w}({k})" for w, k in sorted(missing.items()))
            warn(where, f"{len(missing)} word(s) used but not taught/known/glossed: {listed}")


def coverage(lessons: list[tuple[str, dict]], lists: Lists) -> list[str]:
    lines = [f"word list: content/reference/{lists.source}"]
    taught_all = {v["hanzi"] for _, d in lessons for v in d["content"].get("vocab", []) + d["content"].get("extra_vocab", [])}
    known = {w for w, lv in lists.old.items() if lv <= 2} | assumed_known()
    groups = [("level 1-2 words not in old HSK 1-2", (lists.targets.get(1, set()) | lists.targets.get(2, set())) - known)]
    groups += [(f"level {lv}", lists.targets.get(lv, set())) for lv in (3, 4)]
    for name, target in groups:
        if target:
            n = len(taught_all & target)
            lines.append(f"new HSK {name}: {n}/{len(target)} words taught ({100 * n // len(target)}%)")
    return lines


def check_lesson(path: Path, curriculum: dict[tuple[int, int], dict]) -> dict:
    where = f"{path.parent.name}/{path.name}"
    data = json.loads(path.read_text(encoding="utf-8"))
    key = (data["level"], data["number"])
    if key not in curriculum:
        err(where, f"HSK{key[0]} lesson {key[1]} is not in curriculum.json")
    c = data["content"]
    check_structure(c, data["level"], where)
    vocab = {v["hanzi"] for v in c.get("vocab", []) + c.get("extra_vocab", [])}
    check_ids(c.get("vocab", []) + c.get("extra_vocab", []), f"{where}/vocab")
    for v in c.get("vocab", []) + c.get("extra_vocab", []):
        if not (v.get("meaning_vi") and v.get("example_zh") and v.get("example_vi") and v.get("pos")):
            err(f"{where}/vocab/{v.get('hanzi')}", "missing pos/meaning/example")
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
    return data


def main() -> int:
    curriculum_list = json.loads((CONTENT / "curriculum.json").read_text(encoding="utf-8"))
    curriculum = {(i["level"], i["number"]): i for i in curriculum_list}
    if len(curriculum) != len(curriculum_list):
        err("curriculum.json", "duplicate (level, number)")
    for level in (3, 4):
        nums = sorted(n for (lv, n) in curriculum if lv == level)
        if nums != list(range(1, 21)):
            err("curriculum.json", f"HSK{level} lessons are not 1..20: {nums}")

    only = [a for a in sys.argv[1:] if not a.startswith("-")]  # e.g. hsk3/lesson-05.json to report on one lesson
    files = sorted(CONTENT.glob("hsk*/lesson-*.json"))
    lessons: list[tuple[str, dict]] = []
    for f in files:
        lessons.append((f"{f.parent.name}/{f.name}", check_lesson(f, curriculum)))
    lessons.sort(key=lambda x: (x[1]["level"], x[1]["number"]))

    lists = Lists()
    if lists.available:
        check_levels(lessons, lists)
    else:
        warnings.append("content/reference word lists not found: HSK level and glossary checks skipped")

    # A lesson may confirm readings it uses on purpose, e.g. "readings_ok": ["只 zhī", "里 li"].
    confirmed = {where: set(d.get("readings_ok", [])) for where, d in lessons}
    reading_warning = re.compile(r"'(.)' written as (\S+),")

    def intended(w: str) -> bool:
        where = next((k for k in confirmed if w.startswith(k)), None)
        m = reading_warning.search(w)
        return bool(where and m and f"{m.group(1)} {m.group(2)}" in confirmed[where])

    warnings[:] = [w for w in warnings if not intended(w)]

    def shown(line: str) -> bool:
        return not only or any(line.startswith(o) for o in only)

    for w in warnings:
        if shown(w):
            print("WARN ", w)
    for e in errors:
        if shown(e):
            print("ERROR", e)
    if lists.available:
        print("\n" + "\n".join(coverage(lessons, lists)))
    n_err = sum(1 for e in errors if shown(e))
    n_warn = sum(1 for w in warnings if shown(w))
    print(f"\n{len(files)} lesson file(s) checked{' (showing ' + ', '.join(only) + ')' if only else ''}: {n_err} error(s), {n_warn} warning(s)")
    return 1 if n_err else 0


if __name__ == "__main__":
    sys.exit(main())
