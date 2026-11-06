import { tokenizePinyin } from "../lib/pinyin";

const TONE_CLASS: Record<number, string> = {
  0: "text-stone-400",
  1: "text-rose-500",
  2: "text-amber-600",
  3: "text-emerald-600",
  4: "text-sky-600",
};

/** Pinyin coloured by tone: 1 rose, 2 amber, 3 green, 4 blue, neutral grey. */
export default function PinyinText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {tokenizePinyin(text).map((t, i) =>
        t.tone === null ? (
          <span key={i}>{t.text}</span>
        ) : (
          <span key={i} className={TONE_CLASS[t.tone]}>
            {t.text}
          </span>
        ),
      )}
    </span>
  );
}
