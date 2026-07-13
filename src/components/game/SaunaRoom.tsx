"use client";

import { useMemo } from "react";
import type { Texture } from "three";
import { useGameStore } from "@/components/game/useGameStore";
import {
  BASE_TEMPERATURE_C,
  MAX_TEMPERATURE_C,
  ROOM_DIMENSIONS,
  WALL_THICKNESS,
} from "@/lib/game/constants";
import {
  createStoneTexture,
  createWindowSceneTexture,
  createWoodTexture,
} from "@/lib/game/textures";

interface StoneData {
  position: [number, number, number];
  scale: number;
}

interface StoveStonesProps {
  highlighted: boolean;
  actionReady: boolean;
  heatGlow: number;
}

function StoveStones({ highlighted, actionReady, heatGlow }: StoveStonesProps) {
  const stones = useMemo<StoneData[]>(
    () =>
      Array.from({ length: 20 }, (_, index) => {
        const ring = Math.floor(index / 5);
        const angle = ((index % 5) / 5) * Math.PI * 2 + ring * 0.25;
        const radius = 0.15 + ring * 0.03;

        return {
          position: [Math.cos(angle) * radius, 0.86 + ring * 0.045, Math.sin(angle) * radius],
          scale: 0.07 + ((index * 17) % 9) * 0.005,
        };
      }),
    [],
  );

  const emissiveIntensity = Math.max(actionReady ? 0.55 : 0, 0.28 + heatGlow * 1.5 + (highlighted ? 0.2 : 0));

  return (
    <>
      {stones.map((stone, index) => (
        <mesh key={`stone-${index}`} position={stone.position} castShadow receiveShadow>
          <icosahedronGeometry args={[stone.scale, 0]} />
          <meshStandardMaterial
            color={highlighted ? "#5a5450" : "#454039"}
            emissive="#ff5a1e"
            emissiveIntensity={emissiveIntensity}
            roughness={0.86}
            metalness={0.12}
          />
        </mesh>
      ))}
    </>
  );
}

interface SaunaWindowProps {
  scene: Texture | null;
  frame: Texture | null;
}

function SaunaWindow({ scene, frame }: SaunaWindowProps) {
  const halfWidth = ROOM_DIMENSIONS.width / 2;
  const frameColor = "#5f3f26";

  return (
    <group position={[-halfWidth + 0.02, 1.55, 0.55]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[1.1, 0.9]} />
        <meshStandardMaterial
          map={scene ?? undefined}
          emissiveMap={scene ?? undefined}
          emissive="#ffffff"
          emissiveIntensity={0.85}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[1.28, 0.1, 0.08]} />
        <meshStandardMaterial map={frame ?? undefined} color={frameColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.48, 0]} castShadow>
        <boxGeometry args={[1.28, 0.1, 0.08]} />
        <meshStandardMaterial map={frame ?? undefined} color={frameColor} roughness={0.8} />
      </mesh>
      <mesh position={[-0.6, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 1.06, 0.08]} />
        <meshStandardMaterial map={frame ?? undefined} color={frameColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.6, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 1.06, 0.08]} />
        <meshStandardMaterial map={frame ?? undefined} color={frameColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[0.05, 0.9, 0.05]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[1.1, 0.05, 0.05]} />
        <meshStandardMaterial color={frameColor} roughness={0.8} />
      </mesh>
    </group>
  );
}

export function SaunaRoom() {
  const focusedId = useGameStore((state) => state.interaction.focusedId);
  const interactionAvailable = useGameStore((state) => state.interaction.isActionAvailable);
  const hasWaterInLadle = useGameStore((state) => state.sauna.hasWaterInLadle);
  const temperatureC = useGameStore((state) => state.sauna.temperatureC);

  const halfWidth = ROOM_DIMENSIONS.width / 2;
  const halfDepth = ROOM_DIMENSIONS.depth / 2;
  const wallHeightCenter = ROOM_DIMENSIONS.height / 2;
  const bucketFocused = focusedId === "bucket";
  const stonesFocused = focusedId === "stones";
  const heatGlow = Math.max(0, Math.min(1, (temperatureC - BASE_TEMPERATURE_C) / (MAX_TEMPERATURE_C - BASE_TEMPERATURE_C)));

  const textures = useMemo(() => {
    const wall = createWoodTexture({
      base: "#7c4e2c",
      grain: "#5f3a1f",
      highlight: "#9a6738",
      plankCount: 7,
      vertical: true,
    });
    wall?.repeat.set(2.6, 1.4);

    const floor = createWoodTexture({
      base: "#5a3a22",
      grain: "#432a17",
      highlight: "#6f4a2c",
      plankCount: 6,
      vertical: false,
    });
    floor?.repeat.set(2.2, 1.8);

    const ceiling = createWoodTexture({
      base: "#5c3a22",
      grain: "#412818",
      highlight: "#6d4629",
      plankCount: 6,
      vertical: true,
    });
    ceiling?.repeat.set(2.4, 1.6);

    const bench = createWoodTexture({
      base: "#a06e42",
      grain: "#7d5330",
      highlight: "#c08a54",
      plankCount: 5,
      vertical: false,
    });
    bench?.repeat.set(2, 1);

    const stove = createStoneTexture();
    const window = createWindowSceneTexture();

    return { wall, floor, ceiling, bench, stove, window };
  }, []);

  return (
    <group>
      <mesh position={[0, -WALL_THICKNESS / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM_DIMENSIONS.width, WALL_THICKNESS, ROOM_DIMENSIONS.depth]} />
        <meshStandardMaterial map={textures.floor ?? undefined} color="#7a5030" roughness={0.95} />
      </mesh>

      <mesh position={[0, ROOM_DIMENSIONS.height + WALL_THICKNESS / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM_DIMENSIONS.width, WALL_THICKNESS, ROOM_DIMENSIONS.depth]} />
        <meshStandardMaterial map={textures.ceiling ?? undefined} color="#6f472c" roughness={0.9} />
      </mesh>

      <mesh position={[0, wallHeightCenter, -halfDepth - WALL_THICKNESS / 2]} receiveShadow>
        <boxGeometry args={[ROOM_DIMENSIONS.width, ROOM_DIMENSIONS.height, WALL_THICKNESS]} />
        <meshStandardMaterial map={textures.wall ?? undefined} color="#8a5c36" roughness={0.9} />
      </mesh>

      <mesh position={[0, wallHeightCenter, halfDepth + WALL_THICKNESS / 2]} receiveShadow>
        <boxGeometry args={[ROOM_DIMENSIONS.width, ROOM_DIMENSIONS.height, WALL_THICKNESS]} />
        <meshStandardMaterial map={textures.wall ?? undefined} color="#875a35" roughness={0.9} />
      </mesh>

      <mesh position={[-halfWidth - WALL_THICKNESS / 2, wallHeightCenter, 0]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, ROOM_DIMENSIONS.height, ROOM_DIMENSIONS.depth + WALL_THICKNESS * 2]} />
        <meshStandardMaterial map={textures.wall ?? undefined} color="#875a35" roughness={0.9} />
      </mesh>

      <mesh position={[halfWidth + WALL_THICKNESS / 2, wallHeightCenter, 0]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, ROOM_DIMENSIONS.height, ROOM_DIMENSIONS.depth + WALL_THICKNESS * 2]} />
        <meshStandardMaterial map={textures.wall ?? undefined} color="#835636" roughness={0.9} />
      </mesh>

      <SaunaWindow scene={textures.window} frame={textures.wall} />

      <group position={[-1.05, 0, -0.82]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.09, 0.78]} />
          <meshStandardMaterial map={textures.bench ?? undefined} color="#b17b4e" roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.09, 0.78]} />
          <meshStandardMaterial map={textures.bench ?? undefined} color="#a5734a" roughness={0.84} />
        </mesh>
        <mesh position={[-0.68, 0.36, -0.33]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.72, 0.1]} />
          <meshStandardMaterial map={textures.bench ?? undefined} color="#8a5f3d" roughness={0.86} />
        </mesh>
        <mesh position={[0.68, 0.36, -0.33]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.72, 0.1]} />
          <meshStandardMaterial map={textures.bench ?? undefined} color="#8a5f3d" roughness={0.86} />
        </mesh>
        <mesh position={[-0.68, 0.11, 0.33]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.22, 0.1]} />
          <meshStandardMaterial map={textures.bench ?? undefined} color="#8a5f3d" roughness={0.86} />
        </mesh>
        <mesh position={[0.68, 0.11, 0.33]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.22, 0.1]} />
          <meshStandardMaterial map={textures.bench ?? undefined} color="#8a5f3d" roughness={0.86} />
        </mesh>
      </group>

      <group position={[1.18, 0, -0.92]}>
        <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.62, 0.72, 0.62]} />
          <meshStandardMaterial map={textures.stove ?? undefined} color="#3a352f" roughness={0.62} metalness={0.42} />
        </mesh>
        <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.54, 0.2, 0.54]} />
          <meshStandardMaterial color="#2c2a28" roughness={0.7} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.44, 0.312]}>
          <planeGeometry args={[0.34, 0.34]} />
          <meshStandardMaterial
            color="#1a0d05"
            emissive="#ff5410"
            emissiveIntensity={0.35 + heatGlow * 1.6}
            roughness={0.8}
          />
        </mesh>
        <StoveStones highlighted={stonesFocused} actionReady={interactionAvailable} heatGlow={heatGlow} />
      </group>

      <group position={[0.84, 0, -0.64]}>
        <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.14, 0.28, 24, 1, true]} />
          <meshStandardMaterial
            color={bucketFocused ? "#9aa0a6" : "#7c828c"}
            roughness={0.32}
            metalness={0.72}
            emissive="#84622c"
            emissiveIntensity={bucketFocused ? 0.3 : 0}
          />
        </mesh>
        <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.145, 0.14, 0.02, 24]} />
          <meshStandardMaterial color="#4c525a" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.13, 0.018, 16, 30]} />
          <meshStandardMaterial color="#8a9099" roughness={0.3} metalness={0.78} />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.14, 0.125, 0.03, 24]} />
          <meshStandardMaterial color="#2a3742" roughness={0.15} metalness={0.35} />
        </mesh>
        <mesh position={[0.22, 0.35, 0.04]} rotation={[0.04, 0.18, Math.PI / 2.2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.33, 12]} />
          <meshStandardMaterial map={textures.bench ?? undefined} color="#9d6d42" roughness={0.8} />
        </mesh>
        <mesh position={[0.35, 0.35, 0.04]} castShadow receiveShadow>
          <sphereGeometry args={[0.05, 20, 20]} />
          <meshStandardMaterial color="#8a9099" roughness={0.35} metalness={0.7} />
        </mesh>
        {hasWaterInLadle && (
          <mesh position={[0.35, 0.352, 0.04]}>
            <sphereGeometry args={[0.036, 16, 16]} />
            <meshStandardMaterial color="#3a6c92" roughness={0.1} metalness={0.2} />
          </mesh>
        )}
      </group>
    </group>
  );
}
