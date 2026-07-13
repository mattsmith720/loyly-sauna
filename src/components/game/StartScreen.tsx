"use client";

import { useSaunaGame } from "./useSaunaGame";
import type { SaunaType } from "./sauna-game-state";

export function StartScreen() {
  const { state, dispatch, audio } = useSaunaGame();

  if (state.phase !== "start") return null;

  const enter = (saunaType: SaunaType) => {
    audio.unlock();
    dispatch({ type: "start", saunaType });
  };

  return (
    <div className="game-overlay absolute inset-0 z-20 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,#2b2622_0%,#120f0c_70%)] px-6">
      <div className="max-w-lg text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#8f8474]">
          LÖYLY CO.
        </p>
        <h1 className="font-[var(--font-serif)] text-4xl leading-tight text-[#f7f2e9] sm:text-5xl">
          Löyly Ritual
        </h1>
        <p className="mt-4 text-[#c4b8a8]">
          Choose your sauna. Walk, sit, throw löyly, and settle into the heat.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-2xl border border-[rgba(221,208,188,0.22)] bg-[rgba(26,22,19,0.72)] px-5 py-5 text-left transition hover:border-[#96613a] hover:bg-[rgba(40,34,28,0.9)]"
            onClick={() => enter("electric")}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8474]">
              Classic
            </p>
            <p className="mt-2 font-[var(--font-serif)] text-2xl text-[#f7f2e9]">Electric</p>
            <p className="mt-2 text-sm text-[#c4b8a8]">
              Indoor cedar room. Dial the heater, throw löyly, sit the round.
            </p>
          </button>

          <button
            type="button"
            className="rounded-2xl border border-[rgba(221,208,188,0.22)] bg-[rgba(26,22,19,0.72)] px-5 py-5 text-left transition hover:border-[#96613a] hover:bg-[rgba(40,34,28,0.9)]"
            onClick={() => enter("woodfired")}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8474]">
              Forest
            </p>
            <p className="mt-2 font-[var(--font-serif)] text-2xl text-[#f7f2e9]">Woodfired</p>
            <p className="mt-2 text-sm text-[#c4b8a8]">
              Cabin in the trees. Light the fire, feed wood, toggle lights, step outside.
            </p>
          </button>
        </div>

        <p className="mt-6 text-sm text-[#8f8474]">
          Desktop: WASD · E · mouse look
          <br />
          Mobile: stick · drag to look · Use
        </p>
      </div>
    </div>
  );
}
