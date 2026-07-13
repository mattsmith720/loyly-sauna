import type { RoomDimensions, Vec3 } from "@/lib/game/types";

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
