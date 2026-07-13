import puppeteer from "puppeteer-core";
import fs from "node:fs";

const OUT = "/tmp/cursor/artifacts";
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome-stable",
  headless: "new",
  args: [
    "--no-sandbox", "--disable-setuid-sandbox",
    "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist", "--enable-webgl",
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const logs = [];
page.on("console", (m) => { if (["error","warning"].includes(m.type())) logs.push(`[console.${m.type()}] ${m.text()}`); });
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
const cdp = await page.target().createCDPSession();

const log = (...a) => { console.log(...a); };

await page.goto("http://localhost:3000/play", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 2000));
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => /start session/i.test(x.textContent || ""));
  b?.click();
});
await new Promise((r) => setTimeout(r, 1000));

const readState = () => page.evaluate(() => {
  const txt = document.body.innerText;
  const temp = txt.match(/Temperature\s*([0-9.]+)\s*C/i);
  const steam = txt.match(/Steam\s*([0-9]+)%/i);
  const btn = [...document.querySelectorAll("button")].find((b) => /pour loyly|splash stones/i.test(b.textContent || ""));
  return {
    temp: temp ? parseFloat(temp[1]) : null,
    steam: steam ? parseInt(steam[1], 10) : null,
    hasInteract: !!btn,
    interactText: btn ? btn.textContent.trim() : null,
  };
});

const bbox = (needle) => page.evaluate((n) => {
  let el = null;
  if (n === "look") {
    const label = [...document.querySelectorAll("span")].find((s) => /drag to look/i.test(s.textContent || ""));
    el = label?.parentElement || null;
  } else {
    const label = [...document.querySelectorAll("span")].find((s) => /^Move$/i.test((s.textContent || "").trim()));
    el = label?.parentElement?.querySelector("div") || null;
  }
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { cx: r.x + r.width / 2, cy: r.y + r.height / 2, w: r.width, h: r.height };
}, needle);

log("after start:", JSON.stringify(await readState()));

// walk forward ~1.0s
const move = await bbox("move");
await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: move.cx, y: move.cy }] });
await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: move.cx, y: move.cy - move.h * 0.45 }] });
await new Promise((r) => setTimeout(r, 1000));
await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await new Promise((r) => setTimeout(r, 200));
log("after walk:", JSON.stringify(await readState()));

const look = await bbox("look");
log("look bbox:", JSON.stringify(look));

// One continuous drag that arcs: horizontal from -X..+X while descending. Poll inline.
async function arc(dir) {
  // dir: +1 sweep right, -1 sweep left. descend downward progressively.
  const sx = look.cx, sy = look.cy - look.h * 0.35;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: sx, y: sy }] });
  const N = 90;
  for (let i = 1; i <= N; i++) {
    const frac = i / N;
    const px = sx + dir * (look.w * 0.42) * Math.sin(frac * Math.PI); // arc out and back
    const py = sy + (look.h * 0.7) * frac; // descend
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: px, y: py }] });
    if (i % 5 === 0) {
      const st = await readState();
      if (st.hasInteract) {
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        return st;
      }
    }
    await new Promise((r) => setTimeout(r, 8));
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  return await readState();
}

let focused = null;
for (const dir of [1, -1, 1]) {
  const st = await arc(dir);
  log("arc", dir, "->", JSON.stringify(st));
  if (st.hasInteract) { focused = st; break; }
}

let pour = null;
if (focused) {
  const pre = await readState();
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /pour loyly|splash stones/i.test(x.textContent || ""));
    b?.click();
  });
  await new Promise((r) => setTimeout(r, 300));
  const post = await readState();
  await page.screenshot({ path: `${OUT}/verify-mobile-pour.png` });
  pour = { pre, post, tempDelta: +(((post.temp ?? 0) - (pre.temp ?? 0)).toFixed(2)), steamDelta: (post.steam ?? 0) - (pre.steam ?? 0) };
}
log("POUR:", JSON.stringify(pour));
log("LOGS:", JSON.stringify(logs));
await browser.close();
