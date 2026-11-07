# Reference data: HSK vocabulary and grammar lists

> **The course follows the 2025 HSK exam syllabus.** That is 《HSK考试大纲》 / 新版HSK考试大纲, published 2025-11 by 中外语言交流合作中心 / Chinese Testing International (CTI) and used by the HSK 3.0 exam from **13 December 2026**.
>
> **Check lessons against `hsk2025_words.json` and `hsk2025_grammar.json`.**
>
> The GF 0025-2021 files (`hsk30_*`) and the HSK 2.0 file are kept **for reference only**.

Built on 2026-11-06 (GF 0025-2021 and HSK 2.0 files) and 2026-11-07 (2025 files).
All files are UTF-8 JSON arrays, simplified characters, pinyin with tone marks (Unicode NFC).

| File | Status | What | Entries |
|---|---|---|---|
| `hsk2025_words.json` | **in use** | 2025 exam syllabus vocabulary, levels 1–6 + 7–9 | 11 000 |
| `hsk2025_grammar.json` | **in use** | 2025 exam syllabus grammar table, levels 1–4 | 339 rows |
| `hsk30_words.json` | reference | GF 0025-2021 standard vocabulary, levels 1–6 + 7–9 | 11 092 |
| `hsk30_grammar.json` | reference | GF 0025-2021 grammar points, levels 1–4, **with example sentences** | 286 |
| `hsk20_words.json` | reference | old HSK 2.0 vocabulary (2012 revision) | 5 001 |

---

## A. `hsk2025_words.json`: 2025 exam syllabus vocabulary (in use)

**Source.** The official PDF 《中文水平考试 HSK考试大纲》 (2025-11 发布, 2026-07 实施), section "HSK 词汇大纲", printed pages 76–351.
- File: [新版HSK考试大纲1219.pdf](https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf). It is linked from [chinesetest.cn](https://www.chinesetest.cn/) → "Examination Syllabus".
- The version used is 406 pages, last modified 2026-10-30 according to the PDF metadata.
- The PDF has a real text layer (Excel printed to PDF). The table was extracted from that layer using the cell coordinates. No OCR was needed.
- **Licence / terms:** © 中外语言交流合作中心 / 汉考国际, with no licence stated. Treat it as all rights reserved, for reference use. The `en` field is from CC-CEDICT (CC BY-SA 4.0), as in the other files.

**Schema**

```json
{"no": 71, "hanzi": "好", "pinyin": "hǎo", "level": 1, "pos": "形",
 "extra_levels": [{"level": 2, "pos": "副"}, {"level": 4, "pos": "动"}],
 "en": "good; appropriate; ...", "gf2021_level": 1}
```

- `no`: the official serial number (1–11000, in syllabus order).
- `level`: 1–6, or **7 for the 7–9 band**.
- `pos`: the official POS for the main level, e.g. 名、动.
- `extra_levels` (102 entries): the syllabus writes some levels like `1（2）（4）` and some POS like `形、（副）、（动）`. This means the word enters at level 1 as 形 and gets the 副 use at level 2 and the 动 use at level 4. Each bracketed POS group is paired, in order, with a bracketed level.
- `sense` and `source_form` (82 entries): homographs numbered in the syllabus, e.g. `本1` (L1, 量) and `本2` (L5, 副/代). The hanzi is stored without the number.
- `variants` (2 entries): alternative readings printed with `/`: 谁 shéi/shuí, 熟 shú/shóu. The 2025 list has **no variant spellings** such as 爸爸|爸 or 有（一）点儿. It prints 有点儿, 没有, 有时, 差点儿, 要不, 凡是.
- `pinyin`: citation tones. **The syllabus marks 一/不 tone sandhi** (yíxià, búyào). For 145 such entries the printed form is in `pinyin_official` and `pinyin` has the sandhi undone (yīxià, bùyào).
  - Other spelling as printed: spaces (`dǎ diànhuà`), hyphens (`hóng-lǜdēng`), capitals (`Hànyǔ`).
  - The apostrophe `’` is normalised to `'`.
- POS: 10 504 entries have one. The 496 without are phrases. `数量` (numeral-classifier) also occurs as a POS.
- `en`: CC-CEDICT gloss (≤5 senses, surnames dropped). 10 989 entries have one.
- `gf2021_level`: the lowest level of the same word, with the same reading ignoring tones, in GF 0025-2021 (`hsk30_words.json`). It is `null` for the 1 200 entries that are not in that standard.

**Counts per level** (exact, from the official PDF)

| Level | 1 | 2 | 3 | 4 | 5 | 6 | 7–9 | Total |
|---|---|---|---|---|---|---|---|---|
| New words | 300 | 200 | 500 | 1000 | 1600 | 1800 | 5600 | 11000 |
| Cumulative | 300 | 500 | 1000 | 2000 | 3600 | 5400 | 11000 | |

The serial numbers run 1–11000 with no gaps.

A few hanzi occur twice in the same level, as separate entries with different readings or POS, e.g. 空 kōng/kòng (L4) and 重 (L4). Distinct hanzi: 10 896.

**Agreement between sources**
- **Earlier official version.** I also parsed the Dec-2025 PDF ([新版HSK考试大纲（词汇、汉字、语法）.pdf](https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B2%EF%BC%88%E8%AF%8D%E6%B1%87%E3%80%81%E6%B1%89%E5%AD%97%E3%80%81%E8%AF%AD%E6%B3%95%EF%BC%89.pdf), 330 pages). Its per-level counts are identical. Only 7 rows differ, all at levels 5–9, and the newer file wins:
  - 白: POS 形、副 → 副
  - 横: héng at L6 plus a new hèng at L7–9
  - pinyin fixes for 感恩, 脚踏实地, 任性, 致力于
- **[krmanik/HSK-3.0](https://github.com/krmanik/HSK-3.0) `New HSK (2025)/HSK Words`** (commit d30e970, a transcription of the same syllabus). Its per-level lists also contain the words whose bracketed extra level is that level.
  - Compared that way, they are **identical to ours for L3 (507) and L7–9**.
  - The only differences at other levels are 6 words that krmanik writes with an optional part, e.g. `差（一）点儿` (L4) and `有（一）点儿`. The official PDF prints 差点儿 and 有点儿, so we follow the PDF.
  - Pinyin of L3/L4 agrees except 怎么办 spacing, 然而 apostrophe style, and a krmanik typo (线上 xiàshàng).
- **[drkameleon/complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary) `newest-N`** (commit 7ac65bf, source not documented). Everything it contains agrees with ours, so it is a strict subset. It lacks 6 / 1 / 12 / 25 / 48 / 110 / 709 words at L1 / L2 / L3 / L4 / L5 / L6 / L7–9, e.g. 你好, 冰激凌, 红绿灯 and 扫码. It looks like an older or incomplete snapshot. Do not use it as a complete list.

**How different is it from GF 0025-2021?** Counted as distinct hanzi:
- **2025 L3** (499 words): **31 are not in GF levels 1–4**, and 6 of those are not in GF at all, e.g. 冰激凌, 电子书, 检票, 红绿灯. In GF terms, 79 of the L3 words were GF L1, 259 GF L2, 79 GF L3, 51 GF L4, 25 GF L5 or higher.
- **2025 L4** (997 words): **228 are not in GF levels 1–4**, and 23 of those are not in GF at all, e.g. 扫码, 网购, 线上, 动车. 205 L4 words come from GF L5 or higher.
- **The other direction.** Of the 3 178 GF L1–4 forms (variants included), **1 468 are not in 2025 L1–4**: 1 105 moved to 2025 L5–6, 52 to L7–9, and 317 are absent from the 2025 list. In detail:
  - GF L3: 535 of 966 words are not in 2025 L1–4.
  - GF L4: 702 of 995 words are not in 2025 L1–4.
- **Overall, 2025 L1–4 is about 1 978 words, versus about 3 178 in GF L1–4.** The 2025 list is much smaller and partly re-levelled.

## B. `hsk2025_grammar.json`: 2025 exam syllabus grammar, levels 1–4 (in use)

**Source.** The same official PDF, section "HSK 语法大纲", printed pages 382–394. It is a table with the columns 类别 / 类别名称 / 细目 / 语法内容. The table was extracted from the text layer, and merged cells were rebuilt from the drawn cell borders, including merged cells split across page breaks. I checked every level 1–4 page by eye against page images. Licence: as in section A.

**Schema**

```json
{"level": 3, "code": "G25-3-04", "category": "词类 > 动词 > 能愿动词", "name_zh": "需要、该、应该、愿意、得",
 "examples": [], "gf2021_codes": ["..."], "page": 389}
```

- One entry per table row (a 语法内容 cell).
- `category` = 类别 > 类别名称 > 细目.
- `name_zh` = 语法内容 as printed, or the 细目 when that row has no content (e.g. 陈述句, 祈使句).
- Superscripts ¹²³⁴⁵ are the syllabus's sense numbers (还¹…还⁴).
- `page` is the printed page number.
- **The syllabus has no official codes.** `code` is a stable ID we assigned (`G25-<level>-<row>`, in document order).
- **The syllabus has no example sentences**, so `examples` is always empty.
- `gf2021_codes` (170 of 339 rows) links to GF 0025-2021 points with the same content. Their proofread example sentences are in `hsk30_grammar.json`.

**Counts.** Table rows per level: 70 / 78 / 96 / 95 (L1–L4), 339 in total. Levels 5, 6 and 7–9 (70 / 50 / 134 rows) are in the PDF but not included.

Rows are not the same unit as GF 0025-2021 "points". For example, the five sub-patterns of 比较句2 are five rows here.

**Agreement between sources**
- **krmanik `New HSK (2025)/HSK Grammar/json`.** Row content is identical for all 339 rows. krmanik truncates 加上 to "加" in one row and writes plain digits for superscripts.
- Category labels are identical except 8 rows where krmanik writes "其 他" with a space, and 3 rows (比较句3, 双重否定句 at L4) where krmanik lost the 类别名称 特殊句型 at a page break. The PDF confirms 特殊句型.
- **The Dec-2025 official version** has an identical grammar table.

**Editorial note.** One missing separator in the official table was fixed: L3 名量词 `…头、句公斤…` → `句、公斤`. The L1 typo `（1）所处+是+名词` (for 处所) is kept as printed.

**Not a 2025 source.** shawkynasr's `HSK 3.0-Yufa 2025 final.csv` contains the **GF 0025-2021** grammar (572 points, 2021 wording), not the 2025 syllabus.

---

# Reference only: GF 0025-2021 standard and HSK 2.0

The sections below describe the earlier files. They follow **《国际中文教育中文水平等级标准》GF 0025-2021** (MOE, 2021) and the old HSK 2.0 list. They are not used for checking any more.

---

## 1. `hsk30_words.json`

**Schema.** Each entry is one row of the official list, in official order:

```json
{"id": "L1-0004", "hanzi": "爸爸", "pinyin": "bàba", "level": 1, "pos": "名", "pos_en": "N",
 "variants": [{"hanzi": "爸", "pinyin": "bà"}], "source_form": "爸爸|爸", "en": "(informal) father; ..."}
```

- `id`: level + index in the official PDF (`L7-` = band 7–9).
- `level`: 1–6, or **7 for the 7–9 band**.
- `hanzi`: the cleaned main form. Notes such as `（形）` are removed and moved into `pos`. Sense numbers (`称1`, `面2`) are removed and kept in `sense`. Ellipses (`…极了` → `极了`) are removed. The original official spelling is kept in `source_form` whenever it differs.
- `variants` (17 entries): the other forms of the same entry, so both forms are usable. Examples: `爸爸|爸`, `零|〇`, `有（一）些` → 有些 / 有一些, `差（一）点儿`, `好（不）容易`, `茅台（酒）`, and alternative readings such as 谁 shéi / shuí and 熟 shú / shóu.
- `example_words` (22 entries): for affix entries, the example word the standard gives in brackets. For example, `第（第二）` gives hanzi `第`, pos `前缀`, example_words `["第二"]`. The example word itself is **not** a list entry.
- `pinyin`: dictionary (citation) tones, without 一/不 tone sandhi.
- `pinyin_official` (821 entries): the spelling on the official chinesetest.cn site, only where it differs from `pinyin`. It marks 一/不 sandhi (búduì), separable verbs with `∥` (bāng∥máng) and neutral tone with `·` (bié·rén).
- Pinyin follows official orthography: spaces in phrases (`dǎ diànhuà`), hyphens in idioms (`yīlù-píng'ān`) and apostrophes (`nǚ'ér`). When comparing, strip spaces, `'`, `-`, `∥` and `·`.
- `pos`: official Chinese part-of-speech abbreviations, joined with `、`: 名 动 形 副 代 数 量 介 连 助 叹 前缀 后缀 拟声. `pos_en` gives the same in English codes (N, V, Adj, …). 9 734 entries have a POS. The other 1 358 are mostly phrases, for which the official list gives no POS.
- `en`: English gloss from CC-CEDICT, first ≤5 senses. 11 062 entries have one. 30 compositional phrases have none, e.g. 车上, 不太, 能不能.

**Sources**

| Source | Role | Commit / retrieval |
|---|---|---|
| [ivankra/hsk30](https://github.com/ivankra/hsk30) `hsk30.csv` | **Primary.** Hanzi from elkmovie's proofread OCR of the official PDF. Pinyin and POS from the official chinesetest.cn database. | commit 4ff9e39 |
| [elkmovie/hsk30](https://github.com/elkmovie/hsk30) `wordlist.txt` | Pleco's OCR of the official PDF | commit 7f3d4fd |
| [shawkynasr/HSK-official-Query-System](https://github.com/shawkynasr/HSK-official-Query-System) `词汇 2022.csv` | Copy of the official chinesetest.cn query database | commit 60153c5 |
| [Wiktionary: HSK list of Mandarin words v3.0](https://en.wiktionary.org/wiki/Appendix:HSK_list_of_Mandarin_words_v3.0/level_3) | Cross-check | level 3 revision 89450858 |
| [krmanik/HSK-3.0](https://github.com/krmanik/HSK-3.0) `New HSK (2021)/HSK List` | Cross-check | commit d30e970 |
| [drkameleon/complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary) `complete.json` | Cross-check. Derived from elkmovie. | commit 7ac65bf |
| [CC-CEDICT](https://www.mdbg.net/chinese/dictionary?page=cc-cedict) | `en` field. Matched through ivankra's CEDICT keys, with a fallback on same hanzi + same toned pinyin. | MDBG export dated 2026-11-06 |

The official document is [MOE notice](http://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/s5987/202103/t20210329_523304.html) and its [PDF](http://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/s5987/202103/W020210329527301787356.pdf). It is a 260-page scan without a text layer, watermarked "仅供查阅" (for reference only).

**Licence / terms**
- ivankra, elkmovie, shawkynasr and drkameleon are MIT-licensed.
- ivankra notes that the underlying list is a PRC government work (版权所有：中华人民共和国教育部), so whether anyone can claim copyright on it is unclear.
- The `en` field comes from CC-CEDICT, which is **CC BY-SA 4.0**: attribution is required and share-alike applies to that field.
- Wiktionary is CC BY-SA 4.0. It was used only for cross-checking.

**Counts per level vs. official**

| Level | 1 | 2 | 3 | 4 | 5 | 6 | 7–9 | Total |
|---|---|---|---|---|---|---|---|---|
| Official GF 0025-2021 | 500 | 772 | 973 | 1000 | 1071 | 1140 | 5636 | 11092 |
| `hsk30_words.json` | 500 | 772 | 973 | 1000 | 1071 | 1140 | 5636 | 11092 |

The counts match exactly. There is one entry per official row, and variants are nested, not counted.

**Agreement between sources.** An entry counts as matched if any of its forms matches.

| Source | Levels 3 and 4 vs. ours | Other levels |
|---|---|---|
| elkmovie (PDF OCR) | 973/973 and 1000/1000 identical | all levels identical |
| shawkynasr (official web DB) | 973/973 and 1000/1000 identical | all levels identical |
| Wiktionary v3.0 | 973/973 and 1000/1000 identical | L1/L2 differ only in variant notation (`爸爸/爸`). In 8 L7 entries Wiktionary adds 儿 (串门儿 vs 串门). |
| krmanik | L3 identical. L4 has 1 difference: krmanik lists 耕 instead of 森林, an error in krmanik. | L2: 示 for 表示. L7: 4 OCR slips (宙/审, 恰然/怡然, …). |
| drkameleon | 953 / 972 rows. The gap is not a real disagreement: drkameleon lists a hanzi only once, at its lowest level (e.g. 白 only at L1), and expands affix examples. | — |

elkmovie (PDF) and shawkynasr (web database) are independent of each other and agree 100%. For L3/L4 pinyin, ours matches the official web pinyin for 968/973 and 999/1000 entries. The only differences are the affix and ellipsis notations (`…极了`, `化（现代化）`).

**Caveats**
- **Same hanzi in more than one level (96 forms).** These are distinct official entries, usually with a different POS or sense. Examples:
  - 白: L1 形 and L3 副
  - 打: L1, L4 and L5
  - 还: L1 twice
  - forms involving L3: 为 了 传 信 力 只 叫 土 头 并 怕 所 报 排 支 正 毛 火 牛 生 痛 白 种 空 米 系 背 行 转 过去 重
  - forms involving L4: 关 冲 出口 别 哪 啊 喂 圈 地方 好 局 并 应 得 怪 才 打 挺 支 散 次 火 盘 着 种 空 系 结 花 落 要 转动 非 首

  A checker that asks "is this word allowed at level N?" should take the **minimum** level over all entries. Note that a specific sense may still belong to a higher level.
- **Same hanzi twice in the same level: 48 cases.** These are homographs or affix entries, e.g. 把 (量/介) at L3, 初 (副/前缀) at L3, 面¹/面² at L2.
- The 7–9 band is not split by level in the standard.
- POS and pinyin come from the official website and are not printed in the PDF word list. The PDF prints only the POS notes needed to tell homographs apart.

## 2. `hsk20_words.json`

**Schema**

```json
{"hanzi": "长", "pinyin": "cháng", "level": 2}
```

Optional fields:
- `pinyin_alt`: other readings, where the source gives several (26 entries).
- `pattern`: the original pattern entry for words split out of it (8 entries).

**Sources**
- **Primary:** [glxxyz/hskhsk.com](https://github.com/glxxyz/hskhsk.com), files `cidian/data/HSK Official With Definitions 2012 L1–L6.txt` (commit 8a6f229, MIT). These are the word lists Hanban published in September 2012, the last official HSK 2.0 revision (see [hskhsk.com word lists](http://www.hskhsk.com/word-lists.html)).
- **Cross-check:** [Wiktionary: HSK list of Mandarin words v2.0](https://en.wiktionary.org/wiki/Appendix:HSK_list_of_Mandarin_words_v2.0/level_2) (CC BY-SA 4.0).
- **For information only:** [clem109/hsk-vocabulary](https://github.com/clem109/hsk-vocabulary), which drkameleon's `old-N` lists reuse. This is the earlier **2010** list. It shares only 144/150 (L1), 134 (L2), 263/300 (L3) … words with the 2012 list, so do not mix the two.

**Counts per level vs. official**

| Level | 1 | 2 | 3 | 4 | 5 | 6 | Total |
|---|---|---|---|---|---|---|---|
| Official (new words per level) | 150 | 150 | 300 | 600 | 1300 | 2500 | 5000 |
| Wiktionary v2.0 (entries) | 150 | 149 | 298 | 600 | 1300 | 2500 | 4997 |
| `hsk20_words.json` | 150 | 151 | 300 | 600 | 1300 | 2500 | 5001 |

The differences come only from pattern entries. The source splits 虽然……但是…… and 因为……所以…… (L2), and 不但……而且…… and 只有……才…… (L3), into separate words; Wiktionary keeps them as single pattern entries. After splitting, glxxyz and Wiktionary agree 100% at every level, apart from POS notes such as `得（助动词）`.

**Caveats**
- Six hanzi appear in two levels: 喂 (L1 wéi, L6 wèi), 长 (L2 cháng, L3 zhǎng), 得 (L2 de, L4 děi), 还 (L2 hái, L3 huán), 等 (L2 and L4, děng), 过 (L2 and L3, guò).
- The source gives generic dictionary readings. Readings were set per level for 长, 喂, 得 and 还 (based on Wiktionary's notes 得（助动词） and 喂（动词）, and the meaning at that level). The two 过 entries are not told apart (the L2 one is probably the particle guo).
- For other polyphones (地, 发, 分, 教, 角, 只, 倒, 假, 空, …) `pinyin` holds the source's first reading and `pinyin_alt` the rest. The reading the official list intends is not certain for these.

## 3. `hsk30_grammar.json`

**Schema**

```json
{"level": 3, "code": "三07", "section": "A.3.2.2", "category": "词类 > 代词",
 "name_zh": "疑问代词的非疑问用法",
 "subpoints": ["（1）任指用法", "①疑问代词+都", "②疑问代词+疑问代词", "（2）不定指用法"],
 "examples": ["谁都喜欢她。", "..."], "notes": ["..."]}
```

- `code`: the official code, printed in the standard as 【三07】.
- `section` and `category`: the appendix section number and its heading path.
- `name_zh`: the heading as printed. **Superscripts ¹²³⁴ are the standard's sense numbers.** For example, 还¹ (L1), 还² (L2), 还³ (L3) and 还⁴ (L4) are different uses of 还 assigned to different levels.
- `subpoints`: sub-headings or formulas, in document order.
- `examples`: every example sentence or phrase, in document order. Phrase lists are split into single items. Examples are not linked to their subpoint.
- `notes`: editorial notes, e.g. （"而是、既然…"例句参见复句部分）.
- Unnumbered cross-references (※) are omitted.

**Sources**
- **Authoritative:** the official GF 0025-2021 PDF, Appendix A 语法等级大纲. Levels 1–4 are printed pages 170–216, which are PDF pages 176–222. Links are the same as above.
- **Text base:** [krmanik/HSK-3.0](https://github.com/krmanik/HSK-3.0), `New HSK (2021)/HSK Grammar/HSK 1–4.txt` (commit d30e970). This is an OCR of that PDF.
  - The repository licence is not standard ("NOASSERTION"). Its `License.md` lists the official PDF as the source and puts krmanik's word lists under CC BY-SA 4.0.
  - The underlying text is © PRC Ministry of Education.
- **Proofreading:** all 286 points (headings, subpoints and examples) were checked by eye against page images of the PDF. In total, 76 lines were corrected or annotated. The corrections:
  - 11 codes with the wrong level character, e.g. 【二06】 → 【三06】
  - all sense superscripts, which were missing
  - OCR errors such as 另→别 (一14), 计你→让你 (四75), 者15→都 (四54), 一千二百五十二→一千三百五十二 (二09)
  - missing text: 出 (二50), 还⁴ (四12), 带来 (二50)
  - missing section headings: A.2.1.7.4, A.4.3
  - punctuation
- **Second OCR check:** the result was also compared with an independent Tesseract OCR of the same pages. Every remaining disagreement was a Tesseract error.
- **Compared with, but not used as source:** the official web database's grammar table, [shawkynasr](https://github.com/shawkynasr/HSK-official-Query-System) `HSK 3.0-Yufa with Reference Books.csv`, which is also ivankra's `hsk30-grammar.csv`. It has the same 286 points in the same order, but it **differs from the PDF** in a few places. This file follows the PDF:

| Code | PDF | Web table |
|---|---|---|
| 三41 | 一……也/都+不/没…… | 像……一样 |
| 一40 | 变化态：用**动态**助词"了²" | 语气助词"了2" |
| 二01 | （1）可能（2）可以 | adds （3）会 |
| 二19 | includes 一定 | lacks 一定 |
| 三77 | 用"是"强调 | 用"是"表示强调 |
| 一19, 二29 | 连接词或短语 | 连接词或词组 |
| 二48 | 数词或数量短语 | 数词、数量短语 |
| 三59 | 重动词 (sic) | 重动句 |

**Counts per level vs. official**

| Level | 1 | 2 | 3 | 4 | Total |
|---|---|---|---|---|---|
| Official grammar points | 48 | 81 | 81 | 76 | 286 |
| `hsk30_grammar.json` points | 48 | 81 | 81 | 76 | 286 |
| Examples | 234 | 330 | 335 | 240 | 1139 |

**Missing / limits**
- Levels 5 (71 points), 6 (67) and 7–9 (148) are **not included**. They exist in the same sources but were not proofread.
- There is no English translation of grammar names.
- The Chinese Grammar Wiki (AllSet Learning) was not used. It maps grammar to its own HSK levels, and its site blocked automated access.

## Validation (all five files, 2026-11-07)

A validation script, run in Docker with `python -I`, checked the following:
- each file is valid JSON
- no empty hanzi, pinyin, level, code, category or name
- hanzi contain only CJK characters (plus 〇)
- pinyin contains no digits, uses only pinyin letters and tone marks, and is NFC
- unique `id` / `no` (`no` runs 1…11000 for the 2025 list)
- every `extra_levels` entry is above the main level and has a POS
- grammar codes run with no gaps for each level
- per-level counts as in the tables above

Result: **ALL CHECKS PASSED**.
- `hsk2025_words.json`: 300/200/500/1000/1600/1800/5600, total 11 000. Cumulative 300/500/1000/2000/3600/5400. 10 896 distinct hanzi.
- `hsk2025_grammar.json`: 70/78/96/95 rows, total 339. 170 rows linked to GF 0025-2021 points.
- `hsk30_words.json`: 500/772/973/1000/1071/1140/5636, total 11 092. 10 959 distinct hanzi forms.
- `hsk20_words.json`: 150/151/300/600/1300/2500, total 5 001.
- `hsk30_grammar.json`: 48/81/81/76, total 286 points and 1 139 examples.

On 2026-11-07, the `en` glosses in `hsk30_words.json` were regenerated so that "surname X" senses are dropped when other senses exist. Nothing else in that file changed.
