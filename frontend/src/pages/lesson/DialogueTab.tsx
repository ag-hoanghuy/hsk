import { useEffect, useRef, useState } from "react";

import { DialogueLine } from "../../api";
import AudioButton from "../../components/AudioButton";
import { Button } from "../../components/Card";
import PinyinText from "../../components/PinyinText";
import { playText, stopAudio } from "../../lib/audio";

interface Props {
  title: string;
  scene?: string;
  lines: DialogueLine[];
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        on ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600 hover:bg-rose-100"
      }`}
    >
      {label}
    </button>
  );
}

export default function DialogueTab({ title, scene, lines }: Props) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showVi, setShowVi] = useState(true);
  const [playing, setPlaying] = useState<number | null>(null);
  const runId = useRef(0);

  const stopAll = () => {
    runId.current++;
    stopAudio();
    setPlaying(null);
  };
  useEffect(() => stopAll, []); // stop on leaving the tab

  const playAll = async () => {
    stopAll();
    const id = runId.current;
    for (let i = 0; i < lines.length; i++) {
      if (runId.current !== id) return;
      setPlaying(i);
      try {
        await playText(lines[i].zh);
      } catch {
        break;
      }
    }
    if (runId.current === id) setPlaying(null);
  };

  const speakers = Array.from(new Set(lines.map((l) => l.speaker)));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <h3 className="mr-auto text-lg font-bold text-stone-800">{title}</h3>
        <Toggle on={showPinyin} label="Pinyin" onClick={() => setShowPinyin(!showPinyin)} />
        <Toggle on={showVi} label="Tiếng Việt" onClick={() => setShowVi(!showVi)} />
        {playing === null ? <Button onClick={playAll}>Nghe cả bài</Button> : <Button variant="soft" onClick={stopAll}>Dừng</Button>}
      </div>
      {scene && <p className="-mt-2 mb-5 text-sm italic text-stone-500">{scene}</p>}
      <div className="space-y-4">
        {lines.map((line, i) => {
          const right = speakers.indexOf(line.speaker) % 2 === 1;
          return (
            <div key={i} className={`flex ${right ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-3xl p-4 shadow-card transition ${
                  right ? "bg-rose-50" : "bg-white"
                } ${playing === i ? "ring-2 ring-rose-400" : ""}`}
              >
                <div className="mb-1 text-xs font-semibold text-rose-400">{line.speaker}</div>
                <div className="flex items-start gap-3">
                  <div>
                    <div className="font-han text-xl leading-relaxed text-stone-800">{line.zh}</div>
                    {showPinyin && <PinyinText text={line.pinyin} className="text-sm" />}
                    {showVi && <div className="mt-1 text-sm text-stone-500">{line.vi}</div>}
                  </div>
                  <AudioButton text={line.zh} size="sm" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
