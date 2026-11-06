import { useState } from "react";

import { VocabItem } from "../../api";
import AudioButton from "../../components/AudioButton";
import PinyinText from "../../components/PinyinText";

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
        </div>
        <AudioButton text={item.hanzi} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-500">{item.pos}</span>
        <span className="font-semibold text-stone-700">{item.meaning_vi}</span>
      </div>
      {open ? (
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
      ) : (
        <div className="mt-3 text-xs text-stone-400">Bấm để xem ví dụ</div>
      )}
    </div>
  );
}

export default function VocabTab({ vocab }: { vocab: VocabItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {vocab.map((v) => (
        <VocabCard key={v.id} item={v} />
      ))}
    </div>
  );
}
