<!-- orchestrate handoff
task: forest-exterior
branch: orch/loyly-realism/forest-exterior
agentId: bc-638b3d9b-83b1-4c13-97da-b8f03c8418e8
runId: run-93af4c68-2ff1-4937-ab79-a2c9d9a93494
resultStatus: finished
finishedAt: 2026-07-13T09:03:02.699Z
-->

## Status
success

## Branch
`orch/loyly-realism/forest-exterior`

## What I did
- `src/components/game/forest-layout.ts`
  - Added shared woodfired exterior layout data:
    - deterministic procedural tree field generation for a clearing ring
    - expanded elliptical outside roam bounds (`minZ`, `center`, radii)
    - reusable tree collider metadata for movement collision
- `src/components/game/Forest.tsx`
  - Rebuilt woodfired exterior into a dusk forest clearing:
    - replaced per-tree component meshes with **InstancedMesh** trees (trunk + 2 canopy instance layers)
    - added procedural forest-floor material using a generated `DataTexture`
    - upgraded porch geometry with deck, step, posts, and rail alignment at the cabin doorway/front wall
    - kept subtle reduced-motion-aware fireflies (`!state.reducedMotion`) and made them calmer/cozier
    - added optional campfire ring and warm/cool exterior accent lighting
    - lazy-gated dense forest rendering so tree instances only render when outside or door-open
- `src/components/game/Player.tsx`
  - Expanded woodfired outside traversal and collision:
    - replaced tight rectangular clamp with expanded elliptical roam area
    - added simple cabin-front collision constraints around porch/door zone
    - added per-tree collision pushback to prevent clipping through trunks
  - Left electric outside clamp behavior unchanged
- `src/components/game/SaunaCanvas.tsx`
  - Tuned woodfired fog/background/lighting to blend interior/exterior better with HDRI:
    - dynamic dusk fog/background when outside/door-open
    - `Environment` now uses HDRI background for woodfired exterior visibility
    - adjusted woodfired ambient/directional/hemisphere balance for smoother inside↔outside transitions
  - Kept electric mode’s cool outside porch branch unchanged
- UI evidence artifact captured:
  - `/opt/cursor/artifacts/forest-exterior-walkthrough.webm`

## Measurements
- `woodfired tree rendering draw calls (trees only): 156 → 3`
- `woodfired outside X bound span: 9.0m → 21.6m`
- `woodfired outside Z roam depth: 6.9m → 19.6m`
- `npm run build: pass == pass`
- `npx tsc --noEmit: pass == pass`
- `npm run lint: pass == pass`
- `npm test: 73 passing == 73 passing`

## Verification
live-ui-verified

## Notes, concerns, deviations, findings, thoughts, feedback
- Reused existing CC0 HDRI (`autumn_forest_02_1k.hdr`) and built procedural ground/tree geometry; no new downloaded assets were needed, so `public/game/ASSETS.md` and `scripts/fetch-game-assets.mjs` were not changed.
- Collision is intentionally simple/cheap (ellipse bounds + cabin front guard + trunk radius pushback) to keep movement stable and performant without physics overhead.
- Electric outside scene was kept as-is (no forestification changes).

## Suggested follow-ups
- Add a lightweight tree LOD tier (far billboard or simplified canopy) if mobile GPU profiling shows pressure on low-end devices.
- Add a small gameplay smoke test that asserts woodfired outside bounds/collision invariants (no world escape, no trunk penetration).
- Consider subtle exterior ambient audio tie-in when `playerMode === "outside"` to complete the forest atmosphere stack.