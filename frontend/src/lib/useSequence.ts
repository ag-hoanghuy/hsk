import { useCallback, useEffect, useRef, useState } from "react";

import { playText, stopAudio } from "./audio";

/** Plays a list of texts one after another; starting again or calling stop() cancels the run. */
export function useSequencePlayer() {
  const run = useRef(0);
  const [index, setIndex] = useState<number | null>(null);

  const stop = useCallback(() => {
    run.current++;
    stopAudio();
    setIndex(null);
  }, []);

  useEffect(() => stop, [stop]); // silence on unmount

  const play = useCallback(
    async (texts: string[], { slow = false, gapMs = 700 }: { slow?: boolean; gapMs?: number } = {}) => {
      stop();
      const id = run.current;
      for (let i = 0; i < texts.length; i++) {
        if (run.current !== id) return;
        setIndex(i);
        try {
          await playText(texts[i], slow);
        } catch {
          break;
        }
        if (gapMs > 0 && i < texts.length - 1) await new Promise((r) => setTimeout(r, gapMs));
      }
      if (run.current === id) setIndex(null);
    },
    [stop],
  );

  return { index, play, stop };
}
