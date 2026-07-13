import {
  BASE_TEMPERATURE_C,
  COMFORTABLE_TEMPERATURE_MAX_C,
  COMFORTABLE_TEMPERATURE_MIN_C,
  DEFAULT_AUDIO_MUTED,
  DEFAULT_AUDIO_VOLUME,
  DEFAULT_MOUSE_SENSITIVITY,
  DEFAULT_SESSION_LENGTH_MINUTES,
  LOYLY_COOLDOWN_SECONDS,
  LOYLY_STEAM_BOOST,
  LOYLY_TEMPERATURE_BOOST_C,
  MAX_MOUSE_SENSITIVITY,
  MAX_TEMPERATURE_C,
  MIN_MOUSE_SENSITIVITY,
  PLAYER_EYE_HEIGHT,
  PLAYER_RADIUS,
  PLAYER_SPEED_MPS,
  PLAYER_START_POSITION,
  getSessionDurationSeconds,
  SESSION_LENGTH_OPTIONS,
  STEAM_DECAY_PER_SECOND,
  STEAM_HEAT_BONUS_PER_SECOND,
  TEMPERATURE_DECAY_PER_SECOND,
} from "@/lib/game/constants";
import type {
  GameSettingsState,
  GameState,
  InteractionState,
  MovementInput,
  MovementKey,
  SessionLengthMinutes,
  SessionPhase,
  SaunaState,
  Vec3,
} from "@/lib/game/types";

type StateListener = () => void;

export interface GameStoreActions {
  setMovementKey: (key: MovementKey, pressed: boolean) => void;
  setPointerLocked: (isLocked: boolean) => void;
  setPlayerPosition: (position: Vec3) => void;
  setPlayerView: (yaw: number, pitch: number) => void;
  setSessionLengthMinutes: (minutes: SessionLengthMinutes) => void;
  setMouseSensitivity: (mouseSensitivity: number) => void;
  setAudioMuted: (audioMuted: boolean) => void;
  toggleAudioMuted: () => void;
  setAudioVolume: (audioVolume: number) => void;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  restartToStart: () => void;
  setFocusedInteractable: (focusedId: InteractionState["focusedId"]) => void;
  tryInteract: () => void;
  tickSimulation: (deltaSeconds: number) => void;
}

export interface GameStore {
  getState: () => GameState;
  subscribe: (listener: StateListener) => () => void;
  actions: GameStoreActions;
}

function createEmptyInput(): MovementInput {
  return {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };
}

function createInitialInteraction(): InteractionState {
  return {
    focusedId: null,
    prompt: null,
    isActionAvailable: false,
  };
}

function createInitialSaunaState(minutes: SessionLengthMinutes): SaunaState {
  return {
    temperatureC: BASE_TEMPERATURE_C,
    steamLevel: 0,
    hasWaterInLadle: false,
    pourCooldownRemainingSec: 0,
    elapsedSec: 0,
    totalDurationSec: getSessionDurationSeconds(minutes),
    timeInComfortRangeSec: 0,
    pourCount: 0,
  };
}

function createInitialSettings(): GameSettingsState {
  return {
    sessionLengthMinutes: DEFAULT_SESSION_LENGTH_MINUTES,
    mouseSensitivity: DEFAULT_MOUSE_SENSITIVITY,
    audioMuted: DEFAULT_AUDIO_MUTED,
    audioVolume: DEFAULT_AUDIO_VOLUME,
  };
}

function isComfortableTemperature(temperatureC: number): boolean {
  return temperatureC >= COMFORTABLE_TEMPERATURE_MIN_C && temperatureC <= COMFORTABLE_TEMPERATURE_MAX_C;
}

function clearInput(prevInput: MovementInput): MovementInput {
  if (!prevInput.forward && !prevInput.backward && !prevInput.left && !prevInput.right) {
    return prevInput;
  }

  return createEmptyInput();
}

function buildInteractionState(
  focusedId: InteractionState["focusedId"],
  hasWaterInLadle: boolean,
  pourCooldownRemainingSec: number,
): InteractionState {
  if (focusedId === null) {
    return createInitialInteraction();
  }

  if (focusedId === "bucket") {
    return {
      focusedId,
      prompt: hasWaterInLadle ? "Ladle is ready. Look at the stones." : "Press E to fill ladle",
      isActionAvailable: !hasWaterInLadle,
    };
  }

  if (!hasWaterInLadle) {
    return {
      focusedId,
      prompt: "Fill the ladle at the bucket first",
      isActionAvailable: false,
    };
  }

  if (pourCooldownRemainingSec > 0) {
    return {
      focusedId,
      prompt: `Stones cooling down (${pourCooldownRemainingSec.toFixed(1)}s)`,
      isActionAvailable: false,
    };
  }

  return {
    focusedId,
    prompt: "Press E to pour loyly",
    isActionAvailable: true,
  };
}

function createInitialState(): GameState {
  const settings = createInitialSettings();

  return {
    player: {
      position: { ...PLAYER_START_POSITION },
      view: { yaw: 0, pitch: 0 },
      eyeHeight: PLAYER_EYE_HEIGHT,
      radius: PLAYER_RADIUS,
      speedMetersPerSecond: PLAYER_SPEED_MPS,
    },
    input: createEmptyInput(),
    session: {
      phase: "start",
      isPointerLocked: false,
      startedAtMs: null,
      completedAtMs: null,
    },
    sauna: createInitialSaunaState(settings.sessionLengthMinutes),
    interaction: createInitialInteraction(),
    settings,
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
      setState((prev) => {
        if (prev.input[key] === pressed) {
          return prev;
        }

        return {
          ...prev,
          input: {
            ...prev.input,
            [key]: pressed,
          },
        };
      });
    },
    setPointerLocked(isLocked) {
      setState((prev) => {
        if (prev.session.phase !== "playing") {
          if (!prev.session.isPointerLocked) {
            return prev;
          }

          return {
            ...prev,
            input: clearInput(prev.input),
            session: {
              ...prev.session,
              isPointerLocked: false,
            },
          };
        }

        const nextPhase: SessionPhase = isLocked ? "playing" : "paused";
        const nextPointerLocked = isLocked;

        if (prev.session.isPointerLocked === nextPointerLocked && prev.session.phase === nextPhase) {
          return prev;
        }

        return {
          ...prev,
          input: nextPointerLocked ? prev.input : clearInput(prev.input),
          session: {
            ...prev.session,
            phase: nextPhase,
            isPointerLocked: nextPointerLocked,
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
    setSessionLengthMinutes(minutes) {
      if (!SESSION_LENGTH_OPTIONS.includes(minutes)) {
        return;
      }

      setState((prev) => {
        if (prev.settings.sessionLengthMinutes === minutes) {
          return prev;
        }

        const totalDurationSec = getSessionDurationSeconds(minutes);
        const elapsedSec = Math.min(prev.sauna.elapsedSec, totalDurationSec);
        const completed = prev.session.phase !== "start" && elapsedSec >= totalDurationSec;

        return {
          ...prev,
          input: completed ? clearInput(prev.input) : prev.input,
          settings: {
            ...prev.settings,
            sessionLengthMinutes: minutes,
          },
          session: completed
            ? {
                ...prev.session,
                phase: "complete",
                isPointerLocked: false,
                completedAtMs: Date.now(),
              }
            : prev.session,
          sauna: {
            ...prev.sauna,
            elapsedSec,
            totalDurationSec,
            timeInComfortRangeSec: Math.min(prev.sauna.timeInComfortRangeSec, elapsedSec),
          },
          interaction: completed ? createInitialInteraction() : prev.interaction,
        };
      });
    },
    setMouseSensitivity(mouseSensitivity) {
      setState((prev) => {
        const nextSensitivity = Math.max(MIN_MOUSE_SENSITIVITY, Math.min(MAX_MOUSE_SENSITIVITY, mouseSensitivity));
        if (nextSensitivity === prev.settings.mouseSensitivity) {
          return prev;
        }

        return {
          ...prev,
          settings: {
            ...prev.settings,
            mouseSensitivity: nextSensitivity,
          },
        };
      });
    },
    setAudioMuted(audioMuted) {
      setState((prev) => {
        if (prev.settings.audioMuted === audioMuted) {
          return prev;
        }

        return {
          ...prev,
          settings: {
            ...prev.settings,
            audioMuted,
          },
        };
      });
    },
    toggleAudioMuted() {
      setState((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          audioMuted: !prev.settings.audioMuted,
        },
      }));
    },
    setAudioVolume(audioVolume) {
      setState((prev) => {
        const nextVolume = Math.max(0, Math.min(1, audioVolume));
        if (nextVolume === prev.settings.audioVolume) {
          return prev;
        }

        return {
          ...prev,
          settings: {
            ...prev.settings,
            audioVolume: nextVolume,
            audioMuted: nextVolume === 0 ? prev.settings.audioMuted : false,
          },
        };
      });
    },
    startSession() {
      setState((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          position: { ...PLAYER_START_POSITION },
          view: { yaw: 0, pitch: 0 },
        },
        input: createEmptyInput(),
        session: {
          phase: "playing",
          isPointerLocked: false,
          startedAtMs: Date.now(),
          completedAtMs: null,
        },
        sauna: createInitialSaunaState(prev.settings.sessionLengthMinutes),
        interaction: createInitialInteraction(),
      }));
    },
    pauseSession() {
      setState((prev) => {
        if (prev.session.phase !== "playing") {
          return prev;
        }

        return {
          ...prev,
          input: clearInput(prev.input),
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
        if (prev.session.phase !== "paused") {
          return prev;
        }

        return {
          ...prev,
          session: {
            ...prev.session,
            phase: "playing",
          },
        };
      });
    },
    restartToStart() {
      setState((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          position: { ...PLAYER_START_POSITION },
          view: { yaw: 0, pitch: 0 },
        },
        input: createEmptyInput(),
        session: {
          phase: "start",
          isPointerLocked: false,
          startedAtMs: null,
          completedAtMs: null,
        },
        sauna: createInitialSaunaState(prev.settings.sessionLengthMinutes),
        interaction: createInitialInteraction(),
      }));
    },
    setFocusedInteractable(focusedId) {
      setState((prev) => {
        const interaction = buildInteractionState(
          focusedId,
          prev.sauna.hasWaterInLadle,
          prev.sauna.pourCooldownRemainingSec,
        );

        if (
          interaction.focusedId === prev.interaction.focusedId &&
          interaction.prompt === prev.interaction.prompt &&
          interaction.isActionAvailable === prev.interaction.isActionAvailable
        ) {
          return prev;
        }

        return {
          ...prev,
          interaction,
        };
      });
    },
    tryInteract() {
      setState((prev) => {
        if (prev.session.phase !== "playing") {
          return prev;
        }

        if (prev.interaction.focusedId === "bucket") {
          if (prev.sauna.hasWaterInLadle) {
            return prev;
          }

          const sauna: SaunaState = {
            ...prev.sauna,
            hasWaterInLadle: true,
          };

          return {
            ...prev,
            sauna,
            interaction: buildInteractionState(
              prev.interaction.focusedId,
              sauna.hasWaterInLadle,
              sauna.pourCooldownRemainingSec,
            ),
          };
        }

        if (
          prev.interaction.focusedId === "stones" &&
          prev.sauna.hasWaterInLadle &&
          prev.sauna.pourCooldownRemainingSec <= 0
        ) {
          const sauna: SaunaState = {
            ...prev.sauna,
            temperatureC: Math.min(MAX_TEMPERATURE_C, prev.sauna.temperatureC + LOYLY_TEMPERATURE_BOOST_C),
            steamLevel: Math.min(1, prev.sauna.steamLevel + LOYLY_STEAM_BOOST),
            hasWaterInLadle: false,
            pourCooldownRemainingSec: LOYLY_COOLDOWN_SECONDS,
            pourCount: prev.sauna.pourCount + 1,
          };

          return {
            ...prev,
            sauna,
            interaction: buildInteractionState(
              prev.interaction.focusedId,
              sauna.hasWaterInLadle,
              sauna.pourCooldownRemainingSec,
            ),
          };
        }

        return prev;
      });
    },
    tickSimulation(deltaSeconds) {
      if (deltaSeconds <= 0) {
        return;
      }

      setState((prev) => {
        if (prev.session.phase !== "playing" || !prev.session.isPointerLocked) {
          return prev;
        }

        const remaining = Math.max(0, prev.sauna.totalDurationSec - prev.sauna.elapsedSec);
        if (remaining <= 0) {
          return {
            ...prev,
            input: clearInput(prev.input),
            session: {
              ...prev.session,
              phase: "complete",
              isPointerLocked: false,
              completedAtMs: Date.now(),
            },
            interaction: createInitialInteraction(),
          };
        }

        const step = Math.min(deltaSeconds, remaining);
        const pourCooldownRemainingSec = Math.max(0, prev.sauna.pourCooldownRemainingSec - step);
        const steamLevel = Math.max(0, prev.sauna.steamLevel - STEAM_DECAY_PER_SECOND * step);
        const cooledTemperature =
          prev.sauna.temperatureC + (BASE_TEMPERATURE_C - prev.sauna.temperatureC) * TEMPERATURE_DECAY_PER_SECOND * step;
        const temperatureC = Math.max(
          BASE_TEMPERATURE_C,
          Math.min(MAX_TEMPERATURE_C, cooledTemperature + steamLevel * STEAM_HEAT_BONUS_PER_SECOND * step),
        );
        const elapsedSec = prev.sauna.elapsedSec + step;
        const timeInComfortRangeSec =
          prev.sauna.timeInComfortRangeSec + (isComfortableTemperature(temperatureC) ? step : 0);
        const completed = elapsedSec >= prev.sauna.totalDurationSec;

        const sauna: SaunaState = {
          ...prev.sauna,
          temperatureC,
          steamLevel,
          pourCooldownRemainingSec,
          elapsedSec,
          timeInComfortRangeSec: Math.min(timeInComfortRangeSec, elapsedSec),
        };
        const interaction = buildInteractionState(
          prev.interaction.focusedId,
          sauna.hasWaterInLadle,
          sauna.pourCooldownRemainingSec,
        );

        if (!completed) {
          return {
            ...prev,
            sauna,
            interaction,
          };
        }

        return {
          ...prev,
          input: clearInput(prev.input),
          session: {
            ...prev.session,
            phase: "complete",
            isPointerLocked: false,
            completedAtMs: Date.now(),
          },
          sauna,
          interaction: createInitialInteraction(),
        };
      });
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
