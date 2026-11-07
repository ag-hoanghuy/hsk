# Authoring spec for lesson files

One lesson = one file `content/hsk<level>/lesson-NN.json` (NN = 01..20). Titles and grammar points of every
lesson are in `content/curriculum.json`; the words each lesson teaches are in `content/plan/allocation.json`.
`content/hsk3/lesson-01.json` is the reference lesson: copy its style and level of detail.

The learner is one Vietnamese adult studying alone on a PC. She knows roughly old-HSK 1–2 (~300 words) and is
preparing for the new HSK levels 3 and 4. Word levels follow the **2025 HSK exam syllabus** (新版HSK考试大纲,
`content/reference/hsk2025_words.json`): level 3 adds ~500 words, level 4 ~1000. HSK3 lessons also teach the level 1–2
words she does not know yet ("base" words). All explanations are in natural, warm, simple Vietnamese (not translated
English, no jargon without explanation). Chinese is simplified; pinyin uses tone marks.

## Top level

```json
{ "level": 3, "number": 1, "summary": "1–2 câu tiếng Việt tóm tắt bài", "content": { ... } }
```

## `content` sections (all required)

| key | what | count |
|---|---|---|
| `objectives` | strings, each completes "Học xong bài này, bạn có thể …" (write without that prefix) | 3–4 |
| `vocab` | core words, taught in depth | 15–20 |
| `extra_vocab` | the rest of the lesson's allocated words (same fields, shorter examples) | HSK3 ~10–20, HSK4 ~30 |
| `glossary` | words the texts use that the learner is not expected to know (see below) | as needed |
| `grammar` | the lesson's grammar points from curriculum.json | 2–4 |
| `dialogue` | `{title_vi, scene_vi, lines[]}`, everyday situation, 2–3 speakers | 8–10 lines |
| `exercises` | practice (`choice`, `order`, `match`) with answers and explanations | 12–14 |
| `quiz.grammar` | multiple choice on the grammar points | 6 |
| `test` | end-of-lesson test: 2 questions of each of the 8 types | 16 |
| `reading` | list with ONE passage, pre-segmented into tokens, with translation and questions | 1 passage, 4–5 questions |
| `listening` | list with ONE short script with questions | 1 script, 3–4 questions |
| `speaking` | sentences to read aloud, easy → hard, each with a pronunciation tip | 5–8 |
| `review` | `{remember: [5 strings], mistakes: [3 strings]}` "5 điều cần nhớ" and "3 lỗi hay sai" | 5 + 3 |

### Vocabulary item (`vocab` and `extra_vocab`)

```json
{"id":"v1","hanzi":"周末","pinyin":"zhōumò","pos":"danh từ","meaning_vi":"cuối tuần",
 "example_zh":"周末你有什么打算？","example_pinyin":"Zhōumò nǐ yǒu shénme dǎsuàn?","example_vi":"Cuối tuần bạn có dự định gì?",
 "hanviet":"CHU MẠT","note_vi":"…"}
```

- ids: `v1…` for core, `x1…` for extra. `pos` is one of: danh từ, động từ, tính từ, phó từ, đại từ, số từ, lượng từ,
  giới từ, liên từ, trợ từ, thán từ, động từ năng nguyện, từ chỉ phương hướng, cụm từ (two allowed: "động từ / danh từ").
- `hanviet` (optional): Sino-Vietnamese reading in capitals, only when it really helps remember the meaning.
- `note_vi` (optional, core words): confusable words (e.g. 刚/刚才), false friends with Hán-Việt, usage limits.
- Examples are short, natural, and use only taught/known words (or glossary words).
- Core and extra words must come from the lesson's allocation; do not teach a word another lesson owns.
- Taught words (core and extra) are words of the lesson's level, or level 1–2 words the learner does not know yet
  (not in old HSK 1–2). Core = the 15–20 most important ones; every allocated word must be taught (core or extra).

### Glossary

Any word in the lesson texts (dialogue, examples, reading, listening, speaking) that is not taught in this or an
earlier lesson, not in old HSK 1–2 and not a level-1 word must be listed: `{"hanzi","pinyin","meaning_vi","kind"}`
with `kind: "base"` for level-2 words, `"beyond"` for words not taught yet (later lesson, higher level or outside
the lists). (Level-1 words need no entry: every sentence already shows full pinyin and a translation.) Prefer rewriting sentences over piling up "beyond" words; base words are fine. The validator prints the
missing ones. Names (小王, 李明…) need no entry.

### Grammar point

```json
{"id":"g1","title":"Bổ ngữ kết quả “好”","pattern":"S + V + 好 (+ 了)","explanation_vi":"…",
 "examples":[{"zh":"…","pinyin":"…","vi":"…"}, … at least 3],
 "mistakes_vi":"✗ 我准备了好。\n✓ 我准备好了。\nGiải thích ngắn vì sao sai…",
 "compare_vi":"(optional) so sánh với cách nói tiếng Việt"}
```

`mistakes_vi` describes 1–3 mistakes typical for Vietnamese speakers (word order transferred from Vietnamese,
了/过/着, 的/得/地, wrong negation 不/没, measure words, Hán-Việt false friends …), each as ✗ wrong / ✓ right + why.

### Questions

All questions have `id`, `type`, `tag`, `prompt_vi`, and (except `match`) `explanation_vi`. The app shuffles options,
so the correct answer may be at any index. Exactly one option must be correct.

- `choice`: `question_zh` (may contain `____`), `options` (4, or `["对","错"]`), `answer` (index).
- `order`: `words` (4–7 pieces), `answers` (every acceptable full sentence without punctuation), `translation_vi`.
- `match`: `pairs` (5 `{zh, vi}`; no duplicate sides).
- `fill` (test): `sentence_zh` with `____`, `answers` (accepted Chinese strings), `hint_vi`.
- `listen_choice` (test): `audio_text` (Chinese, spoken by TTS), `options`, `answer`.
- `dictation` (test): `audio_text`, `answers` (accepted Chinese strings; punctuation and spaces are ignored).
- `translate_vi_zh` (test): `source_vi`, `answers` (list every natural variant you can think of: word order, 了, 呢, …).
- `translate_zh_vi` (test): `source_zh`, `answers_vi` (2–3 natural translations), `keywords` (list of groups; every group
  must have one alternative present; matching ignores case and Vietnamese diacritics, so include synonyms).

Tags: `v:<hanzi>` for a word of this lesson (core or extra), `g:<short key>` for a grammar point (use the same key for
all questions on that point, e.g. `g:把字句1`), `vocab` for match questions, `reading` / `listening` for comprehension.

### Reading

```json
[{"id":"rp1","title_zh":"…","title_vi":"…",
  "paragraphs":[{"tokens":[["小李","Xiǎo Lǐ","Tiểu Lý (tên người)"],["和","hé","và"],["。"]],"vi":"bản dịch đoạn"}],
  "questions":[ choice questions, at least one with options ["对","错"] ]}]
```

Length (Chinese characters, punctuation excluded): HSK3 80–150, HSK4 150–250. Every word token has pinyin and a
Vietnamese meaning in context; punctuation tokens have only the character. Split into words the way a dictionary would
(周末, 打算, 一起), not character by character.

### Listening

`[{"id":"lp1","title_vi":"…","text_zh":"… (≤ 380 characters)","pinyin":"…","vi":"…","questions":[3–4 choice]}]`

### Speaking

`[{"id":"s1","zh":"…","pinyin":"…","vi":"…","tip_vi":"Chú ý: 你好 đọc ní hǎo vì hai thanh 3 đi liền…"}]` — from short
phrases to a full sentence using the grammar point. Tips name the concrete difficulty for Vietnamese speakers (third
tone sandhi, 一/不 changes, neutral tones, zh/ch/sh vs z/c/s, -n/-ng, ü, aspirated p/t/k/q/ch/c …).

## Pinyin conventions

- Words joined: `zhōumò`, `dǎsuàn`; sentences start with a capital, keep the Chinese punctuation as `, . ? !`.
- Neutral tone has no mark: `péngyou`, `shénme`, `xièxie`, `zhīdao` (follow the dictionary).
- Mark the real tone of 一 and 不 (`yí ge`, `yìqǐ`, `bú shì`, `bù hǎo`). Do NOT mark third-tone sandhi (write `nǐ hǎo`);
  mention it in speaking tips instead.
- Erhua is written with r: `nàr`, `yìdiǎnr`, `yíhuìr`.
- Heteronyms must match the context (行 xíng/háng, 得 de/dé/děi, 了 le/liǎo, 长 cháng/zhǎng, 还 hái/huán, 觉 jué/jiào …).

## Content rules

- Original writing only: never copy textbook dialogues, readings or exercises.
- No real people, brands or sensitive topics (politics, religion, violence); everyday life, study, work, travel, health, family.
- Use only words taught in this or earlier lessons, old HSK 1–2 words, and glossary words; re-use earlier lessons' words often.
- Difficulty grows from lesson to lesson.

## Checking

```
docker compose exec -T backend python /tools/validate_content.py hsk3/lesson-05.json
```

Fix every ERROR. Fix warnings too unless the reading/choice is intended (e.g. 得 děi "phải"); list the ones you keep
and anything you are unsure about in `docs/review-notes/hsk<level>-NN.md` (Vietnamese).
