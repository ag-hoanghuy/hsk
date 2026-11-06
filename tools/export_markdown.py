#!/usr/bin/env python3
"""Write the readable Markdown version of every lesson to docs/bai-hoc/ (generated from the JSON, never edited by hand).

Run:  docker compose exec -T backend python /tools/export_markdown.py
(the backend container mounts content/ at /content and docs/ at /docs.)
"""
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = Path(os.environ.get("CONTENT_DIR", ROOT / "content"))
OUT = Path(os.environ.get("DOCS_OUT", ROOT / "docs" / "bai-hoc"))

TYPE_VI = {
    "choice": "Chọn đáp án",
    "order": "Sắp xếp câu",
    "match": "Nối từ",
    "fill": "Điền từ",
    "listen_choice": "Nghe chọn đáp án",
    "dictation": "Nghe viết lại",
    "translate_vi_zh": "Dịch Việt – Trung",
    "translate_zh_vi": "Dịch Trung – Việt",
}


def esc(s: str) -> str:
    return str(s).replace("|", "\\|").replace("\n", "<br>")


def question_md(q: dict, n: int) -> list[str]:
    t = q["type"]
    head = f"{n}. **[{TYPE_VI.get(t, t)}]** {q.get('prompt_vi', '')}"
    out = [head]
    if t in ("choice", "listen_choice"):
        if t == "listen_choice":
            out.append(f"   - Audio: {q['audio_text']}")
        if q.get("question_zh"):
            out.append(f"   - {q['question_zh']}")
        letters = "ABCDEF"
        out.append("   - " + "   ".join(f"{letters[i]}. {o}" for i, o in enumerate(q["options"])))
        out.append(f"   - Đáp án: **{letters[q['answer']]}. {q['options'][q['answer']]}**")
    elif t == "order":
        out.append(f"   - Từ: {' / '.join(q['words'])}")
        out.append(f"   - Đáp án: **{q['answers'][0]}**" + (f" (chấp nhận: {'; '.join(q['answers'][1:])})" if len(q["answers"]) > 1 else ""))
        if q.get("translation_vi"):
            out.append(f"   - Nghĩa: {q['translation_vi']}")
    elif t == "match":
        out.append("   - " + "; ".join(f"{p['zh']} = {p['vi']}" for p in q["pairs"]))
    elif t == "fill":
        out.append(f"   - {q['sentence_zh']}" + (f" (gợi ý: {q['hint_vi']})" if q.get("hint_vi") else ""))
        out.append(f"   - Đáp án: **{' / '.join(q['answers'])}**")
    elif t == "dictation":
        out.append(f"   - Audio: {q['audio_text']}")
        out.append(f"   - Đáp án: **{q['answers'][0]}**")
    elif t == "translate_vi_zh":
        out.append(f"   - {q['source_vi']}")
        out.append(f"   - Đáp án: **{q['answers'][0]}**" + (f" (chấp nhận thêm {len(q['answers']) - 1} cách)" if len(q["answers"]) > 1 else ""))
    elif t == "translate_zh_vi":
        out.append(f"   - {q['source_zh']}")
        out.append(f"   - Đáp án: **{q['answers_vi'][0]}**")
    if q.get("explanation_vi"):
        out.append(f"   - Giải thích: {q['explanation_vi']}")
    return out


def lesson_md(data: dict, meta: dict) -> str:
    c = data["content"]
    L = [f"# HSK {data['level']} · Bài {data['number']}: {meta['title_zh']} – {meta['title_vi']}", ""]
    if data.get("summary"):
        L += [f"> {data['summary']}", ""]

    L += ["## 1. Mục tiêu bài", ""] + [f"- {o}" for o in c.get("objectives", [])] + [""]

    L += ["## 2. Từ vựng", "", "| Chữ Hán | Pinyin | Loại từ | Nghĩa | Ví dụ | Ghi chú |", "|---|---|---|---|---|---|"]
    for v in c.get("vocab", []):
        ex = f"{v['example_zh']}<br>{v['example_pinyin']}<br>{v['example_vi']}"
        note = " ".join(x for x in [f"Hán Việt: {v['hanviet']}." if v.get("hanviet") else "", v.get("note_vi", "")] if x)
        L.append(f"| {v['hanzi']} | {v['pinyin']} | {v['pos']} | {esc(v['meaning_vi'])} | {esc(ex)} | {esc(note)} |")
    L.append("")
    if c.get("extra_vocab"):
        L += ["### Từ mở rộng", "", "| Chữ Hán | Pinyin | Loại từ | Nghĩa | Ví dụ |", "|---|---|---|---|---|"]
        for v in c["extra_vocab"]:
            L.append(f"| {v['hanzi']} | {v['pinyin']} | {v['pos']} | {esc(v['meaning_vi'])} | {esc(v['example_zh'] + ' – ' + v['example_vi'])} |")
        L.append("")
    if c.get("glossary"):
        L += ["### Từ cần biết thêm khi đọc bài", ""]
        L += [f"- {g['hanzi']} ({g['pinyin']}): {g['meaning_vi']}{' – ngoài phạm vi' if g['kind'] == 'beyond' else ''}" for g in c["glossary"]]
        L.append("")

    L += ["## 3. Ngữ pháp", ""]
    for i, g in enumerate(c.get("grammar", []), 1):
        L += [f"### 3.{i}. {g['title']}", "", f"**Cấu trúc:** `{g['pattern']}`", "", g["explanation_vi"], ""]
        L += [f"- {e['zh']}  \n  {e['pinyin']}  \n  {e['vi']}" for e in g.get("examples", [])]
        L.append("")
        if g.get("mistakes_vi"):
            L += ["**Lỗi người Việt hay gặp:**", "", g["mistakes_vi"].replace("\n", "  \n"), ""]
        if g.get("compare_vi"):
            L += ["**So với tiếng Việt:** " + g["compare_vi"], ""]

    d = c.get("dialogue", {})
    L += [f"## 4. Hội thoại: {d.get('title_vi', '')}", ""]
    if d.get("scene_vi"):
        L += [f"*{d['scene_vi']}*", ""]
    for line in d.get("lines", []):
        L += [f"**{line['speaker']}:** {line['zh']}  ", f"{line['pinyin']}  ", f"_{line['vi']}_", ""]

    L += ["## 5. Bài tập", ""]
    for n, q in enumerate(c.get("exercises", []), 1):
        L += question_md(q, n)
    L.append("")
    L += ["## 6. Quiz ngữ pháp", ""]
    for n, q in enumerate(c.get("quiz", {}).get("grammar", []), 1):
        L += question_md(q, n)
    L.append("")
    L += ["## 7. Bài kiểm tra cuối bài", ""]
    for n, q in enumerate(c.get("test", []), 1):
        L += question_md(q, n) + [f"   - Tag: `{q['tag']}`"]
    L.append("")

    for p in c.get("reading", []):
        L += [f"## 8. Đoạn đọc: {p['title_zh']} ({p['title_vi']})", ""]
        for para in p["paragraphs"]:
            zh = "".join(t[0] for t in para["tokens"])
            py = " ".join(t[1] for t in para["tokens"] if len(t) > 1)
            L += [zh, "", f"_{py}_", "", f"> {para['vi']}", ""]
        for n, q in enumerate(p.get("questions", []), 1):
            L += question_md(q, n)
        L.append("")
    for p in c.get("listening", []):
        L += [f"## 9. Đoạn nghe: {p['title_vi']}", "", p["text_zh"], "", f"_{p['pinyin']}_", "", f"> {p['vi']}", ""]
        for n, q in enumerate(p.get("questions", []), 1):
            L += question_md(q, n)
        L.append("")

    L += ["## 10. Câu luyện nói", ""]
    for n, s in enumerate(c.get("speaking", []), 1):
        L += [f"{n}. {s['zh']}  ", f"   {s['pinyin']}  ", f"   {s['vi']}  ", f"   _{s['tip_vi']}_", ""]

    r = c.get("review", {})
    L += ["## 11. Tóm tắt & ôn nhanh", "", "**5 điều cần nhớ**", ""] + [f"{i}. {x}" for i, x in enumerate(r.get("remember", []), 1)]
    L += ["", "**3 lỗi hay sai**", ""] + [f"- {x}" for x in r.get("mistakes", [])] + [""]
    return "\n".join(L)


def main() -> int:
    curriculum = {(i["level"], i["number"]): i for i in json.loads((CONTENT / "curriculum.json").read_text(encoding="utf-8"))}
    OUT.mkdir(parents=True, exist_ok=True)
    index = ["# Tài liệu học HSK 3–4 (bản đọc)", "", "Sinh tự động từ `content/hsk*/lesson-NN.json` bằng `tools/export_markdown.py`; đừng sửa tay.", ""]
    files = sorted(CONTENT.glob("hsk*/lesson-*.json"))
    for f in files:
        data = json.loads(f.read_text(encoding="utf-8"))
        meta = curriculum[(data["level"], data["number"])]
        name = f"hsk{data['level']}-{data['number']:02d}.md"
        (OUT / name).write_text(lesson_md(data, meta), encoding="utf-8")
        index.append(f"- [HSK {data['level']} · Bài {data['number']}: {meta['title_zh']} – {meta['title_vi']}]({name})")
    (OUT / "README.md").write_text("\n".join(index) + "\n", encoding="utf-8")
    print(f"wrote {len(files)} lesson(s) to {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
