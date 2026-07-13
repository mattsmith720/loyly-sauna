import type { InteractableId, RoomDimensions, SessionLengthMinutes, Vec3 } from "@/lib/game/types";

export const ROOM_DIMENSIONS: RoomDimensions = {
  width: 4,
  depth: 3,
  height: 2.5,
};

export const WALL_THICKNESS = 0.08;

export const PLAYER_EYE_HEIGHT = 1.6;
export const PLAYER_RADIUS = 0.25;
export const PLAYER_SPEED_MPS = 2.4;

export const PLAYER_START_POSITION: Vec3 = {
  x: 0,
  y: PLAYER_EYE_HEIGHT,
  z: 1,
};

export const SESSION_LENGTH_OPTIONS = [5, 10, 15] as const satisfies readonly SessionLengthMinutes[];
export const DEFAULT_SESSION_LENGTH_MINUTES: SessionLengthMinutes = 10;
export const GAME_MINUTE_TO_REAL_SECONDS = 6;

export const BASE_TEMPERATURE_C = 72;
export const MAX_TEMPERATURE_C = 115;
export const COMFORTABLE_TEMPERATURE_MIN_C = 78;
export const COMFORTABLE_TEMPERATURE_MAX_C = 92;

export const LOYLY_TEMPERATURE_BOOST_C = 17;
export const LOYLY_STEAM_BOOST = 0.62;
export const LOYLY_COOLDOWN_SECONDS = 3.4;
export const STEAM_DECAY_PER_SECOND = 0.28;
export const TEMPERATURE_DECAY_PER_SECOND = 0.18;
export const STEAM_HEAT_BONUS_PER_SECOND = 2.2;

export const DEFAULT_MOUSE_SENSITIVITY = 1;
export const MIN_MOUSE_SENSITIVITY = 0.3;
export const MAX_MOUSE_SENSITIVITY = 2;

export interface InteractableDefinition {
  id: InteractableId;
  position: Vec3;
  interactionDistanceMeters: number;
  lookDotThreshold: number;
}

export const INTERACTABLES: Record<InteractableId, InteractableDefinition> = {
  bucket: {
    id: "bucket",
    position: { x: 0.84, y: 0.55, z: -0.64 },
    interactionDistanceMeters: 2.1,
    lookDotThreshold: 0.82,
  },
  stones: {
    id: "stones",
    position: { x: 1.18, y: 0.9, z: -0.92 },
    interactionDistanceMeters: 2.2,
    lookDotThreshold: 0.82,
  },
};

export function getSessionDurationSeconds(minutes: SessionLengthMinutes): number {
  return minutes * GAME_MINUTE_TO_REAL_SECONDS;
}
