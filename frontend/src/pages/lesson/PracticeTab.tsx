import { useMemo, useRef, useState } from "react";

import {
  AnswerRecord,
  ChoiceExercise,
  Exercise,
  ListenChoiceQuestion,
  ListenFillExercise,
  MatchExercise,
  OrderExercise,
} from "../../api";
import AudioButton from "../../components/AudioButton";
import { Button, Card } from "../../components/Card";
import { ChoiceInput, FillSentence, ListenControls, OrderInput } from "../../components/questions/inputs";
import { gradeZh } from "../../lib/grading";
import { newSeed, shuffle } from "../../lib/random";

function Feedback({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className={`mt-5 rounded-2xl p-4 ${ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
      <div className="font-semibold">{ok ? "Chính xác! 🎉" : "Chưa đúng rồi"}</div>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

type ChoiceLike = ChoiceExercise | ListenChoiceQuestion | ListenFillExercise;

/** Pick-one question: plain multiple choice, hear-and-choose, or hear-and-fill-the-blank. */
function ChoiceQ({ ex, seed, onResult }: { ex: ChoiceLike; seed: string; onResult: (ok: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const ok = picked === ex.answer;

  const check = () => {
    setChecked(true);
    onResult(ok);
  };

  return (
    <div>
      {ex.type === "choice" && <div className="font-han text-xl font-medium text-stone-800">{ex.question_zh}</div>}
      {ex.type !== "choice" && <ListenControls text={ex.audio_text} />}
      {ex.type === "listen_fill" && (
        <div className="mt-4">
          <FillSentence sentence={ex.sentence_zh} value={picked !== null ? ex.options[picked] : ""} />
        </div>
      )}
      <ChoiceInput
        options={ex.options}
        value={picked}
        onChange={setPicked}
        locked={checked}
        correct={checked ? ex.answer : undefined}
        seed={seed}
      />
      {!checked && (
        <div className="mt-5">
          <Button onClick={check} disabled={picked === null}>
            Kiểm tra
          </Button>
        </div>
      )}
      {checked && (
        <Feedback ok={ok}>
          {ex.type !== "choice" && (
            <div className="mb-1 flex items-center gap-2">
              <span className="font-han text-lg font-medium">{ex.audio_text}</span>
              <AudioButton text={ex.audio_text} size="sm" />
            </div>
          )}
          {ex.explanation_vi}
        </Feedback>
      )}
    </div>
  );
}

function OrderQ({ ex, seed, onResult }: { ex: OrderExercise; seed: string; onResult: (ok: boolean) => void }) {
  const [chosen, setChosen] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const sentence = chosen.map((id) => ex.words[id]).join("");
  const ok = gradeZh(sentence, ex.answers);

  const check = () => {
    setChecked(true);
    onResult(ok);
  };

  return (
    <div>
      <div className="text-stone-600">
        Dịch: <span className="font-medium text-stone-800">{ex.translation_vi}</span>
      </div>
      <OrderInput words={ex.words} value={chosen} onChange={setChosen} locked={checked} seed={seed} />
      {!checked && (
        <div className="mt-5">
          <Button onClick={check} disabled={chosen.length !== ex.words.length}>
            Kiểm tra
          </Button>
        </div>
      )}
      {checked && (
        <Feedback ok={ok}>
          <div className="flex items-center gap-2">
            <span className="font-han text-lg font-medium">{ex.answers[0]}</span>
            <AudioButton text={ex.answers[0]} size="sm" />
          </div>
          <div className="mt-1">{ex.explanation_vi}</div>
        </Feedback>
      )}
    </div>
  );
}

/** Practice matching gives instant feedback on every pair (the test uses MatchLinkInput instead). */
function MatchQ({ ex, onResult }: { ex: MatchExercise; onResult: (ok: boolean) => void }) {
  const right = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ i, vi: p.vi }))), [ex]);
  const [left, setLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState(0);
  const [flash, setFlash] = useState<number | null>(null);
  const reported = useRef(false);

  const pickRight = (i: number) => {
    if (left === null) return;
    if (left === i) {
      const next = [...matched, i];
      setMatched(next);
      setLeft(null);
      if (next.length === ex.pairs.length && !reported.current) {
        reported.current = true;
        onResult(wrong === 0);
      }
    } else {
      setWrong(wrong + 1);
      setFlash(i);
      setTimeout(() => setFlash(null), 500);
    }
  };

  const done = matched.length === ex.pairs.length;

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <div className="space-y-3">
          {ex.pairs.map((p, i) => (
            <button
              key={i}
              type="button"
              disabled={matched.includes(i)}
              onClick={() => setLeft(i)}
              className={`w-full rounded-2xl border-2 px-4 py-3 font-han text-lg transition ${
                matched.includes(i)
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : left === i
                    ? "border-rose-500 bg-rose-50"
                    : "border-rose-100 bg-white hover:border-rose-300"
              }`}
            >
              {p.zh}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {right.map(({ i, vi }) => (
            <button
              key={i}
              type="button"
              disabled={matched.includes(i)}
              onClick={() => pickRight(i)}
              className={`w-full rounded-2xl border-2 px-4 py-3 text-left transition ${
                matched.includes(i)
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : flash === i
                    ? "border-rose-500 bg-rose-100"
                    : "border-rose-100 bg-white hover:border-rose-300"
              }`}
            >
              {vi}
            </button>
          ))}
        </div>
      </div>
      {!done && <div className="mt-4 text-sm text-stone-400">Chọn một từ bên trái, rồi chọn nghĩa tương ứng bên phải.</div>}
      {done && (
        <Feedback ok={wrong === 0}>
          {wrong === 0 ? "Nối đúng hết, không sai lần nào!" : `Hoàn thành, bạn đã nối sai ${wrong} lần.`}
        </Feedback>
      )}
    </div>
  );
}

interface Props {
  exercises: Exercise[];
  /** Called once the last question is done; `records` lets callers store per-question results. */
  onFinish: (score: number, records: AnswerRecord[]) => void;
  /** When set, "Làm lại" calls this (e.g. to build a fresh question set) instead of replaying the same one. */
  onRestart?: () => void;
}

export default function PracticeTab({ exercises, onFinish, onRestart }: Props) {
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [answered, setAnswered] = useState(false);
  const [seed, setSeed] = useState(newSeed);

  const finished = idx >= exercises.length;
  const correct = results.filter(Boolean).length;
  const score = Math.round((correct / Math.max(exercises.length, 1)) * 100);

  const handleResult = (ok: boolean) => {
    setResults((r) => [...r, ok]);
    setAnswered(true);
  };

  const next = () => {
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    setAnswered(false);
    if (nextIdx >= exercises.length) {
      const total = results.filter(Boolean).length;
      const records = exercises.map((e, i) => ({
        question_id: e.id,
        qtype: e.type,
        tag: e.tag,
        user_answer: null,
        is_correct: results[i] ?? false,
      }));
      onFinish(Math.round((total / exercises.length) * 100), records);
    }
  };

  const restart = () => {
    if (onRestart) {
      onRestart();
      return;
    }
    setIdx(0);
    setResults([]);
    setAnswered(false);
    setSeed(newSeed());
  };

  if (finished) {
    return (
      <Card className="text-center">
        <div className="text-5xl">{score >= 80 ? "🌸" : score >= 50 ? "🙂" : "💪"}</div>
        <div className="mt-3 text-3xl font-bold text-rose-500">{score} điểm</div>
        <div className="mt-1 text-stone-500">
          Đúng {correct} / {exercises.length} câu
        </div>
        <div className="mt-6">
          <Button onClick={restart}>Làm lại</Button>
        </div>
      </Card>
    );
  }

  const ex = exercises[idx];
  const key = `${seed}-${ex.id}`;
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-rose-100">
          <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${(idx / exercises.length) * 100}%` }} />
        </div>
        <span className="text-sm font-medium text-stone-500">
          {idx + 1}/{exercises.length}
        </span>
      </div>
      <Card>
        <div className="mb-4 text-sm font-semibold text-rose-400">{ex.prompt_vi}</div>
        {(ex.type === "choice" || ex.type === "listen_choice" || ex.type === "listen_fill") && (
          <ChoiceQ key={key} ex={ex} seed={key} onResult={handleResult} />
        )}
        {ex.type === "order" && <OrderQ key={key} ex={ex} seed={key} onResult={handleResult} />}
        {ex.type === "match" && <MatchQ key={key} ex={ex} onResult={handleResult} />}
        {answered && (
          <div className="mt-5 text-right">
            <Button onClick={next}>{idx + 1 === exercises.length ? "Xem kết quả" : "Câu tiếp theo"}</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
