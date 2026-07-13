"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import type { PointLight } from "three";
import type { PointerLockControls as PointerLockControlsImpl } from "three-stdlib";
import { FirstPersonController } from "@/components/game/FirstPersonController";
import { SaunaRoom } from "@/components/game/SaunaRoom";
import { SteamParticles } from "@/components/game/SteamParticles";

interface SaunaSceneProps {
  controlsRef: MutableRefObject<PointerLockControlsImpl | null>;
  allowUnlockedLookAndMove: boolean;
}

function LanternLight() {
  const lightRef = useRef<PointLight | null>(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    const flicker = 1 + Math.sin(t * 2.1) * 0.04 + Math.sin(t * 5.7) * 0.03;
    lightRef.current.intensity = 5.6 * flicker;
  });

  return (
    <pointLight
      ref={lightRef}
      position={[-0.2, 2.24, 0.5]}
      color="#ffb267"
      intensity={5.6}
      distance={7.5}
      decay={2}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-bias={-0.0006}
    />
  );
}

export function SaunaScene({ controlsRef, allowUnlockedLookAndMove }: SaunaSceneProps) {
  return (
    <>
      <color attach="background" args={["#1a120b"]} />
      <fog attach="fog" args={["#1c130c", 2.6, 10.5]} />

      <ambientLight intensity={0.22} color="#4c341f" />
      <hemisphereLight args={["#6b4a2a", "#150e07", 0.38]} />

      <LanternLight />

      <spotLight
        position={[-1.05, 2.45, -0.2]}
        angle={0.9}
        penumbra={0.9}
        intensity={2.4}
        color="#f0a35a"
        distance={6}
        decay={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0006}
      />

      <pointLight position={[1.2, 1.5, -0.85]} intensity={2.2} color="#ff9448" distance={4} decay={2} />

      <SaunaRoom />
      <SteamParticles />
      <FirstPersonController controlsRef={controlsRef} allowUnlockedLookAndMove={allowUnlockedLookAndMove} />
    </>
  );
}
