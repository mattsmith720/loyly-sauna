"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useSaunaGame } from "./useSaunaGame";

/** First-person ladle view model when holding. */
export function HeldLadle() {
  const { state } = useSaunaGame();
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current || !state.holdingLadle) return;
    group.current.position.copy(camera.position);
    group.current.quaternion.copy(camera.quaternion);
  });

  if (!state.holdingLadle) return null;

  return (
    <group ref={group}>
      <group position={[0.28, -0.28, -0.48]} rotation={[0.35, 0.15, 0.25]}>
        <mesh castShadow>
          <boxGeometry args={[0.04, 0.32, 0.04]} />
          <meshStandardMaterial color="#b07a4f" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[1.2, 0, 0]} castShadow>
          <torusGeometry args={[0.07, 0.014, 8, 16]} />
          <meshStandardMaterial color="#96613a" roughness={0.75} />
        </mesh>
        {state.ladleHasWater && (
          <mesh position={[0, 0.22, 0.02]}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial color="#6a9ab0" transparent opacity={0.7} roughness={0.15} />
          </mesh>
        )}
      </group>
    </group>
  );
}
