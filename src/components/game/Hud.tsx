"use client";

import Link from "next/link";
import {
  ROUND_SECONDS,
  formatHumidity,
  formatTemp,
  formatTimer,
} from "./sauna-game-state";
import { useSaunaGame } from "./useSaunaGame";
import { MobileControls } from "./MobileControls";

export function Hud() {
  const { state, prompt, dispatch } = useSaunaGame();

  if (state.phase === "start") return null;

  const remaining = Math.max(0, ROUND_SECONDS - state.sessionSeconds);
  const progress = Math.min(1, state.sessionSeconds / ROUND_SECONDS);
  const heatVeil = Math.min(0.28, Math.max(0, (state.temperature - 55) / 150));
  const humidVeil = Math.min(0.18, Math.max(0, (state.humidity - 30) / 200));

  if (state.phase === "ended") {
    return (
      <div className="game-overlay absolute inset-0 z-20 flex items-center justify-center bg-[rgba(18,15,12,0.82)] px-6 backdrop-blur-sm">
        <div className="max-w-md text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8f8474]">
            Round complete
          </p>
          <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-[#f7f2e9]">
            Good löyly.
          </h2>
          <p className="mt-3 text-[#c4b8a8]">
            You sat {formatTimer(state.sessionSeconds)} · peak feel {formatTemp(state.temperature)}.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              className="btn btn-timber min-w-[180px]"
              onClick={() => dispatch({ type: "start", saunaType: state.saunaType })}
            >
              Another round
            </button>
            <Link href="/" className="btn btn-ghost min-w-[180px]">
              Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, rgba(255,140,60,${heatVeil}) 0%, transparent 55%), radial-gradient(ellipse at 50% 80%, rgba(240,230,214,${humidVeil}) 0%, transparent 50%)`,
        }}
        aria-hidden
      />

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(247,242,233,0.75)] shadow-[0_0_8px_rgba(221,184,130,0.6)]" />

      {!state.pointerLocked && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <p className="rounded-full bg-[rgba(26,22,19,0.72)] px-4 py-2 text-sm text-[#f7f2e9] backdrop-blur-sm">
            Click or tap to look around
          </p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="rounded-2xl border border-[rgba(221,208,188,0.18)] bg-[rgba(26,22,19,0.72)] px-3 py-2.5 backdrop-blur-md sm:px-4 sm:py-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#8f8474]">
            {state.saunaType === "woodfired" ? "Woodfired" : "Sauna"}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#f7f2e9]">
            <span>{formatTemp(state.temperature)}</span>
            <span>{formatHumidity(state.humidity)}</span>
            {state.saunaType === "woodfired" ? (
              <span>
                {state.fireLit ? `Fire ${Math.round(state.fireFuel)}%` : "Fire out"}
              </span>
            ) : (
              <span>
                {state.heaterOn ? `${Math.round(state.heaterTarget)}° target` : "Heater off"}
              </span>
            )}
            <span>{state.lightsOn ? "Lights on" : "Lights off"}</span>
            {state.holdingLadle && (
              <span className="text-[#ddb882]">{state.ladleHasWater ? "Ladle full" : "Ladle"}</span>
            )}
            {state.holdingWood && <span className="text-[#ddb882]">Carrying wood</span>}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(221,208,188,0.18)] bg-[rgba(26,22,19,0.72)] px-3 py-2.5 text-right backdrop-blur-md sm:px-4 sm:py-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#8f8474]">
            Round
          </p>
          <p className="mt-1.5 font-[var(--font-serif)] text-xl text-[#ddb882] sm:text-2xl">
            {formatTimer(remaining)}
          </p>
        </div>
      </div>

      <MobileControls visible={state.phase === "playing"} />

      {state.saunaType === "electric" && (
        <div className="pointer-events-auto absolute right-3 top-[58%] z-10 -translate-y-1/2 sm:right-5">
          <div className="rounded-2xl border border-[rgba(221,208,188,0.22)] bg-[rgba(26,22,19,0.76)] p-2.5 backdrop-blur-md">
            <p className="mb-2 text-center text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#8f8474]">
              Heater
            </p>
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                className="rounded-full border border-[rgba(221,208,188,0.22)] bg-[rgba(150,97,58,0.65)] px-3 py-1.5 text-xs text-[#f7f2e9]"
                onClick={() => dispatch({ type: "adjust_heater", delta: 2 })}
              >
                Hotter
              </button>
              <p className="min-w-16 text-center text-xs text-[#f7f2e9]">
                {state.heaterOn ? `${Math.round(state.heaterTarget)}°` : "OFF"}
              </p>
              <button
                type="button"
                className="rounded-full border border-[rgba(221,208,188,0.22)] bg-[rgba(26,22,19,0.72)] px-3 py-1.5 text-xs text-[#c4b8a8]"
                onClick={() => dispatch({ type: "adjust_heater", delta: -2 })}
              >
                Cooler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 p-4 pb-6">
        <div className="h-1 w-full max-w-md overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
          <div
            className="h-full rounded-full bg-[#96613a] transition-[width] duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {prompt && (
          <p className="rounded-full bg-[rgba(26,22,19,0.78)] px-4 py-2 text-sm text-[#f7f2e9] backdrop-blur-sm">
            <span className="hidden sm:inline">{prompt} · E</span>
            <span className="sm:hidden">{prompt}</span>
          </p>
        )}

        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className="min-h-12 min-w-12 rounded-full border border-[rgba(221,208,188,0.28)] bg-[rgba(150,97,58,0.85)] px-5 py-3 text-sm font-semibold text-[#f7f2e9] backdrop-blur-sm md:hidden"
            onClick={() => dispatch({ type: "interact" })}
          >
            Use
          </button>
          <button
            type="button"
            className="rounded-full border border-[rgba(221,208,188,0.22)] bg-[rgba(26,22,19,0.72)] px-3 py-2 text-xs text-[#c4b8a8] backdrop-blur-sm"
            onClick={() => dispatch({ type: "toggle_lights" })}
          >
            Lights
          </button>
          <Link
            href="/"
            className="rounded-full border border-[rgba(221,208,188,0.22)] bg-[rgba(26,22,19,0.72)] px-3 py-2 text-xs text-[#c4b8a8] no-underline backdrop-blur-sm hover:no-underline"
          >
            Exit
          </Link>
        </div>
      </div>
    </>
  );
}
