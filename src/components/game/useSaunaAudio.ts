"use client";

import { useCallback, useEffect, useRef } from "react";
import { getSaunaAudioEngine } from "@/lib/game/audio";
import { gameStore } from "@/lib/game/store";
import { useGameStore } from "@/components/game/useGameStore";

/**
 * Bridges the synthesized {@link SaunaAudioEngine} to game state. Audio is only
 * ever started from {@link unlockAudio}, which callers must invoke inside a user
 * gesture so we respect browser autoplay policies.
 */
export function useSaunaAudio() {
  const phase = useGameStore((state) => state.session.phase);
  const muted = useGameStore((state) => state.session.settings.audioMuted);
  const volume = useGameStore((state) => state.session.settings.audioVolume);
  const humidity = useGameStore((state) => state.session.ritual.humidityPercent);
  const lastLoylyAtMs = useGameStore((state) => state.session.ritual.lastLoylyAtMs);

  const humidityRef = useRef(humidity);
  humidityRef.current = humidity;
  const unlockedRef = useRef(false);
  const lastSizzleRef = useRef<number | null>(lastLoylyAtMs);

  useEffect(() => {
    const engine = getSaunaAudioEngine();
    engine.setVolume(volume);
    engine.setMuted(muted);
  }, [muted, volume]);

  useEffect(() => {
    const engine = getSaunaAudioEngine();
    if (phase === "playing" && unlockedRef.current) {
      engine.startAmbient();
    } else if (phase !== "playing") {
      engine.stopAmbient();
    }
  }, [phase]);

  useEffect(() => {
    const engine = getSaunaAudioEngine();
    if (lastLoylyAtMs === null) {
      lastSizzleRef.current = null;
      return;
    }
    if (lastSizzleRef.current === lastLoylyAtMs) return;
    lastSizzleRef.current = lastLoylyAtMs;
    if (!unlockedRef.current) return;
    const intensity = 0.35 + Math.min(1, humidityRef.current / 100) * 0.65;
    engine.playSizzle(intensity);
  }, [lastLoylyAtMs]);

  useEffect(() => {
    return () => {
      getSaunaAudioEngine().stopAmbient(0.1);
    };
  }, []);

  const unlockAudio = useCallback(() => {
    const engine = getSaunaAudioEngine();
    void engine.unlock().then(() => {
      unlockedRef.current = engine.isUnlocked;
      if (!unlockedRef.current) return;
      engine.setVolume(volume);
      engine.setMuted(muted);
      if (gameStore.getState().session.phase === "playing") {
        engine.startAmbient();
      }
    });
  }, [muted, volume]);

  return { unlockAudio };
}
