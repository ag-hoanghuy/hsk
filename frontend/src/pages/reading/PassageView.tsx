import { useState } from "react";

import { AnswerRecord, ReadingPassage, ReadingToken } from "../../api";
import AudioButton from "../../components/AudioButton";
import { Button, Card } from "../../components/Card";
import PinyinText from "../../components/PinyinText";
import { playText } from "../../lib/audio";
import { useSequencePlayer } from "../../lib/useSequence";
import PracticeTab from "../lesson/PracticeTab";

const isWord = (t: ReadingToken): t is [string, string] | [string, string, string] => t.length >= 2;

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        on ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600 hover:bg-rose-100"
      }`}
    >
      {label}
    </button>
  );
}

export default function PassageView({
  passage,
  onFinish,
}: {
  passage: ReadingPassage;
  onFinish: (score: number, records: AnswerRecord[]) => void;
}) {
  const [showPinyin, setShowPinyin] = useState(false);
  const [showVi, setShowVi] = useState(false);
  const [slow, setSlow] = useState(false);
  const [sel, setSel] = useState<{ p: number; t: number } | null>(null);
  const { index, play, stop } = useSequencePlayer();

  const paragraphTexts = passage.paragraphs.map((p) => p.tokens.map((t) => t[0]).join(""));
  const selected = sel ? passage.paragraphs[sel.p].tokens[sel.t] : null;

  const pick = (p: number, t: number) => {
    setSel({ p, t });
    // Say the word, unless the whole passage is being read aloud.
    if (index === null) playText(passage.paragraphs[p].tokens[t][0], slow).catch(() => undefined);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Toggle on={showPinyin} label="Pinyin" onClick={() => setShowPinyin(!showPinyin)} />
        <Toggle on={showVi} label="Bản dịch tiếng Việt" onClick={() => setShowVi(!showVi)} />
        <span className="mx-1 hidden h-5 w-px bg-rose-100 sm:block" />
        {index === null ? (
          <Button onClick={() => play(paragraphTexts, { slow, gapMs: 500 })}>Nghe đoạn văn</Button>
        ) : (
          <Button variant="soft" onClick={stop}>
            Dừng
          </Button>
        )}
        <Toggle on={slow} label="Nghe chậm" onClick={() => setSlow(!slow)} />
      </div>

      <Card>
        <h2 className="font-han text-2xl font-bold text-stone-800">{passage.title_zh}</h2>
        <p className="text-sm text-stone-500">{passage.title_vi}</p>

        <div className="mt-5 space-y-4">
          {passage.paragraphs.map((para, pi) => (
            <div key={pi} className={`rounded-2xl p-2 transition ${index === pi ? "bg-rose-50" : ""}`}>
              <div className="flex flex-wrap items-end gap-x-0.5 gap-y-2">
                {para.tokens.map((tok, ti) =>
                  isWord(tok) ? (
                    <button
                      key={ti}
                      type="button"
                      onClick={() => pick(pi, ti)}
                      className={`flex flex-col items-center rounded-lg px-0.5 transition ${
                        sel?.p === pi && sel.t === ti ? "bg-rose-100" : "hover:bg-rose-50"
                      }`}
                    >
                      {showPinyin && <PinyinText text={tok[1]} className="text-xs leading-tight" />}
                      <span className="border-b border-dotted border-stone-300 font-han text-2xl text-stone-800">
                        {tok[0]}
                      </span>
                    </button>
                  ) : (
                    <span key={ti} className="font-han text-2xl text-stone-800">
                      {tok[0]}
                    </span>
                  ),
                )}
              </div>
              {showVi && <p className="mt-2 text-sm text-stone-500">{para.vi}</p>}
            </div>
          ))}
        </div>
      </Card>

      <div className="sticky bottom-4 z-10">
        <div className="rounded-3xl border border-rose-100 bg-white/95 p-4 shadow-card backdrop-blur">
          {selected && isWord(selected) ? (
            <div className="flex items-center gap-4">
              <div className="font-han text-3xl font-bold text-stone-800">{selected[0]}</div>
              <div className="min-w-0 flex-1">
                <PinyinText text={selected[1]} className="text-lg font-medium" />
                <div className="text-stone-600">{selected.length === 3 ? selected[2] : ""}</div>
              </div>
              <AudioButton text={selected[0]} slow={slow} />
            </div>
          ) : (
            <div className="text-sm text-stone-400">Bấm vào một từ trong đoạn văn để xem pinyin và nghĩa.</div>
          )}
        </div>
      </div>

      {passage.questions.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-bold text-stone-800">Câu hỏi đọc hiểu</h3>
          <PracticeTab exercises={passage.questions} onFinish={onFinish} />
        </div>
      )}
    </div>
  );
}
