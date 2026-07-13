# Game assets license ledger

All assets are **CC0 1.0** (public domain). Source: [Poly Haven](https://polyhaven.com). Fetched via `scripts/fetch-game-assets.mjs`.

| File | Asset ID | Author(s) | License | Source URL | Fetched |
|------|----------|-----------|---------|------------|---------|
| `textures/wooden_planks/*` | wooden_planks | Charlotte Baglioni, Dario Barresi | CC0 | https://polyhaven.com/a/wooden_planks | 2026-07-13 |
| `hdri/autumn_forest_02_1k.hdr` | autumn_forest_02 | Poly Haven | CC0 | https://polyhaven.com/a/autumn_forest_02 | 2026-07-13 |
| `models/lantern_01/*` | Lantern_01 | Poly Haven | CC0 | https://polyhaven.com/a/Lantern_01 | 2026-07-13 |
| `models/barrel_01/*` | Barrel_01 | Poly Haven | CC0 | https://polyhaven.com/a/Barrel_01 | 2026-07-13 |

## Audio note

P5 audio is synthesized at runtime in `src/components/game/Audio.tsx` with the Web Audio API (fire crackle, forest ambience, löyly hiss, and round-end chime). No third-party audio files were downloaded or committed.

## Adding assets

1. Confirm license is CC0 or public domain.
2. Add row to this table before committing.
3. Re-run `node scripts/fetch-game-assets.mjs` or place files manually under `public/game/`.

## Attribution

CC0 does not require attribution; we credit Poly Haven and authors for transparency.
