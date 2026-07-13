import puppeteer from "puppeteer-core";
import fs from "node:fs";

const OUT = "/tmp/cursor/artifacts";
fs.mkdirSync(OUT, { recursive: true });

const execPath = "/usr/bin/google-chrome-stable";

const browser = await puppeteer.launch({
  executablePath: execPath,
  headless: "new",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--enable-webgl",
    "--window-size=1280,720",
  ],
});

function collect(page, tag, sink) {
  page.on("console", (m) => {
    const t = m.type();
    if (t === "error" || t === "warning") sink.push(`[${tag}][console.${t}] ${m.text()}`);
  });
  page.on("pageerror", (e) => sink.push(`[${tag}][pageerror] ${e.message}`));
  page.on("requestfailed", (r) => sink.push(`[${tag}][reqfail] ${r.url()} ${r.failure()?.errorText}`));
}

async function snap(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("saved", name);
}

const results = {};

// ---------- DESKTOP ----------
{
  const logs = [];
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  collect(page, "desktop", logs);

  await page.goto("http://localhost:3000/play", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));

  // header/footer hidden?
  const chrome = await page.evaluate(() => {
    const h = document.querySelector("header.site");
    const f = document.querySelector("footer.site");
    const vis = (el) => !!el && getComputedStyle(el).display !== "none";
    return { headerVisible: vis(h), footerVisible: vis(f), playRoute: document.body.dataset.playRoute };
  });
  results.desktop_chrome_hidden = chrome;

  // Is there a Start button (idle menu)?
  const hasStart = await page.evaluate(() => {
    return [...document.querySelectorAll("button")].some((b) => /start session/i.test(b.textContent || ""));
  });
  results.desktop_has_start = hasStart;
  await snap(page, "verify-desktop-menu");

  // Check audio context did not autoplay: count AudioContexts running (best-effort via patch is impossible post-load).
  // Click Start
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /start session/i.test(x.textContent || ""));
    b?.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Read store state via window? store not exposed. Read HUD text instead.
  const hud1 = await page.evaluate(() => document.body.innerText);
  results.desktop_hud_has_temp = /Temperature/i.test(hud1);
  results.desktop_hud_has_steam = /Steam/i.test(hud1);
  results.desktop_hud_has_time = /Time remaining/i.test(hud1);
  await snap(page, "verify-desktop-playing");

  // Wait ~3s and confirm timer changes (live HUD)
  const t1 = await page.evaluate(() => {
    const m = document.body.innerText.match(/Time remaining\s*([0-9]+:[0-9]{2})/i);
    return m ? m[1] : null;
  });
  await new Promise((r) => setTimeout(r, 3500));
  const t2 = await page.evaluate(() => {
    const m = document.body.innerText.match(/Time remaining\s*([0-9]+:[0-9]{2})/i);
    return m ? m[1] : null;
  });
  results.desktop_timer_live = { t1, t2, changed: t1 !== t2 };

  results.desktop_logs = logs;
  await page.close();
}

// ---------- MOBILE ----------
{
  const logs = [];
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  collect(page, "mobile", logs);
  await page.goto("http://localhost:3000/play", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));

  const hasStart = await page.evaluate(() =>
    [...document.querySelectorAll("button")].some((b) => /start session/i.test(b.textContent || "")),
  );
  results.mobile_has_start = hasStart;
  await snap(page, "verify-mobile-menu");

  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /start session/i.test(x.textContent || ""));
    b?.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Check touch controls present (Move / Drag to look / Pause)
  const touch = await page.evaluate(() => {
    const txt = document.body.innerText;
    return {
      move: /Move/i.test(txt),
      look: /Drag to look/i.test(txt),
      pause: /Pause/i.test(txt),
      temp: /Temperature/i.test(txt),
    };
  });
  results.mobile_touch = touch;
  await snap(page, "verify-mobile-playing");

  results.mobile_logs = logs;
  await page.close();
}

// ---------- HOMEPAGE ----------
{
  const logs = [];
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  collect(page, "home", logs);
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 60000 });
  const home = await page.evaluate(() => {
    const h = document.querySelector("header.site");
    const vis = (el) => !!el && getComputedStyle(el).display !== "none";
    return { headerVisible: vis(h), hasContent: document.body.innerText.length > 200 };
  });
  results.home = home;
  results.home_logs = logs;
  await page.close();
}

console.log("RESULTS:\n" + JSON.stringify(results, null, 2));
await browser.close();
