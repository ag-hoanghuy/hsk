import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { AnswerRecord, api, Exercise, LessonDetail } from "../api";
import { buildListeningChoice, buildListeningFill } from "../lib/listengen";
import ListenDialogue from "./listening/ListenDialogue";
import ListenPassageTab from "./listening/ListenPassage";
import ListenWords from "./listening/ListenWords";
import PracticeTab from "./lesson/PracticeTab";

type Mode = "words" | "dialogue" | "passage" | "choice" | "fill";

const MODES: { key: Mode; label: string }[] = [
  { key: "words", label: "Nghe từ vựng" },
  { key: "dialogue", label: "Nghe hội thoại" },
  { key: "passage", label: "Nghe đoạn văn" },
  { key: "choice", label: "Nghe và chọn đáp án" },
  { key: "fill", label: "Nghe và điền từ" },
];

/** A practice set built fresh from the lesson; "Làm lại" builds a new one. */
function GeneratedPractice({
  build,
  onFinish,
  emptyText,
}: {
  build: () => Exercise[];
  onFinish: (score: number, records: AnswerRecord[]) => void;
  emptyText: string;
}) {
  const [round, setRound] = useState(0);
  const exercises = useMemo(build, [round]); // eslint-disable-line react-hooks/exhaustive-deps
  if (exercises.length === 0) return <p className="text-center text-stone-400">{emptyText}</p>;
  return <PracticeTab key={round} exercises={exercises} onFinish={onFinish} onRestart={() => setRound((r) => r + 1)} />;
}

export default function ListeningLesson() {
  const lessonId = Number(useParams().id);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [mode, setMode] = useState<Mode>("words");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLesson(null);
    api.lesson(lessonId).then(setLesson).catch((e) => setError(String(e)));
  }, [lessonId]);

  if (error) return <p className="text-rose-600">Không tải được bài học: {error}</p>;
  if (!lesson) return <p className="text-stone-400">Đang tải…</p>;
  if (!lesson.available) {
    return (
      <div className="rounded-3xl border border-dashed border-rose-200 bg-white p-10 text-center text-stone-500">
        Bài này chưa có nội dung. <Link className="text-rose-500 underline" to="/listening">Quay lại</Link>
      </div>
    );
  }
  const c = lesson.content;

  // Store each finished set as an attempt (for error statistics) and keep the best score.
  const finish = async (score: number, records: AnswerRecord[]) => {
    try {
      await api.createAttempt({ lesson_id: lesson.id, kind: "listening", answers: records });
      await api.saveProgress(lesson.id, "listening", score);
    } catch {
      /* practice still works if saving fails */
    }
  };

  return (
    <div>
      <Link to="/listening" className="text-sm font-medium text-rose-500 hover:underline">
        ← Luyện nghe
      </Link>
      <div className="mt-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-rose-400">
          HSK {lesson.level} · Bài {lesson.number}
        </div>
        <h1 className="mt-1 font-han text-3xl font-bold text-stone-800">{lesson.title_zh}</h1>
        <p className="mt-1 text-stone-500">{lesson.title_vi}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              mode === m.key ? "bg-rose-500 text-white shadow-card" : "bg-white text-stone-600 hover:bg-rose-50"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {mode === "words" && <ListenWords vocab={c.vocab} />}
        {mode === "dialogue" && <ListenDialogue title={c.dialogue.title_vi} lines={c.dialogue.lines} />}
        {mode === "passage" && <ListenPassageTab passages={c.listening ?? []} onFinish={finish} />}
        {mode === "choice" && (
          <GeneratedPractice
            key="choice"
            build={() => buildListeningChoice(c)}
            onFinish={finish}
            emptyText="Chưa đủ nội dung để tạo bài nghe."
          />
        )}
        {mode === "fill" && (
          <GeneratedPractice
            key="fill"
            build={() => buildListeningFill(c)}
            onFinish={finish}
            emptyText="Chưa đủ nội dung để tạo bài điền từ."
          />
        )}
      </div>
    </div>
  );
}
