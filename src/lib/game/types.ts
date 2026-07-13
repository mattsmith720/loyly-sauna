export type SessionPhase = "idle" | "playing" | "paused" | "complete";
export type SessionLengthMinutes = 5 | 10 | 15;
export type InteractableId = "bucket" | "stones";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface EulerAngles {
  yaw: number;
  pitch: number;
}

export interface RoomDimensions {
  width: number;
  depth: number;
  height: number;
}

export interface MovementInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export type MovementKey = keyof MovementInput;

export interface PlayerState {
  position: Vec3;
  view: EulerAngles;
  eyeHeight: number;
  radius: number;
  speedMetersPerSecond: number;
}

export interface SessionState {
  phase: SessionPhase;
  isPointerLocked: boolean;
  startedAtMs: number | null;
  settings: SessionSettings;
  timer: SessionTimerState;
  ritual: RitualState;
  interaction: InteractionState;
}

export interface SessionSettings {
  sessionLengthMinutes: SessionLengthMinutes;
  mouseSensitivity: number;
}

export interface SessionTimerState {
  targetRealSeconds: number;
  elapsedRealSeconds: number;
  remainingRealSeconds: number;
}

export interface RitualState {
  temperatureC: number;
  humidityPercent: number;
  comfortBandMinC: number;
  comfortBandMaxC: number;
  timeInComfortSeconds: number;
  loylyCooldownSeconds: number;
  loylyCooldownRemainingSeconds: number;
  lastLoylyAtMs: number | null;
}

export interface InteractionState {
  focusedInteractableId: InteractableId | null;
  prompt: string | null;
}

export interface InteractableDefinition {
  id: InteractableId;
  label: string;
  prompt: string;
  position: Vec3;
  maxDistance: number;
  lookDotThreshold: number;
}

export interface GameState {
  player: PlayerState;
  input: MovementInput;
  session: SessionState;
}
