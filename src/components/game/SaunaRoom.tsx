"use client";

import { useMemo } from "react";
import { ROOM_DIMENSIONS, WALL_THICKNESS } from "@/lib/game/constants";

interface StoneData {
  position: [number, number, number];
  scale: number;
}

function StoveStones() {
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
          <meshStandardMaterial color="#65615e" roughness={0.92} metalness={0.05} />
        </mesh>
      ))}
    </>
  );
}

export function SaunaRoom() {
  const halfWidth = ROOM_DIMENSIONS.width / 2;
  const halfDepth = ROOM_DIMENSIONS.depth / 2;
  const wallHeightCenter = ROOM_DIMENSIONS.height / 2;

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
        <StoveStones />
      </group>

      <group position={[0.8, 0, -0.62]}>
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.2, 0.26, 24]} />
          <meshStandardMaterial color="#8b5f3e" roughness={0.76} metalness={0.08} />
        </mesh>
        <mesh position={[0, 0.35, 0]} castShadow>
          <torusGeometry args={[0.14, 0.014, 12, 28]} />
          <meshStandardMaterial color="#c2b199" roughness={0.48} metalness={0.3} />
        </mesh>

        <group position={[0.23, 0.42, -0.06]} rotation={[0, 0.38, -0.2]}>
          <mesh position={[0.28, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.58, 10]} />
            <meshStandardMaterial color="#c09c6e" roughness={0.72} metalness={0.06} />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.075, 14, 14]} />
            <meshStandardMaterial color="#b7babf" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
