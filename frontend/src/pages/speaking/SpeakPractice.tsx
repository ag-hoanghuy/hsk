import { useCallback, useEffect, useRef, useState } from "react";

import { api, SpeakingResult, SpeakingStatus } from "../../api";
import AudioButton from "../../components/AudioButton";
import { Card } from "../../components/Card";
import PinyinText from "../../components/PinyinText";
import { MicError, micSupported, Recorder, Recording } from "../../lib/recorder";
import type { SpeakItem } from "../../lib/speakingItems";
import SpeakResultView from "./SpeakResultView";

type Phase = "idle" | "recording" | "analyzing" | "done" | "error";

interface Props {
  lessonId: number;
  item: SpeakItem;
  onScored: (text: string, overall: number) => void;
  onNext?: () => void;
}

export default function SpeakPractice({ lessonId, item, onScored, onNext }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [showPinyin, setShowPinyin] = useState(true);
  const [showVi, setShowVi] = useState(true);
  const [level, setLevel] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState<SpeakingResult | null>(null);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState<SpeakingStatus | null>(null);
  const recorder = useRef<Recorder | null>(null);
  const startedAt = useRef(0);

  // Start over whenever another sentence is chosen.
  useEffect(() => {
    recorder.current?.cancel();
    recorder.current = null;
    setPhase("idle");
    setResult(null);
    setError(null);
    setRecording((old) => {
      if (old) URL.revokeObjectURL(old.url);
      return null;
    });
  }, [item.id, item.zh]);

  useEffect(() => () => recorder.current?.cancel(), []);

  // The recognition model loads in the background the first time; wait for it before recording.
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const poll = () =>
      api
        .speakingStatus()
        .then((s) => {
          if (cancelled) return;
          setEngine(s);
          if (s.state === "loading" || s.state === "idle") timer = window.setTimeout(poll, 3000);
        })
        .catch(() => {
          if (!cancelled) timer = window.setTimeout(poll, 5000);
        });
    void poll();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (phase !== "recording") return;
    const id = window.setInterval(() => setSeconds((Date.now() - startedAt.current) / 1000), 100);
    return () => window.clearInterval(id);
  }, [phase]);

  const stop = useCallback(async () => {
    const rec = recorder.current;
    if (!rec) return;
    recorder.current = null;
    setLevel(0);
    const audio = await rec.stop();
    if (!audio || audio.seconds < 0.4) {
      setError("Đoạn ghi âm quá ngắn. Hãy bấm micro, đọc cả câu rồi bấm dừng.");
      setPhase("error");
      return;
    }
    setRecording(audio);
    setPhase("analyzing");
    try {
      const res = await api.assessSpeaking(lessonId, item.zh, audio.wav);
      setResult(res);
      setPhase("done");
      onScored(item.zh, res.overall);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
    }
  }, [item.zh, lessonId, onScored]);

  const start = async () => {
    setError(null);
    setResult(null);
    setSeconds(0);
    setRecording((old) => {
      if (old) URL.revokeObjectURL(old.url);
      return null;
    });
    const rec = new Recorder();
    try {
      await rec.start(setLevel, () => void stop());
    } catch (e) {
      rec.cancel();
      setError(e instanceof MicError ? e.message : String(e));
      setPhase("error");
      return;
    }
    recorder.current = rec;
    startedAt.current = Date.now();
    setPhase("recording");
  };

  const ready = engine?.state === "ready";
  const supported = micSupported();

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            {item.speaker && <div className="text-xs font-semibold text-rose-400">{item.speaker}</div>}
            <div className="font-han text-3xl font-bold leading-snug text-stone-800">{item.zh}</div>
            {showPinyin && <PinyinText text={item.pinyin} className="mt-1 block text-lg font-medium" />}
            {showVi && <div className="mt-1 text-stone-500">{item.vi}</div>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <AudioButton text={item.zh} label="Nghe mẫu" />
            <AudioButton text={item.zh} slow label="Nghe chậm" />
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-sm text-stone-500">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={showPinyin} onChange={(e) => setShowPinyin(e.target.checked)} /> Pinyin
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={showVi} onChange={(e) => setShowVi(e.target.checked)} /> Tiếng Việt
          </label>
        </div>
      </Card>

      {!supported && (
        <p className="rounded-2xl bg-amber-50 p-4 text-amber-700">
          Trình duyệt này không hỗ trợ ghi âm. Hãy mở trang bằng Chrome hoặc Edge tại địa chỉ localhost.
        </p>
      )}
      {supported && engine?.state === "error" && (
        <p className="rounded-2xl bg-rose-50 p-4 text-rose-700">
          Chưa tải được mô hình nhận dạng giọng nói ({engine.error}). Cần có mạng lần đầu để tải; sau khi sửa, khởi động lại backend
          (docker compose restart backend).
        </p>
      )}
      {supported && engine && engine.state !== "ready" && engine.state !== "error" && (
        <p className="rounded-2xl bg-sky-50 p-4 text-sky-700">
          Đang tải mô hình nhận dạng giọng nói lần đầu (khoảng 1–3 phút, chỉ tải một lần). Bạn có thể nghe mẫu trong lúc chờ.
        </p>
      )}

      {(phase === "idle" || phase === "recording" || phase === "analyzing" || phase === "error") && (
        <Card className="flex flex-col items-center py-8">
          <button
            type="button"
            onClick={phase === "recording" ? () => void stop() : () => void start()}
            disabled={!supported || !ready || phase === "analyzing"}
            aria-label={phase === "recording" ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
            className={`relative flex h-24 w-24 items-center justify-center rounded-full text-white shadow-card transition disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none ${
              phase === "recording" ? "bg-rose-600" : "bg-rose-500 hover:bg-rose-600"
            }`}
            style={phase === "recording" ? { boxShadow: `0 0 0 ${6 + level * 26}px rgba(244,63,94,0.2)` } : undefined}
          >
            {phase === "recording" ? (
              <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="currentColor">
                <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.9V21h2v-3.1A7 7 0 0019 11h-2z" />
              </svg>
            )}
          </button>
          <p className="mt-5 text-stone-600" aria-live="polite">
            {phase === "idle" && "Bấm micro, đọc cả câu rồi bấm lại để dừng."}
            {phase === "recording" && `Đang nghe… ${seconds.toFixed(1)}s. Đọc xong thì bấm dừng.`}
            {phase === "analyzing" && "Đang chấm điểm, chờ vài giây nhé…"}
            {phase === "error" && "Thử ghi âm lại nhé."}
          </p>
          {phase === "error" && error && <p className="mt-2 max-w-xl text-center text-rose-600">{error}</p>}
        </Card>
      )}

      {phase === "done" && result && (
        <SpeakResultView
          result={result}
          recordingUrl={recording?.url ?? null}
          sample={item.zh}
          onRetry={() => {
            setPhase("idle");
            setResult(null);
          }}
          onNext={onNext}
        />
      )}
    </div>
  );
}
