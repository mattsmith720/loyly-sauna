<!-- orchestrate handoff
task: audio-and-vfx
branch: orch/loyly-realism/audio-and-vfx
agentId: bc-134e314a-74f4-4564-a276-56b549f45c92
runId: run-498e86f9-f9fe-4459-9214-4599eece3b14
resultStatus: finished
finishedAt: 2026-07-13T09:11:20.547Z
-->

## Status
success

## Branch
`orch/loyly-realism/audio-and-vfx`

## What I did
- Implemented P5 audio and VFX on top of `orch/loyly-realism/forest-exterior` without touching `src/components/game/sauna-game-state.ts`.
- Added `src/components/game/Audio.tsx` and mounted it in `SaunaGame.tsx` (game root).
  - Procedural Web Audio (no large/binary audio assets):
    - fire crackle loop (active only when `saunaType === "woodfired"` and `fireLit`, gain tied to `fireFuel`)
    - löyly hiss/splash one-shot on `steamBurstId` increment
    - forest ambience loop when `playerMode === "outside"` in woodfired mode
    - soft round-end chime once on `phase` transition to `"ended"`
  - Autoplay-safe unlock:
    - audio context is created only after gesture (`audio.unlock()` on StartScreen mode click)
    - fallback gesture unlock listeners for first click/tap/key interaction
- Extended `useSaunaGame.tsx` context API with audio controls consumed by HUD and Audio:
  - `audio: { muted, volume, unlocked, unlock, toggleMute, setMuted, setVolume }`
  - low default volume (`0.24`)
  - persisted mute/volume in localStorage
  - default mute follows `prefers-reduced-motion` when no stored preference exists
- Updated `Hud.tsx`:
  - added mute toggle + volume-cycle control (`Low/Medium/High`)
  - added unlock hint text when audio not yet unlocked
  - refined heat/humidity screen veil into a subtle warm+mist+edge vignette that intensifies with `temperature` + `humidity`
- Updated `WoodStove.tsx` VFX:
  - reduced-motion-aware, fuel-tied flicker for flame scale/position, emissive intensity, and stove point light intensity
- Updated `Steam.tsx` VFX:
  - steam burst density/lifetime/spread now scale with `humidity`
  - reduced-motion lowers active particles/drift/opacity and draw range
- Updated `public/game/ASSETS.md` with an audio note and added `public/game/audio/.gitkeep`.
  - no downloaded audio files were added; all P5 audio is synthesized at runtime
- Captured UI artifact for the interactive changes:
  - `/opt/cursor/artifacts/page@2f7d3001d99180c6a8761757c3ea1981.webm`

## Measurements
- `npm run build: pass == pass`
- `npx tsc --noEmit: pass == pass`
- `npm run lint: pass == pass`
- `npm test: 73 passing == 73 passing`
- `downloaded audio binaries: 0 == 0`

## Verification
live-ui-verified

## Notes, concerns, deviations, findings, thoughts, feedback
- No reducer changes were made; `src/components/game/sauna-game-state.ts` is unchanged.
- I used synthesized Web Audio instead of CC0 downloads to keep repo size small and avoid asset licensing/size overhead while still satisfying all P5 audio behaviors.
- The branch was pushed exactly as requested: `orch/loyly-realism/audio-and-vfx`.
- I did not open/modify any PR, per orchestration instructions.

## Suggested follow-ups
- Manual headphone mix pass on real devices (desktop + mobile) to tune perceived loudness of crackle/forest/hiss/chime levels.
- Optional future enhancement: expose a true volume slider in HUD settings (instead of cycling presets) if finer control is desired.
- Add a small interaction smoke test that checks audio unlock + mute state persistence behavior at the UI level.