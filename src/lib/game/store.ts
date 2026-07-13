import {
  BASE_HUMIDITY_PERCENT,
  BASE_TEMPERATURE_C,
  COMFORT_BAND_MAX_C,
  COMFORT_BAND_MIN_C,
  DEFAULT_MOUSE_SENSITIVITY,
  DEFAULT_SESSION_LENGTH_MINUTES,
  HUMIDITY_RELAX_PER_SECOND,
  LOYLY_COOLDOWN_SECONDS,
  LOYLY_HUMIDITY_BOOST_PERCENT,
  LOYLY_TEMPERATURE_BOOST_C,
  MOUSE_SENSITIVITY_MAX,
  MOUSE_SENSITIVITY_MIN,
  PLAYER_EYE_HEIGHT,
  PLAYER_VIEW_PITCH_MAX,
  PLAYER_VIEW_PITCH_MIN,
  PLAYER_RADIUS,
  PLAYER_SPEED_MPS,
  PLAYER_START_POSITION,
  REAL_SECONDS_PER_GAME_MINUTE,
  TEMPERATURE_RELAX_PER_SECOND,
} from "@/lib/game/constants";
import type {
  GameState,
  InteractableId,
  MovementKey,
  SessionLengthMinutes,
  SessionPhase,
  SessionSettings,
  Vec3,
} from "@/lib/game/types";

type StateListener = () => void;

export interface GameStoreActions {
  setMovementKey: (key: MovementKey, pressed: boolean) => void;
  resetMovementInput: () => void;
  setPointerLocked: (isLocked: boolean) => void;
  setPlayerPosition: (position: Vec3) => void;
  setPlayerView: (yaw: number, pitch: number) => void;
  setSessionPhase: (phase: SessionPhase) => void;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  restartSession: () => void;
  setSessionLengthMinutes: (minutes: SessionLengthMinutes) => void;
  setMouseSensitivity: (sensitivity: number) => void;
  setFocusedInteractable: (interactableId: InteractableId | null, prompt: string | null) => void;
  interact: () => void;
  tickSession: (deltaSeconds: number) => void;
  resetSession: () => void;
}

export interface GameStore {
  getState: () => GameState;
  subscribe: (listener: StateListener) => () => void;
  actions: GameStoreActions;
}

const emptyInput: GameState["input"] = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

function createDefaultSettings(): SessionSettings {
  return {
    sessionLengthMinutes: DEFAULT_SESSION_LENGTH_MINUTES,
    mouseSensitivity: DEFAULT_MOUSE_SENSITIVITY,
  };
}

function getTargetDurationSeconds(minutes: SessionLengthMinutes): number {
  return minutes * REAL_SECONDS_PER_GAME_MINUTE;
}

function clampMouseSensitivity(sensitivity: number): number {
  return Math.min(MOUSE_SENSITIVITY_MAX, Math.max(MOUSE_SENSITIVITY_MIN, sensitivity));
}

function normalizeYaw(yaw: number): number {
  if (!Number.isFinite(yaw)) return 0;
  const tau = Math.PI * 2;
  let normalized = yaw % tau;
  if (normalized > Math.PI) normalized -= tau;
  if (normalized < -Math.PI) normalized += tau;
  return normalized;
}

function clampPitch(pitch: number): number {
  if (!Number.isFinite(pitch)) return 0;
  return Math.min(PLAYER_VIEW_PITCH_MAX, Math.max(PLAYER_VIEW_PITCH_MIN, pitch));
}

function createSessionState(settings: SessionSettings) {
  const targetRealSeconds = getTargetDurationSeconds(settings.sessionLengthMinutes);

  return {
    phase: "idle" as SessionPhase,
    isPointerLocked: false,
    startedAtMs: null,
    settings,
    timer: {
      targetRealSeconds,
      elapsedRealSeconds: 0,
      remainingRealSeconds: targetRealSeconds,
    },
    ritual: {
      temperatureC: BASE_TEMPERATURE_C,
      humidityPercent: BASE_HUMIDITY_PERCENT,
      comfortBandMinC: COMFORT_BAND_MIN_C,
      comfortBandMaxC: COMFORT_BAND_MAX_C,
      timeInComfortSeconds: 0,
      loylyCooldownSeconds: LOYLY_COOLDOWN_SECONDS,
      loylyCooldownRemainingSeconds: 0,
      lastLoylyAtMs: null,
    },
    interaction: {
      focusedInteractableId: null,
      prompt: null,
    },
  };
}

function createInitialState(settings: SessionSettings = createDefaultSettings()): GameState {
  const session = createSessionState(settings);

  return {
    player: {
      position: { ...PLAYER_START_POSITION },
      view: { yaw: 0, pitch: 0 },
      eyeHeight: PLAYER_EYE_HEIGHT,
      radius: PLAYER_RADIUS,
      speedMetersPerSecond: PLAYER_SPEED_MPS,
    },
    input: { ...emptyInput },
    session,
  };
}

function createGameStore(initialState: GameState = createInitialState()): GameStore {
  let state = initialState;
  const listeners = new Set<StateListener>();

  const setState = (updater: (prev: GameState) => GameState) => {
    const nextState = updater(state);
    if (Object.is(nextState, state)) return;
    state = nextState;
    listeners.forEach((listener) => listener());
  };

  const actions: GameStoreActions = {
    setMovementKey(key, pressed) {
      if (state.input[key] === pressed) return;
      setState((prev) => ({
        ...prev,
        input: {
          ...prev.input,
          [key]: pressed,
        },
      }));
    },
    resetMovementInput() {
      setState((prev) => {
        if (!prev.input.forward && !prev.input.backward && !prev.input.left && !prev.input.right) {
          return prev;
        }

        return {
          ...prev,
          input: { ...emptyInput },
        };
      });
    },
    setPointerLocked(isLocked) {
      setState((prev) => {
        if (prev.session.isPointerLocked === isLocked) return prev;

        const nextPhase: SessionPhase =
          isLocked && prev.session.phase === "paused"
            ? "playing"
            : !isLocked && prev.session.phase === "playing"
              ? "paused"
              : prev.session.phase;

        return {
          ...prev,
          input: isLocked ? prev.input : { ...emptyInput },
          session: {
            ...prev.session,
            phase: nextPhase,
            isPointerLocked: isLocked,
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
      const nextYaw = normalizeYaw(yaw);
      const nextPitch = clampPitch(pitch);
      setState((prev) => {
        if (Math.abs(prev.player.view.yaw - nextYaw) < 0.0001 && Math.abs(prev.player.view.pitch - nextPitch) < 0.0001) {
          return prev;
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            view: { yaw: nextYaw, pitch: nextPitch },
          },
        };
      });
    },
    setSessionPhase(phase) {
      if (state.session.phase === phase) return;
      setState((prev) => ({
        ...prev,
        session: {
          ...prev.session,
          phase,
        },
      }));
    },
    startSession() {
      setState((prev) => {
        const settings = {
          ...prev.session.settings,
          mouseSensitivity: clampMouseSensitivity(prev.session.settings.mouseSensitivity),
        };
        const initial = createInitialState(settings);

        return {
          ...initial,
          session: {
            ...initial.session,
            phase: "playing",
            startedAtMs: Date.now(),
          },
        };
      });
    },
    pauseSession() {
      setState((prev) => {
        if (prev.session.phase !== "playing") return prev;

        return {
          ...prev,
          input: { ...emptyInput },
          session: {
            ...prev.session,
            phase: "paused",
            isPointerLocked: false,
          },
        };
      });
    },
    resumeSession() {
      setState((prev) => {
        if (prev.session.phase !== "paused") return prev;

        return {
          ...prev,
          session: {
            ...prev.session,
            phase: "playing",
          },
        };
      });
    },
    restartSession() {
      setState((prev) => {
        const settings = {
          ...prev.session.settings,
          mouseSensitivity: clampMouseSensitivity(prev.session.settings.mouseSensitivity),
        };

        return createInitialState(settings);
      });
    },
    setSessionLengthMinutes(minutes) {
      setState((prev) => {
        const nextTarget = getTargetDurationSeconds(minutes);
        const isIdleOrComplete = prev.session.phase === "idle" || prev.session.phase === "complete";
        const nextElapsed = isIdleOrComplete
          ? 0
          : Math.min(prev.session.timer.elapsedRealSeconds, nextTarget);
        const nextRemaining = Math.max(0, nextTarget - nextElapsed);
        const shouldComplete =
          (prev.session.phase === "playing" || prev.session.phase === "paused") && nextRemaining <= 0;
        const nextPhase: SessionPhase = shouldComplete ? "complete" : prev.session.phase;
        const isPointerLocked = shouldComplete ? false : prev.session.isPointerLocked;

        return {
          ...prev,
          input: isPointerLocked ? prev.input : { ...emptyInput },
          session: {
            ...prev.session,
            phase: nextPhase,
            isPointerLocked,
            settings: {
              ...prev.session.settings,
              sessionLengthMinutes: minutes,
            },
            timer: {
              targetRealSeconds: nextTarget,
              elapsedRealSeconds: nextElapsed,
              remainingRealSeconds: isIdleOrComplete ? nextTarget : nextRemaining,
            },
          },
        };
      });
    },
    setMouseSensitivity(sensitivity) {
      const clamped = clampMouseSensitivity(sensitivity);
      setState((prev) => ({
        ...prev,
        session: {
          ...prev.session,
          settings: {
            ...prev.session.settings,
            mouseSensitivity: clamped,
          },
        },
      }));
    },
    setFocusedInteractable(interactableId, prompt) {
      setState((prev) => {
        if (
          prev.session.interaction.focusedInteractableId === interactableId &&
          prev.session.interaction.prompt === prompt
        ) {
          return prev;
        }

        return {
          ...prev,
          session: {
            ...prev.session,
            interaction: {
              focusedInteractableId: interactableId,
              prompt,
            },
          },
        };
      });
    },
    interact() {
      setState((prev) => {
        if (prev.session.phase !== "playing") return prev;
        if (prev.session.interaction.focusedInteractableId === null) return prev;
        if (prev.session.ritual.loylyCooldownRemainingSeconds > 0) return prev;

        const boostMultiplier = prev.session.interaction.focusedInteractableId === "stones" ? 0.8 : 1;

        return {
          ...prev,
          session: {
            ...prev.session,
            ritual: {
              ...prev.session.ritual,
              temperatureC: Math.min(115, prev.session.ritual.temperatureC + LOYLY_TEMPERATURE_BOOST_C * boostMultiplier),
              humidityPercent: Math.min(
                100,
                prev.session.ritual.humidityPercent + LOYLY_HUMIDITY_BOOST_PERCENT * boostMultiplier,
              ),
              loylyCooldownRemainingSeconds: prev.session.ritual.loylyCooldownSeconds,
              lastLoylyAtMs: Date.now(),
            },
          },
        };
      });
    },
    tickSession(deltaSeconds) {
      if (deltaSeconds <= 0) return;

      setState((prev) => {
        if (prev.session.phase !== "playing") return prev;

        const elapsedRealSeconds = prev.session.timer.elapsedRealSeconds + deltaSeconds;
        const remainingRealSeconds = Math.max(0, prev.session.timer.targetRealSeconds - elapsedRealSeconds);
        const isComplete = remainingRealSeconds <= 0;

        const temperatureRelaxRate = Math.min(1, TEMPERATURE_RELAX_PER_SECOND * deltaSeconds);
        const humidityRelaxRate = Math.min(1, HUMIDITY_RELAX_PER_SECOND * deltaSeconds);
        const temperatureC =
          prev.session.ritual.temperatureC + (BASE_TEMPERATURE_C - prev.session.ritual.temperatureC) * temperatureRelaxRate;
        const humidityPercent =
          prev.session.ritual.humidityPercent +
          (BASE_HUMIDITY_PERCENT - prev.session.ritual.humidityPercent) * humidityRelaxRate;
        const inComfort =
          temperatureC >= prev.session.ritual.comfortBandMinC && temperatureC <= prev.session.ritual.comfortBandMaxC;

        return {
          ...prev,
          input: isComplete ? { ...emptyInput } : prev.input,
          session: {
            ...prev.session,
            phase: isComplete ? "complete" : prev.session.phase,
            isPointerLocked: isComplete ? false : prev.session.isPointerLocked,
            timer: {
              ...prev.session.timer,
              elapsedRealSeconds,
              remainingRealSeconds,
            },
            ritual: {
              ...prev.session.ritual,
              temperatureC,
              humidityPercent,
              timeInComfortSeconds: prev.session.ritual.timeInComfortSeconds + (inComfort ? deltaSeconds : 0),
              loylyCooldownRemainingSeconds: Math.max(
                0,
                prev.session.ritual.loylyCooldownRemainingSeconds - deltaSeconds,
              ),
            },
            interaction: isComplete
              ? {
                  focusedInteractableId: null,
                  prompt: null,
                }
              : prev.session.interaction,
          },
        };
      });
    },
    resetSession() {
      actions.restartSession();
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
