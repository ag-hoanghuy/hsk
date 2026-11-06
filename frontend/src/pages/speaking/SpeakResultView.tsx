import { useState } from "react";

import type { SpeakingResult, SpeakingSyllable, SyllableStatus } from "../../api";
import AudioButton from "../../components/AudioButton";
import { Card } from "../../components/Card";
import { PitchChart, WaveCompare } from "../../components/speaking/SpeakCharts";
import PinyinText from "../../components/PinyinText";

export const TONE_VI: Record<number, string> = {
  0: "thanh nhẹ: đọc ngắn và nhẹ",
  1: "thanh 1: giọng cao, giữ bằng",
  2: "thanh 2: giọng đi lên như hỏi “hả?”",
  3: "thanh 3: giọng trầm xuống thấp rồi nhích lên nhẹ",
  4: "thanh 4: giọng từ cao rơi xuống dứt khoát",
};

const STATUS_STYLE: Record<SyllableStatus, { box: string; chip: string; label: string }> = {
  ok: { box: "border-emerald-200 bg-emerald-50/60", chip: "bg-emerald-100 text-emerald-700", label: "Đúng" },
  tone: { box: "border-amber-300 bg-amber-50", chip: "bg-amber-100 text-amber-700", label: "Xem lại thanh" },
  sound: { box: "border-rose-300 bg-rose-50", chip: "bg-rose-100 text-rose-600", label: "Chưa đúng âm" },
  missing: { box: "border-stone-300 bg-stone-100", chip: "bg-stone-200 text-stone-600", label: "Chưa nghe thấy" },
};

function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-600";
  if (score >= 65) return "text-amber-600";
  return "text-rose-500";
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-1" aria-label={`${n} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={`h-6 w-6 ${i <= n ? "text-amber-400" : "text-stone-200"}`} fill="currentColor">
          <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-stone-600">{label}</span>
        <span className={`font-bold ${scoreColor(value)}`}>{value}</span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full ${value >= 85 ? "bg-emerald-400" : value >= 65 ? "bg-amber-400" : "bg-rose-400"}`}
          style={{ width: `${Math.max(value, 3)}%` }}
        />
      </div>
    </div>
  );
}

function SyllableCard({ s, open, onToggle }: { s: SpeakingSyllable; open: boolean; onToggle: () => void }) {
  const style = STATUS_STYLE[s.status];
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={`flex min-w-[4.5rem] flex-col items-center rounded-2xl border-2 px-3 py-2 transition hover:-translate-y-0.5 ${style.box} ${
        open ? "ring-2 ring-rose-200" : ""
      }`}
    >
      <span className="font-han text-3xl font-bold text-stone-800">{s.hanzi}</span>
      <PinyinText text={s.pinyin} className="text-sm font-semibold" />
      <span className={`mt-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${style.chip}`}>{style.label}</span>
    </button>
  );
}

interface Props {
  result: SpeakingResult;
  recordingUrl: string | null;
  sample: string;
  onRetry: () => void;
  onNext?: () => void;
}

export default function SpeakResultView({ result, recordingUrl, sample, onRetry, onNext }: Props) {
  const [open, setOpen] = useState<number | null>(() => {
    const first = result.syllables.find((s) => s.status !== "ok");
    return first ? first.index : null;
  });
  const [charts, setCharts] = useState(false);
  const selected = result.syllables.find((s) => s.index === open) ?? null;
  const problems = result.syllables.filter((s) => s.status !== "ok");

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-8 border-rose-100 bg-white">
            <span className={`text-4xl font-extrabold ${scoreColor(result.overall)}`}>{result.overall}</span>
            <span className="-mt-1 text-xs text-stone-400">/ 100</span>
          </div>
          <div className="min-w-[14rem] flex-1">
            <Stars n={result.stars} />
            <p className="mt-1 text-lg font-bold text-stone-800">{result.verdict}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Meter label="Phát âm" value={result.accuracy} />
              <Meter label="Trôi chảy" value={result.fluency} />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold text-stone-500">Máy nghe được bạn nói</div>
        <div className="mt-1 font-han text-xl text-stone-800">{result.heard || "(không nhận ra chữ nào)"}</div>
        <p className="mt-1 text-xs text-stone-400">
          Đây là kết quả nhận dạng giọng nói tự động, đôi khi máy nghe sai ngay cả khi bạn đọc đúng.
        </p>
      </Card>

      <Card>
        <div className="text-sm font-semibold text-stone-500">Từng âm tiết (bấm để xem chi tiết)</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.syllables.map((s) => (
            <SyllableCard key={s.index} s={s} open={open === s.index} onToggle={() => setOpen(open === s.index ? null : s.index)} />
          ))}
        </div>
        {selected && (
          <div className="mt-4 rounded-2xl bg-rose-50/60 p-4 text-sm text-stone-700">
            <div className="font-semibold text-stone-800">
              {selected.hanzi} <PinyinText text={selected.pinyin} />
              <span className="ml-2 font-normal text-stone-500">· {TONE_VI[selected.tone]}</span>
            </div>
            <p className="mt-1">{selected.note ?? (selected.status === "ok" ? "Bạn đọc âm này tốt." : "")}</p>
          </div>
        )}
        {problems.length === 0 && <p className="mt-3 text-sm text-emerald-600">Mọi âm tiết đều đúng. Giỏi lắm!</p>}
      </Card>

      {result.tips.length > 0 && (
        <Card>
          <div className="text-sm font-semibold text-stone-500">Gợi ý cho lần sau</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-700">
            {result.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <button type="button" onClick={() => setCharts(!charts)} className="flex w-full items-center justify-between text-left" aria-expanded={charts}>
          <span className="text-sm font-semibold text-stone-500">So sánh âm thanh với giọng mẫu (để tham khảo)</span>
          <span className="text-rose-500">{charts ? "Ẩn" : "Xem"}</span>
        </button>
        {charts && (
          <div className="mt-3 space-y-4">
            <div>
              <div className="mb-1 flex flex-wrap gap-4 text-xs text-stone-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-5 rounded bg-stone-400" /> Giọng mẫu
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-5 rounded bg-rose-500" /> Giọng bạn
                </span>
                <span>Đường cao thấp của giọng nói, đã quy về cùng thang đo</span>
              </div>
              <PitchChart charts={result.charts} syllables={result.syllables} />
            </div>
            <WaveCompare charts={result.charts} />
            <p className="text-xs text-stone-400">
              Mẫu {result.stats.ref_seconds}s, bạn {result.stats.usr_seconds}s. Hình chỉ để bạn quan sát: giọng mẫu là giọng máy nên cao thấp mỗi chữ có thể khác một chút so với người thật.
            </p>
          </div>
        )}
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onRetry} className="rounded-full bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-rose-600">
          Thử lại
        </button>
        {onNext && (
          <button type="button" onClick={onNext} className="rounded-full bg-rose-50 px-6 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100">
            Câu tiếp theo
          </button>
        )}
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <AudioButton text={sample} label="Nghe giọng mẫu" /> Mẫu
          {recordingUrl && <RecordingPlayer url={recordingUrl} />}
        </div>
      </div>
    </div>
  );
}

/** Plays the learner's own recording. */
export function RecordingPlayer({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Nghe lại giọng của bạn"
        title="Nghe lại giọng của bạn"
        onClick={() => {
          const a = new Audio(url);
          setPlaying(true);
          a.onended = a.onerror = () => setPlaying(false);
          void a.play().catch(() => setPlaying(false));
        }}
        className={`ml-3 inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
          playing ? "bg-rose-500 text-white" : "bg-amber-50 text-amber-600 hover:bg-amber-100"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.9V21h2v-3.1A7 7 0 0019 11h-2z" />
        </svg>
      </button>
      <span>Giọng bạn</span>
    </>
  );
}
