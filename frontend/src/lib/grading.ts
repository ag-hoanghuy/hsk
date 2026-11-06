import type { TestQuestion, TestType } from "../api";

/** A learner's raw answer; its shape depends on the question type (see isAnswered). */
export type AnswerValue = number | number[] | (number | null)[] | string | null | undefined;

const ZH_STRIP = /[\s，。！？、：；“”‘’（）《》【】,.!?:;"'()[\]…—\-·~]/g;

/** Chinese comparison ignores spaces and punctuation (full-width forms are folded first). */
export const normalizeZh = (s: string) => s.normalize("NFKC").replace(ZH_STRIP, "");

/** Vietnamese comparison ignores case, diacritics and punctuation, so typing without accents still counts. */
export const normalizeVi = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function gradeZh(input: string, answers: string[]): boolean {
  const n = normalizeZh(input);
  return n.length > 0 && answers.some((a) => normalizeZh(a) === n);
}

/** Accept an exact (normalised) match, or text containing a word from every keyword group. */
export function gradeVi(input: string, answers: string[], keywords?: string[][]): boolean {
  const n = normalizeVi(input);
  if (!n) return false;
  if (answers.some((a) => normalizeVi(a) === n)) return true;
  if (!keywords || keywords.length === 0) return false;
  const padded = ` ${n} `;
  return keywords.every((group) => group.some((kw) => padded.includes(` ${normalizeVi(kw)} `)));
}

export const BLANK = "____";

export function isAnswered(q: TestQuestion, v: AnswerValue): boolean {
  switch (q.type) {
    case "choice":
    case "listen_choice":
      return typeof v === "number";
    case "order":
      return Array.isArray(v) && v.length === q.words.length;
    case "match":
      return Array.isArray(v) && v.length === q.pairs.length && v.every((x) => x !== null);
    default:
      return typeof v === "string" && v.trim().length > 0;
  }
}

export function gradeQuestion(q: TestQuestion, v: AnswerValue): boolean {
  if (!isAnswered(q, v)) return false;
  switch (q.type) {
    case "choice":
    case "listen_choice":
      return v === q.answer;
    case "order": {
      const sentence = (v as number[]).map((i) => q.words[i]).join("");
      return gradeZh(sentence, q.answers);
    }
    case "match":
      return (v as (number | null)[]).every((r, i) => r === i);
    case "fill": {
      const text = v as string;
      const whole = q.answers.map((a) => q.sentence_zh.replace(BLANK, a));
      return gradeZh(text, q.answers) || gradeZh(text, whole);
    }
    case "dictation":
    case "translate_vi_zh":
      return gradeZh(v as string, q.answers);
    case "translate_zh_vi":
      return gradeVi(v as string, q.answers_vi, q.keywords);
  }
}

export const TYPE_LABEL: Record<TestType, string> = {
  choice: "Chọn đáp án đúng",
  match: "Nối từ với nghĩa",
  order: "Sắp xếp thành câu",
  fill: "Điền từ còn thiếu",
  listen_choice: "Nghe và chọn đáp án",
  dictation: "Nghe và viết lại câu",
  translate_vi_zh: "Dịch Việt – Trung",
  translate_zh_vi: "Dịch Trung – Việt",
};

export const typeLabel = (t: string) => TYPE_LABEL[t as TestType] ?? t;

/** The accepted answer shown in review, as plain text. */
export function correctText(q: TestQuestion): string {
  switch (q.type) {
    case "choice":
    case "listen_choice":
      return q.options[q.answer];
    case "order":
    case "fill":
    case "dictation":
    case "translate_vi_zh":
      return q.answers[0];
    case "match":
      return q.pairs.map((p) => `${p.zh} = ${p.vi}`).join(" · ");
    case "translate_zh_vi":
      return q.answers_vi[0];
  }
}

/** What the learner answered, as plain text ("" when left blank). */
export function userText(q: TestQuestion, v: AnswerValue): string {
  if (!isAnswered(q, v)) return "";
  switch (q.type) {
    case "choice":
    case "listen_choice":
      return q.options[v as number];
    case "order":
      return (v as number[]).map((i) => q.words[i]).join("");
    case "match":
      return (v as (number | null)[]).map((r, i) => `${q.pairs[i].zh} = ${q.pairs[r as number].vi}`).join(" · ");
    default:
      return v as string;
  }
}
