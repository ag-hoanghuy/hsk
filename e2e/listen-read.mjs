// Listening and reading pages, driven by the content of HSK3 lesson 1.
import { api, lessonFile, openBrowser, pollList, resetData, sleep, suite } from "./lib.mjs";

await resetData();
const { check, finish } = suite("listen-read");
const C = lessonFile(3, 1).content;
const h = await openBrowser();
const { page } = h;
const id = (await api("/api/lessons?level=3")).find((l) => l.number === 1).id;

async function answerAll(questions, after) {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await h.waitText(`${i + 1}/${questions.length}`);
    await h.click(q.options[q.answer], after ? { after } : {}).catch(() => h.click(q.options[q.answer]));
    await h.click("Kiểm tra");
    await h.waitText("Chính xác");
    await h.click(i + 1 === questions.length ? "Xem kết quả" : "Câu tiếp theo");
  }
  await h.waitText("100 điểm");
}

// ------------------------------------------------------------ listening
console.log("Listening: words");
await h.goto("/listening");
check((await h.text()).includes("Chọn một bài để nghe"), "listening picker loads");
await h.goto(`/listening/${id}`);
await h.waitText("Nghe từ vựng");
let t = await h.text();
check((t.match(/Bấm để xem đáp án/g) ?? []).length === C.vocab.length, `${C.vocab.length} core word cards with hidden answers`);
await h.click(`Từ mở rộng (${C.extra_vocab.length})`);
await sleep(200);
t = await h.text();
check((t.match(/Bấm để xem đáp án/g) ?? []).length === C.extra_vocab.length, "extra words can be practised too");
await h.click("Hiện tất cả đáp án");
check((await h.text()).includes(C.extra_vocab[0].meaning_vi), "show-all reveals meanings");
await h.click("Nghe lần lượt cả bài");
await h.waitText("Dừng");
await h.click("Dừng");
check(true, "play-all starts and stops");

console.log("Listening: dialogue");
await h.click("Nghe hội thoại");
await sleep(200);
check(!(await h.text()).includes(C.dialogue.lines[0].zh), "dialogue text hidden by default");
await h.click("Chữ Hán");
await sleep(150);
check((await h.text()).includes(C.dialogue.lines[0].zh), "toggle reveals the Chinese text");

console.log("Listening: passage");
const lp = C.listening[0];
await h.click("Nghe đoạn văn");
await h.waitText(lp.title_vi);
check(!(await h.text()).includes(lp.text_zh.slice(0, 8)), "passage text hidden until asked");
await h.click("Xem nội dung đoạn văn");
await h.waitText(lp.text_zh.slice(0, 8));
await answerAll(lp.questions);
let attempts = await pollList(`/api/attempts?lesson_id=${id}&kind=listening`, 1);
check(attempts[0]?.score === 100 && attempts[0].total === lp.questions.length, "listening attempt stored with 100%");

console.log("Listening: generated sets");
await h.click("Nghe và chọn đáp án");
await h.waitText("1/10");
check(true, "hear-and-choose set has 10 questions");
await h.click("Nghe và điền từ", { prefix: true });
await h.waitText("1/8");
check(true, "hear-and-fill set has 8 questions");

// ------------------------------------------------------------ reading
console.log("Reading");
const rp = C.reading[0];
await h.goto(`/reading/${id}`);
await h.waitText(rp.title_zh);
const firstWord = rp.paragraphs[0].tokens.find((tk) => tk.length === 3);
t = await h.text();
check(!t.includes(rp.paragraphs[0].vi), "translation hidden by default");
await h.click("Pinyin");
await sleep(150);
check((await h.text()).includes(firstWord[1]), "pinyin toggle shows pinyin");
await h.click("Bản dịch tiếng Việt");
await sleep(150);
check((await h.text()).includes(rp.paragraphs[0].vi), "translation toggle shows paragraph translations");
await page.evaluate((w) => [...document.querySelectorAll("button")].find((b) => b.textContent.includes(w)).click(), firstWord[0]);
await sleep(300);
check((await h.text()).includes(firstWord[2]), `tapping ${firstWord[0]} shows its meaning`);
await answerAll(rp.questions, "Câu hỏi đọc hiểu");
attempts = await pollList(`/api/attempts?lesson_id=${id}&kind=reading`, 1);
check(attempts[0]?.score === 100 && attempts[0].total === rp.questions.length, "reading attempt stored with 100%");
await h.goto("/reading");
check((await h.text()).includes("100 điểm"), "reading picker shows the best score");

check(h.errors.length === 0, `no page/console errors${h.errors.length ? ": " + h.errors.slice(0, 3).join(" | ") : ""}`);
await h.browser.close();
await resetData(true);
process.exit(finish());
