import type { SpeakingCharts, SpeakingSyllable, SyllableStatus } from "../../api";

const W = 640;

const STATUS_FILL: Record<SyllableStatus, string> = {
  ok: "rgba(16,185,129,0.07)",
  tone: "rgba(245,158,11,0.16)",
  sound: "rgba(244,63,94,0.14)",
  missing: "rgba(120,113,108,0.16)",
};

/** Polyline path that breaks wherever the pitch is unvoiced (null). */
function pitchPath(values: (number | null)[], x: (i: number) => number, y: (v: number) => number): string {
  let d = "";
  let pen = false;
  values.forEach((v, i) => {
    if (v === null) {
      pen = false;
      return;
    }
    d += `${pen ? "L" : "M"}${x(i).toFixed(1)} ${y(Math.max(-1.3, Math.min(1.3, v))).toFixed(1)} `;
    pen = true;
  });
  return d;
}

/** Sample (grey) and learner (rose) pitch on the same time axis, syllables shaded by verdict. */
export function PitchChart({ charts, syllables }: { charts: SpeakingCharts; syllables: SpeakingSyllable[] }) {
  const H = 150;
  const n = Math.max(charts.ref_pitch.length, 1);
  const x = (i: number) => (i / n) * W;
  const y = (v: number) => H / 2 - (v / 1.3) * (H / 2 - 22) + 8;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Đường cao độ giọng mẫu và giọng của bạn">
      {syllables.map((s, k) => {
        const a = x(charts.bounds[k]);
        const b = x(charts.bounds[k + 1]);
        return (
          <g key={k}>
            <rect x={a} y={0} width={Math.max(b - a, 1)} height={H} fill={STATUS_FILL[s.status]} />
            <text x={(a + b) / 2} y={16} textAnchor="middle" className="fill-stone-600 font-han" fontSize={15} fontWeight={600}>
              {s.hanzi}
            </text>
            {k > 0 && <line x1={a} x2={a} y1={22} y2={H} stroke="rgba(120,113,108,0.25)" strokeDasharray="3 3" />}
          </g>
        );
      })}
      <line x1={0} x2={W} y1={y(0)} y2={y(0)} stroke="rgba(120,113,108,0.2)" />
      <path d={pitchPath(charts.ref_pitch, x, y)} fill="none" stroke="#a8a29e" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <path d={pitchPath(charts.usr_pitch, x, y)} fill="none" stroke="#f43f5e" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Loudness of the sample and of the recording on a shared time axis, so a slower reading is visible. */
export function WaveCompare({ charts }: { charts: SpeakingCharts }) {
  const H = 90;
  const len = Math.max(charts.ref_wave.length, charts.usr_wave.length, 1);
  const bar = W / len;
  const draw = (vals: number[], mid: number, color: string) =>
    vals.map((v, i) => {
      const h = Math.max(1.5, v * 34);
      return <rect key={i} x={i * bar} y={mid - h / 2} width={Math.max(bar * 0.7, 1)} height={h} rx={bar * 0.35} fill={color} />;
    });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Độ lớn âm thanh theo thời gian">
      <text x={2} y={10} fontSize={10} className="fill-stone-400">
        Mẫu
      </text>
      {draw(charts.ref_wave, 26, "#d6d3d1")}
      <text x={2} y={58} fontSize={10} className="fill-stone-400">
        Bạn
      </text>
      {draw(charts.usr_wave, 72, "#fda4af")}
    </svg>
  );
}
