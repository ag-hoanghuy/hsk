import { GrammarItem } from "../../api";
import AudioButton from "../../components/AudioButton";
import { Card } from "../../components/Card";
import PinyinText from "../../components/PinyinText";

export default function GrammarTab({ grammar }: { grammar: GrammarItem[] }) {
  return (
    <div className="space-y-5">
      {grammar.map((g, i) => (
        <Card key={g.id}>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white">
              {i + 1}
            </span>
            <h3 className="text-lg font-bold text-stone-800">{g.title}</h3>
          </div>
          <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 font-han text-lg font-medium text-rose-600">
            {g.pattern}
          </div>
          <p className="mt-4 leading-relaxed text-stone-600">{g.explanation_vi}</p>
          <div className="mt-4 space-y-3">
            {g.examples.map((ex, k) => (
              <div key={k} className="flex items-start justify-between gap-3 rounded-2xl bg-cream p-3">
                <div>
                  <div className="font-han text-lg text-stone-800">{ex.zh}</div>
                  <PinyinText text={ex.pinyin} className="text-sm" />
                  <div className="mt-1 text-sm text-stone-500">{ex.vi}</div>
                </div>
                <AudioButton text={ex.zh} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
