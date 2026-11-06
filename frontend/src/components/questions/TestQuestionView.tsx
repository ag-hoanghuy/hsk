import type { TestQuestion } from "../../api";
import type { AnswerValue } from "../../lib/grading";
import AudioButton from "../AudioButton";
import { ChoiceInput, FillSentence, ListenControls, MatchLinkInput, OrderInput, ZhTextInput } from "./inputs";

interface Props {
  q: TestQuestion;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  seed: string; // keeps option order stable while the learner moves between questions
  pool: string; // characters used as decoys in the character keyboard
}

/** Renders the interactive part of one test question (no feedback: grading happens on submit). */
export default function TestQuestionView({ q, value, onChange, seed, pool }: Props) {
  const qseed = `${seed}:${q.id}`;

  switch (q.type) {
    case "choice":
      return (
        <>
          <div className="font-han text-xl font-medium text-stone-800">{q.question_zh}</div>
          <ChoiceInput
            options={q.options}
            value={typeof value === "number" ? value : null}
            onChange={onChange}
            seed={qseed}
          />
        </>
      );

    case "listen_choice":
      return (
        <>
          <ListenControls text={q.audio_text} />
          <ChoiceInput
            options={q.options}
            value={typeof value === "number" ? value : null}
            onChange={onChange}
            seed={qseed}
          />
        </>
      );

    case "match":
      return (
        <MatchLinkInput
          pairs={q.pairs}
          value={Array.isArray(value) ? (value as (number | null)[]) : undefined}
          onChange={onChange}
          seed={qseed}
        />
      );

    case "order":
      return (
        <>
          <div className="text-stone-600">
            Dịch: <span className="font-medium text-stone-800">{q.translation_vi}</span>
          </div>
          <OrderInput
            words={q.words}
            value={Array.isArray(value) ? (value as number[]) : []}
            onChange={onChange}
            seed={qseed}
          />
        </>
      );

    case "fill": {
      const text = typeof value === "string" ? value : "";
      return (
        <>
          <FillSentence sentence={q.sentence_zh} value={text} />
          {q.hint_vi && <div className="mt-1 text-sm text-stone-500">Gợi ý: {q.hint_vi}</div>}
          <ZhTextInput value={text} onChange={onChange} bankSource={q.answers[0]} pool={pool} seed={qseed} />
        </>
      );
    }

    case "dictation":
      return (
        <>
          <ListenControls text={q.audio_text} />
          <ZhTextInput
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
            bankSource={q.answers[0]}
            pool={pool}
            seed={qseed}
            placeholder="Viết lại câu bạn nghe được bằng chữ Hán…"
          />
        </>
      );

    case "translate_vi_zh":
      return (
        <>
          <div className="rounded-2xl bg-cream p-4 text-lg text-stone-800">{q.source_vi}</div>
          <ZhTextInput
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
            bankSource={q.answers[0]}
            pool={pool}
            seed={qseed}
            placeholder="Dịch sang tiếng Trung…"
          />
        </>
      );

    case "translate_zh_vi":
      return (
        <>
          <div className="flex items-start justify-between gap-3 rounded-2xl bg-cream p-4">
            <div className="font-han text-xl text-stone-800">{q.source_zh}</div>
            <AudioButton text={q.source_zh} size="sm" />
          </div>
          <textarea
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            placeholder="Dịch sang tiếng Việt…"
            className="mt-4 w-full rounded-2xl border-2 border-rose-100 bg-white px-4 py-3 text-lg outline-none transition focus:border-rose-400"
          />
        </>
      );
  }
}
