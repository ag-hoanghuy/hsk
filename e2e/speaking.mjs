// Speaking page with a fake microphone that plays a WAV file: a correct reading scores high, a different sentence low.
// Needs the speech model to be loaded (first start downloads it).
import path from "node:path";

import { api, lessonFile, openBrowser, ROOT, resetData, sleep, suite } from "./lib.mjs";

await resetData();
const { check, finish } = suite("speaking");
const C = lessonFile(3, 1).content;
const id = (await api("/api/lessons?level=3")).find((l) => l.number === 1).id;
const line = C.dialogue.lines[0].zh; // the fixtures record this sentence (another voice) and an unrelated one

async function scenario(name, wav, seconds, verify) {
  console.log(`== ${name}`);
  const h = await openBrowser([
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    `--use-file-for-fake-audio-capture=${path.join(ROOT, "e2e", "fixtures", wav).replace(/\\/g, "/")}%noloop`,
  ]);
  try {
    await h.goto(`/speaking/${id}`);
    await h.waitText("đã luyện");
    const groups = await h.text();
    check(groups.toLowerCase().includes("câu luyện nói") && C.speaking.every((s) => groups.includes(s.zh)), "authored speaking drills are listed");
    await h.click(line, { prefix: true }); // the button may also show a best score
    await h.waitText(C.dialogue.lines[0].vi);
    await h.page.waitForSelector('button[aria-label="Bắt đầu ghi âm"]:not([disabled])', { timeout: 240000 });
    await h.page.click('button[aria-label="Bắt đầu ghi âm"]');
    await h.waitText("Đang nghe");
    await sleep(seconds * 1000);
    await h.page.click('button[aria-label="Dừng ghi âm"]');
    await h.page.waitForFunction(
      () => document.body.innerText.includes("Từng âm tiết") || document.body.innerText.includes("Thử ghi âm lại"),
      { timeout: 90000 },
    );
    await sleep(300);
    await h.shot(`speaking-${name}`);
    const t = await h.text();
    const m = t.match(/(\d+)\s*\/ 100/);
    await verify(m ? Number(m[1]) : null, t);
  } catch (e) {
    check(false, `${name}: ${e.message}`);
  }
  check(h.errors.length === 0, `${name}: no page/console errors${h.errors.length ? ": " + h.errors.join(" | ") : ""}`);
  await h.browser.close();
}

await scenario("same-sentence", "l1-dialogue-1.wav", 5.8, async (score, t) => {
  check(score !== null && score >= 85, `correct reading scores high (${score})`);
  check(t.includes("Máy nghe được bạn nói"), "recognised text is shown");
  const best = await api(`/api/speaking/best?lesson_id=${id}`);
  check(best.length === 1 && best[0].best === score, "best score stored");
});
await scenario("other-sentence", "other-sentence.wav", 5.4, async (score, t) => {
  check(score !== null && score < 50, `a different sentence scores low (${score})`);
  check(/Chưa nghe thấy|Chưa đúng âm/.test(t), "wrong or missing syllables are reported");
});

await resetData(true);
process.exit(finish());
