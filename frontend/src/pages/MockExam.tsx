import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api, Attempt, LessonDetail, TestQuestion } from "../api";
import { Button, Card } from "../components/Card";
import { AnswerValue, gradeQuestion, typeLabel } from "../lib/grading";
import { newSeed, seededShuffle } from "../lib/random";
import { TestRunner } from "./lesson/TestTab";
import TestResult from "./lesson/TestResult";

const PER_TYPE = 5;
const TYPES: TestQuestion["type"][] = ["choice", "match", "order", "fill", "listen_choice", "dictation", "translate_vi_zh", "translate_zh_vi"];

/** Draw up to PER_TYPE questions of every type from all lesson tests of the level; ids become "<lessonId>:<id>". */
function drawExam(lessons: LessonDetail[], seed: string): { questions: TestQuestion[]; lessonOf: Record<string, number> } {
  const lessonOf: Record<string, number> = {};
  const all = lessons.flatMap((l) =>
    (l.content.test ?? []).map((q) => {
      const id = `${l.id}:${q.id}`;
      lessonOf[id] = l.id;
      return { ...q, id } as TestQuestion;
    }),
  );
  const questions = TYPES.flatMap((t) => seededShuffle(all.filter((q) => q.type === t), `${seed}:${t}`).slice(0, PER_TYPE));
  return { questions, lessonOf };
}

type Phase = { name: "intro" } | { name: "run"; seed: string } | { name: "result"; attempt: Attempt; seed: string };

export default function MockExam() {
  const level = Number(useParams().level);
  const [lessons, setLessons] = useState<LessonDetail[] | null>(null);
  const [phase, setPhase] = useState<Phase>({ name: "intro" });
  const [history, setHistory] = useState<Attempt[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLessons(null);
    setPhase({ name: "intro" });
    api
      .lessons(level)
      .then((list) => Promise.all(list.filter((l) => l.has.includes("test")).map((l) => api.lesson(l.id))))
      .then(setLessons)
      .catch((e) => setError(String(e)));
    api.mocks(level).then(setHistory).catch(() => undefined);
  }, [level]);

  const seed = phase.name === "intro" ? null : phase.seed;
  const exam = useMemo(() => (lessons && seed ? drawExam(lessons, seed) : null), [lessons, seed]);
  const pool = useMemo(() => (lessons ?? []).flatMap((l) => l.content.vocab.map((v) => v.hanzi)).join(""), [lessons]);

  if (error) return <p className="text-rose-600">Không tải được dữ liệu: {error}</p>;
  if (!lessons) return <p className="text-stone-400">Đang chuẩn bị đề…</p>;

  const submit = async (answers: Record<string, AnswerValue>) => {
    if (!exam || phase.name !== "run") return;
    setSubmitting(true);
    setError(null);
    try {
      const attempt = await api.createMock(
        level,
        exam.questions.map((q) => ({
          question_id: q.id,
          lesson_id: exam.lessonOf[q.id],
          qtype: q.type,
          tag: q.tag,
          user_answer: answers[q.id] ?? null,
          is_correct: gradeQuestion(q, answers[q.id]),
        })),
      );
      setPhase({ name: "result", attempt, seed: phase.seed });
      api.mocks(level).then(setHistory).catch(() => undefined);
    } catch {
      setError("Không lưu được bài làm, kiểm tra lại kết nối rồi bấm Nộp bài lần nữa nhé.");
    } finally {
      setSubmitting(false);
    }
  };

  if (phase.name === "run" && exam) {
    return (
      <div>
        <h1 className="mb-4 text-xl font-bold text-stone-800">Thi thử HSK {level}</h1>
        <TestRunner
          questions={exam.questions}
          pool={pool}
          seed={phase.seed}
          submitting={submitting}
          error={error}
          onSubmit={submit}
          onQuit={() => setPhase({ name: "intro" })}
        />
      </div>
    );
  }

  if (phase.name === "result" && exam) {
    const wrongBy = new Map<number, number>();
    (phase.attempt.answers ?? []).forEach((a) => {
      if (!a.is_correct) {
        const lid = Number(a.question_id.split(":")[0]);
        wrongBy.set(lid, (wrongBy.get(lid) ?? 0) + 1);
      }
    });
    const weak = [...wrongBy.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-stone-800">Kết quả thi thử HSK {level}</h1>
        {weak.length > 0 && (
          <Card>
            <h3 className="font-bold text-stone-800">Bài nên ôn lại</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {weak.map(([lid, n]) => {
                const l = lessons.find((x) => x.id === lid);
                return (
                  <Link key={lid} to={`/lesson/${lid}`} className="rounded-full bg-rose-50 px-4 py-1.5 text-sm text-rose-600 hover:bg-rose-100">
                    Bài {l?.number}: <span className="font-han">{l?.title_zh}</span> · sai {n}
                  </Link>
                );
              })}
            </div>
          </Card>
        )}
        <TestResult
          questions={exam.questions}
          attempt={phase.attempt}
          onRetry={() => setPhase({ name: "run", seed: newSeed() })}
          onBack={() => setPhase({ name: "intro" })}
          onAccept={async (qid) => {
            const attempt = await api.acceptMockAnswer(phase.attempt.id, qid);
            setPhase({ ...phase, attempt });
          }}
        />
      </div>
    );
  }

  const available = lessons.length;
  const counts = TYPES.map((t) => ({ t, n: Math.min(PER_TYPE, lessons.flatMap((l) => l.content.test ?? []).filter((q) => q.type === t).length) }));
  const total = counts.reduce((s, c) => s + c.n, 0);

  return (
    <div className="space-y-5">
      <Link to="/roadmap" className="text-sm font-medium text-rose-500 hover:underline">
        ← Lộ trình
      </Link>
      <Card>
        <h1 className="text-2xl font-bold text-stone-800">Thi thử cuối cấp HSK {level}</h1>
        <p className="mt-2 text-stone-600">
          Đề gồm {total} câu lấy ngẫu nhiên từ bài kiểm tra của {available} bài đã có nội dung, đủ 8 dạng câu. Mỗi lần làm lại là một đề
          mới. Nên làm khi đã học xong khoảng 4 bài trở lên, và làm hết một lượt trong khoảng 40–50 phút.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {counts.map(({ t, n }) => (
            <span key={t} className="rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-600">
              {typeLabel(t)} · {n}
            </span>
          ))}
        </div>
        <div className="mt-5">
          <Button onClick={() => setPhase({ name: "run", seed: newSeed() })} disabled={total === 0}>
            {history.length > 0 ? "Làm đề mới" : "Bắt đầu thi thử"}
          </Button>
        </div>
      </Card>
      {history.length > 0 && (
        <Card>
          <h3 className="font-bold text-stone-800">Các lần thi thử</h3>
          <div className="mt-3 divide-y divide-rose-50">
            {history.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-sm text-stone-500">{new Date(a.created_at).toLocaleString("vi-VN")}</span>
                <span className="flex items-center gap-3">
                  <span className="text-sm text-stone-400">
                    {a.correct}/{a.total} câu
                  </span>
                  <span className="rounded-full bg-rose-50 px-3 py-0.5 text-sm font-bold text-rose-500">{a.score} điểm</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
