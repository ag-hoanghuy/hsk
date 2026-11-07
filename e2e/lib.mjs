// Shared helpers for the browser tests (puppeteer-core driving Microsoft Edge).
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const BASE = process.env.E2E_BASE ?? "http://localhost:5173";
export const API = process.env.E2E_API ?? "http://localhost:8000";
export const EDGE = process.env.EDGE_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const lessonFile = (level, number) =>
  JSON.parse(fs.readFileSync(path.join(ROOT, "content", `hsk${level}`, `lesson-${String(number).padStart(2, "0")}.json`), "utf8"));

export const api = async (p, init) => {
  const res = await fetch(API + p, init);
  return res.json();
};

/** The tests create attempts and progress. Refuse to touch a database with real study data unless E2E_RESET=1.
 *  `afterRun` clears what the test itself just created. */
export async function resetData(afterRun = false) {
  const o = await api("/api/overview");
  const busy = o.active_days > 0 || o.totals.speaking_attempts > 0;
  if (busy && !afterRun && process.env.E2E_RESET !== "1") {
    console.error("The database already has study data. Run the tests only on a development database,");
    console.error("or set E2E_RESET=1 to DELETE all attempts and progress first (make a backup with scripts/backup.ps1).");
    process.exit(2);
  }
  execSync(
    'docker compose exec -T db psql -U hsk -d hsk -q -c "delete from attempts; delete from section_progress; delete from speaking_attempts; delete from mock_attempts;"',
    { cwd: ROOT, stdio: "ignore" },
  );
}

export function suite(name) {
  const results = [];
  const check = (cond, msg) => {
    results.push([!!cond, msg]);
    console.log(cond ? "  ok  " : " FAIL ", msg);
  };
  const finish = () => {
    const failed = results.filter(([ok]) => !ok);
    console.log(failed.length ? `\n${name}: ${failed.length} of ${results.length} CHECK(S) FAILED` : `\n${name}: ALL ${results.length} CHECKS PASSED`);
    return failed.length ? 1 : 0;
  };
  return { check, finish };
}

export async function openBrowser(extraArgs = [], viewport = { width: 1100, height: 1300 }) {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "new",
    args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required", ...extraArgs],
    defaultViewport: viewport,
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text());
  });
  const shotsDir = path.join(ROOT, "e2e", "shots");
  fs.mkdirSync(shotsDir, { recursive: true });

  const h = {
    browser,
    page,
    errors,
    shot: (name) => page.screenshot({ path: path.join(shotsDir, `${name}.png`), fullPage: true }),
    text: () => page.evaluate(() => document.body.innerText),
    /** Case-insensitive (CSS uppercase changes innerText). */
    waitText: (t, timeout = 10000) =>
      page.waitForFunction((t) => document.body.innerText.toLowerCase().includes(t.toLowerCase()), { timeout }, t),
    goto: async (p) => {
      await page.goto(BASE + p, { waitUntil: "load", timeout: 60000 });
      await sleep(400);
    },
    /** Click the first enabled button whose text matches (exact by default). */
    click: async (text, { prefix = false, contains = false, after = null } = {}) => {
      const ok = await page.evaluate(
        (text, prefix, contains, after) => {
          const marker = after ? [...document.querySelectorAll("h1,h2,h3")].find((x) => x.textContent.includes(after)) : null;
          const b = [...document.querySelectorAll("button"), ...document.querySelectorAll("a")].find((b) => {
            const t = b.textContent.trim();
            if (b.disabled) return false;
            if (marker && !(marker.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)) return false;
            return contains ? t.includes(text) : prefix ? t.startsWith(text) : t === text;
          });
          if (b) b.click();
          return !!b;
        },
        text,
        prefix,
        contains,
        after,
      );
      if (!ok) throw new Error(`button not found: ${text}`);
      await sleep(80);
    },
    tab: async (label) => {
      await h.click(label, { prefix: true });
      await sleep(250);
    },
  };
  return h;
}

export async function pollList(p, n, ms = 15000) {
  const end = Date.now() + ms;
  let list = [];
  while (Date.now() < end) {
    list = await api(p);
    if (list.length >= n) break;
    await sleep(300);
  }
  return list;
}

/** Answer one lesson-test question through the UI (TestQuestionView). */
export async function answerTestQuestion(h, q, { wrong = false, blank = false } = {}) {
  switch (q.type) {
    case "choice":
    case "listen_choice":
      await h.click(wrong ? q.options[(q.answer + 1) % q.options.length] : q.options[q.answer]);
      break;
    case "match": {
      const pairs = wrong ? q.pairs.map((p, i) => [p.zh, q.pairs[(i + 1) % q.pairs.length].vi]) : q.pairs.map((p) => [p.zh, p.vi]);
      for (const [zh, vi] of pairs) {
        await h.click(zh);
        await h.click(vi);
      }
      break;
    }
    case "order": {
      let rest = q.answers[0];
      const used = new Set();
      const picked = [];
      while (rest.length) {
        const i = q.words.findIndex((w, k) => !used.has(k) && rest.startsWith(w));
        if (i < 0) throw new Error("cannot split " + q.answers[0]);
        used.add(i);
        picked.push(q.words[i]);
        rest = rest.slice(q.words[i].length);
      }
      for (const w of wrong ? picked.reverse() : picked) await h.click(w);
      break;
    }
    case "fill":
    case "dictation":
    case "translate_vi_zh":
      if (!blank) await h.page.type("input", wrong ? "错" : q.answers[0]);
      break;
    case "translate_zh_vi":
      if (!blank) await h.page.type("textarea", wrong ? "Hôm nay trời đẹp quá" : q.answers_vi[0]);
      break;
  }
}
