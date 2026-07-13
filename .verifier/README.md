# Verifier artifacts — cozy-polish (/play sauna game)

These are read-only verification helpers added by the verifier agent. They do
NOT touch the game under `src/`. They drive the already-built app via a headless
system Chrome (`/usr/bin/google-chrome-stable`) using `puppeteer-core`, which was
installed with `npm install --no-save puppeteer-core` so `package.json` and the
lockfile stay untouched.

## How to reproduce

```bash
npm install
npm run build
npx tsc --noEmit          # 0 errors
npm run lint              # no warnings/errors
npm test                  # full vitest suite

# live UI (separate shell): npm run start  (serves :3000)
node .verifier/ui-smoke.mjs             # desktop+mobile smoke, HUD, homepage
node .verifier/touch-pour-attempt.mjs   # blind touch-aim pour attempt
node .verifier/desktop-media-probe.mjs  # shows headless forces (hover:none)=true
```

Screenshots are written to `/tmp/cursor/artifacts/`.

## Results summary

- `npm install`, `next build`, `npx tsc --noEmit`, `next lint`, `vitest` (66 tests): all PASS.
- Live (headless Chrome): scene renders with warm lighting, wood grain, glowing
  stones; HUD (Temperature/Steam/Time) live-updates; crosshair + touch controls
  present; start menu shows audio default 35% + "Sound on"; `/play` hides the
  marketing header/footer; `/` renders the marketing chrome. No console/page errors.
- Ritual loop + pour mechanic (start→pour→decay→pause→resume→complete→restart,
  +14C/+40% boost, cooldown gating, stones 0.8x) verified via a store-level test.
- Caveat: headless Chrome reports `(hover: none) === true` even with emulated
  fine-pointer media, so this app's touch-detection forces TOUCH mode in headless.
  The true desktop pointer-lock + WASD path and the live in-cone pour could not be
  exercised in-browser here; they are covered by code inspection + the unit test.
