// Every page loads without errors: home, all 40 lesson pages (each tab), listening/reading/speaking pages,
// progress, roadmap, and a full mock exam answered correctly.
import fs from "node:fs";
import path from "node:path";

import { answerTestQuestion, api, openBrowser, resetData, ROOT, sleep, suite } from "./lib.mjs";

await resetData();
const { check, finish } = suite("pages");
const h = await openBrowser();

// ------------------------------------------------------------ home, roadmap, progress
await h.goto("/");
let t = await h.text();
check(t.includes("Danh sách bài học") && /Hôm nay|học \d+ ngày/.test(t), "home loads with the today banner");
await h.goto("/roadmap");
t = await h.text();
check(t.includes("Lộ trình 40 bài") && t.includes("1 – 3 – 7 – 14 – 30"), "roadmap shows rhythm and spaced repetition");
await h.goto("/progress");
check((await h.text()).includes("Hôm nay cần ôn"), "progress page loads");

// ------------------------------------------------------------ every lesson with content
const lessons = [...(await api("/api/lessons?level=3")), ...(await api("/api/lessons?level=4"))].filter((l) => l.available);
console.log(`Opening ${lessons.length} lessons`);
for (const l of lessons) {
  const where = `HSK${l.level} L${l.number}`;
  const before = h.errors.length;
  await h.goto(`/lesson/${l.id}`);
  for (const tab of ["Ngữ pháp", "Hội thoại", "Bài tập", "Quiz", "Kiểm tra", "Ôn nhanh"]) {
    await h.tab(tab);
  }
  await h.goto(`/reading/${l.id}`);
  await h.goto(`/listening/${l.id}`);
  await h.goto(`/speaking/${l.id}`);
  check(h.errors.length === before, `${where}: all tabs and practice pages render without errors`);
}

// ------------------------------------------------------------ mock exam (answers taken from the lesson files)
const files = Object.fromEntries(
  lessons.map((l) => [l.id, JSON.parse(fs.readFileSync(path.join(ROOT, "content", `hsk${l.level}`, `lesson-${String(l.number).padStart(2, "0")}.json`), "utf8"))]),
);
for (const level of [3, 4]) {
  if (!lessons.some((l) => l.level === level)) continue;
  console.log(`Mock exam HSK ${level}`);
  await h.goto(`/mock/${level}`);
  await h.waitText(`Thi thử cuối cấp HSK ${level}`, 30000);
  await h.click("Bắt đầu thi thử");
  const total = Number((await h.text()).match(/Đã làm 0\/(\d+)/)[1]);
  for (let i = 0; i < total; i++) {
    await h.waitText(`Câu ${i + 1} ·`);
    // find which question this is: the TestRunner shows prompt + content; match it against the drawn exam via its id
    const qid = await h.page.evaluate((i) => document.querySelectorAll('button[aria-label^="Câu "]')[i]?.getAttribute("aria-label"), i);
    void qid;
    const shown = await h.text();
    const candidates = Object.entries(files).flatMap(([lid, d]) => (d.content.test ?? []).map((q) => ({ lid, q })));
    const match = candidates.find(({ q }) => {
      const key = q.question_zh ?? q.sentence_zh ?? q.source_vi ?? q.source_zh ?? null;
      if (key) return shown.includes(key);
      if (q.type === "match") return q.pairs.every((p) => shown.includes(p.zh));
      if (q.type === "order") return q.words.every((w) => shown.includes(w)) && shown.includes(q.translation_vi ?? "");
      return false;
    });
    if (match && !["listen_choice", "dictation"].includes(match.q.type)) await answerTestQuestion(h, match.q);
    await sleep(50);
    if (i < total - 1) await h.click("Câu sau →");
  }
  await h.click("Nộp bài");
  await sleep(300);
  if ((await h.text()).includes("chưa trả lời")) await h.click("Nộp bài");
  await h.waitText("Kết quả thi thử", 15000);
  const mocks = await api(`/api/mock?level=${level}`);
  check(mocks.length >= 1 && mocks[0].total === total && mocks[0].score > 50, `HSK${level} mock exam stored (${mocks[0]?.correct}/${total})`);
}

check(h.errors.length === 0, `no page/console errors${h.errors.length ? ": " + h.errors.slice(0, 3).join(" | ") : ""}`);
await h.browser.close();
await resetData(true);
process.exit(finish());
