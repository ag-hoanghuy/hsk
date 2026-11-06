import { useMemo, useState } from "react";

import { normalizeZh } from "../../lib/grading";
import { seededShuffle } from "../../lib/random";
import AudioButton from "../AudioButton";

const CJK = /[一-鿿]/;

export function ChoiceInput({
  options,
  value,
  onChange,
  locked = false,
  correct,
  seed,
}: {
  options: string[];
  value: number | null;
  onChange: (i: number) => void;
  locked?: boolean;
  correct?: number; // when set (and locked) the right option is highlighted
  seed: string;
}) {
  // Authors list the right answer anywhere, so display order is shuffled (stably per seed),
  // except for true/false questions whose 对 / 错 order is fixed.
  const order = useMemo(() => {
    const indices = options.map((_, i) => i);
    const trueFalse = options.length === 2 && options[0] === "对" && options[1] === "错";
    return trueFalse ? indices : seededShuffle(indices, seed);
  }, [options, seed]);
  const zh = options.some((o) => CJK.test(o));

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {order.map((i) => {
        const picked = value === i;
        let style = "border-rose-100 bg-white hover:border-rose-300";
        if (locked && correct !== undefined) {
          if (i === correct) style = "border-emerald-400 bg-emerald-50";
          else if (picked) style = "border-rose-400 bg-rose-100";
        } else if (picked) {
          style = "border-rose-400 bg-rose-50";
        }
        return (
          <button
            key={i}
            type="button"
            disabled={locked}
            onClick={() => onChange(i)}
            className={`rounded-2xl border-2 px-4 py-3 text-left transition ${zh ? "font-han text-lg" : ""} ${style}`}
          >
            {options[i]}
          </button>
        );
      })}
    </div>
  );
}

export function OrderInput({
  words,
  value,
  onChange,
  locked = false,
  seed,
}: {
  words: string[];
  value: number[];
  onChange: (v: number[]) => void;
  locked?: boolean;
  seed: string;
}) {
  const bank = useMemo(() => seededShuffle(words.map((_, i) => i), seed), [words, seed]);

  return (
    <div>
      <div className="mt-4 flex min-h-[3.5rem] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-rose-200 bg-cream p-3">
        {value.length === 0 && <span className="text-sm text-stone-400">Bấm vào các từ bên dưới để xếp câu</span>}
        {value.map((id) => (
          <button
            key={id}
            type="button"
            disabled={locked}
            onClick={() => onChange(value.filter((c) => c !== id))}
            className="rounded-xl bg-rose-500 px-3 py-1.5 font-han text-lg text-white shadow-card"
          >
            {words[id]}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {bank.map((id) => (
          <button
            key={id}
            type="button"
            disabled={locked || value.includes(id)}
            onClick={() => onChange([...value, id])}
            className="rounded-xl border-2 border-rose-100 bg-white px-3 py-1.5 font-han text-lg transition hover:border-rose-300 disabled:opacity-30"
          >
            {words[id]}
          </button>
        ))}
      </div>
      {!locked && value.length > 0 && (
        <button type="button" onClick={() => onChange([])} className="mt-3 text-sm font-medium text-rose-500 hover:underline">
          Xếp lại từ đầu
        </button>
      )}
    </div>
  );
}

const LINK_COLORS = [
  { box: "border-rose-400 bg-rose-50", dot: "bg-rose-400" },
  { box: "border-sky-400 bg-sky-50", dot: "bg-sky-400" },
  { box: "border-amber-400 bg-amber-50", dot: "bg-amber-400" },
  { box: "border-emerald-400 bg-emerald-50", dot: "bg-emerald-400" },
  { box: "border-violet-400 bg-violet-50", dot: "bg-violet-400" },
  { box: "border-teal-400 bg-teal-50", dot: "bg-teal-400" },
];

/** Matching without instant feedback: links[left] = index of the chosen right item (or null). */
export function MatchLinkInput({
  pairs,
  value,
  onChange,
  locked = false,
  seed,
}: {
  pairs: { zh: string; vi: string }[];
  value: (number | null)[] | undefined;
  onChange: (v: (number | null)[]) => void;
  locked?: boolean;
  seed: string;
}) {
  const links = Array.isArray(value) ? value : pairs.map(() => null);
  const [sel, setSel] = useState<number | null>(null);
  const rightOrder = useMemo(() => seededShuffle(pairs.map((_, i) => i), seed), [pairs, seed]);

  const clickLeft = (i: number) => {
    if (locked) return;
    if (links[i] !== null) {
      const next = [...links];
      next[i] = null;
      onChange(next);
    }
    setSel(i);
  };

  const clickRight = (r: number) => {
    if (locked) return;
    const owner = links.findIndex((v) => v === r);
    const next = [...links];
    if (sel === null) {
      if (owner >= 0) {
        next[owner] = null;
        onChange(next);
      }
      return;
    }
    if (owner >= 0) next[owner] = null;
    next[sel] = r;
    onChange(next);
    setSel(null);
  };

  return (
    <div>
      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-3">
        <div className="space-y-3">
          {pairs.map((p, i) => {
            const linked = links[i] !== null;
            return (
              <button
                key={i}
                type="button"
                disabled={locked}
                onClick={() => clickLeft(i)}
                className={`w-full rounded-2xl border-2 px-4 py-3 text-left font-han text-lg transition ${
                  linked
                    ? LINK_COLORS[i % LINK_COLORS.length].box
                    : sel === i
                      ? "border-rose-500 bg-white ring-2 ring-rose-200"
                      : "border-rose-100 bg-white hover:border-rose-300"
                }`}
              >
                {p.zh}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          {rightOrder.map((r) => {
            const owner = links.findIndex((v) => v === r);
            return (
              <button
                key={r}
                type="button"
                disabled={locked}
                onClick={() => clickRight(r)}
                className={`w-full rounded-2xl border-2 px-4 py-3 text-left transition ${
                  owner >= 0
                    ? LINK_COLORS[owner % LINK_COLORS.length].box
                    : "border-rose-100 bg-white hover:border-rose-300"
                }`}
              >
                {pairs[r].vi}
              </button>
            );
          })}
        </div>
      </div>
      {!locked && (
        <div className="mt-3 text-sm text-stone-400">
          Chọn một từ bên trái, rồi chọn nghĩa bên phải. Các cặp đã nối có cùng màu; bấm lại để bỏ nối.
        </div>
      )}
    </div>
  );
}

/**
 * Text box for Chinese answers. A character keyboard (the answer's characters plus a few decoys)
 * can be shown for learners who have no Chinese input method installed.
 */
export function ZhTextInput({
  value,
  onChange,
  locked = false,
  bankSource,
  pool,
  seed,
  placeholder = "Nhập chữ Hán…",
}: {
  value: string;
  onChange: (v: string) => void;
  locked?: boolean;
  bankSource: string;
  pool: string;
  seed: string;
  placeholder?: string;
}) {
  const [showBank, setShowBank] = useState(false);

  const chars = useMemo(() => {
    const answer = [...normalizeZh(bankSource)];
    const decoys = seededShuffle(
      [...new Set([...pool])].filter((c) => CJK.test(c) && !answer.includes(c)),
      `${seed}:decoy`,
    ).slice(0, Math.max(4, Math.ceil(answer.length / 2)));
    return seededShuffle([...answer, ...decoys], `${seed}:bank`);
  }, [bankSource, pool, seed]);

  return (
    <div className="mt-4">
      <input
        lang="zh-CN"
        value={value}
        disabled={locked}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-2xl border-2 border-rose-100 bg-white px-4 py-3 font-han text-xl outline-none transition focus:border-rose-400 disabled:bg-stone-50"
      />
      {!locked && (
        <>
          <button
            type="button"
            onClick={() => setShowBank(!showBank)}
            className="mt-2 text-sm font-medium text-rose-500 hover:underline"
          >
            {showBank ? "Ẩn bàn phím chữ Hán" : "Chưa gõ được chữ Hán? Dùng bàn phím chữ Hán"}
          </button>
          {showBank && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-cream p-3">
              {chars.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange(value + c)}
                  className="h-11 w-11 rounded-xl border-2 border-rose-100 bg-white font-han text-xl transition hover:border-rose-300"
                >
                  {c}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onChange([...value].slice(0, -1).join(""))}
                className="h-11 rounded-xl bg-rose-100 px-3 text-sm font-semibold text-rose-600 hover:bg-rose-200"
              >
                Xóa
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** A sentence whose "____" blank shows what the learner has filled in so far. */
export function FillSentence({ sentence, value }: { sentence: string; value: string }) {
  const [before, after = ""] = sentence.split("____");
  return (
    <div className="font-han text-xl leading-loose text-stone-800">
      {before}
      <span className="mx-1 inline-block min-w-[3.5rem] border-b-2 border-rose-400 px-1 text-center text-rose-600">
        {value || " "}
      </span>
      {after}
    </div>
  );
}

export function ListenControls({ text }: { text: string }) {
  return (
    <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-cream p-4">
      <div className="flex items-center gap-2">
        <AudioButton text={text} label="Nghe" />
        <span className="text-sm font-medium text-stone-600">Nghe</span>
      </div>
      <div className="flex items-center gap-2">
        <AudioButton text={text} slow label="Nghe chậm" />
        <span className="text-sm font-medium text-stone-600">Nghe chậm</span>
      </div>
      <span className="text-sm text-stone-400">Có thể nghe lại nhiều lần</span>
    </div>
  );
}
