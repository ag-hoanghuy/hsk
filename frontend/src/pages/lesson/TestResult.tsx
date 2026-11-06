import { useMemo, useState } from "react";

import { AnswerRecord, Attempt, TestQuestion } from "../../api";
import AudioButton from "../../components/AudioButton";
import { Button, Card } from "../../components/Card";
import { AnswerValue, correctText, typeLabel, userText } from "../../lib/grading";
import { tagLabel } from "../../lib/tags";

const CAN_ACCEPT = new Set(["fill", "dictation", "translate_vi_zh", "translate_zh_vi"]);

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-rose-100" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-rose-500"
          strokeDasharray={`${(score / 100) * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-rose-500">{score}</span>
        <span className="text-xs text-stone-400">/ 100 điểm</span>
      </div>
    </div>
  );
}

function QuestionBody({ q }: { q: TestQuestion }) {
  switch (q.type) {
    case "choice":
      return <div className="font-han text-lg text-stone-800">{q.question_zh}</div>;
    case "listen_choice":
    case "dictation":
      return (
        <div className="flex items-center gap-2">
          <AudioButton text={q.audio_text} size="sm" />
          <span className="text-sm text-stone-500">
            Nội dung nghe: <span className="font-han text-base text-stone-800">{q.audio_text}</span>
          </span>
        </div>
      );
    case "order":
      return <div className="text-stone-700">Sắp xếp: {q.words.join(" / ")}</div>;
    case "fill":
      return <div className="font-han text-lg text-stone-800">{q.sentence_zh}</div>;
    case "translate_vi_zh":
      return <div className="text-stone-800">{q.source_vi}</div>;
    case "translate_zh_vi":
      return (
        <div className="flex items-center gap-2">
          <span className="font-han text-lg text-stone-800">{q.source_zh}</span>
          <AudioButton text={q.source_zh} size="sm" />
        </div>
      );
    case "match":
      return null;
  }
}

function MatchReview({ q, value }: { q: Extract<TestQuestion, { type: "match" }>; value: AnswerValue }) {
  const links = Array.isArray(value) ? (value as (number | null)[]) : [];
  return (
    <div className="space-y-1.5">
      {q.pairs.map((p, i) => {
        const chosen = links[i];
        const ok = chosen === i;
        return (
          <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
            <span className={ok ? "text-emerald-600" : "text-rose-500"}>{ok ? "✓" : "✗"}</span>
            <span className="font-han text-base text-stone-800">{p.zh}</span>
            <span className="text-stone-400">→</span>
            {ok ? (
              <span className="text-emerald-700">{p.vi}</span>
            ) : (
              <>
                <span className="text-rose-500 line-through">
                  {typeof chosen === "number" ? q.pairs[chosen].vi : "(chưa nối)"}
                </span>
                <span className="text-emerald-700">{p.vi}</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface Props {
  questions: TestQuestion[];
  attempt: Attempt;
  onRetry: () => void;
  onBack: () => void;
  onAccept: (questionId: string) => Promise<void>;
}

export default function TestResult({ questions, attempt, onRetry, onBack, onAccept }: Props) {
  const [onlyWrong, setOnlyWrong] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const records = attempt.answers ?? [];
  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);
  // Keep the test's own order, ignore answers whose question no longer exists in the content.
  const items = records
    .map((r) => ({ r, q: byId.get(r.question_id) }))
    .filter((x): x is { r: AnswerRecord; q: TestQuestion } => x.q !== undefined);

  const stats = useMemo(() => {
    const type = new Map<string, { total: number; wrong: number }>();
    const tag = new Map<string, number>();
    for (const { r } of items) {
      const t = type.get(r.qtype) ?? { total: 0, wrong: 0 };
      t.total++;
      if (!r.is_correct) {
        t.wrong++;
        if (r.tag) tag.set(r.tag, (tag.get(r.tag) ?? 0) + 1);
      }
      type.set(r.qtype, t);
    }
    return { type: [...type.entries()], tag: [...tag.entries()].sort((a, b) => b[1] - a[1]) };
  }, [items]);

  const wrongCount = attempt.total - attempt.correct;
  const message =
    attempt.score >= 90
      ? "Xuất sắc! 🌸"
      : attempt.score >= 70
        ? "Làm tốt lắm! 👏"
        : attempt.score >= 50
          ? "Khá ổn, ôn thêm chút nữa nhé 🙂"
          : "Đừng nản, thử lại nào 💪";

  const accept = async (id: string) => {
    setBusy(id);
    try {
      await onAccept(id);
    } finally {
      setBusy(null);
    }
  };

  const shown = items.map((x, i) => ({ ...x, n: i + 1 })).filter((x) => !onlyWrong || !x.r.is_correct);

  return (
    <div className="space-y-5">
      <Card className="text-center">
        <ScoreRing score={attempt.score} />
        <div className="mt-3 text-lg font-bold text-stone-800">{message}</div>
        <div className="mt-1 text-stone-500">
          Đúng {attempt.correct} / {attempt.total} câu · Sai {wrongCount} câu
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button onClick={onRetry}>Làm lại bài kiểm tra</Button>
          <Button variant="soft" onClick={onBack}>
            Quay lại
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-stone-800">Thống kê lỗi sai</h3>
        <div className="mt-4 space-y-3">
          {stats.type.map(([type, s]) => {
            const right = s.total - s.wrong;
            return (
              <div key={type}>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">{typeLabel(type)}</span>
                  <span className={s.wrong > 0 ? "font-semibold text-rose-500" : "font-semibold text-emerald-600"}>
                    {right}/{s.total} đúng
                  </span>
                </div>
                <div className="mt-1 flex h-2.5 overflow-hidden rounded-full bg-rose-100">
                  <div className="bg-emerald-400" style={{ width: `${(right / s.total) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5">
          <div className="text-sm font-semibold text-stone-600">Từ vựng / ngữ pháp cần ôn lại</div>
          {stats.tag.length === 0 ? (
            <p className="mt-2 text-sm text-emerald-600">Tuyệt vời, bạn không sai câu nào! 🎉</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {stats.tag.map(([tag, n]) => (
                <span key={tag} className="rounded-full bg-rose-50 px-3 py-1 font-han text-sm text-rose-600">
                  {tagLabel(tag)}
                  {n > 1 && ` ×${n}`}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-800">Đáp án chi tiết</h3>
          <div className="inline-flex rounded-full bg-rose-50 p-1 text-sm font-semibold">
            {[
              { v: false, label: "Tất cả" },
              { v: true, label: `Câu sai (${wrongCount})` },
            ].map((o) => (
              <button
                key={String(o.v)}
                type="button"
                onClick={() => setOnlyWrong(o.v)}
                className={`rounded-full px-4 py-1.5 transition ${
                  onlyWrong === o.v ? "bg-white text-rose-500 shadow-card" : "text-stone-500"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {shown.length === 0 && <p className="text-center text-stone-400">Không có câu sai nào.</p>}
          {shown.map(({ q, r, n }) => {
            const value = r.user_answer as AnswerValue;
            const mine = userText(q, value);
            return (
              <Card key={r.question_id} className={`border-l-4 ${r.is_correct ? "border-emerald-400" : "border-rose-400"}`}>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-stone-400">Câu {n}</span>
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-rose-500">{typeLabel(q.type)}</span>
                  <span className={r.is_correct ? "text-emerald-600" : "text-rose-500"}>
                    {r.is_correct ? "✓ Đúng" : "✗ Sai"}
                  </span>
                  {r.overridden && <span className="text-stone-400">(bạn xác nhận đúng)</span>}
                </div>
                <div className="mt-2">
                  <QuestionBody q={q} />
                </div>
                {q.type === "match" ? (
                  <div className="mt-3">
                    <MatchReview q={q} value={value} />
                  </div>
                ) : (
                  <div className="mt-3 space-y-1 text-sm">
                    <div>
                      <span className="text-stone-400">Bạn trả lời: </span>
                      <span className={`${r.is_correct ? "text-emerald-700" : "text-rose-600"} ${mine ? "" : "italic"}`}>
                        {mine || "(bỏ trống)"}
                      </span>
                    </div>
                    {!r.is_correct && (
                      <div>
                        <span className="text-stone-400">Đáp án đúng: </span>
                        <span className="font-medium text-emerald-700">{correctText(q)}</span>
                      </div>
                    )}
                  </div>
                )}
                {q.explanation_vi && (
                  <div className="mt-3 rounded-2xl bg-cream p-3 text-sm text-stone-600">💡 {q.explanation_vi}</div>
                )}
                {!r.is_correct && CAN_ACCEPT.has(q.type) && mine && (
                  <button
                    type="button"
                    disabled={busy === r.question_id}
                    onClick={() => accept(r.question_id)}
                    className="mt-3 text-sm font-medium text-rose-500 hover:underline disabled:opacity-50"
                  >
                    Câu trả lời của mình cũng đúng
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
