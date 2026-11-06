import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api, LessonSummary, Overview, ProgressRow, SECTIONS } from "../api";

const LEVELS = [3, 4];

function LessonCard({ lesson, done }: { lesson: LessonSummary; done: number }) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-rose-400">Bài {lesson.number}</div>
        {lesson.available ? (
          <div className="flex gap-1" title={`${done}/${SECTIONS.length} phần đã học`}>
            {SECTIONS.map((_, i) => (
              <span key={i} className={`h-2 w-5 rounded-full ${i < done ? "bg-rose-500" : "bg-rose-100"}`} />
            ))}
          </div>
        ) : (
          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-400">Sắp có</span>
        )}
      </div>
      <div className="mt-2 font-han text-xl font-bold text-stone-800">{lesson.title_zh}</div>
      <div className="mt-1 text-sm text-stone-500">{lesson.title_vi}</div>
      {lesson.grammar_points.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {lesson.grammar_points.slice(0, 3).map((g) => (
            <span key={g} className="rounded-full bg-cream px-2 py-0.5 font-han text-xs text-stone-500">
              {g}
            </span>
          ))}
        </div>
      )}
    </>
  );

  if (!lesson.available) {
    return <div className="rounded-3xl bg-white/60 p-5 opacity-70">{body}</div>;
  }
  return (
    <Link
      to={`/lesson/${lesson.id}`}
      className="block rounded-3xl bg-white p-5 shadow-card transition hover:-translate-y-0.5"
    >
      {body}
    </Link>
  );
}

function TodayBanner({ data }: { data: Overview }) {
  const due = data.reviews_due.length;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-4 rounded-3xl bg-gradient-to-r from-rose-100 to-amber-50 p-5">
      <div className="text-4xl">{data.streak > 0 ? "🔥" : "🌱"}</div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-stone-800">
          {data.streak > 0 ? `Bạn đã học ${data.streak} ngày liên tiếp!` : "Hôm nay mình bắt đầu học nhé!"}
        </div>
        <div className="text-sm text-stone-600">
          {due > 0
            ? `Có ${due} bài đến hạn ôn hôm nay: ${data.reviews_due
                .slice(0, 3)
                .map((r) => `HSK${r.level} bài ${r.number}`)
                .join(", ")}${due > 3 ? "…" : ""}.`
            : "Không có bài nào cần ôn, học tiếp bài mới thôi."}
        </div>
      </div>
      <Link
        to="/progress"
        className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-rose-500 shadow-card transition hover:bg-rose-50"
      >
        {due > 0 ? "Ôn ngay" : "Xem tiến độ"}
      </Link>
    </div>
  );
}

export default function Home() {
  const [level, setLevel] = useState(3);
  const [lessons, setLessons] = useState<LessonSummary[] | null>(null);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLessons(null);
    setError(null);
    api.lessons(level).then(setLessons).catch((e) => setError(String(e)));
    api.progress().then(setProgress).catch(() => undefined);
  }, [level]);

  useEffect(() => {
    api.overview().then(setOverview).catch(() => undefined);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800">Danh sách bài học</h1>
      <p className="mt-1 text-stone-500">Chọn một bài để bắt đầu học hôm nay.</p>
      {overview && <TodayBanner data={overview} />}

      <div className="mt-6 inline-flex rounded-full bg-rose-50 p-1">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
              level === l ? "bg-white text-rose-500 shadow-card" : "text-stone-500 hover:text-rose-500"
            }`}
          >
            HSK {l}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {error && <p className="text-rose-600">Không tải được dữ liệu: {error}</p>}
        {!error && lessons === null && <p className="text-stone-400">Đang tải…</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons?.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              done={progress.filter((p) => p.lesson_id === lesson.id && SECTIONS.includes(p.section)).length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
