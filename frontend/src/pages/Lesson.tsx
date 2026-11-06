import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { api, LessonDetail, ProgressRow, Section } from "../api";
import { Button } from "../components/Card";
import DialogueTab from "./lesson/DialogueTab";
import GrammarTab from "./lesson/GrammarTab";
import PracticeTab from "./lesson/PracticeTab";
import QuizTab from "./lesson/QuizTab";
import ReviewTab from "./lesson/ReviewTab";
import TestTab from "./lesson/TestTab";
import VocabTab from "./lesson/VocabTab";

type TabKey = Section | "review";

const TABS: { key: TabKey; label: string }[] = [
  { key: "vocab", label: "Từ vựng" },
  { key: "grammar", label: "Ngữ pháp" },
  { key: "dialogue", label: "Hội thoại" },
  { key: "practice", label: "Bài tập" },
  { key: "quiz", label: "Quiz" },
  { key: "test", label: "Kiểm tra" },
  { key: "review", label: "Ôn nhanh" },
];

// Study sections the learner ticks off by hand; practice, quiz and test record themselves on completion.
const MANUAL_SECTIONS: TabKey[] = ["vocab", "grammar", "dialogue"];

export default function Lesson() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const lessonId = Number(id);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [tab, setTab] = useState<TabKey>(() => {
    const wanted = search.get("tab");
    return TABS.some((t) => t.key === wanted) ? (wanted as TabKey) : "vocab";
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLesson(null);
    api.lesson(lessonId).then(setLesson).catch((e) => setError(String(e)));
    api.progress(lessonId).then(setProgress).catch(() => undefined);
  }, [lessonId]);

  const done = (s: TabKey) => progress.find((p) => p.section === s);

  const markDone = async (section: Section, score?: number) => {
    const row = await api.saveProgress(lessonId, section, score);
    setProgress((prev) => [...prev.filter((p) => p.section !== section), row]);
  };

  if (error) return <p className="text-rose-600">Không tải được bài học: {error}</p>;
  if (!lesson) return <p className="text-stone-400">Đang tải…</p>;
  if (!lesson.available) {
    return (
      <div className="rounded-3xl border border-dashed border-rose-200 bg-white p-10 text-center text-stone-500">
        Bài này chưa có nội dung. <Link className="text-rose-500 underline" to="/">Quay lại danh sách</Link>
      </div>
    );
  }
  const c = lesson.content;

  return (
    <div>
      <Link to="/" className="text-sm font-medium text-rose-500 hover:underline">
        ← Danh sách bài học
      </Link>
      <div className="mt-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-rose-400">
          HSK {lesson.level} · Bài {lesson.number}
        </div>
        <h1 className="mt-1 font-han text-3xl font-bold text-stone-800">{lesson.title_zh}</h1>
        <p className="mt-1 text-stone-500">{lesson.title_vi}</p>
        {lesson.summary && <p className="mt-3 text-sm text-stone-500">{lesson.summary}</p>}
        {c.objectives && c.objectives.length > 0 && (
          <div className="mt-4 rounded-3xl bg-white p-4 shadow-card">
            <div className="text-sm font-semibold text-stone-500">Học xong bài này, bạn có thể:</div>
            <ul className="mt-2 grid gap-1.5 text-stone-700 sm:grid-cols-2">
              {c.objectives.map((o, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-rose-400">✓</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === t.key ? "bg-rose-500 text-white shadow-card" : "bg-white text-stone-600 hover:bg-rose-50"
            }`}
          >
            {t.label}
            {done(t.key) && <span className={tab === t.key ? "text-white" : "text-emerald-500"}>✓</span>}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "vocab" && <VocabTab vocab={c.vocab} extra={c.extra_vocab} glossary={c.glossary} />}
        {tab === "grammar" && <GrammarTab grammar={c.grammar} />}
        {tab === "dialogue" && <DialogueTab title={c.dialogue.title_vi} scene={c.dialogue.scene_vi} lines={c.dialogue.lines} />}
        {tab === "review" && <ReviewTab lesson={lesson} />}
        {tab === "practice" && (
          <PracticeTab key={lessonId} exercises={c.exercises} onFinish={(score) => markDone("practice", score)} />
        )}
        {tab === "quiz" && <QuizTab key={lessonId} lesson={lesson} onFinished={(score) => markDone("quiz", score)} />}
        {tab === "test" && <TestTab key={lessonId} lesson={lesson} onFinished={(score) => markDone("test", score)} />}
        {MANUAL_SECTIONS.includes(tab) && (
          <div className="mt-8 flex justify-center">
            {done(tab) ? (
              <span className="rounded-full bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-600">
                Đã học xong phần này ✓
              </span>
            ) : (
              <Button onClick={() => markDone(tab as Section)}>Đánh dấu đã học xong</Button>
            )}
          </div>
        )}
        {tab === "practice" && done("practice")?.best_score != null && (
          <p className="mt-4 text-center text-sm text-stone-400">Điểm cao nhất: {done("practice")!.best_score}</p>
        )}
      </div>
    </div>
  );
}
