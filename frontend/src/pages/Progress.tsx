import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api, LessonOverview, Overview, ReviewItem, SECTIONS } from "../api";
import { Card } from "../components/Card";
import { tagLabel } from "../lib/tags";

const STEP_LABEL = ["sau 1 ngày", "sau 3 ngày", "sau 7 ngày", "sau 14 ngày", "sau 30 ngày"];

function fmtDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)}/${Number(m)}`;
}

function Stat({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-2xl font-extrabold text-stone-800">{value}</div>
        <div className="text-sm text-stone-500">{label}</div>
      </div>
    </Card>
  );
}

function ReviewRow({ r, due }: { r: ReviewItem; due: boolean }) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-2xl bg-cream px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-rose-400">
          HSK {r.level} · Bài {r.number} · lần ôn {r.step}/5 ({STEP_LABEL[r.step - 1]})
        </div>
        <div className="font-han font-bold text-stone-800">{r.title_zh}</div>
        <div className="text-sm text-stone-500">{r.title_vi}</div>
      </div>
      {due ? (
        <>
          {r.overdue_days ? <span className="text-xs font-medium text-amber-600">trễ {r.overdue_days} ngày</span> : null}
          <Link
            to={`/lesson/${r.lesson_id}?tab=quiz`}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-rose-600"
          >
            Ôn ngay
          </Link>
        </>
      ) : (
        <span className="text-sm text-stone-500">ngày {fmtDate(r.due)}</span>
      )}
    </li>
  );
}

function Calendar({ days }: { days: Overview["calendar"] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const level = d.count === 0 ? 0 : Math.ceil((d.count / max) * 3);
          const color = ["bg-stone-100", "bg-rose-200", "bg-rose-300", "bg-rose-500"][level];
          return <div key={d.date} title={`${fmtDate(d.date)}: ${d.count} hoạt động`} className={`aspect-square rounded-md ${color}`} />;
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-stone-400">
        <span>{fmtDate(days[0].date)}</span>
        <span>hôm nay</span>
      </div>
    </div>
  );
}

function nextReview(l: LessonOverview): string {
  const p = l.reviews.find((r) => r.status !== "done");
  if (!l.learned_on) return "—";
  if (!p) return "đã ôn đủ 5 lần";
  return p.status === "due" ? "cần ôn ngay" : `ôn ngày ${fmtDate(p.due)}`;
}

function LessonTable({ lessons }: { lessons: LessonOverview[] }) {
  return (
    <div className="overflow-x-auto rounded-3xl bg-white shadow-card">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-stone-400">
          <tr>
            <th className="px-4 py-3">Bài</th>
            <th className="px-2 py-3">Tiến độ</th>
            <th className="px-2 py-3">Kiểm tra</th>
            <th className="px-2 py-3">Nói</th>
            <th className="px-4 py-3">Ôn tập</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((l) => (
            <tr key={l.id} className={`border-t border-rose-50 ${l.available ? "" : "opacity-50"}`}>
              <td className="px-4 py-2.5">
                {l.available ? (
                  <Link to={`/lesson/${l.id}`} className="hover:text-rose-500">
                    <span className="mr-2 text-stone-400">{l.number}.</span>
                    <span className="font-han font-semibold text-stone-800">{l.title_zh}</span>
                  </Link>
                ) : (
                  <span>
                    <span className="mr-2 text-stone-400">{l.number}.</span>
                    <span className="font-han">{l.title_zh}</span>
                  </span>
                )}
              </td>
              <td className="px-2 py-2.5">
                <div className="flex gap-1" title={`${l.done.length}/${SECTIONS.length} phần`}>
                  {SECTIONS.map((s) => (
                    <span key={s} className={`h-2 w-4 rounded-full ${l.done.includes(s) ? "bg-rose-500" : "bg-rose-100"}`} />
                  ))}
                </div>
              </td>
              <td className="px-2 py-2.5 font-semibold text-stone-700">{l.scores.test ?? "—"}</td>
              <td className="px-2 py-2.5 text-stone-700">{l.speaking_best ?? "—"}</td>
              <td className="px-4 py-2.5 text-stone-500">{nextReview(l)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Progress() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(3);

  useEffect(() => {
    api.overview().then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className="text-rose-600">Không tải được dữ liệu: {error}</p>;
  if (!data) return <p className="text-stone-400">Đang tải…</p>;
  const t = data.totals;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Tiến độ học tập</h1>
        <p className="mt-1 text-stone-500">
          Xem mình đã học tới đâu, hôm nay cần ôn bài nào và những chỗ hay sai.{" "}
          <Link to="/roadmap" className="font-medium text-rose-500 hover:underline">
            Xem lộ trình 40 bài →
          </Link>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="🔥" value={data.streak} label="ngày học liên tiếp" />
        <Stat icon="📚" value={`${t.lessons_finished}/${t.lessons_available}`} label="bài đã học xong" />
        <Stat icon="🈶" value={t.words_learned} label="từ mới đã học" />
        <Stat icon="📝" value={t.avg_test ?? "—"} label="điểm kiểm tra trung bình" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <Card>
          <h2 className="text-lg font-bold text-stone-800">Hôm nay cần ôn</h2>
          <p className="mt-1 text-sm text-stone-500">
            Mỗi bài được nhắc ôn sau 1, 3, 7, 14 và 30 ngày tính từ lúc làm xong bài kiểm tra. Làm quiz, bài kiểm tra, luyện nghe, đọc
            hoặc nói của bài đó là tính đã ôn.
          </p>
          {data.reviews_due.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-emerald-700">Hôm nay không có bài nào cần ôn. Học bài mới thôi!</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {data.reviews_due.map((r) => (
                <ReviewRow key={r.lesson_id} r={r} due />
              ))}
            </ul>
          )}
          {data.reviews_upcoming.length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-stone-400">7 ngày tới</h3>
              <ul className="mt-2 space-y-2">
                {data.reviews_upcoming.map((r) => (
                  <ReviewRow key={r.lesson_id} r={r} due={false} />
                ))}
              </ul>
            </>
          )}
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-stone-800">5 tuần gần đây</h2>
          <p className="mb-3 mt-1 text-sm text-stone-500">Đã học {data.active_days} ngày.</p>
          <Calendar days={data.calendar} />
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-800">Từng bài</h2>
          <div className="inline-flex rounded-full bg-rose-50 p-1">
            {[3, 4].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${
                  level === l ? "bg-white text-rose-500 shadow-card" : "text-stone-500 hover:text-rose-500"
                }`}
              >
                HSK {l}
              </button>
            ))}
          </div>
        </div>
        <LessonTable lessons={data.lessons.filter((l) => l.level === level)} />
      </div>

      <Card>
        <h2 className="text-lg font-bold text-stone-800">Những chỗ hay sai nhất</h2>
        {data.mistakes.length === 0 ? (
          <p className="mt-2 text-stone-500">Chưa có dữ liệu. Làm bài tập, quiz và bài kiểm tra để xem thống kê.</p>
        ) : (
          <ul className="mt-3 divide-y divide-rose-50">
            {data.mistakes.map((m) => (
              <li key={`${m.lesson_id}-${m.tag}`} className="flex items-center justify-between gap-3 py-2">
                <Link to={`/lesson/${m.lesson_id}`} className="min-w-0 hover:text-rose-500">
                  <span className="mr-2 text-xs text-stone-400">
                    HSK {m.level}·{m.number}
                  </span>
                  <span className="font-han text-stone-700">{tagLabel(m.tag)}</span>
                </Link>
                <span className="shrink-0 text-sm text-stone-500">
                  sai <span className="font-bold text-rose-500">{m.wrong}</span>/{m.total}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
