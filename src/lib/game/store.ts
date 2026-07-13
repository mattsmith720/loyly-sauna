import {
  PLAYER_EYE_HEIGHT,
  PLAYER_RADIUS,
  PLAYER_SPEED_MPS,
  PLAYER_START_POSITION,
} from "@/lib/game/constants";
import type { GameState, MovementKey, SessionPhase, Vec3 } from "@/lib/game/types";

type StateListener = () => void;

export interface GameStoreActions {
  // Add interaction and timer actions here so gameplay systems stay centralized.
  setMovementKey: (key: MovementKey, pressed: boolean) => void;
  setPointerLocked: (isLocked: boolean) => void;
  setPlayerPosition: (position: Vec3) => void;
  setPlayerView: (yaw: number, pitch: number) => void;
  setSessionPhase: (phase: SessionPhase) => void;
  resetSession: () => void;
}

export interface GameStore {
  getState: () => GameState;
  subscribe: (listener: StateListener) => () => void;
  actions: GameStoreActions;
}

function createInitialState(): GameState {
  return {
    player: {
      position: { ...PLAYER_START_POSITION },
      view: { yaw: 0, pitch: 0 },
      eyeHeight: PLAYER_EYE_HEIGHT,
      radius: PLAYER_RADIUS,
      speedMetersPerSecond: PLAYER_SPEED_MPS,
    },
    input: {
      forward: false,
      backward: false,
      left: false,
      right: false,
    },
    session: {
      phase: "idle",
      isPointerLocked: false,
      startedAtMs: null,
    },
  };
}

function createGameStore(initialState: GameState = createInitialState()): GameStore {
  let state = initialState;
  const listeners = new Set<StateListener>();

  const setState = (updater: (prev: GameState) => GameState) => {
    state = updater(state);
    listeners.forEach((listener) => listener());
  };

  const actions: GameStoreActions = {
    setMovementKey(key, pressed) {
      setState((prev) => ({
        ...prev,
        input: {
          ...prev.input,
          [key]: pressed,
        },
      }));
    },
    setPointerLocked(isLocked) {
      setState((prev) => {
        const phase: SessionPhase = isLocked ? "playing" : prev.session.startedAtMs === null ? "idle" : "paused";
        const startedAtMs = isLocked && prev.session.startedAtMs === null ? Date.now() : prev.session.startedAtMs;

        return {
          ...prev,
          input: isLocked
            ? prev.input
            : {
                forward: false,
                backward: false,
                left: false,
                right: false,
              },
          session: {
            ...prev.session,
            phase,
            isPointerLocked: isLocked,
            startedAtMs,
          },
        };
      });
    },
    setPlayerPosition(position) {
      setState((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          position: { ...position },
        },
      }));
    },
    setPlayerView(yaw, pitch) {
      setState((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          view: { yaw, pitch },
        },
      }));
    },
    setSessionPhase(phase) {
      setState((prev) => ({
        ...prev,
        session: {
          ...prev.session,
          phase,
        },
      }));
    },
    resetSession() {
      const initial = createInitialState();
      setState((prev) => ({
        ...initial,
        player: {
          ...initial.player,
          view: prev.player.view,
        },
      }));
    },
  };

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    actions,
  };
}

export const gameStore = createGameStore();
