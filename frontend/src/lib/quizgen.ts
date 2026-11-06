import type { ChoiceExercise, VocabItem } from "../api";
import { shuffle } from "./random";

export interface QuizQuestion {
  id: string;
  tag: string;
  prompt_vi: string;
  main: string; // the big text shown on the card
  mainIsZh: boolean;
  sub?: string; // smaller line under the main text (e.g. pinyin)
  audioText?: string; // spoken automatically and replayable
  options: string[];
  answer: number;
  explanation: string;
}

function withShuffledOptions(options: string[], correct: string): { options: string[]; answer: number } {
  const shuffled = shuffle(options);
  return { options: shuffled, answer: shuffled.indexOf(correct) };
}

/** Pick `n` distractors whose displayed text differs from the correct one and from each other. */
function pickDistractors(vocab: VocabItem[], current: VocabItem, text: (v: VocabItem) => string, n = 3): string[] {
  const seen = new Set([text(current)]);
  const out: string[] = [];
  for (const v of shuffle(vocab)) {
    const t = text(v);
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
    if (out.length === n) break;
  }
  return out;
}

/** Vocabulary quiz generated from the lesson's word list: hanzi→meaning, meaning→hanzi, listen→hanzi. */
export function buildVocabQuiz(vocab: VocabItem[], count = 10): QuizQuestion[] {
  const items = shuffle(vocab).slice(0, Math.min(count, vocab.length));
  return items.map((v, i) => {
    const explanation = `${v.hanzi} (${v.pinyin}) = ${v.meaning_vi}`;
    const base = { id: `vq:${v.id}`, tag: `v:${v.hanzi}`, explanation };
    const mode = i % 3;
    if (mode === 0) {
      const options = [v.meaning_vi, ...pickDistractors(vocab, v, (x) => x.meaning_vi)];
      return {
        ...base,
        id: `${base.id}:zh2vi`,
        prompt_vi: "Chọn nghĩa đúng của từ này",
        main: v.hanzi,
        mainIsZh: true,
        sub: v.pinyin,
        audioText: v.hanzi,
        ...withShuffledOptions(options, v.meaning_vi),
      };
    }
    if (mode === 1) {
      const options = [v.hanzi, ...pickDistractors(vocab, v, (x) => x.hanzi)];
      return {
        ...base,
        id: `${base.id}:vi2zh`,
        prompt_vi: "Chọn từ tiếng Trung đúng",
        main: v.meaning_vi,
        mainIsZh: false,
        ...withShuffledOptions(options, v.hanzi),
      };
    }
    const options = [v.hanzi, ...pickDistractors(vocab, v, (x) => x.hanzi)];
    return {
      ...base,
      id: `${base.id}:listen`,
      prompt_vi: "Nghe và chọn từ bạn nghe được",
      main: "🔊",
      mainIsZh: false,
      audioText: v.hanzi,
      ...withShuffledOptions(options, v.hanzi),
    };
  });
}

/** Grammar quiz from the authored multiple-choice items (options reshuffled each play). */
export function buildGrammarQuiz(items: ChoiceExercise[]): QuizQuestion[] {
  return shuffle(items).map((ex) => ({
    id: `gq:${ex.id}`,
    tag: ex.tag,
    prompt_vi: ex.prompt_vi,
    main: ex.question_zh,
    mainIsZh: false,
    explanation: ex.explanation_vi ?? "",
    ...withShuffledOptions(ex.options, ex.options[ex.answer]),
  }));
}
