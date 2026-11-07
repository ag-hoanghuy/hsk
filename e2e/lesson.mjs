// Lesson page: vocabulary sections, quiz (timed and untimed), end-of-lesson test (all correct, mistakes, blank,
// override), practice, review tab, writing tab, progress. Uses HSK3 lesson 1.
import { answerTestQuestion, api, lessonFile, openBrowser, pollList, resetData, sleep, suite } from "./lib.mjs";

await resetData();
const { check, finish } = suite("lesson");
const L = lessonFile(3, 1);
const C = L.content;
const h = await openBrowser();
const { page } = h;

const lessons = await api("/api/lessons?level=3");
const L1 = lessons.find((l) => l.number === 1);
const id = L1.id;

// ------------------------------------------------------------ vocabulary
console.log("Vocabulary");
await h.goto(`/lesson/${id}`);
let t = await h.text();
check(t.includes(L1.title_zh), "lesson page shows the title");
check(C.objectives.every((o) => t.includes(o)), "objectives are listed");
const lower = t.toLowerCase(); // section headings are uppercased by CSS
check(lower.includes(`từ mới chính (${C.vocab.length})`) && lower.includes(`từ mở rộng (${C.extra_vocab.length})`), "core and extra vocabulary sections");
if (C.glossary?.length) check(lower.includes("từ cần biết thêm"), "glossary section shown");
await h.shot("lesson-vocab");

// ------------------------------------------------------------ grammar
await h.tab("Ngữ pháp");
t = await h.text();
check(C.grammar.every((g) => t.includes(g.title)), "all grammar points shown");
check(t.includes("Lỗi người Việt hay gặp"), "common mistakes box shown");

// ------------------------------------------------------------ quiz (untimed, with extra words)
console.log("Quiz");
await h.tab("Quiz");
const switches = await page.$$('button[role="switch"]');
check(switches.length === 2, "two switches: timer and extra words");
await switches[0].click(); // timer off
await switches[1].click(); // include extra words
await sleep(100);
check((await h.text()).includes("15 câu"), "vocab quiz with extra words has 15 questions");
await h.click("Chơi ngay");
for (let i = 0; i < 15; i++) {
  await h.waitText(`Câu ${i + 1}/15`);
  await page.evaluate(() => {
    const opts = [...document.querySelectorAll("button")].filter((b) => /^[ABCD]$/.test(b.firstElementChild?.textContent ?? ""));
    opts[0].click();
  });
  await page.waitForFunction(() => /Câu tiếp theo|Xem kết quả/.test(document.body.innerText), { timeout: 5000 });
  await h.click(i === 14 ? "Xem kết quả" : "Câu tiếp theo");
}
await h.waitText("Chuỗi đúng dài nhất");
let attempts = await pollList(`/api/attempts?lesson_id=${id}&kind=quiz_vocab`, 1);
check(attempts.length === 1 && attempts[0].total === 15, "vocab quiz attempt saved (15 answers)");

console.log("Quiz grammar (timed, one question expires)");
await h.click("Về menu");
await (await page.$$('button[role="switch"]'))[0].click(); // timer back on
await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => b.textContent.trim() === "Chơi ngay")[1].click());
await h.waitText("Câu 1/6");
await h.waitText("Hết giờ", 30000);
check(true, "timer expiry reveals the answer");
await h.click("✕ Thoát", { prefix: true });

// ------------------------------------------------------------ test: all correct
console.log("Test: all correct");
const runTest = async (plan) => {
  for (let i = 0; i < C.test.length; i++) {
    await h.waitText(`Câu ${i + 1} ·`);
    await answerTestQuestion(h, C.test[i], plan(C.test[i], i));
    await sleep(60);
    if (i < C.test.length - 1) await h.click("Câu sau →");
  }
};
await h.goto(`/lesson/${id}?tab=test`);
check((await h.text()).includes("16 câu, gồm 8 dạng"), "test intro: 16 questions, 8 types");
await h.click("Bắt đầu làm bài");
await runTest(() => ({}));
await h.click("Nộp bài");
await h.waitText("Đúng 16 / 16 câu", 10000);
check(true, "all-correct attempt: 16/16");
await h.shot("lesson-test-100");
attempts = await pollList(`/api/attempts?lesson_id=${id}&kind=test`, 1);
check(attempts[0]?.score === 100, "test attempt saved with score 100");

// ------------------------------------------------------------ test: mistakes, blank, override
console.log("Test: mistakes, blank answer, override");
await h.click("Làm lại bài kiểm tra");
const blankAt = C.test.findIndex((q) => q.type === "translate_vi_zh");
const wrongTypes = new Set(["choice", "order", "translate_zh_vi"]);
await runTest((q, i) => (i === blankAt ? { blank: true } : { wrong: wrongTypes.has(q.type) }));
await h.click("Nộp bài");
await h.waitText("chưa trả lời");
check(true, "submitting with a blank answer asks for confirmation");
await h.click("Nộp bài");
await h.waitText("Thống kê lỗi sai", 10000);
t = await h.text();
const m = t.match(/Đúng (\d+) \/ 16 câu · Sai (\d+) câu/);
check(m && Number(m[2]) > 0, `mistakes counted (${m && m[0]})`);
check(t.includes("(bỏ trống)"), "blank answer shown as (bỏ trống)");
const before = attempts[0];
await h.click("Câu sai", { prefix: true });
await h.click("Câu trả lời của mình cũng đúng");
await sleep(800);
attempts = await pollList(`/api/attempts?lesson_id=${id}&kind=test`, 2);
const latest = await api(`/api/attempts/${attempts[0].id}`);
check(latest.answers.some((a) => a.overridden), "override stored on the attempt");
void before;

// ------------------------------------------------------------ practice
console.log("Practice");
await h.goto(`/lesson/${id}?tab=practice`);
await h.waitText(`1/${C.exercises.length}`);
const first = C.exercises[0];
await h.click(first.options[first.answer]);
await h.click("Kiểm tra");
await h.waitText("Chính xác");
check(true, "practice choice grading works");

// ------------------------------------------------------------ review + writing
console.log("Review and writing tabs");
await h.goto(`/lesson/${id}?tab=review`);
t = await h.text();
check(C.review.remember.every((r) => t.includes(r)) && t.includes("Lỗi hay sai"), "review tab lists what to remember and mistakes");
await h.goto(`/lesson/${id}?tab=writing`);
await h.waitText("chữ trong từ chính");
await page.waitForFunction(() => document.querySelectorAll("svg path").length > 3, { timeout: 20000 });
check(true, "writing tab loads stroke data and draws the character");
await h.click("Tô theo mẫu");
await sleep(1500);
check((await h.text()).includes("Sai 0 nét"), "trace mode starts a stroke quiz");
await h.shot("lesson-writing");

// ------------------------------------------------------------ progress
console.log("Progress");
const progress = await api(`/api/progress?lesson_id=${id}`);
const sections = progress.map((p) => p.section);
check(sections.includes("quiz") && sections.includes("test"), `quiz and test recorded (${sections.join(",")})`);
const ov = await api("/api/overview");
check(ov.streak >= 1 && ov.active_days >= 1, "overview counts today as a study day");
const row = ov.lessons.find((l) => l.id === id);
check(row.learned_on === ov.today && row.reviews[0]?.status === "upcoming", "first review is scheduled after the test");
await h.goto("/progress");
check((await h.text()).includes("ngày học liên tiếp"), "progress page loads");

check(h.errors.length === 0, `no page/console errors${h.errors.length ? ": " + h.errors.slice(0, 3).join(" | ") : ""}`);
await h.browser.close();
await resetData(true);
process.exit(finish());
