import { useState } from "react";

import { DialogueLine } from "../../api";
import AudioButton from "../../components/AudioButton";
import { Button } from "../../components/Card";
import PinyinText from "../../components/PinyinText";
import { useSequencePlayer } from "../../lib/useSequence";

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

/** Dialogue as a listening exercise: the text starts hidden and can be revealed piece by piece. */
export default function ListenDialogue({ title, lines }: { title: string; lines: DialogueLine[] }) {
  const [showZh, setShowZh] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);
  const [showVi, setShowVi] = useState(false);
  const [slow, setSlow] = useState(false);
  const { index, play, stop } = useSequencePlayer();
  const speakers = Array.from(new Set(lines.map((l) => l.speaker)));

  return (
    <div>
      <p className="mb-4 text-sm text-stone-500">
        Nghe hội thoại “{title}” và cố hiểu trước khi xem chữ. Bật dần chữ Hán, pinyin, tiếng Việt khi cần.
      </p>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {index === null ? (
          <Button onClick={() => play(lines.map((l) => l.zh), { slow, gapMs: 900 })}>Nghe cả hội thoại</Button>
        ) : (
          <Button variant="soft" onClick={stop}>
            Dừng
          </Button>
        )}
        <Toggle on={slow} label="Nghe chậm" onClick={() => setSlow(!slow)} />
        <span className="mx-1 hidden h-5 w-px bg-rose-100 sm:block" />
        <Toggle on={showZh} label="Chữ Hán" onClick={() => setShowZh(!showZh)} />
        <Toggle on={showPinyin} label="Pinyin" onClick={() => setShowPinyin(!showPinyin)} />
        <Toggle on={showVi} label="Tiếng Việt" onClick={() => setShowVi(!showVi)} />
      </div>

      <div className="space-y-4">
        {lines.map((line, i) => {
          const right = speakers.indexOf(line.speaker) % 2 === 1;
          const anyText = showZh || showPinyin || showVi;
          return (
            <div key={i} className={`flex ${right ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-3xl p-4 shadow-card transition ${right ? "bg-rose-50" : "bg-white"} ${
                  index === i ? "ring-2 ring-rose-400" : ""
                }`}
              >
                <div className="mb-1 text-xs font-semibold text-rose-400">{line.speaker}</div>
                <div className="flex items-start gap-3">
                  <AudioButton text={line.zh} slow={slow} label={`Nghe câu ${i + 1}`} />
                  <div className="min-w-[8rem]">
                    {!anyText && <div className="pt-2 text-sm text-stone-400">Câu {i + 1}</div>}
                    {showZh && <div className="font-han text-xl leading-relaxed text-stone-800">{line.zh}</div>}
                    {showPinyin && <PinyinText text={line.pinyin} className="text-sm" />}
                    {showVi && <div className="mt-1 text-sm text-stone-500">{line.vi}</div>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
