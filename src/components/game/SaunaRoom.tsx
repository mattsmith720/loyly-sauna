"use client";

import { useMemo } from "react";
import { useGameStore } from "@/components/game/useGameStore";
import { ROOM_DIMENSIONS, WALL_THICKNESS } from "@/lib/game/constants";

interface StoneData {
  position: [number, number, number];
  scale: number;
}

interface StoveStonesProps {
  highlighted: boolean;
  actionReady: boolean;
}

function StoveStones({ highlighted, actionReady }: StoveStonesProps) {
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

  return (
    <>
      {stones.map((stone, index) => (
        <mesh key={`stone-${index}`} position={stone.position} castShadow receiveShadow>
          <icosahedronGeometry args={[stone.scale, 0]} />
          <meshStandardMaterial
            color={highlighted ? "#7d7671" : "#65615e"}
            emissive={highlighted ? "#9c693d" : "#000000"}
            emissiveIntensity={actionReady ? 0.45 : highlighted ? 0.23 : 0}
            roughness={0.92}
            metalness={0.05}
          />
        </mesh>
      ))}
    </>
  );
}

export function SaunaRoom() {
  const focusedId = useGameStore((state) => state.interaction.focusedId);
  const interactionAvailable = useGameStore((state) => state.interaction.isActionAvailable);
  const steamLevel = useGameStore((state) => state.sauna.steamLevel);
  const halfWidth = ROOM_DIMENSIONS.width / 2;
  const halfDepth = ROOM_DIMENSIONS.depth / 2;
  const wallHeightCenter = ROOM_DIMENSIONS.height / 2;
  const bucketFocused = focusedId === "bucket";
  const stonesFocused = focusedId === "stones";

  return (
    <group>
      <mesh position={[0, -WALL_THICKNESS / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM_DIMENSIONS.width, WALL_THICKNESS, ROOM_DIMENSIONS.depth]} />
        <meshStandardMaterial color="#8b5f3e" roughness={0.9} />
      </mesh>

      <mesh position={[0, ROOM_DIMENSIONS.height + WALL_THICKNESS / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM_DIMENSIONS.width, WALL_THICKNESS, ROOM_DIMENSIONS.depth]} />
        <meshStandardMaterial color="#6f472c" roughness={0.88} />
      </mesh>

      <mesh position={[0, wallHeightCenter, -halfDepth - WALL_THICKNESS / 2]} receiveShadow>
        <boxGeometry args={[ROOM_DIMENSIONS.width, ROOM_DIMENSIONS.height, WALL_THICKNESS]} />
        <meshStandardMaterial color="#7d5133" roughness={0.87} />
      </mesh>

      <mesh position={[0, wallHeightCenter, halfDepth + WALL_THICKNESS / 2]} receiveShadow>
        <boxGeometry args={[ROOM_DIMENSIONS.width, ROOM_DIMENSIONS.height, WALL_THICKNESS]} />
        <meshStandardMaterial color="#7a4f31" roughness={0.87} />
      </mesh>

      <mesh position={[-halfWidth - WALL_THICKNESS / 2, wallHeightCenter, 0]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, ROOM_DIMENSIONS.height, ROOM_DIMENSIONS.depth + WALL_THICKNESS * 2]} />
        <meshStandardMaterial color="#7a4f31" roughness={0.87} />
      </mesh>

      <mesh position={[halfWidth + WALL_THICKNESS / 2, wallHeightCenter, 0]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, ROOM_DIMENSIONS.height, ROOM_DIMENSIONS.depth + WALL_THICKNESS * 2]} />
        <meshStandardMaterial color="#765033" roughness={0.87} />
      </mesh>

      <group position={[-1.05, 0, -0.82]}>
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.09, 0.78]} />
          <meshStandardMaterial color="#b17b4e" roughness={0.83} />
        </mesh>
        <mesh position={[-0.68, 0.11, -0.33]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.22, 0.1]} />
          <meshStandardMaterial color="#8a5f3d" roughness={0.86} />
        </mesh>
        <mesh position={[0.68, 0.11, -0.33]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.22, 0.1]} />
          <meshStandardMaterial color="#8a5f3d" roughness={0.86} />
        </mesh>
      </group>

      <group position={[1.18, 0, -0.92]}>
        <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.62, 0.72, 0.62]} />
          <meshStandardMaterial color="#2b2b2f" roughness={0.43} metalness={0.34} />
        </mesh>
        <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.54, 0.2, 0.54]} />
          <meshStandardMaterial color="#39393f" roughness={0.56} metalness={0.24} />
        </mesh>
        <StoveStones highlighted={stonesFocused} actionReady={interactionAvailable} />
        <mesh position={[0, 0.98 + steamLevel * 0.3, 0]} receiveShadow={false}>
          <sphereGeometry args={[0.15 + steamLevel * 0.22, 18, 18]} />
          <meshStandardMaterial
            color="#e5f0f4"
            transparent
            opacity={Math.min(0.28, steamLevel * 0.35)}
            depthWrite={false}
          />
        </mesh>
      </group>

      <group position={[0.84, 0, -0.64]}>
        <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.14, 0.28, 24, 1, true]} />
          <meshStandardMaterial
            color={bucketFocused ? "#8a8f95" : "#6f7680"}
            roughness={0.33}
            metalness={0.62}
            emissive={bucketFocused ? "#84622c" : "#000000"}
            emissiveIntensity={bucketFocused ? 0.24 : 0}
          />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.13, 0.018, 16, 30]} />
          <meshStandardMaterial color="#7f858d" roughness={0.34} metalness={0.64} />
        </mesh>
        <mesh position={[0.22, 0.35, 0.04]} rotation={[0.04, 0.18, Math.PI / 2.2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.33, 12]} />
          <meshStandardMaterial color="#9d6d42" roughness={0.82} />
        </mesh>
        <mesh position={[0.35, 0.35, 0.04]} castShadow receiveShadow>
          <sphereGeometry args={[0.05, 20, 20]} />
          <meshStandardMaterial
            color={interactionAvailable && stonesFocused ? "#7ca8d1" : "#5e84a8"}
            roughness={0.4}
            metalness={0.16}
          />
        </mesh>
      </group>
    </group>
  );
}
