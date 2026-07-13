<!-- orchestrate handoff
task: verify-loyly
branch: `orch/loyly-realism/systems-and-qa` (no commits made — verifier left the deliverable branch untouched; the 844 KB `/play` start-screen screenshot is at `/tmp/play-start.png`, not committed to avoid adding a large binary to the deliverable PR)
agentId: bc-663aefec-07ff-4ea7-bb4c-90d49d2367d4
runId: run-d3131587-32ee-436d-8627-62778ec06044
resultStatus: finished
finishedAt: 2026-07-13T09:39:33.449Z
-->

All checks complete. The working tree is clean; I made no source modifications. Here is my verdict.

## Verification
unit-test-verified

## Target
`systems-and-qa` on branch `orch/loyly-realism/systems-and-qa`

## Branch
`orch/loyly-realism/systems-and-qa` (no commits made — verifier left the deliverable branch untouched; the 844 KB `/play` start-screen screenshot is at `/tmp/play-start.png`, not committed to avoid adding a large binary to the deliverable PR)

## Execution
- `npm install` → success (438 packages, exit 0).
- `npm run build` (Next 15.5.20 production) → success. `/play` route **340 kB**, First Load JS **446 kB** (matches handoff). No build errors.
- `npx tsc --noEmit` → exit 0, no type errors.
- `npm run lint` (`next lint`) → "✔ No ESLint warnings or errors", exit 0.
- `npm test` (vitest) → **78 passed / 78 (11 files)**, exit 0. Includes new reducer tests: peak-temp tracking (rises + never lowers while cooling), löyly counting (success vs blocked), start-reset, `isFireLow`.
- Started prod server (`PORT=3100 npm run start`); `curl` → `/` = 200, `/play` = 200.
- `/play` HTML has `game-shell` + "Löyly Ritual" and **no** `<header>`/`<footer>`; `/` has both header+footer → confirms route/chrome separation.
- Headless Chrome screenshot of `/play` → start screen renders cleanly: "Löyly Ritual", Electric ("Indoor cedar room") + Woodfired ("Cabin in the trees") cards, control hints "Desktop: WASD · E · mouse look / Mobile: stick · drag to look · Use".
- Code inspection of every changed file (reducer, Hud, Player, Audio, Steam, Forest, SaunaCanvas, SaunaRoom, WoodStove, useSaunaGame, tests).
- `git diff --stat` vs `merge-base` with `origin/main` → 18 files, +1669/−389; `public/` diff adds **only text** (ASSETS.md + audio/.gitkeep) → **0 new binaries** on this branch.

## Findings
Per acceptance criterion:
- [x] Fire-tending prompt in HUD when woodfired fuel low: `isFireLow` (woodfired && fireLit && fuel<25); `Hud.tsx` renders a prominent amber "Fire is low — get wood and feed the firebox" banner (pulse gated by `reducedMotion`) + amber top-bar fire readout. **met** (code + unit test for `isFireLow`).
- [x] Sit/stand eases camera with bench snap: `Player.tsx` damps position to `SEAT_ANCHOR` (1.12, 0.05) + lower eye height (1.05), one-shot orientation ease to bench-facing yaw that yields to look input; standing lerps back. **met** (code; not driven live).
- [x] Light-off mood cozy with fire glow dominating: `SaunaCanvas` `emberFill = heat*0.2` warm ambient when lights off, warm ambient color; `WoodStove`/`Heater` point lights apply `darkBoost` (1.35–1.4x) when off. **met** (code; not visually captured live).
- [x] Thermometer prop reads live temperature: `WallThermometer` needle angle derived from `state.temperature`, readout `formatTemp(state.temperature)`. **met** (code).
- [x] Round-end summary shows peak temp + löyly count; reducer ADD-only, keeps electric/woodfired split: reducer adds `peakTemperature`/`loylyCount`/`FIRE_LOW_THRESHOLD`/`isFireLow` only; peak tracked in `tick` + on throws, count only on successful throws, both reset on `start`; HUD "ended" screen shows Peak heat + Löyly thrown. **met** (unit-test-verified).
- [x] Desktop + mobile controls work, reduced-motion reduces steam/fireflies/head-bob, no regressions: pointer lock + WASD + E in `Player`; `MobileControls` stick + drag-look + HUD "Use". reduced-motion: steam density 0.45x + lower opacity/drift, fireflies disabled (`active={!reducedMotion && ...}`), head-bob skipped. **met** (code; controls not driven live).
- [x] Tests cover new reducer tracking; TODO P2–P7 checkboxes updated: 5 new tests present and passing; `TODO.md` P2–P7 all `[x]`. **met**.
- [x] build/lint/tsc/test all pass: **met** (evidence above).
- [x] Single draft PR to main with /play build-size note: upstream handoff cites draft PR #4 (base `main`) with the 340/446 kB note; I did not open/modify it (planner owns integration). **met per handoff; not re-opened by verifier**.

GDD P2–P7 goals (code-confirmed):
- [x] Woodfired realism (P2): window (glass pane + frame + sill in `WoodfiredBackWall`), plank PBR via `WoodPlankMaterial`, slatted benches, iron stove + firebox interact anchor, `Woodpile`, chimney stack + ceiling collar, animated `DoorAssembly` (damped hinge). met (code).
- [x] Electric polish (P3): procedural kiuas (`Heater`) with clean light materials, cool blue fills vs woodfired warm, cool porch (non-forest) when outside, heater HUD on right aligning with 3D heater on right. met (code).
- [x] Forest (P4): local dusk HDRI `autumn_forest_02_1k.hdr`, instanced trees, procedural ground + clearing, porch/posts/campfire ring, expanded elliptical bounds + tree/cabin collision (`Player`/`forest-layout`), fog tuned per interior/exterior, reduced-motion fireflies; electric porch unchanged. met (code).
- [x] Audio/VFX (P5): Web Audio synthesized fire crackle tied to `fireLit`/fuel, löyly hiss on `steamBurstId`, forest ambience when woodfired+outside, round-end chime; autoplay-safe (AudioContext only after first-gesture `unlock`, masterGain starts 0, default volume 0.24 capped 0.6, mute defaults to reduced-motion pref); mute toggle in HUD; flame flicker; humidity-scaled steam; HUD heat/humidity veil. met (code).

Other findings (severity-ordered):
- (med) Electric mode image-lighting uses drei `Environment preset="apartment"`, which fetches a **remote HDRI** at runtime — in an offline/air-gapped or headless env the electric scene suspends and won't render (upstream flagged this). Works with normal network at build/deploy; not a code defect but an offline-resilience gap.
- (low) Live interactive 3D flow (light fire → throw löyly → step outside → sit-camera ease → thermometer tracking → mobile touch) was **not** driven live: headless WebGL interaction (pointer lock, precise aiming) isn't reliably scriptable here and no Puppeteer/Playwright is installed. These are verified by unit tests (systems logic) + code inspection + build, not by live gameplay.
- (low) Default audio volume 0.24 (labeled "Medium" in HUD) is low-ish and capped at 0.6; satisfies "default to low volume" reasonably though not the lowest band.
- (low) No new binaries added by this branch; largest pre-existing assets are `autumn_forest_02_1k.hdr` (1.9 MB) and `Lantern_01.bin` (865 KB), all CC0-logged in `ASSETS.md`. Total `public/game` = 5.3 MB.

## Notes & suggestions
- Every quality gate is genuinely green (build, tsc, lint, 78/78 tests) and reproduced live here. Systems-depth reducer changes are truly ADD-only and unit-test-covered.
- Asset licensing is clean: `ASSETS.md` logs all four Poly Haven CC0 assets; audio is runtime-synthesized (no committed audio files). No large/unlicensed binaries introduced.
- The branch diff vs `main` (18 files, +1669) confirms it is the **complete** game (interior realism + forest + audio/VFX + systems), i.e. the full final deliverable, not just the P6/P7 slice.
- If live UI proof is required before ship, run desktop Chrome at `/play` on a networked machine to confirm: (1) electric HDRI actually loads, (2) fire-lit "fire dominates" mood with lights off, (3) sit-camera ease + bench snap, (4) thermometer needle tracking, (5) mobile touch flow. Consider bundling a small local CC0 apartment HDRI (upstream suggestion) to make electric mode render offline and improve verifiability.