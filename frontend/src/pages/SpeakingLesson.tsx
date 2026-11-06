import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api, LessonDetail } from "../api";
import { buildSpeakingGroups, SpeakItem } from "../lib/speakingItems";
import SpeakPractice from "./speaking/SpeakPractice";

const key = (zh: string) => zh.replace(/\s+/g, "");

export default function SpeakingLesson() {
  const lessonId = Number(useParams().id);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SpeakItem | null>(null);
  const [best, setBest] = useState<Record<string, number>>({});

  useEffect(() => {
    setLesson(null);
    setSelected(null);
    api.lesson(lessonId).then(setLesson).catch((e) => setError(String(e)));
    api
      .speakingBest(lessonId)
      .then((rows) => setBest(Object.fromEntries(rows.map((r) => [key(r.text), r.best]))))
      .catch(() => undefined);
  }, [lessonId]);

  const groups = useMemo(() => (lesson ? buildSpeakingGroups(lesson.content) : []), [lesson]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    if (!selected && flat.length > 0) setSelected(flat[0]);
  }, [flat, selected]);

  const onScored = useCallback(
    (text: string, overall: number) => {
      setBest((b) => ({ ...b, [key(text)]: Math.max(b[key(text)] ?? 0, overall) }));
      api.saveProgress(lessonId, "speaking", overall).catch(() => undefined);
    },
    [lessonId],
  );

  if (error) return <p className="text-rose-600">Không tải được bài học: {error}</p>;
  if (!lesson) return <p className="text-stone-400">Đang tải…</p>;
  if (flat.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-rose-200 bg-white p-10 text-center text-stone-500">
        Bài này chưa có câu để luyện nói. <Link className="text-rose-500 underline" to="/speaking">Quay lại</Link>
      </div>
    );
  }

  const index = selected ? flat.findIndex((i) => i.zh === selected.zh) : -1;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : null;
  const done = flat.filter((i) => best[key(i.zh)] !== undefined).length;

  return (
    <div>
      <Link to="/speaking" className="text-sm font-medium text-rose-500 hover:underline">
        ← Luyện nói
      </Link>
      <div className="mt-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-rose-400">
          HSK {lesson.level} · Bài {lesson.number}
        </div>
        <h1 className="mt-1 font-han text-3xl font-bold text-stone-800">{lesson.title_zh}</h1>
        <p className="mt-1 text-stone-500">
          {lesson.title_vi} · đã luyện {done}/{flat.length} câu
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <nav aria-label="Danh sách câu" className="space-y-5 lg:max-h-[75vh] lg:overflow-y-auto lg:pr-2">
          {groups.map((g) => (
            <div key={g.key}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">{g.label}</div>
              <ul className="space-y-1.5">
                {g.items.map((it) => {
                  const score = best[key(it.zh)];
                  const active = selected?.zh === it.zh;
                  return (
                    <li key={it.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(it)}
                        aria-current={active}
                        className={`flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-left transition ${
                          active ? "bg-rose-500 text-white shadow-card" : "bg-white text-stone-700 hover:bg-rose-50"
                        }`}
                      >
                        <span className="font-han text-sm leading-snug">{it.zh}</span>
                        {score !== undefined && (
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                              active ? "bg-white/25 text-white" : score >= 85 ? "bg-emerald-100 text-emerald-700" : score >= 65 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-600"
                            }`}
                          >
                            {score}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div>
          {selected && (
            <SpeakPractice
              lessonId={lesson.id}
              item={selected}
              onScored={onScored}
              onNext={next ? () => setSelected(next) : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
