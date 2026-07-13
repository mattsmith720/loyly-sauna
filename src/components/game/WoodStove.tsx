"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useSaunaGame } from "./useSaunaGame";
import type { InteractableId } from "./sauna-game-state";

const IRON_DARK = "#1d1b19";
const IRON = "#2b2824";
const IRON_LIGHT = "#3f3a33";
const STOVE_POSITION: [number, number, number] = [-0.72, 0, -1.16];

export const WOOD_STONES_ORIGIN: [number, number, number] = [
  STOVE_POSITION[0],
  1.25,
  STOVE_POSITION[2] + 0.04,
];
export const WOODPILE_POSITION: [number, number, number] = [-1.46, 0.08, -0.68];

function stoneOffset(index: number) {
  const ring = Math.floor(index / 10);
  const column = index % 10;
  const radius = ring === 0 ? 0.26 : ring === 1 ? 0.2 : 0.12;
  const theta = (column / 10) * Math.PI * 2 + ring * 0.22;
  return {
    x: Math.cos(theta) * radius,
    y: 1.18 + ring * 0.09 + (column % 2) * 0.015,
    z: Math.sin(theta) * (radius * 0.74),
    scale: 0.05 + (index % 4) * 0.009,
  };
}

export function WoodStove() {
  const { state } = useSaunaGame();
  const flameRef = useRef<THREE.Mesh>(null);
  const flameMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const fuelRatio = Math.min(1, state.fireFuel / 100);
  const glow = state.fireLit ? Math.min(1.7, 0.22 + fuelRatio * 1.35) : 0.03;
  const stones = useMemo(() => Array.from({ length: 26 }, (_, index) => stoneOffset(index)), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const speed = state.reducedMotion ? 4.2 : 9.8;
    const amount = (state.reducedMotion ? 0.03 : 0.09) + fuelRatio * (state.reducedMotion ? 0.05 : 0.13);
    const flicker = state.fireLit
      ? Math.max(0.72, 1 + Math.sin(t * speed) * amount + Math.sin(t * speed * 1.7) * amount * 0.55)
      : 0;
    if (flameRef.current && state.fireLit) {
      flameRef.current.scale.set(1, 0.84 + fuelRatio * 0.42 + (flicker - 1) * 0.3, 1);
      flameRef.current.position.y =
        0.48 + Math.sin(t * (state.reducedMotion ? 4.4 : 11.8)) * (state.reducedMotion ? 0.006 : 0.015);
    }
    if (flameMaterialRef.current) {
      flameMaterialRef.current.emissiveIntensity = state.fireLit
        ? 1.1 + fuelRatio * 1.6 + (flicker - 1) * 0.5
        : 0;
    }
    if (lightRef.current) {
      lightRef.current.intensity = state.fireLit
        ? (1.15 + fuelRatio * 2.1) * (state.reducedMotion ? 0.96 : 1 + (flicker - 1) * 0.22)
        : 0;
    }
  });

  return (
    <group position={STOVE_POSITION}>
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.98, 0.16, 0.92]} />
        <meshStandardMaterial color={IRON_DARK} roughness={0.82} metalness={0.22} />
      </mesh>
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.84, 1.04, 0.76]} />
        <meshStandardMaterial color={IRON} roughness={0.75} metalness={0.35} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.94, 0.12, 0.88]} />
        <meshStandardMaterial color={IRON_LIGHT} roughness={0.7} metalness={0.4} />
      </mesh>

      <mesh position={[0, 1.24, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.2, 0.62]} />
        <meshStandardMaterial
          color="#3a342f"
          emissive="#ff6a1a"
          emissiveIntensity={glow * 0.34}
          roughness={0.88}
        />
      </mesh>
      {Array.from({ length: 7 }).map((_, index) => {
        const x = -0.31 + index * 0.105;
        return (
          <mesh key={`rail-front-${index}`} position={[x, 1.24, 0.34]} castShadow>
            <boxGeometry args={[0.035, 0.22, 0.03]} />
            <meshStandardMaterial color="#4a443d" roughness={0.58} metalness={0.45} />
          </mesh>
        );
      })}
      {Array.from({ length: 7 }).map((_, index) => {
        const x = -0.31 + index * 0.105;
        return (
          <mesh key={`rail-back-${index}`} position={[x, 1.24, -0.3]} castShadow>
            <boxGeometry args={[0.035, 0.22, 0.03]} />
            <meshStandardMaterial color="#4a443d" roughness={0.58} metalness={0.45} />
          </mesh>
        );
      })}
      <mesh position={[0, 1.34, 0.02]} castShadow>
        <boxGeometry args={[0.72, 0.05, 0.62]} />
        <meshStandardMaterial color="#4f4a43" roughness={0.64} metalness={0.38} />
      </mesh>
      {stones.map((stone, index) => (
        <mesh key={`stone-${index}`} position={[stone.x, stone.y, stone.z]} castShadow>
          <dodecahedronGeometry args={[stone.scale, 0]} />
          <meshStandardMaterial
            color="#595148"
            emissive="#ff8a2c"
            emissiveIntensity={glow * (0.34 + (index % 5) * 0.08)}
            roughness={0.95}
          />
        </mesh>
      ))}
      <mesh position={[0, 1.25, 0.06]} userData={{ interactableId: "stones" as InteractableId }}>
        <boxGeometry args={[0.88, 0.44, 0.52]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh
        position={[0, 0.44, 0.42]}
        userData={{ interactableId: "firebox" as InteractableId }}
        castShadow
      >
        <boxGeometry args={[0.56, 0.46, 0.09]} />
        <meshStandardMaterial
          color={state.focusedInteractable === "firebox" ? "#c98c55" : "#181511"}
          emissive={state.fireLit ? "#ff5a18" : state.focusedInteractable === "firebox" ? "#55310f" : "#000000"}
          emissiveIntensity={state.fireLit ? glow * 0.75 : state.focusedInteractable === "firebox" ? 0.38 : 0}
          roughness={0.74}
          metalness={0.32}
        />
      </mesh>
      <mesh position={[0, 0.44, 0.47]}>
        <boxGeometry args={[0.61, 0.51, 0.015]} />
        <meshStandardMaterial
          color={state.focusedInteractable === "firebox" ? "#d8a367" : "#4b4339"}
          emissive={state.focusedInteractable === "firebox" ? "#5f3a12" : "#000000"}
          emissiveIntensity={state.focusedInteractable === "firebox" ? 0.28 : 0}
          roughness={0.45}
          metalness={0.64}
        />
      </mesh>
      <mesh position={[0, 0.44, 0.49]} castShadow>
        <torusGeometry args={[0.07, 0.01, 8, 20]} />
        <meshStandardMaterial color="#b8a995" roughness={0.4} metalness={0.68} />
      </mesh>

      {state.fireLit && (
        <mesh ref={flameRef} position={[0, 0.48, 0.13]}>
          <coneGeometry args={[0.14, 0.36, 7]} />
          <meshStandardMaterial
            ref={flameMaterialRef}
            color="#ff8a2a"
            emissive="#ff4a00"
            emissiveIntensity={1.4}
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </mesh>
      )}
      {state.fireLit && (
        <mesh position={[0, 0.29, 0.13]}>
          <sphereGeometry args={[0.11, 10, 10]} />
          <meshStandardMaterial
            color="#5a3520"
            emissive="#ff5b1c"
            emissiveIntensity={1.3}
            roughness={0.9}
          />
        </mesh>
      )}

      <pointLight
        ref={lightRef}
        intensity={state.fireLit ? 1.7 + glow : 0}
        color="#ff6a22"
        position={[0, 0.6, 0.22]}
        distance={5}
      />

      <mesh position={[0, 1.95, -0.08]} castShadow>
        <cylinderGeometry args={[0.1, 0.11, 1.5, 16]} />
        <meshStandardMaterial color="#34302b" roughness={0.7} metalness={0.54} />
      </mesh>
      <mesh position={[0, 3.02, -0.08]} castShadow>
        <cylinderGeometry args={[0.13, 0.11, 0.94, 16]} />
        <meshStandardMaterial color="#2c2824" roughness={0.8} metalness={0.45} />
      </mesh>
      <mesh position={[0, 3.6, -0.08]} castShadow>
        <coneGeometry args={[0.17, 0.22, 14]} />
        <meshStandardMaterial color="#25211d" roughness={0.82} metalness={0.34} />
      </mesh>

      <Text
        position={[0, 0.1, 0.5]}
        fontSize={0.05}
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
  const logs = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        return {
          x: col * 0.16 - 0.24 + (row % 2 === 0 ? 0.02 : -0.02),
          y: row * 0.11 + 0.05,
          z: (row % 2 === 0 ? 0.06 : -0.05) + ((index % 2) * 0.02 - 0.01),
          ry: row % 2 === 0 ? Math.PI / 2 : Math.PI / 2 + 0.05,
          rz: ((index % 3) - 1) * 0.08,
          radius: 0.042 + (index % 3) * 0.006,
        };
      }),
    [],
  );

  return (
    <group position={WOODPILE_POSITION}>
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.84, 0.08, 0.48]} />
        <meshStandardMaterial color="#3f352a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.03, 0.17]} castShadow>
        <boxGeometry args={[0.84, 0.06, 0.06]} />
        <meshStandardMaterial color="#4d4031" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.03, -0.17]} castShadow>
        <boxGeometry args={[0.84, 0.06, 0.06]} />
        <meshStandardMaterial color="#4d4031" roughness={0.92} />
      </mesh>
      {[-0.38, 0.38].map((x) => (
        <mesh key={x} position={[x, 0.18, 0]} castShadow>
          <boxGeometry args={[0.06, 0.34, 0.42]} />
          <meshStandardMaterial color="#4b3f31" roughness={0.9} />
        </mesh>
      ))}

      {logs.map((log, index) => (
        <mesh
          key={index}
          position={[log.x, log.y, log.z]}
          rotation={[0, log.ry, log.rz]}
          castShadow
        >
          <cylinderGeometry args={[log.radius, log.radius * 1.04, 0.48, 10]} />
          <meshStandardMaterial
            color={focused ? "#d39a63" : index % 2 === 0 ? "#6e4928" : "#825937"}
            emissive={focused ? "#5a3010" : "#000000"}
            emissiveIntensity={focused ? 0.35 : 0}
            roughness={0.93}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.26, 0]} userData={{ interactableId: "woodpile" as InteractableId }}>
        <boxGeometry args={[0.82, 0.58, 0.52]} />
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
