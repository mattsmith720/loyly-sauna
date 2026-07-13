"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import type { PointLight } from "three";
import type { PointerLockControls as PointerLockControlsImpl } from "three-stdlib";
import { FirstPersonController } from "@/components/game/FirstPersonController";
import { SaunaRoom } from "@/components/game/SaunaRoom";
import { SteamParticles } from "@/components/game/SteamParticles";
import { gameStore } from "@/lib/game/store";

interface SaunaSceneProps {
  controlsRef: MutableRefObject<PointerLockControlsImpl | null>;
}

const STOVE_POSITION: [number, number, number] = [1.18, 0.86, -0.92];
const STEAM_ORIGIN: [number, number, number] = [1.18, 1.02, -0.92];

// The stove glow subtly breathes and reacts to steam so the room never reads as
// flat-lit. Driven in a child component to avoid re-rendering the whole scene.
function KiuasGlow() {
  const lightRef = useRef<PointLight>(null);
  const emberRef = useRef<PointLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const steamLevel = gameStore.getState().sauna.steamLevel;
    const flicker = 0.85 + Math.sin(time * 7.3) * 0.07 + Math.sin(time * 13.1) * 0.05;
    const boost = 1 + steamLevel * 0.5;

    if (lightRef.current) {
      lightRef.current.intensity = 6.4 * flicker * boost;
    }
    if (emberRef.current) {
      emberRef.current.intensity = 3.1 * (0.9 + Math.sin(time * 5.1 + 1.7) * 0.12);
    }
  });

  return (
    <>
      <pointLight
        ref={lightRef}
        position={STOVE_POSITION}
        color="#ff7d33"
        intensity={6.4}
        distance={6.5}
        decay={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0008}
      />
      <pointLight ref={emberRef} position={[1.18, 1.0, -0.92]} color="#ffb066" intensity={3.1} distance={3.4} decay={2} />
    </>
  );
}

export function SaunaScene({ controlsRef }: SaunaSceneProps) {
  return (
    <>
      <color attach="background" args={["#140d07"]} />
      <fog attach="fog" args={["#1b110a", 2.4, 9.5]} />

      <ambientLight intensity={0.16} color="#5a3a22" />
      <hemisphereLight args={["#4a3320", "#0d0906", 0.35]} />

      <KiuasGlow />

      <pointLight position={[-1.0, 2.1, 0.6]} color="#ffcf9c" intensity={1.5} distance={5.5} decay={2} />

      <spotLight
        position={[-1.0, 2.35, -0.4]}
        angle={0.9}
        penumbra={0.9}
        color="#ffb877"
        intensity={2.2}
        distance={6}
        decay={2}
      />

      <pointLight position={[-1.95, 1.5, 1.1]} color="#8fb4e8" intensity={0.7} distance={4} decay={2} />

      <SaunaRoom />
      <SteamParticles origin={STEAM_ORIGIN} />
      <FirstPersonController controlsRef={controlsRef} />
    </>
  );
}
