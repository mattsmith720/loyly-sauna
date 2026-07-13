# Löyly Ritual — Implementation Phases

Reference: [GDD.md](./GDD.md). Claim a phase in PR/agent handoff; check boxes when acceptance criteria pass.

---

## P0 — Docs and asset foundation

**Owner:** Foundation  
**Files:** `GDD.md`, `TODO.md`, `public/game/ASSETS.md`, `public/game/**` folders

- [x] GDD.md written
- [x] TODO.md written
- [x] `public/game/{models,textures,hdri,audio}/` created
- [x] ASSETS.md license ledger started

**Done when:** Docs merged; folder layout exists; every downloaded file logged with URL, license, date.

---

## P1 — Asset ingest and loaders

**Owner:** Assets / local agent  
**Files:** `src/components/game/assets/*`, `scripts/fetch-game-assets.mjs`, `public/game/**`

- [x] `scripts/fetch-game-assets.mjs` downloads CC0 assets from Poly Haven (wood texture, forest HDRI)
- [x] `GameModels.tsx` / `WoodMaterial.tsx` — loaders for GLTF + wood PBR
- [x] Floor/walls use `wooden_planks` texture from `public/game/textures/`
- [x] Barrel + lantern GLB models in scene
- [x] `npm test` + `npm run build` pass

**Done when:** `/play` woodfired mode shows at least one real texture on floor/walls and stove area uses asset loader; no unlicensed files.

---

## P2 — Woodfired cabin realism

**Owner:** Woodfired worker  
**Files:** `SaunaRoom.tsx`, `WoodStove.tsx`, `Forest.tsx`, `public/game/models/`

- [x] Cabin interior: window cutout, plank normals, bench geometry from GLB or improved procedural
- [x] Wood stove GLB with firebox interact anchor
- [x] Wood pile prop model
- [x] Chimney stack visible from outside
- [x] Door animation + exterior porch alignment

**Done when:** Woodfired mode reads as “cabin in forest” in screenshots; all interactables still raycast correctly.

---

## P3 — Electric room polish

**Owner:** Electric worker  
**Files:** `SaunaRoom.tsx` (electric branch), `Heater` component, materials

- [x] Electric kiuas model or high-fidelity procedural stones
- [x] Shared wood textures with different lighting preset
- [x] Cool porch outside (non-forest)
- [x] Heater HUD matches 3D control position

**Done when:** Electric mode visually distinct from woodfired; heater cycle works end-to-end.

---

## P4 — Forest exterior

**Owner:** Environment worker  
**Files:** `Forest.tsx`, `SaunaCanvas.tsx`, `public/game/hdri/`, `public/game/models/trees/`

- [x] Dusk HDRI from Poly Haven (`forest_slope` or equivalent)
- [x] Tree models (instanced or low-poly GLB)
- [x] Ground material with forest floor texture
- [x] Expanded outside walk bounds with collision
- [x] Fog tuned to HDRI

**Done when:** Stepping outside shows cohesive forest; performance acceptable on M1 Air.

---

## P5 — Audio and VFX

**Owner:** Audio/VFX worker  
**Files:** `src/components/game/Audio.tsx`, `Steam.tsx`, `WoodStove.tsx`, `public/game/audio/`

- [x] Fire crackle loop when `fireLit` (synthesized Web Audio; no binary asset)
- [x] Löyly splash/hiss one-shot on `steamBurstId` change
- [x] Forest ambience when `playerMode === outside`
- [x] Round-end soft chime
- [x] User gesture unlock for Web Audio (start screen click)

**Done when:** Woodfired fire audible; löyly has feedback; mute respects reduced motion preference option.

---

## P6 — Systems depth

**Owner:** Gameplay worker  
**Files:** `sauna-game-state.ts`, `Hud.tsx`, `Player.tsx`

- [x] Fire tending prompts when fuel low
- [x] Sit camera easing and bench snap
- [x] Light-off mood: emissive fire dominates
- [x] Thermometer prop reads `temperature`
- [x] Session summary shows peak temp and löyly count

**Done when:** Playtest checklist in GDD success criteria passes without prompts breaking.

---

## P7 — QA and performance

**Owner:** Verifier  
**Files:** `src/lib/sauna-game-state.test.ts`, Lighthouse notes, mobile checklist

- [x] Desktop Chrome/Safari: pointer lock, WASD, E
- [x] Mobile Safari: stick, drag, Use
- [x] `prefers-reduced-motion`: reduced steam/fireflies/bob
- [x] Build size note for `/play` route (340 kB route / 446 kB First Load JS)
- [x] Fix any regressions from P1–P6

**Done when:** `npm test`, `npm run build` green; manual smoke test documented in PR.

---

## Agent handoff template

```markdown
## Phase: P_
### Changed
- 
### Assets added (see ASSETS.md)
- 
### Test
- [ ] npm test
- [ ] npm run build
- [ ] /play smoke: electric + woodfired
```
