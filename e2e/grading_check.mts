// Checks every lesson's questions against the app's own grading code (frontend/src/lib/grading.ts):
// all accepted answers are graded correct, obvious wrong answers are graded wrong, order puzzles are solvable,
// tags point at words of the lesson. Run from the repo root:  node e2e/grading_check.mts [hsk3/lesson-05.json]
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { gradeQuestion, gradeVi, gradeZh, isAnswered, normalizeVi, normalizeZh, userText, correctText } = await import(
  pathToFileURL(join(ROOT, "frontend/src/lib/grading.ts")).href
);

let failures = 0;
const check = (cond: unknown, msg: string) => {
  if (!cond) {
    failures++;
    console.log("FAIL:", msg);
  }
};

// --- normalisers
check(normalizeZh("我已经 准备好了！") === "我已经准备好了", "normalizeZh punctuation/space");
check(normalizeZh("你好，世界。") === "你好世界", "normalizeZh fullwidth comma");
check(normalizeVi("Cuối tuần, bạn có dự định gì?") === "cuoi tuan ban co du dinh gi", "normalizeVi");
check(normalizeVi("Đi công viên") === "di cong vien", "normalizeVi đ");
check(gradeVi("toi khong on mot chu nao ca", ["x"], [["không", "chưa"], ["một chữ"], ["ôn"]]) === true, "gradeVi no-diacritics keywords");
check(gradeVi("Tôi không con một chữ nào", ["x"], [["không"], ["một chữ"], ["ôn"]]) === false, "gradeVi word-boundary (con != on)");
check(gradeVi("", ["x"]) === false, "gradeVi empty");

function perms<T>(a: T[]): T[][] {
  if (a.length <= 1) return [a];
  return a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any;

function checkChoice(q: Q, id: string) {
  check(new Set(q.options).size === q.options.length, id + " distinct options");
  check(q.answer >= 0 && q.answer < q.options.length, id + " answer in range");
}

const only = process.argv[2];
const files = ["hsk3", "hsk4"].filter((lv) => existsSync(join(ROOT, "content", lv))).flatMap((lv) =>
  readdirSync(join(ROOT, "content", lv))
    .filter((f) => /^lesson-\d\d\.json$/.test(f))
    .map((f) => `${lv}/${f}`),
);
let checked = 0;
for (const file of files.filter((f) => !only || f === only)) {
  checked++;
  const lesson = JSON.parse(readFileSync(join(ROOT, "content", file), "utf8")).content;
  const tag = (m: string) => `${file} ${m}`;
  const test: Q[] = lesson.test ?? [];
  check(test.length === 16, tag("16 test questions"));
  check(new Set(test.map((q) => q.type)).size === 8, tag("8 distinct test types"));
  const ids = test.map((q) => q.id);
  check(new Set(ids).size === ids.length, tag("unique test ids"));

  for (const q of test) {
    const id = tag(q.id + " " + q.type);
    check(q.tag && q.prompt_vi && (q.explanation_vi || q.type === "match"), id + " has tag/prompt/explanation");
    check(!isAnswered(q, undefined) && !isAnswered(q, null), id + " unanswered by default");
    switch (q.type) {
      case "choice":
      case "listen_choice":
        checkChoice(q, id);
        check(gradeQuestion(q, q.answer), id + " correct idx");
        check(!gradeQuestion(q, (q.answer + 1) % q.options.length), id + " wrong idx");
        check(userText(q, q.answer) === correctText(q), id + " text");
        break;
      case "match": {
        const n = q.pairs.length;
        check(new Set(q.pairs.map((p: Q) => p.vi)).size === n && new Set(q.pairs.map((p: Q) => p.zh)).size === n, id + " distinct pairs");
        check(gradeQuestion(q, [...Array(n).keys()]), id + " identity");
        const swapped = [...Array(n).keys()];
        [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
        check(!gradeQuestion(q, swapped), id + " swapped pair wrong");
        check(!gradeQuestion(q, [0, null, ...Array(n - 2).fill(null)]), id + " incomplete");
        break;
      }
      case "order": {
        const all = perms(q.words.map((_: unknown, i: number) => i)) as number[][];
        for (const ans of q.answers)
          check(all.some((p) => normalizeZh(p.map((i) => q.words[i]).join("")) === normalizeZh(ans)), id + " reachable: " + ans);
        const good = all.find((p) => gradeZh(p.map((i) => q.words[i]).join(""), q.answers));
        check(good && gradeQuestion(q, good), id + " correct order");
        const bad = all.filter((p) => !gradeZh(p.map((i) => q.words[i]).join(""), q.answers));
        check(bad.length > 0 && !gradeQuestion(q, bad[0]), id + " wrong order");
        if (good) check(!gradeQuestion(q, good.slice(0, -1)), id + " incomplete order");
        break;
      }
      case "fill":
        check(q.sentence_zh.includes("____"), id + " has blank");
        for (const a of q.answers) check(gradeQuestion(q, a), id + " answer " + a);
        check(gradeQuestion(q, q.sentence_zh.replace("____", q.answers[0])), id + " full sentence accepted");
        check(!gradeQuestion(q, "错"), id + " wrong");
        break;
      case "dictation":
      case "translate_vi_zh":
        for (const a of q.answers) check(gradeQuestion(q, a), id + " variant " + a);
        check(gradeQuestion(q, q.answers[0] + "。"), id + " punctuation ignored");
        check(!gradeQuestion(q, "不对"), id + " wrong");
        break;
      case "translate_zh_vi":
        for (const a of q.answers_vi) check(gradeQuestion(q, a), id + " variant " + a);
        check(!gradeQuestion(q, "Hôm nay trời đẹp quá"), id + " wrong");
        check(!gradeQuestion(q, "  "), id + " blank");
        check(q.keywords && q.keywords.length > 0, id + " has keywords");
        break;
    }
  }
  const choices = [
    ...(lesson.quiz?.grammar ?? []),
    ...(lesson.exercises ?? []).filter((e: Q) => e.type === "choice"),
    ...(lesson.reading ?? []).flatMap((p: Q) => p.questions ?? []),
    ...(lesson.listening ?? []).flatMap((p: Q) => p.questions ?? []),
  ];
  for (const q of choices) checkChoice(q, tag(q.id));
  for (const e of (lesson.exercises ?? []).filter((x: Q) => x.type === "order")) {
    const all = perms(e.words.map((_: unknown, i: number) => i)) as number[][];
    for (const ans of e.answers) check(all.some((p) => normalizeZh(p.map((i) => e.words[i]).join("")) === normalizeZh(ans)), tag(e.id + " reachable: " + ans));
  }
  check((lesson.quiz?.grammar ?? []).length === 6, tag("6 grammar quiz items"));
  const words = new Set([...(lesson.vocab ?? []), ...(lesson.extra_vocab ?? [])].map((v: Q) => v.hanzi));
  for (const q of [...test, ...(lesson.quiz?.grammar ?? []), ...(lesson.exercises ?? [])])
    if (q.tag?.startsWith("v:")) check(words.has(q.tag.slice(2)), tag(q.id + " vocab tag exists " + q.tag));
}
console.log(failures === 0 ? `ALL GRADING CHECKS PASSED (${checked} lesson file(s))` : `${failures} FAILURES`);
process.exit(failures ? 1 : 0);
