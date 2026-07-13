"use client";

import type { MutableRefObject } from "react";
import type { PointerLockControls as PointerLockControlsImpl } from "three-stdlib";
import { FirstPersonController } from "@/components/game/FirstPersonController";
import { SaunaRoom } from "@/components/game/SaunaRoom";

interface SaunaSceneProps {
  controlsRef: MutableRefObject<PointerLockControlsImpl | null>;
}

export function SaunaScene({ controlsRef }: SaunaSceneProps) {
  return (
    <>
      <color attach="background" args={["#17110b"]} />
      <fog attach="fog" args={["#17110b", 4, 14]} />

      <ambientLight intensity={0.55} />
      <directionalLight position={[1.8, 2.2, 1.4]} intensity={0.9} castShadow />
      <pointLight position={[1.2, 1.4, -0.85]} intensity={11} color="#f6b47a" distance={6.5} decay={2} castShadow />

      <SaunaRoom />
      <FirstPersonController controlsRef={controlsRef} />
    </>
  );
}
