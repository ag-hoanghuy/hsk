const TONE_MARKS: Record<string, number> = {
  ā: 1, á: 2, ǎ: 3, à: 4,
  ē: 1, é: 2, ě: 3, è: 4,
  ī: 1, í: 2, ǐ: 3, ì: 4,
  ō: 1, ó: 2, ǒ: 3, ò: 4,
  ū: 1, ú: 2, ǔ: 3, ù: 4,
  ǖ: 1, ǘ: 2, ǚ: 3, ǜ: 4,
};
const VOWELS = "aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ";

const toneOf = (c: string) => TONE_MARKS[c.toLowerCase()] ?? 0;
const isVowel = (c: string) => VOWELS.includes(c.toLowerCase());

export interface Syllable {
  text: string;
  tone: number; // 0 = neutral
}

/**
 * Split one pinyin word (e.g. "zhōumò", "gàosu") into syllables, each tagged with its tone.
 * Every tone mark owns one syllable; letters after the last mark (e.g. "su" in "gàosu") are neutral.
 */
export function splitSyllables(word: string): Syllable[] {
  const marks: number[] = [];
  for (let i = 0; i < word.length; i++) if (toneOf(word[i]) > 0) marks.push(i);
  if (marks.length === 0) return [{ text: word, tone: 0 }];

  // End (exclusive) of the syllable owning marks[k]: its vowels, then a coda n / ng / r if one fits.
  const syllableEnd = (k: number, limit: number): number => {
    const atWordEnd = limit === word.length;
    let j = marks[k] + 1;
    while (j < limit && isVowel(word[j])) j++;
    const rest = word.slice(j, limit);
    if (rest.startsWith("ng") && (rest.length > 2 || atWordEnd)) j += 2;
    else if (rest.startsWith("n") && (rest.length > 1 || atWordEnd)) j += 1;
    if (atWordEnd && word.slice(j) === "r") j += 1; // erhua: diǎnr
    return j;
  };

  const out: Syllable[] = [];
  let start = 0;
  for (let k = 0; k < marks.length; k++) {
    const limit = k + 1 < marks.length ? marks[k + 1] : word.length;
    const end = syllableEnd(k, limit);
    out.push({ text: word.slice(start, end), tone: toneOf(word[marks[k]]) });
    start = end;
  }
  if (start < word.length) out.push({ text: word.slice(start), tone: 0 });
  return out;
}

const WORD_RE = /[A-Za-züÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+/g;

export type Token = { text: string; tone: number | null }; // tone null = punctuation / spacing

/** Tokenise a pinyin string (word or sentence) into tone-tagged chunks. */
export function tokenizePinyin(input: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const m of input.matchAll(WORD_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) tokens.push({ text: input.slice(last, idx), tone: null });
    tokens.push(...splitSyllables(m[0]));
    last = idx + m[0].length;
  }
  if (last < input.length) tokens.push({ text: input.slice(last), tone: null });
  return tokens;
}
