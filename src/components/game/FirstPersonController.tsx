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

export function FirstPersonController({ controlsRef }: FirstPersonControllerProps) {
  const camera = useThree((state) => state.camera);
  const mouseSensitivity = useGameStore((state) => state.session.settings.mouseSensitivity);
  const sessionPhase = useGameStore((state) => state.session.phase);

  useEffect(() => {
    const { player } = gameStore.getState();
    camera.position.set(player.position.x, player.eyeHeight, player.position.z);
  }, [camera]);

  useEffect(() => {
    const handleKeyboardInput = (event: KeyboardEvent, pressed: boolean) => {
      if (event.code === "Escape" && pressed) {
        const state = gameStore.getState();
        if (state.session.phase === "playing") {
          event.preventDefault();
          controlsRef.current?.unlock();
          gameStore.actions.pauseSession();
        }
        return;
      }

      if (event.code === "KeyE" && pressed) {
        const state = gameStore.getState();
        if (state.session.phase === "playing" && state.session.isPointerLocked) {
          event.preventDefault();
          gameStore.actions.interact();
        }
        return;
      }

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
  }, [controlsRef]);

  useFrame((_, delta) => {
    const state = gameStore.getState();
    const { player, input, session } = state;

    if (session.phase === "playing") {
      gameStore.actions.tickSession(delta);
    }

    if (session.phase !== "playing" || !session.isPointerLocked) {
      if (!session.isPointerLocked) {
        camera.position.set(player.position.x, player.eyeHeight, player.position.z);
        camera.rotation.y = player.view.yaw;
        camera.rotation.x = player.view.pitch;
      }
      if (session.interaction.focusedInteractableId !== null || session.interaction.prompt !== null) {
        gameStore.actions.setFocusedInteractable(null, null);
      }
      return;
    }

    gameStore.actions.setPlayerView(camera.rotation.y, camera.rotation.x);
    camera.getWorldDirection(lookDirection).normalize();

    let focusedInteractableId: InteractableId | null = null;
    let prompt: string | null = null;
    let bestScore = -Infinity;

    for (const interactable of INTERACTABLES) {
      toTarget.set(
        interactable.position.x - camera.position.x,
        interactable.position.y - camera.position.y,
        interactable.position.z - camera.position.z,
      );

      const distance = toTarget.length();
      if (distance > interactable.maxDistance) continue;

      toTarget.normalize();
      const lookDot = toTarget.dot(lookDirection);
      if (lookDot < interactable.lookDotThreshold) continue;

      const score = lookDot - distance * 0.08;
      if (score <= bestScore) continue;

      bestScore = score;
      focusedInteractableId = interactable.id;
      prompt =
        state.session.ritual.loylyCooldownRemainingSeconds > 0
          ? `Loyly cooling down ${state.session.ritual.loylyCooldownRemainingSeconds.toFixed(1)}s`
          : interactable.prompt;
    }

    gameStore.actions.setFocusedInteractable(focusedInteractableId, prompt);

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

  useEffect(() => {
    if ((sessionPhase === "idle" || sessionPhase === "complete") && controlsRef.current?.isLocked) {
      controlsRef.current.unlock();
    }
  }, [controlsRef, sessionPhase]);

  return (
    <PointerLockControls
      ref={controlsRef}
      pointerSpeed={mouseSensitivity}
      onLock={() => gameStore.actions.setPointerLocked(true)}
      onUnlock={() => {
        gameStore.actions.setPointerLocked(false);
      }}
    />
  );
}
