import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api, CurriculumItem } from "../api";
import { Card } from "../components/Card";

const WEEK_PLAN = [
  { day: "Ngày 1", what: "Từ vựng chính + nghe từ vựng (tab Từ vựng, Luyện nghe › Nghe từ vựng)" },
  { day: "Ngày 2", what: "Ngữ pháp + hội thoại, đọc to hội thoại theo audio" },
  { day: "Ngày 3", what: "Bài tập + quiz từ vựng/ngữ pháp, xem lại câu sai" },
  { day: "Ngày 4", what: "Luyện đọc + luyện nghe đoạn văn + luyện nói 5–8 câu" },
  { day: "Ngày 5", what: "Bài kiểm tra cuối bài, đọc phần Ôn nhanh, học từ mở rộng" },
];

const SPACING = [
  { when: "1 ngày", what: "Quiz từ vựng (bật “gồm từ mở rộng”)" },
  { when: "3 ngày", what: "Quiz ngữ pháp + nghe chọn đáp án" },
  { when: "7 ngày", what: "Làm lại bài kiểm tra, xem các câu từng sai" },
  { when: "14 ngày", what: "Luyện đọc + luyện nói lại bài đó" },
  { when: "30 ngày", what: "Quiz từ vựng + bài kiểm tra một lần nữa" },
];

export default function Roadmap() {
  const [items, setItems] = useState<CurriculumItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(3);

  useEffect(() => {
    api.curriculum().then(setItems).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className="text-rose-600">Không tải được dữ liệu: {error}</p>;
  if (!items) return <p className="text-stone-400">Đang tải…</p>;
  const rows = items.filter((i) => i.level === level);
  const words = rows.reduce((s, r) => s + r.vocab_count + r.extra_count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Lộ trình 40 bài</h1>
        <p className="mt-1 text-stone-500">
          HSK 3 và HSK 4 theo chủ đề và ngữ pháp của giáo trình Standard Course, từ vựng theo đề cương thi HSK mới 2025 (kỳ thi từ
          12/2026). Mỗi bài có từ chính và từ mở rộng.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold text-stone-800">Nhịp học gợi ý</h2>
          <ul className="mt-3 space-y-1.5 text-stone-700">
            <li>• 1 bài trong 3–5 ngày, mỗi ngày 30–45 phút.</li>
            <li>• Sau mỗi 4 bài: dành 1–2 ngày ôn tập (quiz, bài kiểm tra của 4 bài đó).</li>
            <li>• Cuối mỗi cấp: thi thử, xem bài nào sai nhiều để ôn lại.</li>
          </ul>
          <div className="mt-4 space-y-1.5 text-sm">
            {WEEK_PLAN.map((d) => (
              <div key={d.day} className="flex gap-3">
                <span className="w-14 shrink-0 font-semibold text-rose-500">{d.day}</span>
                <span className="text-stone-600">{d.what}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-stone-800">Ôn theo giãn cách 1 – 3 – 7 – 14 – 30 ngày</h2>
          <p className="mt-2 text-sm text-stone-600">
            Tính từ ngày làm xong bài kiểm tra của bài. Trang{" "}
            <Link to="/progress" className="font-medium text-rose-500 hover:underline">
              Tiến độ
            </Link>{" "}
            tự nhắc bài nào đến hạn ôn.
          </p>
          <div className="mt-3 space-y-1.5 text-sm">
            {SPACING.map((s) => (
              <div key={s.when} className="flex gap-3">
                <span className="w-16 shrink-0 font-semibold text-rose-500">Sau {s.when}</span>
                <span className="text-stone-600">{s.what}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-rose-50 p-1">
          {[3, 4].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                level === l ? "bg-white text-rose-500 shadow-card" : "text-stone-500 hover:text-rose-500"
              }`}
            >
              HSK {l}
            </button>
          ))}
        </div>
        <span className="text-sm text-stone-500">{words} từ trong 20 bài</span>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white shadow-card">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-stone-400">
            <tr>
              <th className="px-4 py-3">Bài</th>
              <th className="px-2 py-3">Tên bài</th>
              <th className="px-2 py-3">Chủ đề · mục tiêu giao tiếp</th>
              <th className="px-2 py-3">Ngữ pháp chính</th>
              <th className="px-4 py-3 text-right">Từ mới</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Fragment key={r.number}>
                <tr className="border-t border-rose-50 align-top">
                  <td className="px-4 py-3 font-bold text-rose-400">{r.number}</td>
                  <td className="px-2 py-3">
                    {r.available && r.id ? (
                      <Link to={`/lesson/${r.id}`} className="font-han font-semibold text-stone-800 hover:text-rose-500">
                        {r.title_zh}
                      </Link>
                    ) : (
                      <span className="font-han font-semibold text-stone-500">{r.title_zh}</span>
                    )}
                    <div className="text-stone-500">{r.title_vi}</div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="font-medium text-stone-700">{r.theme_vi}</div>
                    <div className="text-stone-500">{r.goal_vi}</div>
                  </td>
                  <td className="px-2 py-3 font-han text-stone-600">{r.grammar_points.join("；")}</td>
                  <td className="px-4 py-3 text-right text-stone-700">
                    {r.available ? (
                      <>
                        {r.vocab_count}
                        {r.extra_count > 0 && <span className="text-stone-400"> + {r.extra_count}</span>}
                      </>
                    ) : (
                      <span className="text-stone-400">sắp có</span>
                    )}
                  </td>
                </tr>
                {r.number % 4 === 0 && (
                  <tr className="bg-cream">
                    <td colSpan={5} className="px-4 py-2 text-center text-sm font-medium text-rose-500">
                      {r.number === 20 ? (
                        <Link to={`/mock/${level}`} className="hover:underline">
                          🎯 Thi thử cuối cấp HSK {level} →
                        </Link>
                      ) : (
                        <>🔁 Ôn tập bài {r.number - 3}–{r.number}</>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
