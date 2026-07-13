import puppeteer from "puppeteer-core";
import fs from "node:fs";
const OUT = "/tmp/cursor/artifacts";
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome-stable",
  headless: "new",
  args: ["--no-sandbox","--disable-setuid-sandbox","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--enable-webgl"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, isMobile: false, hasTouch: false });
const logs = [];
page.on("console", (m) => { if (["error","warning"].includes(m.type())) logs.push(`[console.${m.type()}] ${m.text()}`); });
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

const cdp = await page.target().createCDPSession();
// Force desktop-like media features BEFORE load.
await cdp.send("Emulation.setEmulatedMedia", {
  features: [
    { name: "hover", value: "hover" },
    { name: "any-hover", value: "hover" },
    { name: "pointer", value: "fine" },
    { name: "any-pointer", value: "fine" },
  ],
});
await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: false });

await page.goto("http://localhost:3000/play", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 2000));

const probe = await page.evaluate(() => ({
  maxTouchPoints: navigator.maxTouchPoints,
  coarse: window.matchMedia("(pointer: coarse)").matches,
  hoverNone: window.matchMedia("(hover: none)").matches,
  menuText: document.querySelector("p")?.textContent || null,
}));
console.log("probe:", JSON.stringify(probe));

// Start
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => /start session/i.test(x.textContent || ""));
  b?.click();
});
await new Promise((r) => setTimeout(r, 1200));

const ui = await page.evaluate(() => {
  const txt = document.body.innerText;
  return {
    hasJoystick: /Drag to look|^Move$/im.test(txt),
    hasResumeOverlay: /Click to resume control/i.test(txt),
    hasWasdHint: /WASD/i.test(txt),
    pointerLockEl: !!document.pointerLockElement,
    hudTemp: /Temperature/i.test(txt),
  };
});
console.log("desktop ui after start:", JSON.stringify(ui));
await page.screenshot({ path: `${OUT}/verify-desktop-true-playing.png` });

// Press E without focus (should do nothing / no crash); then try to lock via click.
await page.mouse.click(640, 360);
await new Promise((r) => setTimeout(r, 400));
const afterClick = await page.evaluate(() => ({ pointerLockEl: !!document.pointerLockElement, txt: /Click to resume control/i.test(document.body.innerText) }));
console.log("after canvas click:", JSON.stringify(afterClick));

console.log("LOGS:", JSON.stringify(logs));
await browser.close();
