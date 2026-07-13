"use client";

import { useSyncExternalStore } from "react";
import { gameStore } from "@/lib/game/store";
import type { GameState } from "@/lib/game/types";

export function useGameStore<T>(selector: (state: GameState) => T): T {
  return useSyncExternalStore(
    gameStore.subscribe,
    () => selector(gameStore.getState()),
    () => selector(gameStore.getState()),
  );
}
