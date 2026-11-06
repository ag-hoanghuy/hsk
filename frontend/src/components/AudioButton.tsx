import { useState } from "react";

import { AudioInterrupted, playText } from "../lib/audio";

interface Props {
  text: string;
  slow?: boolean;
  size?: "sm" | "md";
  label?: string;
}

export default function AudioButton({ text, slow = false, size = "md", label }: Props) {
  const [state, setState] = useState<"idle" | "playing" | "error">("idle");

  const onClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setState("playing");
    try {
      await playText(text, slow);
      setState("idle");
    } catch (err) {
      setState(err instanceof AudioInterrupted ? "idle" : "error");
    }
  };

  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const color =
    state === "error"
      ? "bg-stone-100 text-stone-400"
      : state === "playing"
        ? "bg-rose-500 text-white"
        : "bg-rose-50 text-rose-500 hover:bg-rose-100";

  return (
    <button
      type="button"
      onClick={onClick}
      title={state === "error" ? "Không phát được âm thanh (cần kết nối mạng lần đầu)" : (label ?? "Nghe")}
      aria-label={label ?? "Nghe"}
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition ${dim} ${color}`}
    >
      <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="currentColor">
        {slow ? (
          <path d="M12 3a9 9 0 100 18 9 9 0 000-18zm1 4v5.4l3.3 2-.8 1.3L11 13V7h2z" />
        ) : (
          <path d="M3 10v4h4l5 4V6L7 10H3zm13.5 2a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4zM14 3.2v2.1a7 7 0 010 13.4v2.1a9 9 0 000-17.6z" />
        )}
      </svg>
    </button>
  );
}
