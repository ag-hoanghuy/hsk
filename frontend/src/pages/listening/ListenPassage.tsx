import { useState } from "react";

import { AnswerRecord, ListeningPassage } from "../../api";
import { Button, Card } from "../../components/Card";
import PinyinText from "../../components/PinyinText";
import { ListenControls } from "../../components/questions/inputs";
import PracticeTab from "../lesson/PracticeTab";

function PassageBlock({
  passage,
  onFinish,
}: {
  passage: ListeningPassage;
  onFinish: (score: number, records: AnswerRecord[]) => void;
}) {
  const [showText, setShowText] = useState(false);

  return (
    <div className="space-y-5">
      <Card>
        <h3 className="font-bold text-stone-800">{passage.title_vi}</h3>
        <p className="mt-1 text-sm text-stone-500">
          Nghe đoạn văn (có thể nghe lại nhiều lần) rồi trả lời các câu hỏi bên dưới.
        </p>
        <div className="mt-4">
          <ListenControls text={passage.text_zh} />
        </div>
        <div className="mt-4">
          <Button variant="soft" onClick={() => setShowText(!showText)}>
            {showText ? "Ẩn nội dung" : "Xem nội dung đoạn văn"}
          </Button>
        </div>
        {showText && (
          <div className="mt-4 rounded-2xl bg-cream p-4">
            <div className="font-han text-lg leading-relaxed text-stone-800">{passage.text_zh}</div>
            <PinyinText text={passage.pinyin} className="mt-1 block text-sm" />
            <div className="mt-2 text-sm text-stone-500">{passage.vi}</div>
          </div>
        )}
      </Card>
      <PracticeTab exercises={passage.questions} onFinish={onFinish} />
    </div>
  );
}

export default function ListenPassageTab({
  passages,
  onFinish,
}: {
  passages: ListeningPassage[];
  onFinish: (score: number, records: AnswerRecord[]) => void;
}) {
  const [current, setCurrent] = useState(0);
  if (passages.length === 0) return <p className="text-center text-stone-400">Bài này chưa có đoạn văn để nghe.</p>;

  return (
    <div>
      {passages.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {passages.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setCurrent(i)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                current === i ? "bg-rose-500 text-white" : "bg-white text-stone-600 hover:bg-rose-50"
              }`}
            >
              Đoạn {i + 1}
            </button>
          ))}
        </div>
      )}
      <PassageBlock key={passages[current].id} passage={passages[current]} onFinish={onFinish} />
    </div>
  );
}
