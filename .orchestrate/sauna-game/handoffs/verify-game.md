<!-- orchestrate handoff
task: verify-game
branch: `orch/sauna-game/cozy-polish` (committed nothing — this checked-out branch is the deliverable itself, backing open draft PR #2; I intentionally left verifier screenshots/scripts untracked to avoid polluting the deliverable with ~2.7 MB of PNGs and undercutting the "no large binaries" criterion)
agentId: bc-c90696f7-cf74-4156-aa1b-0e51e95c79b4
runId: run-6a7ff0c5-1dd1-4dfb-9ae0-fd2ba29c8789
resultStatus: finished
finishedAt: 2026-07-13T08:42:52.577Z
-->

No target source files were modified. Here is my verdict.

## Verification
live-ui-verified

## Target
`cozy-polish` on branch `orch/sauna-game/cozy-polish`

## Branch
`orch/sauna-game/cozy-polish` (committed nothing — this checked-out branch is the deliverable itself, backing open draft PR #2; I intentionally left verifier screenshots/scripts untracked to avoid polluting the deliverable with ~2.7 MB of PNGs and undercutting the "no large binaries" criterion)

## Execution
- `npm install` → success (445 packages, exit 0)
- `npm run build` (`next build`) → success; `/play` route = 252 kB / 354 kB First Load JS (matches handoff)
- `npx tsc --noEmit` → 0 errors (exit 0)
- `npm run lint` (`next lint`) → "✔ No ESLint warnings or errors" (exit 0)
- `git show --stat c756169` → cozy-polish commit added only `.ts/.tsx/.css` (no png/jpg/mp3/wav/glb etc.); `grep` for binary extensions in commit → none
- Tracked binaries in repo are pre-existing marketing images (`public/images/*`, `og-image.jpg`); none added by this task
- Live browser (google-chrome-stable + puppeteer-core, swiftshader WebGL) against `npm run dev`:
  - `/play` → 200; `<canvas>` renders; **0 console/page errors**; `header.site` & `footer.site` computed `display:none`; `body[data-play-route]="true"`; cozy start panel with settings (session length, mouse sensitivity, ambience volume 35%, mute checkbox) + "Start session"
  - `/` (homepage) → 200; renders normally with header/footer `display:block` (marketing site intact)
  - Clicked "Start session" → HUD shows Temperature gauge w/ green comfort band, Time Remaining counting down live (1:00→0:57→0:50→0:40), Steam gauge, sound toggle (🔊), Pause; crosshair (+) centered; 0 errors
  - Mouse-look rotated the camera and revealed the **cozy exterior window** (snowy dusk scene, falling snow, warm horizon glow, timber frame/muntins) — screenshot `artifacts/play-look-left.png`
- Could NOT mouse-drive the löyly pour (pointer-lock movement deltas + precise look-alignment to the interactable dot-threshold are unreliable in headless; prompt never triggered) → steam-burst + sizzle chain confirmed by code only
- Draft PR: `gh pr list` → PR #2 "Cozy sauna game…" base `main`, head `orch/sauna-game/cozy-polish`, isDraft=true (open)

## Findings
Per acceptance criterion:
- [x] Lighting/materials read as warm cozy sauna (not flat-lit): **met** — live screenshots (`play-after-start.png`) show glowing kiuas, warm timber planks, strong light falloff/dark corners; code has flickering amber kiuas point light, warm ambient/hemisphere, spot, warm fog, soft shadows; procedural timber/stone materials with heat-driven emissive stones.
- [x] Visible steam particles on pours + cozy exterior window: **met (window, live) / met-by-code (steam)** — exterior window visually confirmed live (snowy dusk). Steam is a GPU Points system that bursts on `pourCount` change + ambient wisps; not mouse-driven live but code path is sound.
- [x] Ambient audio + loyly sizzle via Web Audio (no large binaries), mute/volume toggle, autoplay-safe: **met (code + partial live)** — `audio.ts` is fully generated Web Audio (brown-noise stove bed, crackles, creaks, band-passed sizzle), no binaries; defaults to 0.35, `start()` only called from user-gesture handlers; mute toggle + volume sliders present and rendered live in start/settings/HUD. Actual audio playback not audible in headless.
- [x] Start/pause/end HUD cohesive/readable + crosshair + prompts: **met (start+HUD live) / code-verified (pause/complete/prompts)** — start screen + in-game HUD + crosshair confirmed live and cohesively themed; pause/complete screens and interaction prompts verified in code; prompts not triggered live (see gap below).
- [x] `next build`, `next lint`, `npx tsc --noEmit` all pass: **met** — all three ran green (evidence above).
- [x] Draft PR to main containing the complete game: **met** — PR #2 open as draft against `main`; branch contains foundation + gameplay + polish commits.

Other findings (severity-ordered):
- (med) Live coverage gap: the pour→steam-burst→sizzle interaction and the interaction prompts could not be mouse-driven in headless (pointer-lock look-alignment). These remain code-verified only. A Playwright test driving pointer-lock would close this (upstream already suggested it).
- (low) `body[data-play-route]` is set in a client `useEffect`, so header/footer are hidden after mount (not removed from DOM). A full-screen fixed overlay (`z-index:350`) covers them, and live render showed them `display:none` with no flash observed — no functional issue.
- (low) Time is compressed: `GAME_MINUTE_TO_REAL_SECONDS = 6`, so the 10-"game-min" default = a 60s ("1:00") real session. Labeled "game min" in UI; intentional, not a bug.
- (low) `next lint` prints a deprecation notice (removed in Next 16) but still passes.

## Notes & suggestions
- Verifier artifacts (screenshots `artifacts/play-start.png`, `play-after-start.png`, `play-look-left.png`, `home.png`; scripts `verify-tmp.mjs`, `verify-interact.mjs`, `verify-pour.mjs`) exist locally but were left **untracked/uncommitted** to avoid modifying the deliverable branch/PR. `puppeteer-core` was installed with `--no-save` (not in `package.json`).
- Handoff claim of `live-ui-verified` is accurate for scene/window/HUD/timer/no-errors and build/lint/type; the one honest caveat is that the pour/steam/sizzle dynamic is code-verified, not mouse-driven — matching the upstream's own note.
- No target source files were modified during verification (`git diff --stat` empty).