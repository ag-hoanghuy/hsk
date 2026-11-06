import { useEffect, useMemo, useState } from "react";

import { AnswerRecord, api, Attempt, ErrorStats, LessonDetail, TestQuestion } from "../../api";
import { Button, Card } from "../../components/Card";
import TestQuestionView from "../../components/questions/TestQuestionView";
import { AnswerValue, gradeQuestion, isAnswered, typeLabel } from "../../lib/grading";
import { newSeed } from "../../lib/random";
import { tagLabel } from "../../lib/tags";
import TestResult from "./TestResult";

function TestRunner({
  questions,
  pool,
  seed,
  submitting,
  error,
  onSubmit,
  onQuit,
}: {
  questions: TestQuestion[];
  pool: string;
  seed: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (answers: Record<string, AnswerValue>) => void;
  onQuit: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [confirming, setConfirming] = useState(false);

  const q = questions[idx];
  const unanswered = questions.filter((x) => !isAnswered(x, answers[x.id])).length;

  const go = (i: number) => {
    setIdx(i);
    setConfirming(false);
  };

  const submit = () => {
    if (unanswered > 0 && !confirming) {
      setConfirming(true);
      return;
    }
    onSubmit(answers);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-semibold">
        <button type="button" onClick={onQuit} className="text-stone-400 hover:text-rose-500">
          ✕ Thoát bài kiểm tra
        </button>
        <span className="text-stone-500">
          Đã làm {questions.length - unanswered}/{questions.length}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {questions.map((x, i) => {
          const done = isAnswered(x, answers[x.id]);
          return (
            <button
              key={x.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Câu ${i + 1}`}
              className={`h-8 w-8 rounded-full text-xs font-bold transition ${
                i === idx
                  ? "bg-rose-500 text-white shadow-card"
                  : done
                    ? "bg-rose-200 text-rose-700"
                    : "bg-white text-stone-400 hover:bg-rose-50"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <Card>
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-rose-400">
          Câu {idx + 1} · {typeLabel(q.type)}
        </div>
        <div className="mb-4 text-sm font-semibold text-stone-500">{q.prompt_vi}</div>
        <TestQuestionView
          key={q.id}
          q={q}
          value={answers[q.id]}
          onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
          seed={seed}
          pool={pool}
        />
      </Card>

      <div className="mt-5 flex items-center justify-between">
        <Button variant="soft" onClick={() => go(idx - 1)} disabled={idx === 0}>
          ← Câu trước
        </Button>
        {idx < questions.length - 1 ? (
          <Button onClick={() => go(idx + 1)}>Câu sau →</Button>
        ) : (
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Đang chấm…" : "Nộp bài"}
          </Button>
        )}
      </div>

      {idx < questions.length - 1 && (
        <div className="mt-4 text-center">
          <button type="button" onClick={submit} className="text-sm font-medium text-rose-500 hover:underline">
            Nộp bài ngay
          </button>
        </div>
      )}
      {confirming && (
        <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
          Bạn còn <b>{unanswered}</b> câu chưa trả lời (sẽ tính là sai). Bấm “Nộp bài” lần nữa để nộp, hoặc chọn số câu ở trên để quay lại làm.
        </div>
      )}
      {error && <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
    </div>
  );
}

type Phase =
  | { name: "intro" }
  | { name: "run"; seed: string }
  | { name: "result"; attempt: Attempt };

export default function TestTab({
  lesson,
  onFinished,
}: {
  lesson: LessonDetail;
  onFinished: (score: number) => void;
}) {
  const questions = lesson.content.test ?? [];
  const pool = useMemo(() => lesson.content.vocab.map((v) => v.hanzi).join(""), [lesson]);
  const [phase, setPhase] = useState<Phase>({ name: "intro" });
  const [history, setHistory] = useState<Attempt[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIntro = () => {
    api.attempts(lesson.id, "test").then(setHistory).catch(() => undefined);
    api.errorStats(lesson.id, "test").then(setStats).catch(() => undefined);
  };
  useEffect(loadIntro, [lesson.id]);

  const submit = async (answers: Record<string, AnswerValue>) => {
    setSubmitting(true);
    setError(null);
    const records: AnswerRecord[] = questions.map((q) => ({
      question_id: q.id,
      qtype: q.type,
      tag: q.tag,
      user_answer: answers[q.id] ?? null,
      is_correct: gradeQuestion(q, answers[q.id]),
    }));
    try {
      const attempt = await api.createAttempt({ lesson_id: lesson.id, kind: "test", answers: records });
      onFinished(attempt.score);
      setPhase({ name: "result", attempt });
    } catch {
      setError("Không lưu được bài làm, kiểm tra lại kết nối rồi bấm Nộp bài lần nữa nhé.");
    } finally {
      setSubmitting(false);
    }
  };

  const openAttempt = async (id: number) => {
    const attempt = await api.attempt(id);
    setPhase({ name: "result", attempt });
  };

  const accept = async (questionId: string) => {
    if (phase.name !== "result") return;
    const attempt = await api.acceptAnswer(phase.attempt.id, questionId);
    setPhase({ name: "result", attempt });
    onFinished(attempt.score);
  };

  const backToIntro = () => {
    setPhase({ name: "intro" });
    loadIntro();
  };

  if (questions.length === 0) {
    return <p className="text-center text-stone-400">Bài này chưa có bài kiểm tra.</p>;
  }

  if (phase.name === "run") {
    return (
      <TestRunner
        questions={questions}
        pool={pool}
        seed={phase.seed}
        submitting={submitting}
        error={error}
        onSubmit={submit}
        onQuit={backToIntro}
      />
    );
  }

  if (phase.name === "result") {
    return (
      <TestResult
        questions={questions}
        attempt={phase.attempt}
        onRetry={() => setPhase({ name: "run", seed: newSeed() })}
        onBack={backToIntro}
        onAccept={accept}
      />
    );
  }

  const typeCounts = new Map<string, number>();
  questions.forEach((q) => typeCounts.set(q.type, (typeCounts.get(q.type) ?? 0) + 1));
  const topTags = (stats?.by_tag ?? []).filter((t) => t.wrong > 0).slice(0, 6);

  return (
    <div className="space-y-5">
      <Card>
        <h3 className="text-lg font-bold text-stone-800">Bài kiểm tra cuối bài</h3>
        <p className="mt-1 text-sm text-stone-500">
          {questions.length} câu, gồm {typeCounts.size} dạng. Làm xong mới nộp bài; sau đó bạn sẽ thấy điểm, đáp án đúng/sai,
          giải thích và thống kê lỗi. Có thể làm lại bao nhiêu lần tùy thích.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[...typeCounts.entries()].map(([type, n]) => (
            <span key={type} className="rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-600">
              {typeLabel(type)} · {n}
            </span>
          ))}
        </div>
        <div className="mt-5">
          <Button onClick={() => setPhase({ name: "run", seed: newSeed() })}>
            {history.length > 0 ? "Làm lại bài kiểm tra" : "Bắt đầu làm bài"}
          </Button>
        </div>
      </Card>

      {history.length > 0 && (
        <Card>
          <h3 className="font-bold text-stone-800">Các lần làm gần đây</h3>
          <div className="mt-3 divide-y divide-rose-50">
            {history.slice(0, 5).map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => openAttempt(a.id)}
                className="flex w-full items-center justify-between gap-3 py-2.5 text-left transition hover:bg-rose-50/50"
              >
                <span className="text-sm text-stone-500">{new Date(a.created_at).toLocaleString("vi-VN")}</span>
                <span className="flex items-center gap-3">
                  <span className="text-sm text-stone-400">
                    {a.correct}/{a.total} câu
                  </span>
                  <span className="rounded-full bg-rose-50 px-3 py-0.5 text-sm font-bold text-rose-500">{a.score} điểm</span>
                  <span className="text-sm font-medium text-rose-500">Xem lại</span>
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {topTags.length > 0 && (
        <Card>
          <h3 className="font-bold text-stone-800">Lỗi hay gặp qua các lần làm</h3>
          <p className="mt-1 text-sm text-stone-500">Những nội dung bạn hay làm sai nhất, nên ôn lại trước khi làm tiếp.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topTags.map((t) => (
              <span key={t.key} className="rounded-full bg-rose-50 px-3 py-1 font-han text-sm text-rose-600">
                {tagLabel(t.key)} · sai {t.wrong}/{t.total}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
