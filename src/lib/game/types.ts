export type SessionPhase = "start" | "playing" | "paused" | "complete";

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
  completedAtMs: number | null;
}

export interface SaunaState {
  temperatureC: number;
  steamLevel: number;
  hasWaterInLadle: boolean;
  pourCooldownRemainingSec: number;
  elapsedSec: number;
  totalDurationSec: number;
  timeInComfortRangeSec: number;
  pourCount: number;
}

export interface InteractionState {
  focusedId: InteractableId | null;
  prompt: string | null;
  isActionAvailable: boolean;
}

export interface GameSettingsState {
  sessionLengthMinutes: SessionLengthMinutes;
  mouseSensitivity: number;
}

export interface GameState {
  player: PlayerState;
  input: MovementInput;
  session: SessionState;
  sauna: SaunaState;
  interaction: InteractionState;
  settings: GameSettingsState;
}
