import HanziWriter, { type CharacterJson } from "hanzi-writer";
import { useEffect, useMemo, useRef, useState } from "react";

import { VocabItem } from "../../api";
import AudioButton from "../../components/AudioButton";
import { Button, Card } from "../../components/Card";
import PinyinText from "../../components/PinyinText";

type Mode = "watch" | "trace" | "recall";

interface CharItem {
  char: string;
  word: VocabItem; // first core word that contains the character
}

const SIZE = 260;

const loader = (char: string, onLoad: (data: CharacterJson) => void, onError: (err?: unknown) => void) => {
  fetch(`/api/strokes/${encodeURIComponent(char)}`)
    .then((r) => (r.ok ? (r.json() as Promise<CharacterJson>) : Promise.reject(new Error(String(r.status)))))
    .then(onLoad)
    .catch(onError);
};

/** 米字格 practice grid behind the drawing area. */
function Grid() {
  const s = SIZE;
  return (
    <svg width={s} height={s} className="absolute inset-0" aria-hidden>
      <rect x={1} y={1} width={s - 2} height={s - 2} fill="#fff" stroke="#fecdd3" strokeWidth={2} rx={12} />
      <g stroke="#fde2e4" strokeDasharray="6 6">
        <line x1={0} y1={0} x2={s} y2={s} />
        <line x1={s} y1={0} x2={0} y2={s} />
        <line x1={s / 2} y1={0} x2={s / 2} y2={s} />
        <line x1={0} y1={s / 2} x2={s} y2={s / 2} />
      </g>
    </svg>
  );
}

function Board({
  item,
  mode,
  onDone,
}: {
  item: CharItem;
  mode: Mode;
  onDone: (mistakes: number) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const writer = useRef<HanziWriter | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!host.current) return;
    host.current.innerHTML = "";
    setStatus("loading");
    setMistakes(0);
    setFinished(false);
    const w = HanziWriter.create(host.current, item.char, {
      width: SIZE,
      height: SIZE,
      padding: 18,
      showOutline: mode !== "recall",
      showCharacter: mode === "watch",
      strokeColor: "#334155",
      radicalColor: "#e11d48",
      outlineColor: "#f1e4e6",
      drawingColor: "#e11d48",
      drawingWidth: 22,
      strokeAnimationSpeed: 1.2,
      delayBetweenStrokes: 250,
      charDataLoader: loader,
      onLoadCharDataSuccess: () => setStatus("ready"),
      onLoadCharDataError: () => setStatus("error"),
    });
    writer.current = w;
    if (mode === "watch") {
      void w.loopCharacterAnimation();
    } else {
      void w.quiz({
        showHintAfterMisses: mode === "trace" ? 2 : 3,
        highlightOnComplete: true,
        onMistake: (d) => setMistakes(d.totalMistakes),
        onComplete: (d) => {
          setMistakes(d.totalMistakes);
          setFinished(true);
          onDone(d.totalMistakes);
        },
      });
    }
    return () => {
      writer.current = null;
      if (host.current) host.current.innerHTML = "";
    };
    // onDone is intentionally not a dependency: a new callback must not restart the quiz
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.char, mode]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <Grid />
        <div ref={host} className="relative" style={{ width: SIZE, height: SIZE, touchAction: "none" }} />
        {status === "loading" && <div className="absolute inset-0 flex items-center justify-center text-sm text-stone-400">Đang tải nét chữ…</div>}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-rose-500">
            Không tải được nét chữ (cần mạng lần đầu cho mỗi chữ).
          </div>
        )}
      </div>
      <div className="mt-3 h-6 text-sm" aria-live="polite">
        {mode !== "watch" && !finished && status === "ready" && <span className="text-stone-500">Sai {mistakes} nét · viết lần lượt từng nét bằng chuột</span>}
        {finished && (
          <span className={mistakes <= 2 ? "font-semibold text-emerald-600" : "font-semibold text-amber-600"}>
            {mistakes === 0 ? "Hoàn hảo!" : mistakes <= 2 ? `Tốt! Sai ${mistakes} nét.` : `Xong, sai ${mistakes} nét. Thử lại nhé.`}
          </span>
        )}
      </div>
      {mode !== "watch" && (
        <div className="mt-2 flex gap-2">
          <Button variant="soft" onClick={() => writer.current?.animateCharacter()}>
            Xem mẫu
          </Button>
        </div>
      )}
    </div>
  );
}

export default function WritingTab({ vocab, onFinish }: { vocab: VocabItem[]; onFinish: (score: number) => void }) {
  const chars = useMemo(() => {
    const seen = new Map<string, CharItem>();
    vocab.forEach((w) =>
      [...w.hanzi].forEach((ch) => {
        if (/[一-鿿]/.test(ch) && !seen.has(ch)) seen.set(ch, { char: ch, word: w });
      }),
    );
    return [...seen.values()];
  }, [vocab]);
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<Mode>("watch");
  const [results, setResults] = useState<Record<string, number>>({});
  const [run, setRun] = useState(0); // remounts the board for "Viết lại"

  if (chars.length === 0) return <p className="text-stone-400">Bài này chưa có từ để luyện viết.</p>;
  const item = chars[idx];
  const done = Object.keys(results).length;
  const good = Object.values(results).filter((m) => m <= 2).length;

  const record = (mistakes: number) => {
    setResults((r) => {
      const next = { ...r, [item.char]: Math.min(r[item.char] ?? Infinity, mistakes) };
      if (Object.keys(next).length === chars.length) {
        onFinish(Math.round((100 * Object.values(next).filter((m) => m <= 2).length) / chars.length));
      }
      return next;
    });
  };

  const MODES: { key: Mode; label: string; desc: string }[] = [
    { key: "watch", label: "Xem cách viết", desc: "Xem thứ tự nét (nét đỏ là bộ thủ)." },
    { key: "trace", label: "Tô theo mẫu", desc: "Viết đè lên chữ mờ, sai 2 lần sẽ có gợi ý." },
    { key: "recall", label: "Viết theo trí nhớ", desc: "Chỉ nhìn pinyin và nghĩa, như phần viết của đề thi." },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              mode === m.key ? "bg-rose-500 text-white shadow-card" : "bg-white text-stone-600 hover:bg-rose-50"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="-mt-2 text-sm text-stone-500">{MODES.find((m) => m.key === mode)?.desc}</p>

      <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
        <Card className="flex flex-col items-center py-6">
          <div className="mb-4 text-center">
            {mode === "recall" ? (
              <>
                <PinyinText text={item.word.pinyin} className="text-2xl font-semibold" />
                <div className="mt-1 text-stone-500">
                  {item.word.meaning_vi} · viết chữ thứ {[...item.word.hanzi].indexOf(item.char) + 1} của từ ({item.word.hanzi.length} chữ)
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="font-han text-2xl text-stone-800">{item.word.hanzi}</span>
                <PinyinText text={item.word.pinyin} className="text-lg" />
                <AudioButton text={item.word.hanzi} size="sm" />
              </div>
            )}
          </div>
          <Board key={`${item.char}-${mode}-${run}`} item={item} mode={mode} onDone={record} />
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button variant="soft" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
              ← Chữ trước
            </Button>
            {mode !== "watch" && (
              <Button variant="soft" onClick={() => setRun((r) => r + 1)}>
                Viết lại
              </Button>
            )}
            <Button onClick={() => setIdx((i) => Math.min(chars.length - 1, i + 1))} disabled={idx === chars.length - 1}>
              Chữ sau →
            </Button>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold text-stone-500">
            {chars.length} chữ trong từ chính · đã viết {done}, tốt {good}
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {chars.map((c, i) => {
              const m = results[c.char];
              const color =
                m === undefined ? "bg-cream text-stone-700" : m <= 2 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
              return (
                <button
                  key={c.char}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Chữ ${c.char}`}
                  className={`aspect-square rounded-xl font-han text-xl transition ${color} ${i === idx ? "ring-2 ring-rose-400" : ""}`}
                >
                  {mode === "recall" && m === undefined ? "?" : c.char}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-stone-400">Xanh: sai tối đa 2 nét. Vàng: nên viết lại.</p>
        </Card>
      </div>
    </div>
  );
}
