import type { LessonContent } from "../api";

export interface SpeakItem {
  id: string;
  zh: string;
  pinyin: string;
  vi: string;
  speaker?: string;
}

export interface SpeakGroup {
  key: string;
  label: string;
  items: SpeakItem[];
}

const MAX_CHARS = 60;

/** Speaker tags such as "A：" in two-person examples are not part of what is said. */
const stripSpeakers = (s: string) => s.replace(/(^|[\s。！？.!?])[AB][：:]\s*/g, "$1").trim();

/** Sentences to practise, built from what the lesson already has: example sentences, grammar examples and the dialogue. */
export function buildSpeakingGroups(content: LessonContent): SpeakGroup[] {
  const seen = new Set<string>();
  const take = (zh: string) => {
    const key = zh.replace(/[\s，。？！、,.?!：:；;“”"]/g, "");
    if (!key || zh.length > MAX_CHARS || seen.has(key)) return false;
    seen.add(key);
    return true;
  };

  const dialogue: SpeakItem[] = [];
  (content.dialogue?.lines ?? []).forEach((l, i) => {
    if (take(l.zh)) dialogue.push({ id: `d${i}`, zh: l.zh, pinyin: l.pinyin, vi: l.vi, speaker: l.speaker });
  });

  const grammar: SpeakItem[] = [];
  (content.grammar ?? []).forEach((g) =>
    g.examples.forEach((e, i) => {
      const zh = stripSpeakers(e.zh);
      if (take(zh)) grammar.push({ id: `${g.id}-${i}`, zh, pinyin: stripSpeakers(e.pinyin), vi: e.vi });
    }),
  );

  const vocab: SpeakItem[] = [];
  (content.vocab ?? []).forEach((v) => {
    if (take(v.example_zh)) vocab.push({ id: v.id, zh: v.example_zh, pinyin: v.example_pinyin, vi: v.example_vi });
  });

  return [
    { key: "dialogue", label: "Hội thoại", items: dialogue },
    { key: "grammar", label: "Mẫu câu ngữ pháp", items: grammar },
    { key: "vocab", label: "Câu ví dụ từ vựng", items: vocab },
  ].filter((g) => g.items.length > 0);
}
