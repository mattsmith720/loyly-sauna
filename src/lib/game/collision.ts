import { PLAYER_EYE_HEIGHT, PLAYER_RADIUS, ROOM_DIMENSIONS } from "@/lib/game/constants";
import type { RoomDimensions, Vec3 } from "@/lib/game/types";

export interface RoomBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export function getRoomBounds(
  room: RoomDimensions = ROOM_DIMENSIONS,
  radius: number = PLAYER_RADIUS,
): RoomBounds {
  const halfWidth = room.width / 2;
  const halfDepth = room.depth / 2;

  return {
    minX: -halfWidth + radius,
    maxX: halfWidth - radius,
    minZ: -halfDepth + radius,
    maxZ: halfDepth - radius,
  };
}

export function clampPlayerPositionToRoom(
  position: Vec3,
  room: RoomDimensions = ROOM_DIMENSIONS,
  radius: number = PLAYER_RADIUS,
  eyeHeight: number = PLAYER_EYE_HEIGHT,
): Vec3 {
  const bounds = getRoomBounds(room, radius);

  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, position.x)),
    y: eyeHeight,
    z: Math.min(bounds.maxZ, Math.max(bounds.minZ, position.z)),
  };
}
