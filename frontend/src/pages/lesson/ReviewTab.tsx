import { Link } from "react-router-dom";

import { LessonDetail } from "../../api";
import { Card } from "../../components/Card";

/** "Tóm tắt & ôn nhanh": what to remember, common mistakes, and shortcuts to the other practice pages. */
export default function ReviewTab({ lesson }: { lesson: LessonDetail }) {
  const review = lesson.content.review;
  return (
    <div className="space-y-5">
      {review ? (
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <h3 className="text-lg font-bold text-stone-800">5 điều cần nhớ</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-stone-700">
              {review.remember.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ol>
          </Card>
          <Card>
            <h3 className="text-lg font-bold text-stone-800">Lỗi hay sai</h3>
            <ul className="mt-3 space-y-2 text-stone-700">
              {review.mistakes.map((m, i) => (
                <li key={i} className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">
                  {m}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : (
        <p className="text-stone-500">Bài này chưa có phần tóm tắt.</p>
      )}
      <Card>
        <h3 className="font-bold text-stone-800">Luyện thêm với bài này</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { to: `/listening/${lesson.id}`, label: "Luyện nghe", show: true },
            { to: `/reading/${lesson.id}`, label: "Luyện đọc", show: lesson.has.includes("reading") },
            { to: `/speaking/${lesson.id}`, label: "Luyện nói", show: true },
          ]
            .filter((l) => l.show)
            .map((l) => (
              <Link key={l.to} to={l.to} className="rounded-full bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100">
                {l.label} →
              </Link>
            ))}
        </div>
      </Card>
    </div>
  );
}
