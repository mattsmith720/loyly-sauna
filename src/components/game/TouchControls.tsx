"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { TOUCH_LOOK_RADIANS_PER_PIXEL } from "@/lib/game/constants";
import { gameStore } from "@/lib/game/store";
import type { InteractableId } from "@/lib/game/types";
import styles from "./SaunaGame.module.css";

const JOYSTICK_DEAD_ZONE = 0.22;
const LOOK_SMOOTHING = 0.65;

interface TouchControlsProps {
  enabled: boolean;
  mouseSensitivity: number;
  focusedInteractableId: InteractableId | null;
  onPause: () => void;
}

interface JoystickVector {
  x: number;
  y: number;
}

export function TouchControls({ enabled, mouseSensitivity, focusedInteractableId, onPause }: TouchControlsProps) {
  const [joystick, setJoystick] = useState<JoystickVector>({ x: 0, y: 0 });
  const movementPointerIdRef = useRef<number | null>(null);
  const lookPointerIdRef = useRef<number | null>(null);
  const lookPointRef = useRef<JoystickVector | null>(null);
  const smoothedLookDeltaRef = useRef<JoystickVector>({ x: 0, y: 0 });

  const applyMovementFromVector = useCallback((x: number, y: number) => {
    const actions = gameStore.actions;
    actions.setMovementKey("forward", y < -JOYSTICK_DEAD_ZONE);
    actions.setMovementKey("backward", y > JOYSTICK_DEAD_ZONE);
    actions.setMovementKey("left", x < -JOYSTICK_DEAD_ZONE);
    actions.setMovementKey("right", x > JOYSTICK_DEAD_ZONE);
  }, []);

  const resetMovement = useCallback(() => {
    movementPointerIdRef.current = null;
    setJoystick({ x: 0, y: 0 });
    gameStore.actions.resetMovementInput();
  }, []);

  const updateJoystickFromPointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const radius = Math.min(bounds.width, bounds.height) * 0.5;
      if (radius <= 0) return;

      const centerX = bounds.left + bounds.width * 0.5;
      const centerY = bounds.top + bounds.height * 0.5;
      let x = (event.clientX - centerX) / radius;
      let y = (event.clientY - centerY) / radius;
      const magnitude = Math.hypot(x, y);
      if (magnitude > 1) {
        x /= magnitude;
        y /= magnitude;
      }

      setJoystick({ x, y });
      applyMovementFromVector(x, y);
    },
    [applyMovementFromVector],
  );

  const handleMovePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      event.preventDefault();
      movementPointerIdRef.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
      updateJoystickFromPointer(event);
    },
    [enabled, updateJoystickFromPointer],
  );

  const handleMovePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || movementPointerIdRef.current !== event.pointerId) return;
      event.preventDefault();
      updateJoystickFromPointer(event);
    },
    [enabled, updateJoystickFromPointer],
  );

  const handleMovePointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (movementPointerIdRef.current !== event.pointerId) return;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      resetMovement();
    },
    [resetMovement],
  );

  const handleLookPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      event.preventDefault();
      lookPointerIdRef.current = event.pointerId;
      lookPointRef.current = { x: event.clientX, y: event.clientY };
      smoothedLookDeltaRef.current = { x: 0, y: 0 };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [enabled],
  );

  const handleLookPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || lookPointerIdRef.current !== event.pointerId) return;
      event.preventDefault();

      const lastPoint = lookPointRef.current;
      if (!lastPoint) {
        lookPointRef.current = { x: event.clientX, y: event.clientY };
        return;
      }

      const rawDeltaX = event.clientX - lastPoint.x;
      const rawDeltaY = event.clientY - lastPoint.y;
      lookPointRef.current = { x: event.clientX, y: event.clientY };

      const smoothedDeltaX = smoothedLookDeltaRef.current.x * (1 - LOOK_SMOOTHING) + rawDeltaX * LOOK_SMOOTHING;
      const smoothedDeltaY = smoothedLookDeltaRef.current.y * (1 - LOOK_SMOOTHING) + rawDeltaY * LOOK_SMOOTHING;
      smoothedLookDeltaRef.current = { x: smoothedDeltaX, y: smoothedDeltaY };

      const state = gameStore.getState();
      if (state.session.phase !== "playing") return;

      gameStore.actions.setPlayerView(
        state.player.view.yaw - smoothedDeltaX * TOUCH_LOOK_RADIANS_PER_PIXEL * mouseSensitivity,
        state.player.view.pitch - smoothedDeltaY * TOUCH_LOOK_RADIANS_PER_PIXEL * mouseSensitivity,
      );
    },
    [enabled, mouseSensitivity],
  );

  const handleLookPointerEnd = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (lookPointerIdRef.current !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    lookPointerIdRef.current = null;
    lookPointRef.current = null;
    smoothedLookDeltaRef.current = { x: 0, y: 0 };
  }, []);

  const handleInteract = useCallback(() => {
    gameStore.actions.interact();
  }, []);

  useEffect(() => {
    if (!enabled) {
      resetMovement();
      lookPointerIdRef.current = null;
      lookPointRef.current = null;
      smoothedLookDeltaRef.current = { x: 0, y: 0 };
    }
  }, [enabled, resetMovement]);

  useEffect(() => {
    return () => {
      gameStore.actions.resetMovementInput();
    };
  }, []);

  const interactLabel = useMemo(() => {
    if (focusedInteractableId === "stones") {
      return "Splash Stones";
    }
    if (focusedInteractableId === "bucket") {
      return "Pour Loyly";
    }
    return "Interact";
  }, [focusedInteractableId]);

  if (!enabled) return null;

  return (
    <div className={styles.touchControlsLayer}>
      <button type="button" className={styles.touchPauseButton} onClick={onPause}>
        Pause
      </button>
      <div className={styles.touchControlsRow}>
        <div className={styles.touchMoveCluster}>
          <div
            className={styles.touchMovePad}
            onPointerDown={handleMovePointerDown}
            onPointerMove={handleMovePointerMove}
            onPointerUp={handleMovePointerEnd}
            onPointerCancel={handleMovePointerEnd}
          >
            <div className={styles.touchMovePadInner} />
            <div
              className={styles.touchMoveThumb}
              style={{ transform: `translate(${joystick.x * 36}px, ${joystick.y * 36}px)` }}
            />
          </div>
          <span className={styles.touchControlLabel}>Move</span>
        </div>

        <div className={styles.touchLookCluster}>
          {focusedInteractableId !== null && (
            <button type="button" className={styles.touchInteractButton} onClick={handleInteract}>
              {interactLabel}
            </button>
          )}
          <div
            className={styles.touchLookSurface}
            onPointerDown={handleLookPointerDown}
            onPointerMove={handleLookPointerMove}
            onPointerUp={handleLookPointerEnd}
            onPointerCancel={handleLookPointerEnd}
          >
            <span className={styles.touchControlLabel}>Drag to look</span>
          </div>
        </div>
      </div>
    </div>
  );
}
