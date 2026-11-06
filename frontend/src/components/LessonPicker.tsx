import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api, LessonSummary, ProgressRow, Section } from "../api";

const LEVELS = [3, 4];

interface Props {
  title: string;
  subtitle: string;
  basePath: string; // e.g. "/listening" → links to /listening/:id
  section: Section; // progress section whose best score is shown
  /** Whether the lesson has what this page needs; others are shown as "Sắp có". */
  ready: (lesson: LessonSummary) => boolean;
}

/** Level tabs + lesson cards shared by the listening, reading (and later speaking) pages. */
export default function LessonPicker({ title, subtitle, basePath, section, ready }: Props) {
  const [level, setLevel] = useState(3);
  const [lessons, setLessons] = useState<LessonSummary[] | null>(null);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLessons(null);
    setError(null);
    api.lessons(level).then(setLessons).catch((e) => setError(String(e)));
    api.progress().then(setProgress).catch(() => undefined);
  }, [level]);

  const best = (lessonId: number) =>
    progress.find((p) => p.lesson_id === lessonId && p.section === section)?.best_score ?? null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800">{title}</h1>
      <p className="mt-1 text-stone-500">{subtitle}</p>

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
          {lessons?.map((lesson) => {
            const score = best(lesson.id);
            const body = (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-rose-400">Bài {lesson.number}</div>
                  {ready(lesson) ? (
                    score !== null && (
                      <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-500">
                        {score} điểm
                      </span>
                    )
                  ) : (
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-400">Sắp có</span>
                  )}
                </div>
                <div className="mt-2 font-han text-xl font-bold text-stone-800">{lesson.title_zh}</div>
                <div className="mt-1 text-sm text-stone-500">{lesson.title_vi}</div>
              </>
            );
            return ready(lesson) ? (
              <Link
                key={lesson.id}
                to={`${basePath}/${lesson.id}`}
                className="block rounded-3xl bg-white p-5 shadow-card transition hover:-translate-y-0.5"
              >
                {body}
              </Link>
            ) : (
              <div key={lesson.id} className="rounded-3xl bg-white/60 p-5 opacity-70">
                {body}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
