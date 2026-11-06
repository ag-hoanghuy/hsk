import { useEffect, useRef, useState } from "react";

import { AnswerRecord, api, Attempt, AttemptKind, LessonDetail } from "../../api";
import AudioButton from "../../components/AudioButton";
import { Button, Card } from "../../components/Card";
import PinyinText from "../../components/PinyinText";
import { playText, stopAudio } from "../../lib/audio";
import { buildGrammarQuiz, buildVocabQuiz, QuizQuestion } from "../../lib/quizgen";

type QuizKind = Extract<AttemptKind, "quiz_vocab" | "quiz_grammar">;

const LIMIT_MS = 20000;

const OPTION_STYLES = [
  { idle: "bg-rose-100 text-rose-900 hover:bg-rose-200", badge: "bg-rose-500" },
  { idle: "bg-sky-100 text-sky-900 hover:bg-sky-200", badge: "bg-sky-500" },
  { idle: "bg-amber-100 text-amber-900 hover:bg-amber-200", badge: "bg-amber-500" },
  { idle: "bg-emerald-100 text-emerald-900 hover:bg-emerald-200", badge: "bg-emerald-500" },
];

interface Summary {
  points: number;
  correct: number;
  total: number;
  maxStreak: number;
  records: AnswerRecord[];
}

function QuizPlayer({
  questions,
  timed,
  onFinish,
  onQuit,
}: {
  questions: QuizQuestion[];
  timed: boolean;
  onFinish: (s: Summary) => void;
  onQuit: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null); // -1 = ran out of time
  const [left, setLeft] = useState(LIMIT_MS);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [gain, setGain] = useState(0);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const startedAt = useRef(Date.now());
  const q = questions[idx];

  // New question: reset the clock and read the word aloud when the question has audio.
  useEffect(() => {
    startedAt.current = Date.now();
    setLeft(LIMIT_MS);
    if (q.audioText) playText(q.audioText).catch(() => undefined);
    return stopAudio;
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (i: number) => {
    if (picked !== null) return;
    const correct = i === q.answer;
    const remaining = Math.max(0, LIMIT_MS - (Date.now() - startedAt.current));
    const base = timed ? 500 + Math.round((500 * remaining) / LIMIT_MS) : 1000;
    const earned = correct ? base + Math.min(streak, 4) * 50 : 0;
    const nextStreak = correct ? streak + 1 : 0;
    setPicked(i);
    setGain(earned);
    setPoints((p) => p + earned);
    setStreak(nextStreak);
    setMaxStreak((m) => Math.max(m, nextStreak));
    setRecords((r) => [
      ...r,
      { question_id: q.id, qtype: "quiz_choice", tag: q.tag, user_answer: i >= 0 ? q.options[i] : null, is_correct: correct },
    ]);
  };

  // Countdown; stops once the learner has answered.
  const pickRef = useRef(pick);
  pickRef.current = pick;
  useEffect(() => {
    if (!timed || picked !== null) return;
    const timer = setInterval(() => {
      const remaining = LIMIT_MS - (Date.now() - startedAt.current);
      if (remaining <= 0) {
        clearInterval(timer);
        setLeft(0);
        pickRef.current(-1);
      } else {
        setLeft(remaining);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [idx, timed, picked]);

  const next = () => {
    if (idx + 1 >= questions.length) {
      const correct = records.filter((r) => r.is_correct).length;
      onFinish({ points, correct, total: questions.length, maxStreak, records });
      return;
    }
    setIdx(idx + 1);
    setPicked(null);
    setGain(0);
  };

  const revealed = picked !== null;
  const ok = picked === q.answer;
  const pct = (left / LIMIT_MS) * 100;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-semibold">
        <button type="button" onClick={onQuit} className="text-stone-400 hover:text-rose-500">
          ✕ Thoát
        </button>
        <span className="text-stone-500">
          Câu {idx + 1}/{questions.length}
        </span>
        <div className="flex items-center gap-3">
          <span className={streak >= 2 ? "text-orange-500" : "text-stone-400"}>🔥 {streak}</span>
          <span className="text-rose-500">⭐ {points}</span>
        </div>
      </div>
      {timed && (
        <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-rose-100">
          <div
            className={`h-full rounded-full ${pct < 25 ? "bg-red-500" : "bg-rose-400"}`}
            style={{ width: `${pct}%`, transition: "width 100ms linear" }}
          />
        </div>
      )}

      <Card className="text-center">
        <div className="text-sm font-semibold text-rose-400">{q.prompt_vi}</div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className={q.mainIsZh ? "font-han text-5xl font-bold text-stone-800" : "text-2xl font-semibold text-stone-800"}>
            {q.main}
          </div>
          {q.audioText && <AudioButton text={q.audioText} />}
        </div>
        {q.sub && <PinyinText text={q.sub} className="mt-1 block text-lg" />}
      </Card>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const style = OPTION_STYLES[i % OPTION_STYLES.length];
          let cls = style.idle;
          if (revealed) {
            if (i === q.answer) cls = "bg-emerald-500 text-white";
            else if (i === picked) cls = "bg-rose-500 text-white";
            else cls = `${style.idle} opacity-40`;
          }
          const zh = /[一-鿿]/.test(opt);
          return (
            <button
              key={i}
              type="button"
              disabled={revealed}
              onClick={() => pick(i)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-left text-lg font-medium shadow-card transition ${cls}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                  revealed && i === q.answer ? "bg-white/30" : style.badge
                }`}
              >
                {"ABCD"[i]}
              </span>
              <span className={zh ? "font-han text-xl" : ""}>{opt}</span>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className={`mt-5 rounded-2xl p-4 ${ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          <div className="flex items-center justify-between">
            <div className="font-semibold">
              {ok ? "Chính xác! 🎉" : picked === -1 ? "Hết giờ rồi ⏰" : "Chưa đúng rồi"}
            </div>
            {ok && <div className="font-bold">+{gain}</div>}
          </div>
          {q.explanation && <div className="mt-1 text-sm">{q.explanation}</div>}
        </div>
      )}
      {revealed && (
        <div className="mt-5 text-right">
          <Button onClick={next}>{idx + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp theo"}</Button>
        </div>
      )}
    </div>
  );
}

function QuizResult({
  summary,
  questions,
  onAgain,
  onMenu,
}: {
  summary: Summary;
  questions: QuizQuestion[];
  onAgain: () => void;
  onMenu: () => void;
}) {
  const pct = Math.round((summary.correct / summary.total) * 100);
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
  const wrong = summary.records.filter((r) => !r.is_correct);

  return (
    <div className="space-y-5">
      <Card className="text-center">
        <div className="text-4xl tracking-widest">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</div>
        <div className="mt-3 text-4xl font-bold text-rose-500">{summary.points} điểm</div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-stone-500">
          <span>
            Đúng {summary.correct}/{summary.total} câu ({pct}%)
          </span>
          <span>🔥 Chuỗi đúng dài nhất: {summary.maxStreak}</span>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={onAgain}>Chơi lại</Button>
          <Button variant="soft" onClick={onMenu}>
            Về menu
          </Button>
        </div>
      </Card>

      {wrong.length > 0 && (
        <Card>
          <h3 className="font-bold text-stone-800">Những câu cần xem lại</h3>
          <div className="mt-3 space-y-3">
            {wrong.map((r) => {
              const q = questions.find((x) => x.id === r.question_id)!;
              return (
                <div key={r.question_id} className="rounded-2xl bg-cream p-3">
                  <div className={q.mainIsZh ? "font-han text-xl" : "text-base font-medium"}>{q.main}</div>
                  <div className="mt-1 text-sm text-emerald-700">
                    Đáp án đúng: <span className={/[一-鿿]/.test(q.options[q.answer]) ? "font-han text-base" : ""}>{q.options[q.answer]}</span>
                  </div>
                  {q.explanation && <div className="mt-1 text-sm text-stone-500">{q.explanation}</div>}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

type Phase =
  | { name: "menu" }
  | { name: "play"; kind: QuizKind; questions: QuizQuestion[] }
  | { name: "result"; kind: QuizKind; questions: QuizQuestion[]; summary: Summary };

export default function QuizTab({
  lesson,
  onFinished,
}: {
  lesson: LessonDetail;
  onFinished: (score: number) => void;
}) {
  const [phase, setPhase] = useState<Phase>({ name: "menu" });
  const [timed, setTimed] = useState(true);
  const [best, setBest] = useState<Partial<Record<QuizKind, { points: number; score: number }>>>({});
  const [saveError, setSaveError] = useState(false);

  const grammarItems = lesson.content.quiz?.grammar ?? [];
  const build = (kind: QuizKind) =>
    kind === "quiz_vocab" ? buildVocabQuiz(lesson.content.vocab, 10) : buildGrammarQuiz(grammarItems);

  const loadBest = () => {
    (["quiz_vocab", "quiz_grammar"] as QuizKind[]).forEach((kind) =>
      api
        .attempts(lesson.id, kind)
        .then((list: Attempt[]) => {
          if (list.length === 0) return;
          const points = Math.max(...list.map((a) => a.extra.points ?? 0));
          const score = Math.max(...list.map((a) => a.score));
          setBest((b) => ({ ...b, [kind]: { points, score } }));
        })
        .catch(() => undefined),
    );
  };
  useEffect(loadBest, [lesson.id]);

  const start = (kind: QuizKind) => setPhase({ name: "play", kind, questions: build(kind) });

  const finish = async (kind: QuizKind, questions: QuizQuestion[], summary: Summary) => {
    setPhase({ name: "result", kind, questions, summary });
    setSaveError(false);
    try {
      await api.createAttempt({
        lesson_id: lesson.id,
        kind,
        answers: summary.records,
        points: summary.points,
        streak_max: summary.maxStreak,
      });
      onFinished(Math.round((summary.correct / summary.total) * 100));
      loadBest();
    } catch {
      setSaveError(true);
    }
  };

  if (phase.name === "play") {
    return (
      <QuizPlayer
        key={phase.questions.map((q) => q.id).join()}
        questions={phase.questions}
        timed={timed}
        onFinish={(s) => finish(phase.kind, phase.questions, s)}
        onQuit={() => setPhase({ name: "menu" })}
      />
    );
  }

  if (phase.name === "result") {
    return (
      <div>
        <QuizResult
          summary={phase.summary}
          questions={phase.questions}
          onAgain={() => start(phase.kind)}
          onMenu={() => setPhase({ name: "menu" })}
        />
        {saveError && <p className="mt-3 text-center text-sm text-rose-500">Không lưu được kết quả, kiểm tra lại kết nối nhé.</p>}
      </div>
    );
  }

  const cards: { kind: QuizKind; icon: string; title: string; desc: string; disabled: boolean }[] = [
    {
      kind: "quiz_vocab",
      icon: "📖",
      title: "Quiz từ vựng",
      desc: "10 câu: chọn nghĩa, chọn từ tiếng Trung, nghe và chọn từ.",
      disabled: lesson.content.vocab.length < 4,
    },
    {
      kind: "quiz_grammar",
      icon: "✏️",
      title: "Quiz ngữ pháp",
      desc: `${grammarItems.length} câu về các điểm ngữ pháp của bài.`,
      disabled: grammarItems.length === 0,
    },
  ];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-card">
        <div>
          <div className="font-semibold text-stone-800">Đếm giờ (20 giây mỗi câu)</div>
          <div className="text-sm text-stone-500">Trả lời nhanh được thêm điểm. Tắt đi để chơi thong thả.</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={timed}
          onClick={() => setTimed(!timed)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${timed ? "bg-rose-500" : "bg-stone-300"}`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${timed ? "left-[1.5rem]" : "left-0.5"}`}
          />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Card key={c.kind}>
            <div className="text-4xl">{c.icon}</div>
            <h3 className="mt-3 text-lg font-bold text-stone-800">{c.title}</h3>
            <p className="mt-1 text-sm text-stone-500">{c.desc}</p>
            {best[c.kind] && (
              <p className="mt-2 text-sm font-medium text-rose-500">
                Điểm cao nhất: {best[c.kind]!.points} ⭐ · {best[c.kind]!.score}% đúng
              </p>
            )}
            <div className="mt-4">
              <Button onClick={() => start(c.kind)} disabled={c.disabled}>
                Chơi ngay
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
