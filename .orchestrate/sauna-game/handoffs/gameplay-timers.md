<!-- orchestrate handoff
task: gameplay-timers
branch: orch/sauna-game/gameplay-timers
agentId: bc-3485d35d-5e79-4eb7-b439-b756b3c78c1e
runId: run-e9617ac2-1595-40d4-8f59-55a90bce7f7d
resultStatus: finished
finishedAt: 2026-07-13T08:20:12.283Z
-->

## Status
success

## Branch
`orch/sauna-game/gameplay-timers`

## What I did
- Implemented a full typed gameplay/state foundation extension in `src/lib/game/**`:
  - `types.ts`: expanded state model with `start|playing|paused|complete`, settings, sauna simulation state, and interaction state.
  - `constants.ts`: added session-length options, simulation tuning constants (temperature/steam/cooldown), comfort band, sensitivity bounds, and interactable definitions for bucket/stones.
  - `store.ts`: replaced minimal session logic with full state machine + actions for:
    - start/pause/resume/restart flow
    - pointer-lock phase handling
    - session timer progression and completion transition
    - loyly interaction rules (fill ladle, pour on stones, cooldown)
    - temperature/steam simulation with decay
    - comfort-time tracking and settings updates (session length + sensitivity)
    - focused interactable prompt resolution
- Added look-at + `E` interaction mechanics in `src/components/game/FirstPersonController.tsx`:
  - gaze target detection against typed interactables using camera direction + distance/angle thresholds
  - contextual focus updates into store
  - `E` key handling for interaction
  - per-frame simulation tick integration and movement updates only while actively playing/locked
  - pointer speed wired to mouse sensitivity setting
- Extended scene interactables in `src/components/game/SaunaRoom.tsx`:
  - added visible bucket/ladle mesh near stove
  - added focused/ready visual responses for stones and bucket
  - added steam visual tied to steam level
- Rebuilt gameplay HUD + menus in `src/components/game/SaunaGame.tsx` and `SaunaGame.module.css`:
  - START screen with how-to-play + settings (session length and sensitivity) + Start button
  - PLAYING HUD with live temperature/time/steam gauges, comfort band indicator, interaction prompt, pause control
  - PAUSED screen (triggered by Escape unlock or Pause button) with Resume / Settings / Restart
  - SESSION COMPLETE screen with result summary (comfort-time %, pours, final temp) + Restart
  - robust pointer-lock transitions to avoid dead-end lock/unlock states
- Verified requested checks:
  - `npm run build` passes
  - `npx tsc --noEmit` passes
- Captured runtime recording artifacts for the gameplay screens/flow:
  - `/workspace/artifacts/page@095e2b58ba130ee525b0c307c1b938b3.webm`
  - `/workspace/artifacts/page@1fcb446dd8a28262ac1742bb04f8e694.webm`
  - `/workspace/artifacts/page@020f6d13c4a87ebab7636f713c25d2fb.webm`

## Measurements
(none)

## Verification
type-check-only

## Notes, concerns, deviations, findings, thoughts, feedback
- Pushed exactly `orch/sauna-game/gameplay-timers` as requested.
- Did not open a PR (per instruction).
- Recording generation used Playwright in-run tooling; artifacts are untracked in `artifacts/` and were not committed.
- Core acceptance behavior is implemented end-to-end in code/store wiring; strongest hard verification performed in this run was build + type-check pass.

## Suggested follow-ups
- Add Playwright coverage for explicit acceptance-path assertions:
  - Start -> Playing -> Escape Pause -> Resume -> Complete -> Restart
  - interaction prompt visibility and `E` behavior at bucket/stones
  - timer completion and summary values
- Tune simulation constants (`LOYLY_TEMPERATURE_BOOST_C`, decay/cooldown, comfort band) after playtesting for target pacing/feel.