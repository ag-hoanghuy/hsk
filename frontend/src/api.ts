export interface LessonSummary {
  id: number;
  level: number;
  number: number;
  title_zh: string;
  title_vi: string;
  summary: string;
  grammar_points: string[];
  available: boolean;
  has: string[]; // content sections present, e.g. "reading", "listening"
}

export interface VocabItem {
  id: string;
  hanzi: string;
  pinyin: string;
  pos: string;
  meaning_vi: string;
  example_zh: string;
  example_pinyin: string;
  example_vi: string;
  hanviet?: string; // Sino-Vietnamese reading, e.g. "CHU MẠT"
  note_vi?: string; // easily confused words, usage notes
}

/** A word that appears in the lesson's texts but is not taught in it (base HSK 3.0 level 1–2 word, or above the level). */
export interface GlossaryItem {
  hanzi: string;
  pinyin: string;
  meaning_vi: string;
  kind: "base" | "beyond";
}

export interface SpeakingDrill {
  id: string;
  zh: string;
  pinyin: string;
  vi: string;
  tip_vi: string; // what to watch out for (tones, sandhi, sounds)
}

export interface Example {
  zh: string;
  pinyin: string;
  vi: string;
}

export interface GrammarItem {
  id: string;
  title: string;
  pattern: string;
  explanation_vi: string;
  examples: Example[];
  mistakes_vi?: string; // typical mistakes of Vietnamese learners (wrong → right)
  compare_vi?: string; // comparison with Vietnamese, when it helps
}

export interface DialogueLine extends Example {
  speaker: string;
}

interface ExerciseBase {
  id: string;
  tag: string;
  prompt_vi: string;
  explanation_vi?: string;
}

export interface ChoiceExercise extends ExerciseBase {
  type: "choice";
  question_zh: string;
  options: string[];
  answer: number;
}

export interface OrderExercise extends ExerciseBase {
  type: "order";
  words: string[];
  answers: string[];
  translation_vi: string;
}

export interface MatchExercise extends ExerciseBase {
  type: "match";
  pairs: { zh: string; vi: string }[];
}

/** Hear a sentence, then pick the missing word of its written form (options include the answer). */
export interface ListenFillExercise extends ExerciseBase {
  type: "listen_fill";
  audio_text: string;
  sentence_zh: string; // contains "____"
  options: string[];
  answer: number;
}

export type Exercise = ChoiceExercise | OrderExercise | MatchExercise | ListenChoiceQuestion | ListenFillExercise;

/** A word of a reading passage: [hanzi, pinyin?, meaning?]; punctuation has only the first item. */
export type ReadingToken = [string] | [string, string] | [string, string, string];

export interface ReadingParagraph {
  tokens: ReadingToken[];
  vi: string;
}

export interface ReadingPassage {
  id: string;
  title_zh: string;
  title_vi: string;
  paragraphs: ReadingParagraph[];
  questions: Exercise[];
}

/** A short passage that is only heard first; its text is revealed afterwards. */
export interface ListeningPassage {
  id: string;
  title_vi: string;
  text_zh: string;
  pinyin: string;
  vi: string;
  questions: Exercise[];
}

/** Fill in the blank: the learner types the missing word (marked "____" in sentence_zh). */
export interface FillQuestion extends ExerciseBase {
  type: "fill";
  sentence_zh: string;
  answers: string[];
  hint_vi?: string;
}

export interface ListenChoiceQuestion extends ExerciseBase {
  type: "listen_choice";
  audio_text: string;
  options: string[];
  answer: number;
}

export interface DictationQuestion extends ExerciseBase {
  type: "dictation";
  audio_text: string;
  answers: string[];
}

export interface TranslateViZhQuestion extends ExerciseBase {
  type: "translate_vi_zh";
  source_vi: string;
  answers: string[];
}

export interface TranslateZhViQuestion extends ExerciseBase {
  type: "translate_zh_vi";
  source_zh: string;
  answers_vi: string[];
  /** Each group lists synonyms; the answer is accepted if it contains one word of every group. */
  keywords?: string[][];
}

export type TestQuestion =
  | ChoiceExercise
  | MatchExercise
  | OrderExercise
  | FillQuestion
  | ListenChoiceQuestion
  | DictationQuestion
  | TranslateViZhQuestion
  | TranslateZhViQuestion;

export type TestType = TestQuestion["type"];

export interface LessonContent {
  objectives?: string[];
  vocab: VocabItem[];
  extra_vocab?: VocabItem[];
  glossary?: GlossaryItem[];
  grammar: GrammarItem[];
  dialogue: { title_vi: string; scene_vi?: string; lines: DialogueLine[] };
  speaking?: SpeakingDrill[];
  review?: { remember: string[]; mistakes: string[] };
  exercises: Exercise[];
  quiz?: { grammar?: ChoiceExercise[] };
  test?: TestQuestion[];
  reading?: ReadingPassage[];
  listening?: ListeningPassage[];
}

export interface LessonDetail extends LessonSummary {
  content: LessonContent;
}

export type Section = "vocab" | "grammar" | "dialogue" | "practice" | "quiz" | "test" | "listening" | "reading" | "speaking";
/** The sections of the lesson page itself, shown as progress dots (listening and reading have their own pages). */
export const SECTIONS: Section[] = ["vocab", "grammar", "dialogue", "practice", "quiz", "test"];

export type AttemptKind = "quiz_vocab" | "quiz_grammar" | "test" | "listening" | "reading";

export interface AnswerRecord {
  question_id: string;
  qtype: string;
  tag: string;
  user_answer: unknown;
  is_correct: boolean;
  overridden?: boolean;
}

export interface Attempt {
  id: number;
  lesson_id: number;
  kind: AttemptKind;
  correct: number;
  total: number;
  score: number;
  extra: { points?: number; streak_max?: number };
  created_at: string;
  answers?: AnswerRecord[];
}

export interface ErrorStat {
  key: string;
  total: number;
  wrong: number;
}

export interface ErrorStats {
  attempts: number;
  by_tag: ErrorStat[];
  by_type: ErrorStat[];
}

export interface ProgressRow {
  lesson_id: number;
  section: Section;
  best_score: number | null;
  completed_at: string;
}

export type SyllableStatus = "ok" | "tone" | "sound" | "missing";

export interface SpeakingSyllable {
  index: number;
  hanzi: string;
  pinyin: string;
  tone: number; // dictionary tone, 0 = neutral
  status: SyllableStatus;
  score: number; // 0-100
  heard?: string; // what the model heard instead, as pinyin
  note?: string; // Vietnamese explanation
}

export interface SpeakingCharts {
  step: number; // seconds per sample
  bounds: number[]; // syllable boundaries (sample index on the pitch axes), syllables + 1 values
  ref_pitch: (number | null)[]; // sample pitch, normalised (about -1..1), null = unvoiced
  usr_pitch: (number | null)[]; // learner pitch warped onto the sample's time axis
  ref_wave: number[]; // 0..1 loudness per 20 ms
  usr_wave: number[];
}

export interface SpeakingResult {
  id: number;
  lesson_id: number;
  text: string;
  overall: number;
  accuracy: number;
  fluency: number;
  stars: number; // 1-5
  verdict: string;
  heard: string; // what the speech recogniser wrote down
  syllables: SpeakingSyllable[];
  tips: string[];
  stats: { ref_seconds: number; usr_seconds: number; ratio: number; pauses: number; extra_pauses: number };
  charts: SpeakingCharts;
  created_at: string;
}

export interface SpeakingStatus {
  state: "idle" | "loading" | "ready" | "error";
  model: string;
  error: string | null;
}

export interface SpeakingBest {
  text: string;
  best: number;
  tries: number;
}

export interface ReviewStep {
  step: number; // 1..5 → 1, 3, 7, 14, 30 days after the lesson test
  due: string; // YYYY-MM-DD
  done_on: string | null;
  status: "done" | "due" | "upcoming";
}

export interface ReviewItem extends ReviewStep {
  lesson_id: number;
  level: number;
  number: number;
  title_zh: string;
  title_vi: string;
  overdue_days?: number;
}

export interface LessonOverview {
  id: number;
  level: number;
  number: number;
  title_zh: string;
  title_vi: string;
  available: boolean;
  done: Section[];
  scores: Partial<Record<Section, number>>;
  speaking_best: number | null;
  last_activity: string | null;
  learned_on: string | null;
  reviews: ReviewStep[];
}

export interface Overview {
  today: string;
  streak: number;
  active_days: number;
  calendar: { date: string; count: number }[];
  totals: {
    lessons_available: number;
    lessons_started: number;
    lessons_finished: number;
    words_learned: number;
    tests_taken: number;
    avg_test: number | null;
    speaking_attempts: number;
    mock_best: Record<string, number | null>;
  };
  lessons: LessonOverview[];
  reviews_due: ReviewItem[];
  reviews_upcoming: ReviewItem[];
  mistakes: { lesson_id: number; level: number; number: number; tag: string; total: number; wrong: number }[];
}

export interface CurriculumItem {
  level: number;
  number: number;
  title_zh: string;
  title_vi: string;
  grammar_points: string[];
  theme_vi: string;
  goal_vi: string;
  id: number | null;
  available: boolean;
  vocab_count: number;
  extra_count: number;
  objectives: string[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      /* keep the status line */
    }
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  lessons: (level: number) => request<LessonSummary[]>(`/api/lessons?level=${level}`),
  lesson: (id: number) => request<LessonDetail>(`/api/lessons/${id}`),
  progress: (lessonId?: number) =>
    request<ProgressRow[]>(lessonId ? `/api/progress?lesson_id=${lessonId}` : "/api/progress"),
  saveProgress: (lesson_id: number, section: Section, score?: number) =>
    request<ProgressRow>("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_id, section, score }),
    }),
  createAttempt: (body: {
    lesson_id: number;
    kind: AttemptKind;
    answers: AnswerRecord[];
    points?: number;
    streak_max?: number;
  }) =>
    request<Attempt>("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  attempts: (lessonId: number, kind: AttemptKind) =>
    request<Attempt[]>(`/api/attempts?lesson_id=${lessonId}&kind=${kind}`),
  attempt: (id: number) => request<Attempt>(`/api/attempts/${id}`),
  acceptAnswer: (attemptId: number, questionId: string) =>
    request<Attempt>(`/api/attempts/${attemptId}/answers/${encodeURIComponent(questionId)}/accept`, {
      method: "POST",
    }),
  errorStats: (lessonId: number, kind?: AttemptKind) =>
    request<ErrorStats>(`/api/stats/errors?lesson_id=${lessonId}${kind ? `&kind=${kind}` : ""}`),
  speakingStatus: () => request<SpeakingStatus>("/api/speaking/status"),
  assessSpeaking: (lessonId: number, text: string, wav: Blob) =>
    request<SpeakingResult>(`/api/speaking/assess?lesson_id=${lessonId}&text=${encodeURIComponent(text)}`, {
      method: "POST",
      headers: { "Content-Type": "audio/wav" },
      body: wav,
    }),
  speakingBest: (lessonId: number) => request<SpeakingBest[]>(`/api/speaking/best?lesson_id=${lessonId}`),
  overview: () => request<Overview>("/api/overview"),
  createMock: (level: number, answers: (AnswerRecord & { lesson_id: number })[]) =>
    request<Attempt>("/api/mock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, answers }),
    }),
  mocks: (level: number) => request<Attempt[]>(`/api/mock?level=${level}`),
  mock: (id: number) => request<Attempt>(`/api/mock/${id}`),
  acceptMockAnswer: (id: number, questionId: string) =>
    request<Attempt>(`/api/mock/${id}/answers/${encodeURIComponent(questionId)}/accept`, { method: "POST" }),
  curriculum: () => request<CurriculumItem[]>("/api/curriculum"),
};
