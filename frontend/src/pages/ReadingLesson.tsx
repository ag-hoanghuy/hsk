import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { AnswerRecord, api, LessonDetail } from "../api";
import PassageView from "./reading/PassageView";

export default function ReadingLesson() {
  const lessonId = Number(useParams().id);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLesson(null);
    setCurrent(0);
    api.lesson(lessonId).then(setLesson).catch((e) => setError(String(e)));
  }, [lessonId]);

  if (error) return <p className="text-rose-600">Không tải được bài học: {error}</p>;
  if (!lesson) return <p className="text-stone-400">Đang tải…</p>;

  const passages = lesson.content.reading ?? [];
  if (passages.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-rose-200 bg-white p-10 text-center text-stone-500">
        Bài này chưa có đoạn văn đọc. <Link className="text-rose-500 underline" to="/reading">Quay lại</Link>
      </div>
    );
  }

  // Store each finished question set as an attempt (for error statistics) and keep the best score.
  const finish = async (score: number, records: AnswerRecord[]) => {
    try {
      await api.createAttempt({ lesson_id: lesson.id, kind: "reading", answers: records });
      await api.saveProgress(lesson.id, "reading", score);
    } catch {
      /* reading still works if saving fails */
    }
  };

  return (
    <div>
      <Link to="/reading" className="text-sm font-medium text-rose-500 hover:underline">
        ← Luyện đọc
      </Link>
      <div className="mt-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-rose-400">
          HSK {lesson.level} · Bài {lesson.number}
        </div>
        <h1 className="mt-1 font-han text-3xl font-bold text-stone-800">{lesson.title_zh}</h1>
        <p className="mt-1 text-stone-500">{lesson.title_vi}</p>
      </div>

      {passages.length > 1 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {passages.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setCurrent(i)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                current === i ? "bg-rose-500 text-white shadow-card" : "bg-white text-stone-600 hover:bg-rose-50"
              }`}
            >
              Đoạn {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        <PassageView key={passages[current].id} passage={passages[current]} onFinish={finish} />
      </div>
    </div>
  );
}
