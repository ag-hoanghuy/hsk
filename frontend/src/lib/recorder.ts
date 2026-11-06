/** Microphone recording as raw PCM, resampled to 16 kHz mono and packed as a WAV file. */

export const TARGET_RATE = 16000;
export const MAX_SECONDS = 20;

export interface Recording {
  samples: Float32Array; // 16 kHz mono, -1..1
  wav: Blob;
  url: string; // object URL for playback
  seconds: number;
}

export class MicError extends Error {}

const WORKLET = `
class Capture extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) this.port.postMessage(ch.slice(0));
    return true;
  }
}
registerProcessor("capture", Capture);
`;

export function micSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof AudioWorkletNode !== "undefined";
}

export class Recorder {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private node: AudioWorkletNode | null = null;
  private chunks: Float32Array[] = [];
  private length = 0;
  private rate = TARGET_RATE;
  private timer: number | null = null;

  /** Ask for the microphone and start capturing. `onLevel` gets a 0..1 loudness about 20 times a second. */
  async start(onLevel?: (level: number) => void, onLimit?: () => void): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: false, noiseSuppression: true, autoGainControl: true },
      });
    } catch (e) {
      const name = (e as DOMException).name;
      if (name === "NotAllowedError" || name === "SecurityError")
        throw new MicError("Trình duyệt chưa được cho phép dùng micro. Bấm biểu tượng ổ khoá cạnh địa chỉ để cho phép rồi thử lại.");
      if (name === "NotFoundError" || name === "OverconstrainedError")
        throw new MicError("Không tìm thấy micro. Hãy cắm micro hoặc kiểm tra thiết bị ghi âm trong Windows.");
      throw new MicError("Không mở được micro: " + (e as Error).message);
    }
    this.ctx = new AudioContext({ sampleRate: TARGET_RATE });
    this.rate = this.ctx.sampleRate;
    if (this.ctx.state === "suspended") await this.ctx.resume();
    const url = URL.createObjectURL(new Blob([WORKLET], { type: "application/javascript" }));
    try {
      await this.ctx.audioWorklet.addModule(url);
    } finally {
      URL.revokeObjectURL(url);
    }
    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.node = new AudioWorkletNode(this.ctx, "capture", { numberOfOutputs: 0 });
    let lastLevel = 0;
    this.node.port.onmessage = (ev: MessageEvent<Float32Array>) => {
      const data = ev.data;
      this.chunks.push(data);
      this.length += data.length;
      if (onLevel) {
        const now = performance.now();
        if (now - lastLevel > 50) {
          lastLevel = now;
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
          onLevel(Math.min(1, Math.sqrt(sum / data.length) * 6));
        }
      }
    };
    this.source.connect(this.node);
    this.timer = window.setTimeout(() => onLimit?.(), MAX_SECONDS * 1000);
  }

  /** Stop and return what was recorded (null when nothing was captured). */
  async stop(): Promise<Recording | null> {
    const rate = this.rate;
    const chunks = this.chunks;
    this.release();
    if (chunks.length === 0) return null;
    const all = new Float32Array(chunks.reduce((n, c) => n + c.length, 0));
    let off = 0;
    for (const c of chunks) {
      all.set(c, off);
      off += c.length;
    }
    const samples = rate === TARGET_RATE ? all : resample(all, rate, TARGET_RATE);
    const wav = new Blob([encodeWav(samples)], { type: "audio/wav" });
    return { samples, wav, url: URL.createObjectURL(wav), seconds: samples.length / TARGET_RATE };
  }

  cancel() {
    this.release();
  }

  private release() {
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
    this.node?.port.close();
    this.source?.disconnect();
    this.node?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.ctx?.close();
    this.ctx = this.stream = this.source = this.node = null;
    this.chunks = [];
    this.length = 0;
  }
}

/** Linear-interpolation resampler with a box filter first when shrinking (enough for speech analysis). */
export function resample(x: Float32Array, from: number, to: number): Float32Array {
  if (from === to) return x;
  const ratio = from / to;
  const out = new Float32Array(Math.floor(x.length / ratio));
  const half = ratio > 1 ? Math.floor(ratio / 2) : 0;
  for (let i = 0; i < out.length; i++) {
    const pos = i * ratio;
    if (half > 0) {
      const lo = Math.max(0, Math.floor(pos) - half);
      const hi = Math.min(x.length - 1, Math.floor(pos) + half);
      let sum = 0;
      for (let j = lo; j <= hi; j++) sum += x[j];
      out[i] = sum / (hi - lo + 1);
    } else {
      const j = Math.floor(pos);
      const f = pos - j;
      out[i] = x[j] * (1 - f) + (x[Math.min(j + 1, x.length - 1)] ?? x[j]) * f;
    }
  }
  return out;
}

export function encodeWav(samples: Float32Array, rate = TARGET_RATE): ArrayBuffer {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF");
  v.setUint32(4, 36 + samples.length * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buf;
}
