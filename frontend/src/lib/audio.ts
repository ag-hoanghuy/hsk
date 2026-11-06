let current: HTMLAudioElement | null = null;
let interrupt: (() => void) | null = null;

/** Rejection reason of a playText() that was cut off by stopAudio() or by a newer playText(). */
export class AudioInterrupted extends Error {
  constructor() {
    super("audio interrupted");
  }
}

export const ttsUrl = (text: string, slow = false) =>
  `/api/tts?text=${encodeURIComponent(text)}${slow ? "&slow=1" : ""}`;

export function stopAudio() {
  const cut = interrupt;
  interrupt = null;
  if (current) {
    current.pause();
    current = null;
  }
  cut?.();
}

/**
 * Play the spoken form of `text`. Resolves when playback ends, rejects with AudioInterrupted when
 * something else starts or stops audio first, and with a plain Error when the audio can't be played.
 */
export function playText(text: string, slow = false): Promise<void> {
  stopAudio();
  return new Promise((resolve, reject) => {
    const audio = new Audio(ttsUrl(text, slow));
    current = audio;
    interrupt = () => reject(new AudioInterrupted());
    audio.onended = () => {
      if (current === audio) {
        current = null;
        interrupt = null;
      }
      resolve();
    };
    audio.onerror = () => {
      if (current === audio) {
        current = null;
        interrupt = null;
      }
      reject(new Error("Không phát được âm thanh"));
    };
    audio.play().catch((e) => {
      if (current === audio) {
        current = null;
        interrupt = null;
      }
      reject(e);
    });
  });
}
