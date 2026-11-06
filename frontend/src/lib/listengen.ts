import type { LessonContent, ListenChoiceQuestion, ListenFillExercise, VocabItem } from "../api";
import { shuffle } from "./random";

/** `n` strings from `pool` that differ from `correct` and from each other. */
function distractors(pool: string[], correct: string, n = 3): string[] {
  const out: string[] = [];
  for (const s of shuffle(pool)) {
    if (s !== correct && !out.includes(s)) out.push(s);
    if (out.length === n) break;
  }
  return out;
}

function choice(
  id: string,
  tag: string,
  prompt_vi: string,
  audio_text: string,
  correct: string,
  pool: string[],
  explanation_vi: string,
): ListenChoiceQuestion {
  const options = shuffle([correct, ...distractors(pool, correct)]);
  return { id, type: "listen_choice", tag, prompt_vi, audio_text, options, answer: options.indexOf(correct), explanation_vi };
}

/** Split Chinese text into sentences, keeping the closing punctuation. */
export function sentencesOf(text: string): string[] {
  return (text.match(/[^。！？!?]+[。！？!?”’]*/g) ?? []).map((s) => s.trim()).filter(Boolean);
}

/**
 * "Hear and choose" questions built from the lesson itself, no extra authoring:
 * words (→ meaning, → hanzi), dialogue lines (→ meaning) and example sentences (→ meaning).
 */
export function buildListeningChoice(c: LessonContent, n = 10): ListenChoiceQuestion[] {
  const vocab = c.vocab;
  const lines = c.dialogue.lines;
  const out: ListenChoiceQuestion[] = [];

  const meaningPool = vocab.map((v) => v.meaning_vi);
  const hanziPool = vocab.map((v) => v.hanzi);
  const viLines = lines.map((l) => l.vi);
  const viExamples = vocab.map((v) => v.example_vi);

  const wordExplain = (v: VocabItem) => `${v.hanzi} (${v.pinyin}) = ${v.meaning_vi}`;
  const words = shuffle(vocab);
  words.slice(0, 3).forEach((v) =>
    out.push(choice(`lw:${v.id}`, `v:${v.hanzi}`, "Nghe từ và chọn nghĩa đúng.", v.hanzi, v.meaning_vi, meaningPool, wordExplain(v))),
  );
  words.slice(3, 5).forEach((v) =>
    out.push(choice(`lh:${v.id}`, `v:${v.hanzi}`, "Nghe và chọn từ bạn nghe được.", v.hanzi, v.hanzi, hanziPool, wordExplain(v))),
  );
  shuffle(lines)
    .slice(0, 3)
    .forEach((l, i) =>
      out.push(
        choice(`ld:${i}:${l.zh.slice(0, 6)}`, "dialogue", "Nghe câu hội thoại và chọn nghĩa đúng.", l.zh, l.vi, viLines, `${l.zh} (${l.pinyin})`),
      ),
    );
  shuffle(vocab)
    .slice(0, 2)
    .forEach((v) =>
      out.push(
        choice(`le:${v.id}`, `v:${v.hanzi}`, "Nghe câu và chọn nghĩa đúng.", v.example_zh, v.example_vi, viExamples, `${v.example_zh} (${v.example_pinyin})`),
      ),
    );
  return shuffle(out).slice(0, n);
}

/**
 * "Hear and fill in the missing word": take sentences from the dialogue and the vocab examples,
 * blank out one vocabulary word and offer it among decoys from the same lesson.
 */
export function buildListeningFill(c: LessonContent, n = 8): ListenFillExercise[] {
  const sentences = new Set<string>();
  c.dialogue.lines.forEach((l) => sentencesOf(l.zh).forEach((s) => sentences.add(s)));
  c.vocab.forEach((v) => sentencesOf(v.example_zh).forEach((s) => sentences.add(s)));

  const usedWords = new Set<string>();
  const out: ListenFillExercise[] = [];
  for (const sentence of shuffle([...sentences])) {
    if (sentence.length < 4) continue;
    const candidates = c.vocab.filter((v) => sentence.includes(v.hanzi) && !usedWords.has(v.hanzi));
    if (candidates.length === 0) continue;
    // Prefer longer words: they make a more meaningful blank than a single character.
    const longest = Math.max(...candidates.map((v) => v.hanzi.length));
    const word = shuffle(candidates.filter((v) => v.hanzi.length === longest))[0];
    usedWords.add(word.hanzi);

    const decoys = distractors(
      c.vocab.map((v) => v.hanzi).filter((h) => !sentence.includes(h)),
      word.hanzi,
    );
    const options = shuffle([word.hanzi, ...decoys]);
    out.push({
      id: `lf:${out.length}:${word.id}`,
      type: "listen_fill",
      tag: `v:${word.hanzi}`,
      prompt_vi: "Nghe câu và chọn từ còn thiếu.",
      audio_text: sentence,
      sentence_zh: sentence.replace(word.hanzi, "____"),
      options,
      answer: options.indexOf(word.hanzi),
      explanation_vi: `${word.hanzi} (${word.pinyin}) = ${word.meaning_vi}`,
    });
    if (out.length === n) break;
  }
  return out;
}
