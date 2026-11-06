import { useState } from "react";

import { GlossaryItem, VocabItem } from "../../api";
import AudioButton from "../../components/AudioButton";
import PinyinText from "../../components/PinyinText";

function Example({ item }: { item: VocabItem }) {
  return (
    <div className="mt-4 rounded-2xl bg-cream p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-han text-lg text-stone-800">{item.example_zh}</div>
          <PinyinText text={item.example_pinyin} className="text-sm" />
          <div className="mt-1 text-sm text-stone-500">{item.example_vi}</div>
        </div>
        <AudioButton text={item.example_zh} size="sm" />
      </div>
    </div>
  );
}

function VocabCard({ item }: { item: VocabItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      className="cursor-pointer rounded-3xl bg-white p-5 shadow-card transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-han text-3xl font-bold text-stone-800">{item.hanzi}</div>
          <PinyinText text={item.pinyin} className="text-base font-medium" />
          {item.hanviet && <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">{item.hanviet}</div>}
        </div>
        <AudioButton text={item.hanzi} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-500">{item.pos}</span>
        <span className="font-semibold text-stone-700">{item.meaning_vi}</span>
      </div>
      {open ? (
        <>
          <Example item={item} />
          {item.note_vi && (
            <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
              <span className="font-semibold">Ghi chú: </span>
              {item.note_vi}
            </p>
          )}
        </>
      ) : (
        <div className="mt-3 text-xs text-stone-400">Bấm để xem ví dụ{item.note_vi ? " và ghi chú" : ""}</div>
      )}
    </div>
  );
}

function ExtraRow({ item }: { item: VocabItem }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-2xl bg-white px-4 py-3 shadow-card">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 text-left">
          <span className="font-han text-xl font-bold text-stone-800">{item.hanzi}</span>
          <PinyinText text={item.pinyin} className="text-sm font-medium" />
          <span className="text-sm text-stone-600">{item.meaning_vi}</span>
          <span className="text-xs text-stone-400">{item.pos}</span>
        </button>
        <AudioButton text={item.hanzi} size="sm" />
      </div>
      {open && <Example item={item} />}
    </li>
  );
}

export default function VocabTab({
  vocab,
  extra = [],
  glossary = [],
}: {
  vocab: VocabItem[];
  extra?: VocabItem[];
  glossary?: GlossaryItem[];
}) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-rose-400">Từ mới chính ({vocab.length})</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {vocab.map((v) => (
            <VocabCard key={v.id} item={v} />
          ))}
        </div>
      </section>

      {extra.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-400">Từ mở rộng ({extra.length})</h2>
          <p className="mb-3 mt-1 text-sm text-stone-500">
            Từ cùng chủ đề trong danh sách HSK 3.0. Không bắt buộc nhớ ngay, nhưng có trong quiz khi bật “gồm từ mở rộng”. Bấm vào từ để xem ví dụ.
          </p>
          <ul className="grid gap-2 lg:grid-cols-2">
            {extra.map((v) => (
              <ExtraRow key={v.id} item={v} />
            ))}
          </ul>
        </section>
      )}

      {glossary.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-400">Từ cần biết thêm khi đọc bài</h2>
          <p className="mb-3 mt-1 text-sm text-stone-500">
            Các từ xuất hiện trong bài nhưng không phải từ mới của bài: từ nền tảng HSK 3.0 cấp 1–2, hoặc từ vượt cấp (đánh dấu “ngoài phạm vi”).
          </p>
          <div className="overflow-hidden rounded-2xl bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <tbody>
                {glossary.map((g) => (
                  <tr key={g.hanzi} className="border-b border-rose-50 last:border-0">
                    <td className="px-4 py-2 font-han text-lg text-stone-800">{g.hanzi}</td>
                    <td className="px-2 py-2">
                      <PinyinText text={g.pinyin} />
                    </td>
                    <td className="px-2 py-2 text-stone-600">{g.meaning_vi}</td>
                    <td className="px-4 py-2 text-right">
                      {g.kind === "beyond" && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">ngoài phạm vi</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
