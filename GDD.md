# Löyly Ritual — Game Design Document

## Vision

A cozy singleplayer first-person sauna ritual simulation for the LÖYLY CO. brand. The player enters a cedar room, heats the space, throws löyly (water on hot stones), sits through a round, and steps outside to cool. No combat, no scores, no failure states beyond the session ending peacefully.

The fantasy is **presence**: warmth, steam, wood, forest dusk, and the slow rhythm of heat building over time.

## Design pillars

1. **Heat authenticity** — Temperature and humidity drift realistically; löyly spikes both briefly; woodfired mode requires tending fire fuel.
2. **Ritual loop** — Clear sequence: enter → heat → löyly → sit → cool → end/repeat.
3. **Forest cabin atmosphere** — Woodfired mode reads as a cabin in the trees; electric mode reads as a clean indoor recovery studio.
4. **Accessibility** — Desktop (pointer lock + WASD) and mobile (stick + drag look + Use button); `prefers-reduced-motion` reduces bob, steam, and fireflies.

## Modes

| Mode | Setting | Heat source | Outside |
|------|---------|-------------|---------|
| **Electric** | Indoor cedar room | Electric kiuas, adjustable target (70–90°C) | Simple cool porch |
| **Woodfired** | Forest cabin | Wood stove + firebox; fuel burns down | Forest clearing, porch, trees, dusk |

Both modes share: ladle, bucket, stones, benches, lights, door, 12-minute round timer.

## Core loop

```mermaid
flowchart LR
  choose[Choose mode] --> enter[Enter sauna]
  enter --> heat[Build heat]
  heat --> loyly[Scoop water and throw löyly]
  loyly --> sit[Sit on bench]
  sit --> round[Round timer runs]
  round --> cool[Step outside optional]
  cool --> end[Round complete]
  end --> repeat[Another round or exit]
```

## Systems

### Temperature (°C)

- Drifts toward heat source setpoint when inside.
- Seated player feels +2°C perceived heat.
- Löyly: +6°C spike on stones when water thrown.
- Outside: drifts toward ambient (22°C electric / 12°C forest).

### Humidity (%)

- Rises on löyly (+22%), slowly decays.
- Higher when fire is active and after steam bursts.

### Heat sources

**Electric:** Heater on/off; target cycles 70 → 82 → 90 → off via interact; HUD Cooler/Hotter buttons.

**Woodfired:** Pick up wood from pile → interact with firebox to light or feed → `fireFuel` 0–100 burns at ~1.8/s → heat target derived from fuel → fire dies at 0.

### Lights

- Toggle via wall switch or ceiling lamp interactable; HUD Lights button.
- When off: ambient and point lights scale to ~20%; room mood shifts darker, fire/stove glow more prominent.

### Session timer

- 12 minutes per round; pauses while player is outside.
- Ends with “Good löyly” screen; option to replay same mode or return to site.

### Player modes

- `walking` — full movement
- `seated` — lower eye height, no movement
- `outside` — forest/porch bounds, cooler ambient

### Interactables

| ID | Action |
|----|--------|
| `ladle` | Pick up / set down |
| `bucket` | Fill ladle (requires holding ladle) |
| `stones` | Throw löyly (requires water + heat) |
| `bench` | Sit / stand |
| `door` | Open → step outside → step inside → close |
| `heater` | Electric only: cycle heat |
| `lights` | Toggle lights |
| `woodpile` | Pick up / set down firewood |
| `firebox` | Light or feed fire (woodfired) |

Focus via center-screen raycast; prompt in HUD; `E` or Use on mobile.

## Controls

| Input | Desktop | Mobile |
|-------|---------|--------|
| Move | WASD | Left stick |
| Look | Mouse (pointer lock) | Drag right side |
| Interact | E | Use button |
| Heater adjust | `[` `]` or HUD | HUD Cooler/Hotter (electric) |
| Lights | Interact or HUD | HUD Lights |
| Exit | HUD link | HUD link |

## Content targets (realism pass)

### Interior

- Cedar plank walls/floor with PBR wood textures
- Upper and lower benches (lauteet)
- Kiuas / wood stove with visible stones
- Bucket, ladle, light fixture, door with handle
- Optional: thermometer, small window (woodfired)

### Exterior (woodfired)

- Forest ground, tree line, dusk sky or HDRI
- Cabin porch with posts
- Optional campfire ring
- Fireflies (ambient, reduced-motion aware)

### Audio (Phase P5)

- Fire crackle (woodfired, loop)
- Löyly hiss on steam burst
- Forest ambience (outside)
- Soft UI chime at round end

### VFX

- Steam particles on löyly (existing; density tied to reduced motion)
- Fire flicker on stove flame mesh
- Heat/humidity screen veil (HUD overlay)

## Art direction

- **Palette:** timber `#96613a`, charcoal `#1a1613`, cream steam `#f0e6d6`, sauna glow `#ddb882`, ember `#ff6a1a`
- **Lighting:** Warm interior key from stove/heater; cool blue fill outside in forest mode
- **Mood:** Intimate, not horror; no jump scares; slow pacing
- **Typography:** Brand serif for titles; sans for HUD data (matches site)

## Technical constraints

- **Stack:** Next.js 15 App Router, React Three Fiber, drei, three.js
- **Route:** `/play` full-screen; no marketing chrome
- **SSR:** Game client-only (`"use client"`)
- **Assets:** `public/game/` — GLB models, webp/jpg textures, HDR/EXR HDRI, OGG/MP3 audio
- **Licenses:** CC0 / public domain only; ledger in `public/game/ASSETS.md`
- **Performance:** Lazy-load heavy assets; target `/play` first paint < 3s on desktop; mobile playable at 30fps
- **Deploy:** Vercel static + client bundle; no server-side game logic

## State architecture

Single reducer in `src/components/game/sauna-game-state.ts`; React context in `useSaunaGame.tsx`. Extend with new fields/actions; do not break electric/woodfired `SaunaType` split.

Scene composition in `SaunaCanvas.tsx` → `SaunaRoom`, `Forest`, `WoodStove`, `Player`, `InteractionRaycast`, `GameLoop`.

## Out of scope

- Multiplayer or networking
- Accounts, saves, leaderboards
- Paid asset marketplaces (Sketchfab paid, Unity Asset Store)
- Unity, Godot, or native app export
- Combat, inventory beyond ladle/wood
- Full physics simulation
- VR mode (future consideration only)

## Success criteria (v1 realistic)

Player can choose mode, walk the room, light/tend fire or set electric heat, toggle lights, throw löyly, sit a full round with live temp/humidity, step into forest outside, and finish without broken controls on desktop and mobile.
