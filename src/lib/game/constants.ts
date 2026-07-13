import type {
  InteractableDefinition,
  SessionLengthMinutes,
  Vec3,
  RoomDimensions,
} from "@/lib/game/types";

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

export const SESSION_LENGTH_OPTIONS_MINUTES = [5, 10, 15] as const satisfies readonly SessionLengthMinutes[];
export const DEFAULT_SESSION_LENGTH_MINUTES: SessionLengthMinutes = 10;
export const REAL_SECONDS_PER_GAME_MINUTE = 6;

export const MOUSE_SENSITIVITY_MIN = 0.4;
export const MOUSE_SENSITIVITY_MAX = 1.8;
export const MOUSE_SENSITIVITY_STEP = 0.1;
export const DEFAULT_MOUSE_SENSITIVITY = 1;

export const BASE_TEMPERATURE_C = 72;
export const BASE_HUMIDITY_PERCENT = 20;
export const COMFORT_BAND_MIN_C = 78;
export const COMFORT_BAND_MAX_C = 86;

export const LOYLY_TEMPERATURE_BOOST_C = 14;
export const LOYLY_HUMIDITY_BOOST_PERCENT = 40;
export const LOYLY_COOLDOWN_SECONDS = 5;

export const TEMPERATURE_RELAX_PER_SECOND = 0.18;
export const HUMIDITY_RELAX_PER_SECOND = 0.34;

export const INTERACTABLES: readonly InteractableDefinition[] = [
  {
    id: "bucket",
    label: "Water bucket",
    prompt: "Press E to pour loyly",
    position: { x: 0.8, y: 0.42, z: -0.62 },
    maxDistance: 1.8,
    lookDotThreshold: 0.965,
  },
  {
    id: "stones",
    label: "Sauna stones",
    prompt: "Press E to splash the stones",
    position: { x: 1.18, y: 0.9, z: -0.92 },
    maxDistance: 2.3,
    lookDotThreshold: 0.96,
  },
];
