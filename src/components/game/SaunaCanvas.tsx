"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, SoftShadows } from "@react-three/drei";
import { GAME_HDRI } from "./assets/game-assets";
import { Forest } from "./Forest";
import { GameLoop } from "./GameLoop";
import { InteractionRaycast } from "./InteractionRaycast";
import { OutsideTransition } from "./OutsideTransition";
import { HeldLadle } from "./HeldLadle";
import { HeldWood } from "./WoodStove";
import { Player } from "./Player";
import { SaunaRoom } from "./SaunaRoom";
import { Steam } from "./Steam";
import { useSaunaGame } from "./useSaunaGame";

function Scene() {
  const { state } = useSaunaGame();
  const woodfired = state.saunaType === "woodfired";
  const heat = state.heaterOn ? Math.min(1, (state.temperature - 40) / 50) : 0;
  const lightFactor = state.lightsOn ? 1 : 0.2;

  return (
    <>
      <color attach="background" args={[woodfired ? "#0a1210" : "#120f0c"]} />
      <fog attach="fog" args={[woodfired ? "#0e1a14" : "#1a1613", woodfired ? 3.5 : 2.2, woodfired ? 16 : 8.5]} />
      <ambientLight intensity={(0.14 + heat * 0.08) * lightFactor} color="#ddb882" />
      <directionalLight
        castShadow
        intensity={(0.28 + heat * 0.85) * lightFactor}
        color="#ff9a4d"
        position={[0.5, 2.8, -1.2]}
        shadow-mapSize={[1024, 1024]}
      />
      {!woodfired && (
        <pointLight
          intensity={(0.15 + heat * 2.2) * lightFactor}
          color="#ff6a1a"
          position={[0, 1.1, -1.35]}
          distance={4}
        />
      )}
      <hemisphereLight intensity={0.28 * lightFactor} color="#f0e6d6" groundColor="#2b2622" />

      <SaunaRoom />
      <Forest />
      <Steam burstId={state.steamBurstId} origin={[0, 1.05, -1.35]} />

      {state.playerMode === "outside" && !woodfired && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2.4]} receiveShadow>
            <planeGeometry args={[3.5, 2]} />
            <meshStandardMaterial color="#3a342e" roughness={0.95} />
          </mesh>
          <mesh position={[0, 1.2, 3.3]}>
            <planeGeometry args={[4, 2.6]} />
            <meshStandardMaterial color="#1a2228" roughness={1} />
          </mesh>
          <pointLight intensity={0.6} color="#8ab4c8" position={[0, 2.2, 2.6]} distance={5} />
        </group>
      )}

      <Player />
      <HeldLadle />
      <HeldWood />
      <InteractionRaycast />
      <OutsideTransition />
      <GameLoop />
      <SoftShadows size={8} focus={0.4} samples={8} />
      {woodfired ? (
        <Environment files={GAME_HDRI} background={false} />
      ) : (
        <Environment preset="apartment" />
      )}
    </>
  );
}

export function SaunaCanvas() {
  return (
    <Canvas
      shadows
      camera={{ fov: 72, near: 0.1, far: 40, position: [0, 1.55, 0.8] }}
      gl={{ antialias: true, alpha: false }}
      className="h-full w-full touch-none"
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
