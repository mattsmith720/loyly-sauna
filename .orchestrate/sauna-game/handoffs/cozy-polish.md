<!-- orchestrate handoff
task: cozy-polish
branch: orch/sauna-game/cozy-polish
agentId: bc-fd718b5e-22c1-4052-b3aa-5f8fbcf86431
runId: run-b397e25b-bc7f-495e-9957-0f6bb8764882
resultStatus: finished
finishedAt: 2026-07-13T08:33:04.153Z
-->

All work is complete. Here is my handoff.

## Status
success

## Branch
`orch/sauna-game/cozy-polish`

## What I did
- `src/lib/game/textures.ts` (new): procedural canvas-generated warm timber (plank grain + knots), stone, soft steam sprite, and a painted snowy-dusk window scene. No binary assets.
- `src/lib/game/audio.ts` (new): fully generated Web Audio soundscape — filtered brown-noise stove bed, scheduled crackles, occasional wood creaks, and a decaying band-passed sizzle on pours. Singleton engine with master gain (mute + volume), autoplay-safe `start()` gated on user gesture, defaults to 35%.
- `src/lib/game/types.ts` / `constants.ts` / `store.ts`: added `audioMuted`/`audioVolume` settings with `setAudioMuted`/`toggleAudioMuted`/`setAudioVolume` actions and defaults (low volume, unmuted).
- `src/components/game/SteamParticles.tsx` (new): GPU `Points` system (custom shader) — burst on each pour + ambient wisps scaled by steam level, keyed off store `pourCount`.
- `src/components/game/SaunaScene.tsx`: warm low-key lighting — flickering kiuas point light that breathes with steam, warm ambient/hemisphere fill, overhead spot/point, cool window fill for contrast, warm interior fog, soft shadows; mounts steam.
- `src/components/game/SaunaRoom.tsx`: applied timber/stone/metal materials, glowing hot stones + firebox that intensify with heat, brushed-metal bucket + wooden ladle (water shows when filled), two-tier bench, and the cozy window with frame/muntins.
- `src/components/game/SaunaGame.tsx` + `SaunaGame.module.css`: cohesive warm theme across start/pause/complete screens and gauges, vignette, scaling crosshair that highlights on available action, readable prompts, in-HUD mute toggle + settings volume/mute, sizzle wiring, audio lifecycle.

## Measurements
- `next build`: passing → passing
- `next lint`: no warnings/errors → no warnings/errors
- `npx tsc --noEmit`: 0 errors → 0 errors
- `/play` First Load JS: 354 kB (procedural assets only; no binaries committed)

## Verification
live-ui-verified

Rendered `/play` live in headless Chrome (no console/page errors): captured the cozy start screen and in-game scene (`artifacts/cozy-start.png`, `artifacts/cozy-playing.png`, untracked) showing warm timber walls, glowing kiuas, HUD gauges with comfort band, mute/pause controls, and crosshair. Build/lint/type-check all pass. Pour→steam-burst and sizzle are wired to store `pourCount`; those interaction dynamics were exercised via the store logic path (pointer-lock interaction can't be driven in headless), so the pour/steam/sizzle chain itself is code-verified rather than mouse-driven.

## Notes, concerns, deviations, findings, thoughts, feedback
- Branch discipline: the orchestrator task explicitly required `orch/sauna-game/cozy-polish`, which conflicts with the generic `cursor/<name>-6431` convention; I followed the explicit task instruction and used `skip_branch_prefix_check` when opening the draft PR to `main` (#2, https://github.com/mattsmith720/loyly-sauna/pull/2).
- Did not commit `artifacts/` (untracked) or install anything into `package.json` (puppeteer-core used `--no-save`); `.orchestrate/` left untouched.
- Textures/audio/steam all render on the client only (guarded for SSR); R3F Canvas children never run server-side.

## Suggested follow-ups
- Add Playwright coverage that mouse-drives pointer-lock to assert the pour→steam-burst→sizzle chain and comfort-band scoring end-to-end.
- Consider persisting audio/settings to `localStorage` so volume/mute/session preferences survive reloads.
- Optional perf: cap `dpr` further or gate steam particle count on device to keep the 354 kB `/play` route smooth on low-end GPUs.