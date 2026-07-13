"use client";

import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, type MutableRefObject } from "react";
import { Vector3 } from "three";
import type { PointerLockControls as PointerLockControlsImpl } from "three-stdlib";
import { useGameStore } from "@/components/game/useGameStore";
import { clampPlayerPositionToRoom } from "@/lib/game/collision";
import { INTERACTABLES } from "@/lib/game/constants";
import { gameStore } from "@/lib/game/store";
import type { InteractableId, MovementKey } from "@/lib/game/types";

interface FirstPersonControllerProps {
  controlsRef: MutableRefObject<PointerLockControlsImpl | null>;
}

const up = new Vector3(0, 1, 0);
const forward = new Vector3();
const right = new Vector3();
const movement = new Vector3();
const lookDirection = new Vector3();
const toTarget = new Vector3();

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

function getFocusedInteractableId(cameraPosition: Vector3, direction: Vector3): InteractableId | null {
  let bestMatch: { id: InteractableId; score: number } | null = null;

  for (const interactable of Object.values(INTERACTABLES)) {
    toTarget.set(interactable.position.x, interactable.position.y, interactable.position.z).sub(cameraPosition);
    const distance = toTarget.length();
    if (distance > interactable.interactionDistanceMeters || distance <= 0) {
      continue;
    }

    toTarget.divideScalar(distance);
    const alignment = toTarget.dot(direction);
    if (alignment < interactable.lookDotThreshold) {
      continue;
    }

    const score = alignment * 2 - distance * 0.35;
    if (bestMatch === null || score > bestMatch.score) {
      bestMatch = { id: interactable.id, score };
    }
  }

  return bestMatch?.id ?? null;
}

export function FirstPersonController({ controlsRef }: FirstPersonControllerProps) {
  const camera = useThree((state) => state.camera);
  const mouseSensitivity = useGameStore((state) => state.settings.mouseSensitivity);

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
    const handleInteraction = (event: KeyboardEvent) => {
      if (event.code !== "KeyE" || event.repeat) {
        return;
      }

      const { session } = gameStore.getState();
      if (session.phase !== "playing" || !session.isPointerLocked) {
        return;
      }

      event.preventDefault();
      gameStore.actions.tryInteract();
    };

    const handleKeyDown = (event: KeyboardEvent) => handleKeyboardInput(event, true);
    const handleKeyUp = (event: KeyboardEvent) => handleKeyboardInput(event, false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  useFrame((_, delta) => {
    const state = gameStore.getState();
    const { player, session } = state;

    if (
      Math.abs(camera.position.x - player.position.x) > 0.0001 ||
      Math.abs(camera.position.y - player.eyeHeight) > 0.0001 ||
      Math.abs(camera.position.z - player.position.z) > 0.0001
    ) {
      camera.position.set(player.position.x, player.eyeHeight, player.position.z);
    }

    if (!session.isPointerLocked) {
      const yawDiff = Math.abs(camera.rotation.y - player.view.yaw);
      const pitchDiff = Math.abs(camera.rotation.x - player.view.pitch);
      if (yawDiff > 0.0001 || pitchDiff > 0.0001) {
        camera.rotation.set(player.view.pitch, player.view.yaw, 0);
      }
    }

    if (session.phase !== "playing") {
      if (state.interaction.focusedId !== null) {
        gameStore.actions.setFocusedInteractable(null);
      }
      return;
    }

    gameStore.actions.tickSimulation(delta);

    const liveState = gameStore.getState();
    if (liveState.session.phase !== "playing" || !liveState.session.isPointerLocked) {
      if (liveState.interaction.focusedId !== null) {
        gameStore.actions.setFocusedInteractable(null);
      }
      return;
    }

    const { input: liveInput, player: livePlayer } = liveState;

    gameStore.actions.setPlayerView(camera.rotation.y, camera.rotation.x);
    camera.getWorldDirection(lookDirection);
    lookDirection.normalize();
    gameStore.actions.setFocusedInteractable(getFocusedInteractableId(camera.position, lookDirection));

    const moveForward = Number(liveInput.forward) - Number(liveInput.backward);
    const moveRight = Number(liveInput.right) - Number(liveInput.left);

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

    const distance = livePlayer.speedMetersPerSecond * delta;
    const nextPosition = clampPlayerPositionToRoom({
      x: livePlayer.position.x + movement.x * distance,
      y: livePlayer.eyeHeight,
      z: livePlayer.position.z + movement.z * distance,
    });

    camera.position.set(nextPosition.x, livePlayer.eyeHeight, nextPosition.z);
    gameStore.actions.setPlayerPosition(nextPosition);
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      pointerSpeed={mouseSensitivity}
      onLock={() => gameStore.actions.setPointerLocked(true)}
      onUnlock={() => gameStore.actions.setPointerLocked(false)}
    />
  );
}
