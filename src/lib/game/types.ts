export type SessionPhase = "idle" | "playing" | "paused";

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
}

export interface GameState {
  player: PlayerState;
  input: MovementInput;
  session: SessionState;
}
