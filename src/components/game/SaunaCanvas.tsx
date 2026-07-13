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
import { HeldWood, WOOD_STONES_ORIGIN } from "./WoodStove";
import { Player } from "./Player";
import { ELECTRIC_STONES_ORIGIN, SaunaRoom } from "./SaunaRoom";
import { Steam } from "./Steam";
import { useSaunaGame } from "./useSaunaGame";

function Scene() {
  const { state } = useSaunaGame();
  const woodfired = state.saunaType === "woodfired";
  const outside = state.playerMode === "outside";
  const exteriorVisible = woodfired && (outside || state.doorOpen);
  const heat = woodfired
    ? state.fireLit
      ? Math.min(1, state.fireFuel / 85)
      : 0
    : state.heaterOn
      ? Math.min(1, (state.temperature - 40) / 50)
      : 0;
  const woodAmbientColor = exteriorVisible ? "#c3d1df" : "#ddb882";
  const woodDirectionalColor = exteriorVisible ? "#8ea2ba" : "#ff9a4d";
  const woodGroundColor = exteriorVisible ? "#1f2e22" : "#2b2622";
  const woodFogColor = exteriorVisible ? "#4a5963" : "#0e1a14";
  const woodFogNear = exteriorVisible ? 8 : 3.5;
  const woodFogFar = exteriorVisible ? 34 : 16;
  const lightFactor = state.lightsOn ? 1 : 0.22;
  const emberFill = state.lightsOn || exteriorVisible ? 0 : heat * 0.2;
  const ambientColor = woodfired
    ? exteriorVisible
      ? woodAmbientColor
      : state.lightsOn
        ? woodAmbientColor
        : "#ff9a4d"
    : state.lightsOn
      ? "#f8f7f2"
      : "#ffb27a";
  const steamOrigin = woodfired ? WOOD_STONES_ORIGIN : ELECTRIC_STONES_ORIGIN;

  return (
    <>
      <color attach="background" args={[woodfired ? (exteriorVisible ? "#4a5963" : "#0a1210") : "#d2d6dc"]} />
      <fog attach="fog" args={[woodfired ? woodFogColor : "#edf1f5", woodfired ? woodFogNear : 2.5, woodfired ? woodFogFar : 10.5]} />
      <ambientLight
        intensity={(woodfired ? (exteriorVisible ? 0.26 : 0.15) + heat * 0.12 : 0.42 + heat * 0.08) * lightFactor + emberFill}
        color={ambientColor}
      />
      <directionalLight
        castShadow
        intensity={(woodfired ? (exteriorVisible ? 0.42 : 0.32) + heat * 0.72 : 0.62 + heat * 0.32) * lightFactor}
        color={woodfired ? woodDirectionalColor : "#e8efff"}
        position={woodfired ? (exteriorVisible ? [-3.5, 6.2, 9.5] : [0.5, 2.8, -1.2]) : [0.2, 2.9, -0.6]}
        shadow-mapSize={[1024, 1024]}
      />
      {!woodfired && (
        <pointLight
          intensity={(0.3 + heat * 1.5) * lightFactor}
          color="#ffd3a5"
          position={[1.22, 1.22, -1.0]}
          distance={3.8}
        />
      )}
      {!woodfired && (
        <pointLight
          intensity={(state.lightsOn ? 0.48 : 0.14) * lightFactor}
          color="#c7deff"
          position={[-0.9, 2.1, -0.7]}
          distance={5.2}
        />
      )}
      <hemisphereLight
        intensity={(woodfired ? (exteriorVisible ? 0.44 : 0.28) : 0.4) * lightFactor}
        color={woodfired ? (exteriorVisible ? "#b7c6d4" : "#f0e6d6") : "#f7fafc"}
        groundColor={woodfired ? woodGroundColor : "#8e8376"}
      />

      <SaunaRoom />
      <Forest />
      <Steam burstId={state.steamBurstId} origin={steamOrigin} />

      {state.playerMode === "outside" && !woodfired && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2.4]} receiveShadow>
            <planeGeometry args={[3.5, 2]} />
            <meshStandardMaterial color="#d3d0ca" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.2, 3.3]}>
            <planeGeometry args={[4, 2.6]} />
            <meshStandardMaterial color="#d2dfe8" roughness={0.96} />
          </mesh>
          <pointLight intensity={0.75} color="#a3d0e5" position={[0, 2.2, 2.6]} distance={5} />
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
        <Environment files={GAME_HDRI} background={exteriorVisible} />
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
