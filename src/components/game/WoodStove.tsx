"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useSaunaGame } from "./useSaunaGame";
import type { InteractableId } from "./sauna-game-state";

const IRON = "#2a2622";
const IRON_LIGHT = "#3a342e";

export function WoodStove() {
  const { state } = useSaunaGame();
  const flameRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const glow = state.fireLit ? Math.min(1.4, 0.35 + state.fireFuel / 70) : 0;

  useFrame(({ clock }) => {
    if (!flameRef.current || !state.fireLit) return;
    const t = clock.elapsedTime;
    const flicker = 0.85 + Math.sin(t * 11) * 0.12 + Math.sin(t * 17.3) * 0.08;
    flameRef.current.scale.set(1, flicker, 1);
    if (lightRef.current) {
      lightRef.current.intensity = (1.6 + glow) * flicker;
    }
  });

  return (
    <group position={[0, 0, -1.4]}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.84, 0.7]} />
        <meshStandardMaterial color={IRON} roughness={0.75} metalness={0.35} />
      </mesh>
      <mesh position={[0.28, 1.15, -0.1]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.9, 10]} />
        <meshStandardMaterial color={IRON_LIGHT} roughness={0.7} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.95, 0.05]} castShadow>
        <boxGeometry args={[0.85, 0.22, 0.55]} />
        <meshStandardMaterial
          color="#3a342e"
          emissive="#ff6a1a"
          emissiveIntensity={glow * 0.8}
          roughness={0.85}
        />
      </mesh>
      {Array.from({ length: 14 }).map((_, index) => {
        const row = Math.floor(index / 5);
        const col = index % 5;
        return (
          <mesh key={index} position={[-0.28 + col * 0.14, 1.08 + row * 0.09, 0.05]} castShadow>
            <sphereGeometry args={[0.05 + (index % 3) * 0.006, 8, 8]} />
            <meshStandardMaterial
              color="#5a5148"
              emissive="#ff7a22"
              emissiveIntensity={glow * 0.7}
              roughness={0.95}
            />
          </mesh>
        );
      })}
      <mesh position={[0, 1.12, 0.12]} userData={{ interactableId: "stones" as InteractableId }}>
        <boxGeometry args={[0.8, 0.35, 0.35]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh
        position={[0, 0.38, 0.36]}
        userData={{ interactableId: "firebox" as InteractableId }}
        castShadow
      >
        <boxGeometry args={[0.55, 0.42, 0.06]} />
        <meshStandardMaterial
          color={state.focusedInteractable === "firebox" ? "#ddb882" : "#1a1613"}
          emissive={state.fireLit ? "#ff5510" : "#000000"}
          emissiveIntensity={state.fireLit ? glow * 0.9 : 0}
          roughness={0.8}
          metalness={0.25}
        />
      </mesh>

      {state.fireLit && (
        <mesh ref={flameRef} position={[0, 0.4, 0.15]}>
          <coneGeometry args={[0.12, 0.32, 6]} />
          <meshStandardMaterial
            color="#ff8a2a"
            emissive="#ff4a00"
            emissiveIntensity={1.8}
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </mesh>
      )}

      <pointLight
        ref={lightRef}
        intensity={state.fireLit ? 1.8 + glow : 0}
        color="#ff6a22"
        position={[0, 0.55, 0.25]}
        distance={4}
      />

      <Text
        position={[0, 0.08, 0.4]}
        fontSize={0.055}
        color="#c4b8a8"
        anchorX="center"
        anchorY="middle"
      >
        {state.fireLit ? `FIRE ${Math.round(state.fireFuel)}%` : "FIREBOX"}
      </Text>
    </group>
  );
}

export function Woodpile() {
  const { state } = useSaunaGame();
  const focused = state.focusedInteractable === "woodpile";

  return (
    <group position={[-1.55, 0.15, 0.85]}>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          position={[(i % 3) * 0.14 - 0.14, Math.floor(i / 3) * 0.12, 0]}
          rotation={[0, 0.2 * i, 0.1]}
          castShadow
        >
          <cylinderGeometry args={[0.05, 0.055, 0.45, 8]} />
          <meshStandardMaterial
            color={focused ? "#ddb882" : "#6b4423"}
            emissive={focused ? "#5a3010" : "#000000"}
            emissiveIntensity={focused ? 0.35 : 0}
            roughness={0.9}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.2, 0]} userData={{ interactableId: "woodpile" as InteractableId }}>
        <boxGeometry args={[0.55, 0.45, 0.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function HeldWood() {
  const { state } = useSaunaGame();
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current || !state.holdingWood) return;
    group.current.position.copy(camera.position);
    group.current.quaternion.copy(camera.quaternion);
  });

  if (!state.holdingWood) return null;

  return (
    <group ref={group}>
      <mesh position={[0.25, -0.25, -0.42]} rotation={[0.4, 0.3, 0.2]} castShadow>
        <cylinderGeometry args={[0.04, 0.045, 0.35, 8]} />
        <meshStandardMaterial color="#8b5e34" roughness={0.88} />
      </mesh>
    </group>
  );
}
