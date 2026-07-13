"use client";

import { Canvas } from "@react-three/fiber";
import { useCallback, useRef, type MouseEvent } from "react";
import type { PointerLockControls as PointerLockControlsImpl } from "three-stdlib";
import { PLAYER_START_POSITION } from "@/lib/game/constants";
import { SaunaScene } from "@/components/game/SaunaScene";
import { useGameStore } from "@/components/game/useGameStore";
import styles from "./SaunaGame.module.css";

export function SaunaGame() {
  const controlsRef = useRef<PointerLockControlsImpl | null>(null);
  const isPointerLocked = useGameStore((state) => state.session.isPointerLocked);

  const requestPointerLock = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    controlsRef.current?.lock();
  }, []);

  return (
    <div className={styles.gameRoot} onClick={requestPointerLock}>
      <Canvas
        className={styles.canvas}
        shadows
        dpr={[1, 1.75]}
        camera={{
          fov: 75,
          near: 0.1,
          far: 50,
          position: [PLAYER_START_POSITION.x, PLAYER_START_POSITION.y, PLAYER_START_POSITION.z],
        }}
      >
        <SaunaScene controlsRef={controlsRef} />
      </Canvas>

      {!isPointerLocked && (
        <button type="button" className={styles.overlay} onClick={requestPointerLock}>
          <span className={styles.overlayTitle}>Click to play</span>
          <span className={styles.overlayHint}>WASD to move · Mouse to look · Esc to unlock</span>
        </button>
      )}
    </div>
  );
}
