import { describe, expect, it } from "vitest";
import {
  HEATER_DEFAULT,
  HEATER_MAX,
  HEATER_MIN,
  ROUND_SECONDS,
  initialSaunaGameState,
  saunaGameReducer,
} from "@/components/game/sauna-game-state";

describe("saunaGameReducer", () => {
  it("starts electric with heater on", () => {
    const next = saunaGameReducer(initialSaunaGameState, { type: "start", saunaType: "electric" });
    expect(next.phase).toBe("playing");
    expect(next.saunaType).toBe("electric");
    expect(next.heaterOn).toBe(true);
    expect(next.sessionSeconds).toBe(0);
  });

  it("starts woodfired cold with fire out", () => {
    const next = saunaGameReducer(initialSaunaGameState, { type: "start", saunaType: "woodfired" });
    expect(next.saunaType).toBe("woodfired");
    expect(next.heaterOn).toBe(false);
    expect(next.fireLit).toBe(false);
    expect(next.lightsOn).toBe(true);
  });

  it("lights fire when feeding wood into firebox", () => {
    const playing = saunaGameReducer(initialSaunaGameState, { type: "start", saunaType: "woodfired" });
    const withWood = { ...playing, holdingWood: true, focusedInteractable: "firebox" as const };
    const lit = saunaGameReducer(withWood, { type: "interact" });
    expect(lit.fireLit).toBe(true);
    expect(lit.holdingWood).toBe(false);
    expect(lit.fireFuel).toBeGreaterThan(0);
    expect(lit.heaterOn).toBe(true);
  });

  it("toggles lights", () => {
    const playing = saunaGameReducer(initialSaunaGameState, { type: "start", saunaType: "woodfired" });
    const off = saunaGameReducer(playing, { type: "toggle_lights" });
    expect(off.lightsOn).toBe(false);
  });

  it("throws löyly when ladle has water", () => {
    const playing = saunaGameReducer(initialSaunaGameState, { type: "start", saunaType: "electric" });
    const withLadle = saunaGameReducer(
      { ...playing, holdingLadle: true, ladleHasWater: true, focusedInteractable: "stones" },
      { type: "interact" },
    );
    expect(withLadle.ladleHasWater).toBe(false);
    expect(withLadle.humidity).toBeGreaterThan(playing.humidity);
    expect(withLadle.steamBurstId).toBe(1);
  });

  it("cycles heater intensity on interact", () => {
    const playing = saunaGameReducer(initialSaunaGameState, { type: "start", saunaType: "electric" });
    const focused = { ...playing, focusedInteractable: "heater" as const, heaterOn: false };
    const on = saunaGameReducer(focused, { type: "interact" });
    expect(on.heaterOn).toBe(true);
    expect(on.heaterTarget).toBe(HEATER_MIN);

    const mid = saunaGameReducer({ ...on, focusedInteractable: "heater" }, { type: "interact" });
    expect(mid.heaterTarget).toBe(HEATER_DEFAULT);

    const max = saunaGameReducer({ ...mid, focusedInteractable: "heater" }, { type: "interact" });
    expect(max.heaterTarget).toBe(HEATER_MAX);

    const off = saunaGameReducer({ ...max, focusedInteractable: "heater" }, { type: "interact" });
    expect(off.heaterOn).toBe(false);
  });

  it("adjusts heater target within band", () => {
    const playing = saunaGameReducer(initialSaunaGameState, { type: "start", saunaType: "electric" });
    const hotter = saunaGameReducer(playing, { type: "adjust_heater", delta: 20 });
    expect(hotter.heaterTarget).toBe(HEATER_MAX);
    const cooler = saunaGameReducer(hotter, { type: "adjust_heater", delta: -100 });
    expect(cooler.heaterTarget).toBe(HEATER_MIN);
  });

  it("ends after the round duration", () => {
    const playing = saunaGameReducer(initialSaunaGameState, { type: "start" });
    const ended = saunaGameReducer(playing, {
      type: "tick",
      delta: ROUND_SECONDS + 1,
    });
    expect(ended.phase).toBe("ended");
  });
});
