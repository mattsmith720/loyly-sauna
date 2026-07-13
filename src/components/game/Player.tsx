"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { consumeLookDelta, moveInput } from "./input";
import { useSaunaGame } from "./useSaunaGame";

const MOVE_SPEED = 2.2;
const EYE_HEIGHT_WALK = 1.55;
const EYE_HEIGHT_SEAT = 1.05;
const EYE_HEIGHT_OUTSIDE = 1.55;
const LOOK_SENSITIVITY = 0.0022;

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

export function Player() {
  const { camera, gl } = useThree();
  const { state, dispatch } = useSaunaGame();
  const bobPhase = useRef(0);
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const [touchDevice, setTouchDevice] = useState(false);
  const lookActive = useRef(false);
  const lastTouch = useRef({ x: 0, y: 0 });

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
    }

    const eyeHeight =
      state.playerMode === "seated"
        ? EYE_HEIGHT_SEAT
        : state.playerMode === "outside"
          ? EYE_HEIGHT_OUTSIDE
          : EYE_HEIGHT_WALK;

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
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -4.5, 4.5);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, 1.6, 8.5);
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
