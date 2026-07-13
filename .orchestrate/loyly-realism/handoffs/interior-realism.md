<!-- orchestrate handoff
task: interior-realism
branch: orch/loyly-realism/interior-realism
agentId: bc-2668114c-1396-45ef-b28f-5d04d549e97d
runId: run-c2db7e48-af7b-450e-bf2e-48fce276d566
resultStatus: finished
finishedAt: 2026-07-13T08:35:14.386Z
-->

## Status
success

## Branch
`orch/loyly-realism/interior-realism`

## What I did
- `src/components/game/SaunaRoom.tsx`
  - Rebuilt interior room composition with mode-aware branches:
    - **Woodfired**: cedar cabin walling with PBR plank material, **window cutout + frame + glass**, warmer tones, and cabin bench feel.
    - **Electric**: brighter/cleaner cedar treatment with slat accents and cleaner studio palette.
  - Added richer **lauteet bench geometry** (upper/lower bench decks, slats, supports) and kept `bench` interactable raycastable.
  - Replaced snap door transform with **animated hinge motion** driven by existing `doorOpen` state (no reducer changes).
  - Moved electric heater to a right-rear position so UI controls map to its screen side.
  - Exported stone origins for proper steam placement.
  - Preserved interactable IDs and raycast volumes for `ladle`, `bucket`, `bench`, `door`, `lights`, `heater`, and `stones`.
- `src/components/game/WoodStove.tsx`
  - Reworked wood stove into higher-fidelity procedural model:
    - layered iron body, stone basket rails, denser visible stones, flame/ember presentation, and stronger firebox readability.
    - added taller **chimney stack** extending above roofline (visible from outside).
  - Kept/clarified interact anchors:
    - `firebox` interactable directly on visible firebox door.
    - `stones` interactable volume above stone bed.
  - Rebuilt `Woodpile` prop near stove with rack + stacked logs and retained `woodpile` interactable volume.
  - Exported `WOOD_STONES_ORIGIN` for steam alignment.
- `src/components/game/SaunaCanvas.tsx`
  - Added distinct lighting/fog/background profiles:
    - **Woodfired** = warm, darker cabin mood.
    - **Electric** = brighter, cleaner studio feel.
  - Set steam burst origin per mode using exported stone origins, so hiss/steam appears at the correct heater/stove location.
- `src/components/game/Hud.tsx`
  - Moved electric heater controls into a right-side floating panel to align with the heater’s new right-side 3D location.
  - Kept existing gauges/buttons/functionality intact.
- `src/components/game/assets/WoodMaterial.tsx`
  - Upgraded wood material helper to support per-surface normal/roughness tuning and cloned textures per usage so repeats/details remain stable across many surfaces.
  - Cleaned hook dependencies to remove lint warnings.
- No changes made to:
  - `src/components/game/sauna-game-state.ts`
  - `src/components/game/Forest.tsx`
- No new CC0 assets were added; no updates required to `public/game/ASSETS.md` or `scripts/fetch-game-assets.mjs`.

## Measurements
- `next lint warnings: 3 → 0`
- `npm run build: pass == pass`
- `npx tsc --noEmit: pass == pass`
- `npm test: 73 passing == 73 passing`

## Verification
live-ui-verified

## Notes, concerns, deviations, findings, thoughts, feedback
- Firebox interact anchor:
  - Local: `[0, 0.44, 0.42]` inside stove group
  - Stove group: `[-0.72, 0, -1.16]`
  - World anchor is visually on the firebox door front.
- Electric heater interact anchor (`heater`):
  - Local: `[0.31, 0.56, 0.12]`
  - Heater group: `[1.22, 0, -1.08]`
  - World anchor sits on the right-side control pod.
- Woodpile interact volume center remains near stove:
  - Group position: `[-1.46, 0.08, -0.68]`
- UI evidence artifacts:
  - `/opt/cursor/artifacts/interior-woodfired-walkthrough.webm`
  - `/opt/cursor/artifacts/interior-electric-walkthrough.webm`
- I did not modify exterior forest scenery (per scope), only ensured door/chimney placement remains coherent from outside-facing views.

## Suggested follow-ups
- Add subtle interior AO/light probes or baked lightmaps for even higher realism while preserving runtime performance.
- Exterior worker: verify chimney/roof silhouette and door threshold from all outside camera angles in final forest pass.
- Audio/VFX worker: bind richer fire crackle intensity to `fireFuel` and mode-specific room tone for the now-distinct interiors.