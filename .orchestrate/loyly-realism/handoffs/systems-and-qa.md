<!-- orchestrate handoff
task: systems-and-qa
branch: orch/loyly-realism/systems-and-qa
agentId: bc-5c9960ca-ae8b-4fc2-80eb-20ff4b71bfec
runId: run-e8f102b3-c9f3-4373-9d50-163251d7077d
resultStatus: finished
finishedAt: 2026-07-13T09:33:12.201Z
-->

All work is complete, committed, pushed, and the draft PR is open. Here is my handoff.

## Status
success

## Branch
`orch/loyly-realism/systems-and-qa`

## What I did
- **Reducer (`src/components/game/sauna-game-state.ts`), ADD-only:** added `peakTemperature` + `loylyCount` fields, `FIRE_LOW_THRESHOLD` const, and `isFireLow()` helper. Peak tracked in `tick` and on löyly throws; löyly count increments only on successful throws; both reset on `start`. Electric/woodfired split and all existing fields/actions/behavior unchanged.
- **`Hud.tsx`:** round-end summary now shows **peak heat** and **löyly thrown**; added a prominent amber "Fire is low" banner (pulse gated by reduced motion) plus amber top-bar fire readout when woodfired fuel < 25%.
- **`Player.tsx`:** sitting eases camera to a lower seated eye height + glides to a bench-facing pose (position ease + one-shot orientation ease that yields to look input); standing eases back. No change to walking/outside movement or `E` interact.
- **`SaunaCanvas.tsx` / `WoodStove.tsx` / `SaunaRoom.tsx`:** light-off mood now keeps a warm ember ambient fill (cozy, not pitch black) and boosts stove/heater point lights so fire glow dominates; added a procedural wall **thermometer** whose needle/readout track live `temperature`.
- **Tests (`src/lib/sauna-game-state.test.ts`):** added coverage for peak-temp tracking (rises, never lowers while cooling), löyly counting (success vs blocked), start-reset, and `isFireLow`.
- **`TODO.md`:** checked off P2–P7.
- Confirmed `prefers-reduced-motion` already reduces steam/fireflies/head-bob and extended it to the new seat ease + banner pulse.

## Measurements
- `npm test: 73 passing → 78 passing`
- `npm run build: pass == pass`
- `npm run lint: pass == pass`
- `npx tsc --noEmit: pass == pass`
- `/play First Load JS: 446 kB` (route size 340 kB)
- `downloaded asset binaries added: 0 == 0`

## Verification
unit-test-verified

- Reducer/systems logic (peak temp, löyly count, fire-low) is covered by passing unit tests.
- Routes serve 200 and compile with no runtime exceptions; HUD DOM (start screen, in-game overlay, heater control, buttons) renders correctly in headless Chrome, and the woodfired 3D scene mounts (captured `/opt/cursor/artifacts/02-woodfired-interior.png`, `04-electric-interior.png`).
- Full 3D visual capture of the *electric* studio was blocked in the offline headless sandbox: drei's `Environment preset="apartment"` fetches a remote HDRI that can't load without network, suspending the electric scene (woodfired uses a local HDRI and renders). Upstream already live-verified scene rendering + audio.

## Notes, concerns, deviations, findings, thoughts, feedback
- The PR tool rejected the required branch name (`cursor/` prefix policy); since the orchestrator mandates the exact branch `orch/loyly-realism/systems-and-qa`, I created the draft PR with `skip_branch_prefix_check` and did **not** rename/delete the branch. PR: https://github.com/mattsmith720/loyly-sauna/pull/4 (base `main`, draft).
- `.orchestrate/` is already tracked from the base branch; I touched none of it, so it's absent from my diff. Working tree is clean.
- Woodfired cold-start is intentionally dark until the fire is lit — this is the upstream mood, not a regression. Automated fire-lighting in headless was unreliable (needs walking closer than the 2.4 m interact range + precise touch aiming), so the fire-lit/lights-off "fire dominates" mood is verified by code + build rather than a screenshot.
- Electric mode's dependence on drei's remote `Environment preset` means offline/air-gapped environments won't image-light the electric room. Not in my scope to change, but a follow-up could bundle a small local apartment HDRI for offline resilience.

## Suggested follow-ups
- Bundle a small CC0 indoor HDRI locally for electric mode so it renders without network (improves offline/headless verifiability and first-paint reliability).
- Add a lightweight UI/interaction smoke test (touch-emulated) that walks to the woodpile, lights the fire, throws löyly, and ends a round to snapshot the fire-lit mood and the summary screen.
- Consider a true volume slider (upstream suggestion) and a headphone loudness pass on real devices.