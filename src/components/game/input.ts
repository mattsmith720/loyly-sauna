"use client";

/** Shared mutable input so HUD joystick and Player can talk without React re-renders each frame. */
export const moveInput = {
  forward: 0,
  right: 0,
  lookDeltaX: 0,
  lookDeltaY: 0,
};

export function consumeLookDelta() {
  const x = moveInput.lookDeltaX;
  const y = moveInput.lookDeltaY;
  moveInput.lookDeltaX = 0;
  moveInput.lookDeltaY = 0;
  return { x, y };
}
