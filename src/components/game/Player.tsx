"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { consumeLookDelta, moveInput } from "./input";
import { WOODFIRED_FOREST_BOUNDS, WOODFIRED_FOREST_TREES } from "./forest-layout";
import { useSaunaGame } from "./useSaunaGame";

const MOVE_SPEED = 2.2;
const EYE_HEIGHT_WALK = 1.55;
const EYE_HEIGHT_SEAT = 1.05;
const EYE_HEIGHT_OUTSIDE = 1.55;
const LOOK_SENSITIVITY = 0.0022;
const PLAYER_RADIUS = 0.28;
const DOORWAY_HALF_WIDTH = 0.62;
const PORCH_WALL_Z = 2.02;
const SEAT_ANCHOR_X = 1.12;
const SEAT_ANCHOR_Z = 0.05;
const SEAT_FACING_YAW = Math.PI / 2;
const SEAT_FACING_PITCH = -0.12;

const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
}

function clampToWoodfiredBounds(position: THREE.Vector3) {
  if (position.z < WOODFIRED_FOREST_BOUNDS.minZ) {
    position.z = WOODFIRED_FOREST_BOUNDS.minZ;
  }

  const dx = position.x - WOODFIRED_FOREST_BOUNDS.centerX;
  const dz = position.z - WOODFIRED_FOREST_BOUNDS.centerZ;
  const norm =
    (dx * dx) / (WOODFIRED_FOREST_BOUNDS.radiusX * WOODFIRED_FOREST_BOUNDS.radiusX) +
    (dz * dz) / (WOODFIRED_FOREST_BOUNDS.radiusZ * WOODFIRED_FOREST_BOUNDS.radiusZ);

  if (norm > 1) {
    const scale = 1 / Math.sqrt(norm);
    position.x = WOODFIRED_FOREST_BOUNDS.centerX + dx * scale;
    position.z = WOODFIRED_FOREST_BOUNDS.centerZ + dz * scale;
  }
}

function applyWoodfiredCabinCollision(position: THREE.Vector3) {
  if (position.z < PORCH_WALL_Z && Math.abs(position.x) > DOORWAY_HALF_WIDTH) {
    position.z = PORCH_WALL_Z;
  }
  if (position.z < 2.25) {
    position.x = THREE.MathUtils.clamp(position.x, -1.9, 1.9);
  }
}

function applyWoodfiredTreeCollision(position: THREE.Vector3) {
  for (const tree of WOODFIRED_FOREST_TREES) {
    const collisionRadius = tree.trunkRadius + PLAYER_RADIUS * 0.9;
    const dx = position.x - tree.x;
    const dz = position.z - tree.z;
    const distSq = dx * dx + dz * dz;
    const minDistSq = collisionRadius * collisionRadius;

    if (distSq >= minDistSq) continue;
    if (distSq <= 0.0001) {
      position.x += collisionRadius;
      continue;
    }

    const dist = Math.sqrt(distSq);
    const push = collisionRadius - dist;
    position.x += (dx / dist) * push;
    position.z += (dz / dist) * push;
  }
}

export function Player() {
  const { camera, gl } = useThree();
  const { state, dispatch } = useSaunaGame();
  const bobPhase = useRef(0);
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const [touchDevice, setTouchDevice] = useState(false);
  const lookActive = useRef(false);
  const lastTouch = useRef({ x: 0, y: 0 });
  const prevMode = useRef(state.playerMode);
  const seatOrientationEasing = useRef(false);

  const desktopLock = state.phase === "playing" && state.pointerLocked && !touchDevice;

  useEffect(() => {
    setTouchDevice(isTouchDevice());
    camera.position.set(0, EYE_HEIGHT_WALK, 0.8);
    euler.current.setFromQuaternion(camera.quaternion);
  }, [camera]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyW") keys.forward = true;
      if (event.code === "KeyS") keys.backward = true;
      if (event.code === "KeyA") keys.left = true;
      if (event.code === "KeyD") keys.right = true;
      if (event.code === "KeyE") dispatch({ type: "interact" });
      if (event.code === "KeyH") dispatch({ type: "toggle_heater" });
      if (event.code === "BracketLeft" || event.code === "Minus") {
        dispatch({ type: "adjust_heater", delta: -2 });
      }
      if (event.code === "BracketRight" || event.code === "Equal") {
        dispatch({ type: "adjust_heater", delta: 2 });
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "KeyW") keys.forward = false;
      if (event.code === "KeyS") keys.backward = false;
      if (event.code === "KeyA") keys.left = false;
      if (event.code === "KeyD") keys.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [dispatch]);

  useEffect(() => {
    if (state.phase !== "playing" || !touchDevice) return;

    const el = gl.domElement;
    dispatch({ type: "set_pointer_locked", locked: true });

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        if (event.clientX < window.innerWidth * 0.38) return;
        lookActive.current = true;
        lastTouch.current = { x: event.clientX, y: event.clientY };
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!lookActive.current) return;
      const dx = event.clientX - lastTouch.current.x;
      const dy = event.clientY - lastTouch.current.y;
      lastTouch.current = { x: event.clientX, y: event.clientY };
      moveInput.lookDeltaX += dx;
      moveInput.lookDeltaY += dy;
    };
    const onPointerUp = () => {
      lookActive.current = false;
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [dispatch, gl.domElement, state.phase, touchDevice]);

  useFrame((_, delta) => {
    if (state.phase !== "playing") return;

    const look = consumeLookDelta();
    if (look.x !== 0 || look.y !== 0) {
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= look.x * LOOK_SENSITIVITY;
      euler.current.x -= look.y * LOOK_SENSITIVITY;
      euler.current.x = THREE.MathUtils.clamp(euler.current.x, -1.2, 1.2);
      camera.quaternion.setFromEuler(euler.current);
      seatOrientationEasing.current = false;
    }

    if (state.playerMode !== prevMode.current) {
      if (state.playerMode === "seated" && !state.reducedMotion) {
        seatOrientationEasing.current = true;
      }
      prevMode.current = state.playerMode;
    }

    const eyeHeight =
      state.playerMode === "seated"
        ? EYE_HEIGHT_SEAT
        : state.playerMode === "outside"
          ? EYE_HEIGHT_OUTSIDE
          : EYE_HEIGHT_WALK;

    if (state.playerMode === "seated") {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, SEAT_ANCHOR_X, 4.5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, SEAT_ANCHOR_Z, 4.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, eyeHeight, 4.5, delta);

      if (seatOrientationEasing.current) {
        euler.current.setFromQuaternion(camera.quaternion);
        let yaw = euler.current.y;
        while (yaw - SEAT_FACING_YAW > Math.PI) yaw -= Math.PI * 2;
        while (yaw - SEAT_FACING_YAW < -Math.PI) yaw += Math.PI * 2;
        euler.current.y = THREE.MathUtils.damp(yaw, SEAT_FACING_YAW, 5, delta);
        euler.current.x = THREE.MathUtils.damp(euler.current.x, SEAT_FACING_PITCH, 5, delta);
        camera.quaternion.setFromEuler(euler.current);
        if (Math.abs(euler.current.y - SEAT_FACING_YAW) < 0.015) {
          seatOrientationEasing.current = false;
        }
      }
      return;
    }

    let forwardAxis = moveInput.forward;
    let rightAxis = moveInput.right;
    if (keys.forward) forwardAxis += 1;
    if (keys.backward) forwardAxis -= 1;
    if (keys.left) rightAxis -= 1;
    if (keys.right) rightAxis += 1;
    forwardAxis = THREE.MathUtils.clamp(forwardAxis, -1, 1);
    rightAxis = THREE.MathUtils.clamp(rightAxis, -1, 1);

    const canMove = state.playerMode === "walking" || state.playerMode === "outside";
    const moving = canMove && (Math.abs(forwardAxis) > 0.08 || Math.abs(rightAxis) > 0.08);

    if (moving && !state.reducedMotion) {
      bobPhase.current += delta * 6;
      camera.position.y = eyeHeight + Math.sin(bobPhase.current) * 0.03;
    } else {
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, eyeHeight, delta * 8);
    }

    if (!moving || !canMove) return;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const sideways = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
    const velocity = new THREE.Vector3();
    velocity.addScaledVector(direction, forwardAxis);
    velocity.addScaledVector(sideways, rightAxis);

    if (velocity.lengthSq() > 0) {
      velocity.normalize().multiplyScalar(MOVE_SPEED * delta);
      camera.position.add(velocity);
    }

    if (state.playerMode === "walking") {
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -1.65, 1.65);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -1.35, 1.25);
    }

    if (state.playerMode === "outside") {
      if (state.saunaType === "woodfired") {
        clampToWoodfiredBounds(camera.position);
        applyWoodfiredCabinCollision(camera.position);
        applyWoodfiredTreeCollision(camera.position);
        clampToWoodfiredBounds(camera.position);
        applyWoodfiredCabinCollision(camera.position);
      } else {
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -1.2, 1.2);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, 1.6, 2.8);
      }
    }
  });

  if (touchDevice) return null;

  return (
    <PointerLockControls
      enabled={desktopLock}
      onLock={() => dispatch({ type: "set_pointer_locked", locked: true })}
      onUnlock={() => dispatch({ type: "set_pointer_locked", locked: false })}
    />
  );
}
