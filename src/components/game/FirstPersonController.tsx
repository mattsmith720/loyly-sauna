"use client";

import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, type MutableRefObject } from "react";
import { Vector3 } from "three";
import type { PointerLockControls as PointerLockControlsImpl } from "three-stdlib";
import { clampPlayerPositionToRoom } from "@/lib/game/collision";
import { gameStore } from "@/lib/game/store";
import type { MovementKey } from "@/lib/game/types";

interface FirstPersonControllerProps {
  controlsRef: MutableRefObject<PointerLockControlsImpl | null>;
}

const up = new Vector3(0, 1, 0);
const forward = new Vector3();
const right = new Vector3();
const movement = new Vector3();

const keyToMovementMap = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
} as const satisfies Record<string, MovementKey>;

export function FirstPersonController({ controlsRef }: FirstPersonControllerProps) {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const { player } = gameStore.getState();
    camera.position.set(player.position.x, player.eyeHeight, player.position.z);
  }, [camera]);

  useEffect(() => {
    const handleKeyboardInput = (event: KeyboardEvent, pressed: boolean) => {
      if (!(event.code in keyToMovementMap)) return;
      const movementKey = keyToMovementMap[event.code as keyof typeof keyToMovementMap];

      event.preventDefault();
      gameStore.actions.setMovementKey(movementKey, pressed);
    };

    const handleKeyDown = (event: KeyboardEvent) => handleKeyboardInput(event, true);
    const handleKeyUp = (event: KeyboardEvent) => handleKeyboardInput(event, false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const state = gameStore.getState();
    const { player, input, session } = state;

    if (!session.isPointerLocked) return;

    gameStore.actions.setPlayerView(camera.rotation.y, camera.rotation.x);

    const moveForward = Number(input.forward) - Number(input.backward);
    const moveRight = Number(input.right) - Number(input.left);

    if (moveForward === 0 && moveRight === 0) return;

    camera.getWorldDirection(forward);
    forward.y = 0;

    if (forward.lengthSq() === 0) return;

    forward.normalize();
    right.crossVectors(forward, up).normalize();

    movement.copy(forward).multiplyScalar(moveForward).addScaledVector(right, moveRight);

    if (movement.lengthSq() > 1) {
      movement.normalize();
    }

    const distance = player.speedMetersPerSecond * delta;
    const nextPosition = clampPlayerPositionToRoom({
      x: player.position.x + movement.x * distance,
      y: player.eyeHeight,
      z: player.position.z + movement.z * distance,
    });

    camera.position.set(nextPosition.x, player.eyeHeight, nextPosition.z);
    gameStore.actions.setPlayerPosition(nextPosition);
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      onLock={() => gameStore.actions.setPointerLocked(true)}
      onUnlock={() => gameStore.actions.setPointerLocked(false)}
    />
  );
}
