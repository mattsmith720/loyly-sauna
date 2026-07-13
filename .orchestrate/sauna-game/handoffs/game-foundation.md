<!-- orchestrate handoff
task: game-foundation
branch: orch/sauna-game/game-foundation
agentId: bc-4719acc3-4863-49fd-a8ba-e2569635ef1f
runId: run-0324426f-8ec7-49cd-a40b-220f392b5a90
resultStatus: finished
finishedAt: 2026-07-13T07:46:50.167Z
-->

## Status
success

## Branch
`orch/sauna-game/game-foundation`

## What I did
- Added and installed required 3D dependencies in `package.json` / `package-lock.json`:
  - `three`
  - `@react-three/fiber`
  - `@react-three/drei`
  - `@types/three`
- Created a new isolated `/play` route under `src/app/play/**`:
  - `layout.tsx` with route-local wrapper
  - `PlayRouteChrome.tsx` client helper to toggle route-specific body state
  - `play-route.css` to hide marketing chrome only while on `/play`
  - `page.tsx` rendering the game entry component
- Built reusable game architecture:
  - `src/lib/game/**`: typed state/types/constants/collision/store/index exports
  - `src/components/game/**`: scene composition, room geometry, first-person controller, store hook, root game component
- Implemented core 3D sauna scene:
  - Enclosed room (floor, 4 walls, ceiling), bench, kiuas + stone pile
  - Basic readable lighting/fog setup
- Implemented first-person controls:
  - Pointer lock (click to lock, Esc to unlock) via drei `PointerLockControls`
  - WASD/arrow movement
  - No-fly camera (fixed eye height)
  - Wall collision using room AABB clamp logic
  - Unlock overlay: “Click to play”
- Verified build and runtime:
  - `next build` succeeds
  - `/` and `/play` both return 200 in runtime check
- Captured UI recording artifact of `/play` interaction:
  - `/workspace/artifacts/page@59353ce943c92cae19f20cf61854eec9.webm`

## Measurements
- `3D render dependencies in package.json (three + r3f + drei + @types/three): 0 → 4`
- ``npm run build` exit code: 1 → 0`
- `Recorded /play interaction artifact size: 0 B → 448022 B`

## Verification
live-ui-verified

## Notes, concerns, deviations, findings, thoughts, feedback
- Constraint respected: no changes were made to `src/app/page.tsx`, `src/app/layout.tsx`, `src/components/layout/**`, or `src/components/sections/**`.
- Because root layout changes were out of scope, `/play` isolation is implemented by route-local layout + route-specific chrome suppression CSS at runtime (marketing header/footer/banner/action bar are hidden on `/play`), while homepage files remain unchanged.
- Left `artifacts/` untracked (not committed), so the recording is available as a run artifact path.

## Suggested follow-ups
- If full structural isolation is desired (marketing chrome not rendered at all, not just hidden), refactor into route groups with separate top-level layouts when modifying `src/app/layout.tsx` and marketing routes becomes allowed.
- Add interaction tests (Playwright) asserting:
  - overlay visibility toggles on pointer lock/unlock
  - WASD movement updates player state
  - position clamp prevents walking through walls
- Extend `src/lib/game/store.ts` with timer/session/gameplay slices for downstream sauna mechanics (löyly, rounds, end states).