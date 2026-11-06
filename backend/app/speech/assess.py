"""Assess a recording of a sentence against the expected text.

Three kinds of evidence are combined:
  * what a speech recogniser hears (wrong, missing or extra syllables, and tone swaps it can hear),
  * how well the audio fits the expected sentence compared with the same sentence with one syllable's
    tone changed (the recogniser scores both; this catches tone slips it would otherwise "correct"),
  * speed and pauses.
The pitch/loudness curves are returned for the learner to look at but are not scored.
"""

import numpy as np
from pypinyin import Style, pinyin

from . import audio, fluency
from .asr import engine
from .compare import compare
from .reference import Track, analyse, segment
from .syllables import Syl, initial_of, recognised, similarity, syllables

# A syllable is flagged when another tone fits the audio better than the expected one by more than TONE_MARGIN
# nats, after removing PRIOR_WEIGHT x the same difference measured on silence (the model's liking for common
# characters). Both were picked on synthetic voices: on 59 natural sentences, AUC 0.82, about 40% of tone changes
# caught and ~3% of correct sentences flagged. Lower the margin to catch more at the price of more false alarms.
TONE_MARGIN = 0.0
PRIOR_WEIGHT = 0.5

TONE_VI = {
    0: "thanh nhẹ, đọc ngắn và nhẹ",
    1: "thanh 1, giọng cao và giữ bằng",
    2: "thanh 2, giọng đi lên như khi hỏi “hả?”",
    3: "thanh 3, giọng trầm xuống thấp rồi nhích lên nhẹ",
    4: "thanh 4, giọng từ cao rơi xuống dứt khoát",
}

SOUND_HINTS = {
    frozenset({"zh", "z"}): "zh, ch, sh là âm uốn lưỡi (đầu lưỡi cong lên), còn z, c, s thì đầu lưỡi để thẳng sau răng",
    frozenset({"ch", "c"}): "zh, ch, sh là âm uốn lưỡi (đầu lưỡi cong lên), còn z, c, s thì đầu lưỡi để thẳng sau răng",
    frozenset({"sh", "s"}): "zh, ch, sh là âm uốn lưỡi (đầu lưỡi cong lên), còn z, c, s thì đầu lưỡi để thẳng sau răng",
    frozenset({"n", "l"}): "n bật hơi qua mũi, l để hơi đi hai bên lưỡi",
    frozenset({"j", "q"}): "q bật hơi mạnh hơn j",
    frozenset({"b", "p"}): "p bật hơi mạnh, b không bật hơi",
    frozenset({"d", "t"}): "t bật hơi mạnh, d không bật hơi",
    frozenset({"g", "k"}): "k bật hơi mạnh, g không bật hơi",
    frozenset({"an", "ang"}): "an kết thúc bằng n (đầu lưỡi chạm lợi), ang kết thúc bằng ng (cuống lưỡi)",
    frozenset({"en", "eng"}): "en kết thúc bằng n, eng kết thúc bằng ng",
    frozenset({"in", "ing"}): "in kết thúc bằng n, ing kết thúc bằng ng",
}


class AssessError(Exception):
    """The recording cannot be assessed; the message is shown to the learner."""


# ---- matching what was heard to what was expected -----------------------------------------------


def pair_cost(e: Syl, cand: list[tuple[str, int]]) -> tuple[float, tuple[str, int]]:
    best = (9.0, cand[0])
    for base, tone in cand:
        sim = similarity(e.base, base)
        if sim == 1.0:
            c = 0.0 if (tone == e.tone or tone in e.surface) else 0.4
        else:
            c = {0.8: 0.6, 0.5: 0.9, 0.0: 1.4}[sim]
        if c < best[0]:
            best = (c, (base, tone))
    return best


def align(exp: list[Syl], got: list[tuple[str, str, list[tuple[str, int]]]]) -> tuple[dict[int, int], int]:
    """Edit-distance alignment of expected syllables with recognised ones. Returns {expected idx: recognised idx}
    for the matched pairs and the number of recognised syllables that match nothing."""
    n, m = len(exp), len(got)
    cost = np.zeros((n + 1, m + 1))
    cost[:, 0] = np.arange(n + 1)
    cost[0, :] = np.arange(m + 1)
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            sub = pair_cost(exp[i - 1], got[j - 1][2])[0]
            cost[i, j] = min(cost[i - 1, j - 1] + sub, cost[i - 1, j] + 1.0, cost[i, j - 1] + 1.0)
    i, j = n, m
    pairs: dict[int, int] = {}
    while i > 0 and j > 0:
        sub = pair_cost(exp[i - 1], got[j - 1][2])[0]
        if np.isclose(cost[i, j], cost[i - 1, j - 1] + sub):
            pairs[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif np.isclose(cost[i, j], cost[i - 1, j] + 1.0):
            i -= 1
        else:
            j -= 1
    return pairs, m - len(pairs)


def heard_syllables(text: str, exp: list[Syl]) -> list[tuple[str, str, list[tuple[str, int]]]]:
    """(hanzi, tone-marked pinyin, readings) of each Chinese character in the transcript."""
    chars = recognised(text)
    if any(s.erhua for s in exp):
        chars = [c for c in chars if c[0] != "儿"]
    return [(ch, pinyin(ch, style=Style.TONE)[0][0], rd) for ch, rd in chars]


# ---- tone evidence from the model's likelihoods -------------------------------------------------

# text -> (tone-variant candidates, all candidate texts, their log-likelihood on silence); the silent part never changes
_prior_cache: dict[str, tuple[list[tuple[int, int, str]], list[str], list[float]]] = {}


def tone_margins(text: str, exp: list[Syl], enc, frames: int) -> dict[int, tuple[float, int]]:
    """{syllable idx: (margin, tone)}: how much better the best other tone fits the audio than the expected one."""
    if text not in _prior_cache:
        cands: list[tuple[int, int, str]] = []
        for s in exp:
            if s.tone == 0:
                continue
            for t in (1, 2, 3, 4):
                if t in s.surface or t == s.tone:
                    continue
                chars = engine.by_pron.get((s.base, t))
                if chars:
                    cands.append((s.index, t, text[: s.pos] + chars[0] + text[s.pos + 1 :]))
        texts = [text] + [c[2] for c in cands]
        prior = engine.log_likelihoods(*engine.silence(), texts) if cands else [0.0] * len(texts)
        if len(_prior_cache) > 500:
            _prior_cache.clear()
        _prior_cache[text] = (cands, texts, prior)
    cands, texts, prior = _prior_cache[text]
    if not cands:
        return {}
    ll = engine.log_likelihoods(enc, frames, texts)
    out: dict[int, tuple[float, int]] = {}
    for (idx, t, _), l, p in zip(cands, ll[1:], prior[1:]):
        margin = (l - ll[0]) - PRIOR_WEIGHT * (p - prior[0])
        if idx not in out or margin > out[idx][0]:
            out[idx] = (margin, t)
    return out


# ---- verdicts -----------------------------------------------------------------------------------


def sound_hint(e: Syl, heard_base: str) -> str:
    hi = initial_of(heard_base)
    for pair in ({e.initial, hi}, {e.final, heard_base[len(hi) :]}):
        hint = SOUND_HINTS.get(frozenset(pair))
        if hint:
            return hint
    return ""


def sandhi_note(e: Syl) -> str:
    if e.tone not in e.surface and e.surface:
        t = min(e.surface - {e.tone}) if e.surface - {e.tone} else e.tone
        return f" (ở đây biến điệu nên đọc như thanh {t})"
    return ""


def faint_syllables(comp, bounds: list[int], usr: Track) -> set[int]:
    """Syllables the learner's audio hardly contains: the warp squeezes them into a few frames (the recording ends
    early or skips them) or the matched stretch is near silent. The recogniser tends to fill such gaps in by
    guessing the rest of the sentence, so this is checked on the signal itself."""
    out: set[int] = set()
    loud = float(np.percentile(usr.db, 95))
    for k, m in enumerate(comp.syllables):
        a, b = bounds[k], bounds[k + 1]
        c, d = m.usr_frames
        if b - a >= 8 and (d - c) < 0.25 * (b - a):
            out.add(k)
        elif d > c and float(np.max(usr.db[c:d])) < loud - 30:
            out.add(k)
    return out


def judge(exp: list[Syl], heard: list[tuple[str, str, list[tuple[str, int]]]], margins: dict[int, tuple[float, int]], faint: set[int]):
    pairs, extra = align(exp, heard)
    out = []
    for e in exp:
        j = pairs.get(e.index)
        status, score, note, said = "ok", 100, None, None
        if e.index in faint and j is not None and pair_cost(e, heard[j][2])[0] <= 0.4:
            j = None  # the recogniser "heard" it but the audio is nearly empty there: it filled the gap by guessing
        if j is None:
            status, score = "missing", 0
            note = f"Chưa nghe thấy chữ {e.hanzi} ({e.pinyin}). Có thể bạn đã bỏ qua hoặc đọc quá nhỏ."
        else:
            ch, marked, cand = heard[j]
            cost, (base, tone) = pair_cost(e, cand)
            said = marked
            if cost == 0.0:
                pass
            elif cost == 0.4:
                status, score = "tone", 55
                note = (
                    f"Máy nghe thành {marked} ({ch}), tức là thanh {tone}. Chữ này đọc là {e.pinyin}: "
                    f"{TONE_VI[e.tone]}{sandhi_note(e)}."
                )
            else:
                status, score = "sound", 30 if cost <= 0.6 else 20
                hint = sound_hint(e, base)
                note = f"Máy nghe thành {marked} ({ch}) thay vì {e.pinyin}." + (f" Lưu ý: {hint}." if hint else "")
        m = margins.get(e.index)
        if status == "ok" and m is not None and m[0] > TONE_MARGIN:
            status, score = "tone", 75
            note = (
                f"Thanh của chữ này nghe chưa rõ, gần với thanh {m[1]} hơn. Chữ này đọc là {e.pinyin}: "
                f"{TONE_VI[e.tone]}{sandhi_note(e)}. Nghe mẫu và thử lại."
            )
        out.append({
            "index": e.index, "hanzi": e.hanzi, "pinyin": e.pinyin, "tone": e.tone,
            "status": status, "score": score, "heard": said, "note": note,
        })
    return out, extra


def verdict(overall: int) -> tuple[int, str]:
    if overall >= 90:
        return 5, "Tuyệt vời! Phát âm rất chuẩn."
    if overall >= 80:
        return 4, "Rất tốt! Chỉ còn vài chỗ nhỏ."
    if overall >= 65:
        return 3, "Khá tốt, còn một vài chỗ cần sửa."
    if overall >= 45:
        return 2, "Cần luyện thêm, bạn thử lại nhé."
    return 1, "Hãy nghe mẫu thật kỹ rồi thử lại nhé."


def tips(syls: list[dict], extra: int, flu: dict, usr: Track, y: np.ndarray) -> list[str]:
    out: list[str] = []
    tone = [s for s in syls if s["status"] == "tone"]
    sound = [s for s in syls if s["status"] == "sound"]
    missing = [s for s in syls if s["status"] == "missing"]
    if tone:
        out.append("Luyện lại thanh điệu của: " + ", ".join(f"{s['hanzi']} ({s['pinyin']})" for s in tone[:5]) + ". Nghe chậm rồi nhại theo.")
    if sound:
        out.append("Chú ý phát âm: " + ", ".join(f"{s['hanzi']} ({s['pinyin']})" for s in sound[:5]) + ".")
    if missing:
        out.append("Bạn chưa đọc hoặc đọc quá nhỏ ở: " + ", ".join(s["hanzi"] for s in missing[:6]) + ".")
    if extra:
        out.append("Máy nghe thấy bạn đọc thừa hoặc thêm âm ở một chỗ nào đó. Đọc đúng từng chữ trong câu nhé.")
    if flu["ratio"] > 2.0:
        out.append("Bạn đọc chậm hơn mẫu khá nhiều. Khi đã quen, thử đọc liền mạch hơn.")
    elif flu["ratio"] < 0.6:
        out.append("Bạn đọc nhanh hơn mẫu nhiều, thử đọc chậm lại để từng chữ rõ ràng.")
    if flu["extra_pauses"] > 0:
        out.append("Bạn ngắt giữa câu ở những chỗ không có dấu câu. Thử đọc liền một hơi.")
    loud = float(np.percentile(usr.db, 95))
    if loud < -38:
        out.append("Giọng thu vào hơi nhỏ, hãy nói to hơn hoặc ngồi gần micro hơn.")
    if float(np.mean(np.abs(y) > 0.98)) > 0.005:
        out.append("Âm thanh bị vỡ do quá to, hãy ngồi xa micro một chút.")
    if float(np.percentile(usr.db, 95) - np.percentile(usr.db, 10)) < 18:
        out.append("Có nhiều tiếng ồn xung quanh, hãy chọn nơi yên tĩnh hơn để chấm chính xác hơn.")
    return out[:6]


# ---- charts -------------------------------------------------------------------------------------


def envelope(track: Track) -> np.ndarray:
    amp = 10 ** (track.db / 20)
    n = len(amp) // 2 * 2
    return amp[:n].reshape(-1, 2).max(axis=1)


def build_charts(ref: Track, usr: Track, bounds: list[int], path: np.ndarray) -> dict:
    n = ref.n
    r = (ref.st - ref.centre) / ref.scale
    uv = (usr.st[path[:, 1]] - usr.centre) / usr.scale
    ok = ~np.isnan(uv)
    acc, cnt = np.zeros(n), np.zeros(n)
    np.add.at(acc, path[ok, 0], uv[ok])
    np.add.at(cnt, path[ok, 0], 1)
    u = np.where(cnt > 0, acc / np.maximum(cnt, 1), np.nan)

    def pitch(a: np.ndarray) -> list[float | None]:
        return [None if np.isnan(v) else round(float(v), 2) for v in a]

    re_, ue_ = envelope(ref), envelope(usr)
    norm = max(float(re_.max()), float(ue_.max()), 1e-6)

    def wave(a: np.ndarray) -> list[float]:
        return [round(float((v / norm) ** 0.6), 3) for v in a]

    return {"step": 0.01, "bounds": [int(b) for b in bounds], "ref_pitch": pitch(r), "usr_pitch": pitch(u),
            "ref_wave": wave(re_), "usr_wave": wave(ue_)}


# ---- entry point --------------------------------------------------------------------------------


def run(text: str, wav: bytes, sample_path, words: list[dict]) -> dict:
    exp = syllables(text)
    if not exp:
        raise AssessError("Câu này không có chữ Hán để chấm điểm.")
    try:
        y = audio.decode(wav)
    except Exception as exc:
        raise AssessError("Không đọc được bản ghi âm. Hãy thử ghi lại.") from exc
    usr = analyse(y)
    if usr is None:
        raise AssessError("Không nghe thấy giọng nói. Hãy kiểm tra micro và nói to hơn một chút.")
    if usr.n < 30:
        raise AssessError("Đoạn ghi âm quá ngắn. Hãy đọc cả câu rồi mới bấm dừng.")
    ref = analyse(audio.decode(sample_path))
    if ref is None:
        raise AssessError("Giọng mẫu của câu này bị lỗi, hãy thử câu khác.")
    bounds = segment(ref, len(exp), words)
    comp = compare(ref, bounds, usr)

    padded = np.pad(usr.y, (3200, 3200))
    heard_text = engine.transcribe(padded)["text"]
    enc, frames = engine.encode(padded)
    faint = faint_syllables(comp, bounds, usr)
    syls, extra = judge(exp, heard_syllables(heard_text, exp), tone_margins(text, exp, enc, frames), faint)

    accuracy = int(round(max(0.0, np.mean([s["score"] for s in syls]) - min(15, 4 * extra))))
    flu = fluency.assess(ref, usr)
    overall = int(round(0.8 * accuracy + 0.2 * flu["score"]))
    stars, msg = verdict(overall)
    return {
        "overall": overall, "accuracy": accuracy, "fluency": flu["score"], "stars": stars, "verdict": msg,
        "heard": heard_text, "syllables": syls, "tips": tips(syls, extra, flu, usr, y),
        "stats": {k: flu[k] for k in ("ref_seconds", "usr_seconds", "ratio", "pauses", "extra_pauses")},
        "charts": build_charts(ref, usr, bounds, comp.path),
    }
