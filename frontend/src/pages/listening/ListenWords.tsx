import { useMemo, useState } from "react";

import { VocabItem } from "../../api";
import AudioButton from "../../components/AudioButton";
import { Button } from "../../components/Card";
import PinyinText from "../../components/PinyinText";
import { newSeed, seededShuffle } from "../../lib/random";
import { useSequencePlayer } from "../../lib/useSequence";

export default function ListenWords({ vocab }: { vocab: VocabItem[] }) {
  const [seed, setSeed] = useState<string | null>(null); // null = lesson order
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [all, setAll] = useState(false);
  const { index, play, stop } = useSequencePlayer();

  const words = useMemo(() => (seed ? seededShuffle(vocab, seed) : vocab), [vocab, seed]);
  const toggle = (id: string) =>
    setRevealed((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      <p className="mb-4 text-sm text-stone-500">
        Nghe từng từ và đoán nghĩa trước, rồi bấm vào thẻ để kiểm tra. Có thể nghe lại nhiều lần, hoặc nghe chậm.
      </p>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {index === null ? (
          <Button onClick={() => play(words.map((w) => w.hanzi), { gapMs: 1200 })}>Nghe lần lượt cả bài</Button>
        ) : (
          <Button variant="soft" onClick={stop}>
            Dừng
          </Button>
        )}
        <Button variant="soft" onClick={() => setSeed(newSeed())}>
          Trộn thứ tự
        </Button>
        <Button variant="soft" onClick={() => setAll(!all)}>
          {all ? "Ẩn tất cả đáp án" : "Hiện tất cả đáp án"}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {words.map((v, i) => {
          const open = all || revealed.has(v.id);
          return (
            <div
              key={v.id}
              className={`flex items-center gap-3 rounded-3xl bg-white p-4 shadow-card transition ${
                index === i ? "ring-2 ring-rose-400" : ""
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xs font-bold text-rose-500">
                {i + 1}
              </span>
              <AudioButton text={v.hanzi} label="Nghe" />
              <AudioButton text={v.hanzi} slow label="Nghe chậm" size="sm" />
              <button
                type="button"
                onClick={() => toggle(v.id)}
                className="ml-auto min-h-[3rem] flex-1 text-right"
                aria-label="Hiện hoặc ẩn đáp án"
              >
                {open ? (
                  <>
                    <div className="font-han text-2xl font-bold text-stone-800">{v.hanzi}</div>
                    <PinyinText text={v.pinyin} className="text-sm" />
                    <div className="text-sm text-stone-600">{v.meaning_vi}</div>
                  </>
                ) : (
                  <span className="text-sm font-medium text-rose-400">Bấm để xem đáp án</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
