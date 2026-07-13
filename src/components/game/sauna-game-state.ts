export type GamePhase = "start" | "playing" | "ended";
export type PlayerMode = "walking" | "seated" | "outside";
export type SaunaType = "electric" | "woodfired";

export type InteractableId =
  | "ladle"
  | "bucket"
  | "stones"
  | "bench"
  | "door"
  | "heater"
  | "lights"
  | "firebox"
  | "woodpile";

export const ROUND_SECONDS = 12 * 60;
export const AMBIENT_OUTSIDE = 22;
export const FOREST_OUTSIDE = 12;
export const HEATER_MIN = 70;
export const HEATER_MAX = 90;
export const HEATER_DEFAULT = 82;
export const START_TEMP = 38;
export const WOOD_START_TEMP = 18;
export const FIRE_FUEL_MAX = 100;

export type SaunaGameState = {
  phase: GamePhase;
  saunaType: SaunaType;
  temperature: number;
  humidity: number;
  heaterOn: boolean;
  heaterTarget: number;
  sessionSeconds: number;
  playerMode: PlayerMode;
  holdingLadle: boolean;
  ladleHasWater: boolean;
  holdingWood: boolean;
  lightsOn: boolean;
  fireLit: boolean;
  fireFuel: number;
  steamBurstId: number;
  focusedInteractable: InteractableId | null;
  doorOpen: boolean;
  pointerLocked: boolean;
  reducedMotion: boolean;
};

export type SaunaGameAction =
  | { type: "start"; saunaType?: SaunaType }
  | { type: "end" }
  | { type: "tick"; delta: number }
  | { type: "set_focus"; id: InteractableId | null }
  | { type: "interact" }
  | { type: "toggle_heater" }
  | { type: "adjust_heater"; delta: number }
  | { type: "toggle_lights" }
  | { type: "set_pointer_locked"; locked: boolean }
  | { type: "set_reduced_motion"; reduced: boolean };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function outdoorAmbient(state: SaunaGameState) {
  return state.saunaType === "woodfired" ? FOREST_OUTSIDE : AMBIENT_OUTSIDE;
}

function fireHeatTarget(fuel: number) {
  if (fuel <= 0) return FOREST_OUTSIDE;
  return HEATER_MIN + (HEATER_MAX - HEATER_MIN) * (fuel / FIRE_FUEL_MAX);
}

function promptFor(state: SaunaGameState): string | null {
  if (state.phase !== "playing") return null;
  if (state.playerMode === "outside") {
    return state.doorOpen ? "Step inside" : "Open the door";
  }
  if (state.focusedInteractable === "lights") {
    return state.lightsOn ? "Turn lights off" : "Turn lights on";
  }
  if (state.focusedInteractable === "woodpile") {
    return state.holdingWood ? "Set down wood" : "Pick up firewood";
  }
  if (state.focusedInteractable === "firebox") {
    if (state.holdingLadle) return "Set down the ladle first";
    if (!state.fireLit && state.holdingWood) return "Light the fire";
    if (!state.fireLit) return "Get wood, then light the fire";
    if (state.holdingWood) return "Feed the fire";
    return state.fireFuel < 25 ? "Fire is low · get wood" : "Fire is burning";
  }
  if (state.focusedInteractable === "ladle") {
    if (state.holdingWood) return "Set down wood first";
    return state.holdingLadle ? "Set down ladle" : "Pick up ladle";
  }
  if (state.focusedInteractable === "bucket") {
    if (!state.holdingLadle) return "Pick up the ladle first";
    return state.ladleHasWater ? "Ladle is full" : "Scoop water";
  }
  if (state.focusedInteractable === "stones") {
    if (!state.holdingLadle) return "Pick up the ladle";
    if (state.saunaType === "woodfired" && !state.fireLit) return "Light the fire first";
    if (!state.heaterOn && state.saunaType === "electric") return "Turn heater on first";
    return state.ladleHasWater ? "Throw löyly" : "Fill the ladle first";
  }
  if (state.focusedInteractable === "bench") {
    return state.playerMode === "seated" ? "Stand up" : "Sit on bench";
  }
  if (state.focusedInteractable === "door") {
    if (!state.doorOpen) return "Open door";
    return "Step outside";
  }
  if (state.focusedInteractable === "heater") {
    if (state.saunaType === "woodfired") return null;
    if (!state.heaterOn) return "Turn heater on";
    return `Heater ${Math.round(state.heaterTarget)}° · toggle`;
  }
  return null;
}

export function getInteractionPrompt(state: SaunaGameState): string | null {
  return promptFor(state);
}

export function saunaGameReducer(state: SaunaGameState, action: SaunaGameAction): SaunaGameState {
  switch (action.type) {
    case "start": {
      const saunaType = action.saunaType ?? state.saunaType ?? "electric";
      const woodfired = saunaType === "woodfired";
      return {
        ...state,
        saunaType,
        phase: "playing",
        sessionSeconds: 0,
        temperature: woodfired ? WOOD_START_TEMP : START_TEMP,
        humidity: woodfired ? 28 : 18,
        heaterOn: !woodfired,
        heaterTarget: HEATER_DEFAULT,
        playerMode: "walking",
        doorOpen: false,
        holdingLadle: false,
        ladleHasWater: false,
        holdingWood: false,
        lightsOn: true,
        fireLit: false,
        fireFuel: 0,
        focusedInteractable: null,
      };
    }
    case "end":
      return { ...state, phase: "ended" };
    case "set_focus":
      return { ...state, focusedInteractable: action.id };
    case "set_pointer_locked":
      return { ...state, pointerLocked: action.locked };
    case "set_reduced_motion":
      return { ...state, reducedMotion: action.reduced };
    case "toggle_heater":
      if (state.saunaType === "woodfired") return state;
      return { ...state, heaterOn: !state.heaterOn };
    case "adjust_heater":
      if (state.saunaType === "woodfired") return state;
      return {
        ...state,
        heaterOn: true,
        heaterTarget: clamp(state.heaterTarget + action.delta, HEATER_MIN, HEATER_MAX),
      };
    case "toggle_lights":
      return { ...state, lightsOn: !state.lightsOn };
    case "interact": {
      const id = state.focusedInteractable;
      if (!id || state.phase !== "playing") return state;

      if (id === "lights") {
        return { ...state, lightsOn: !state.lightsOn };
      }
      if (id === "woodpile") {
        if (state.holdingLadle) return state;
        return { ...state, holdingWood: !state.holdingWood };
      }
      if (id === "firebox") {
        if (state.holdingLadle) return state;
        if (state.holdingWood) {
          const lit = true;
          const fuel = clamp(state.fireFuel + (state.fireLit ? 28 : 45), 0, FIRE_FUEL_MAX);
          return {
            ...state,
            holdingWood: false,
            fireLit: lit,
            fireFuel: fuel,
            heaterOn: true,
            heaterTarget: fireHeatTarget(fuel),
          };
        }
        return state;
      }
      if (id === "ladle") {
        if (state.holdingWood) return state;
        return {
          ...state,
          holdingLadle: !state.holdingLadle,
          ladleHasWater: state.holdingLadle ? false : state.ladleHasWater,
        };
      }
      if (id === "bucket" && state.holdingLadle && !state.ladleHasWater) {
        return { ...state, ladleHasWater: true };
      }
      if (id === "stones" && state.holdingLadle && state.ladleHasWater) {
        const hotEnough =
          state.saunaType === "woodfired" ? state.fireLit && state.fireFuel > 5 : state.heaterOn;
        if (!hotEnough) return state;
        return {
          ...state,
          ladleHasWater: false,
          humidity: clamp(state.humidity + 22, 0, 100),
          temperature: clamp(state.temperature + 6, outdoorAmbient(state), HEATER_MAX + 8),
          steamBurstId: state.steamBurstId + 1,
        };
      }
      if (id === "bench") {
        const seated = state.playerMode !== "seated";
        return { ...state, playerMode: seated ? "seated" : "walking" };
      }
      if (id === "door") {
        if (!state.doorOpen) {
          return { ...state, doorOpen: true };
        }
        if (state.playerMode === "walking") {
          return { ...state, playerMode: "outside" };
        }
        if (state.playerMode === "outside") {
          return { ...state, playerMode: "walking", doorOpen: false };
        }
        return state;
      }
      if (id === "heater" && state.saunaType === "electric") {
        if (!state.heaterOn) {
          return { ...state, heaterOn: true, heaterTarget: HEATER_MIN };
        }
        if (state.heaterTarget < HEATER_DEFAULT) {
          return { ...state, heaterTarget: HEATER_DEFAULT };
        }
        if (state.heaterTarget < HEATER_MAX) {
          return { ...state, heaterTarget: HEATER_MAX };
        }
        return { ...state, heaterOn: false, heaterTarget: HEATER_DEFAULT };
      }
      return state;
    }
    case "tick": {
      if (state.phase !== "playing") return state;

      const delta = action.delta;
      let temperature = state.temperature;
      let humidity = state.humidity;
      let sessionSeconds = state.sessionSeconds;
      let fireFuel = state.fireFuel;
      let fireLit = state.fireLit;
      let heaterOn = state.heaterOn;
      let heaterTarget = state.heaterTarget;
      const outdoor = outdoorAmbient(state);

      if (state.saunaType === "woodfired" && fireLit) {
        fireFuel = clamp(fireFuel - delta * 1.8, 0, FIRE_FUEL_MAX);
        if (fireFuel <= 0) {
          fireLit = false;
          heaterOn = false;
        } else {
          heaterOn = true;
          heaterTarget = fireHeatTarget(fireFuel);
        }
      }

      if (state.playerMode === "outside") {
        temperature += (outdoor - temperature) * delta * 0.35;
        humidity += ((state.saunaType === "woodfired" ? 55 : 35) - humidity) * delta * 0.2;
      } else if (heaterOn) {
        const target = heaterTarget + (state.playerMode === "seated" ? 2 : 0);
        const rate = state.saunaType === "woodfired" ? 0.09 : 0.12;
        temperature += (target - temperature) * delta * rate;
        humidity += (42 - humidity) * delta * 0.03;
      } else {
        temperature += (outdoor + 6 - temperature) * delta * 0.08;
        humidity += (30 - humidity) * delta * 0.05;
      }

      humidity = clamp(humidity - delta * 1.2, 12, 100);
      temperature = clamp(temperature, outdoor, HEATER_MAX + 10);

      if (state.playerMode !== "outside") {
        sessionSeconds += delta;
      }

      return {
        ...state,
        temperature,
        humidity,
        sessionSeconds,
        fireFuel,
        fireLit,
        heaterOn,
        heaterTarget,
        phase: sessionSeconds >= ROUND_SECONDS ? "ended" : state.phase,
      };
    }
    default:
      return state;
  }
}

export const initialSaunaGameState: SaunaGameState = {
  phase: "start",
  saunaType: "electric",
  temperature: START_TEMP,
  humidity: 18,
  heaterOn: false,
  heaterTarget: HEATER_DEFAULT,
  sessionSeconds: 0,
  playerMode: "walking",
  holdingLadle: false,
  ladleHasWater: false,
  holdingWood: false,
  lightsOn: true,
  fireLit: false,
  fireFuel: 0,
  steamBurstId: 0,
  focusedInteractable: null,
  doorOpen: false,
  pointerLocked: false,
  reducedMotion: false,
};

export function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatTemp(celsius: number) {
  return `${Math.round(celsius)}°C`;
}

export function formatHumidity(value: number) {
  return `${Math.round(value)}%`;
}
