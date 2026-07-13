"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useSaunaGame } from "./useSaunaGame";

function Tree({ position }: { position: [number, number, number] }) {
  const height = 3.2 + (Math.abs(position[0]) % 7) * 0.15;
  return (
    <group position={position}>
      <mesh position={[0, height * 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, height * 0.35, 8]} />
        <meshStandardMaterial color="#3a2a1c" roughness={0.95} />
      </mesh>
      <mesh position={[0, height * 0.55, 0]} castShadow>
        <coneGeometry args={[0.85, height * 0.55, 8]} />
        <meshStandardMaterial color="#1f3a28" roughness={0.92} />
      </mesh>
      <mesh position={[0, height * 0.85, 0]} castShadow>
        <coneGeometry args={[0.55, height * 0.35, 8]} />
        <meshStandardMaterial color="#2a4a32" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Fireflies({ active }: { active: boolean }) {
  const points = useRef<THREE.Points>(null);
  const base = useMemo(() => {
    const arr = new Float32Array(40 * 3);
    for (let i = 0; i < 40; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = 0.4 + Math.random() * 2.2;
      arr[i * 3 + 2] = 2 + Math.random() * 10;
    }
    return arr;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(base.slice(), 3));
    return geo;
  }, [base]);

  useFrame(({ clock }) => {
    if (!points.current || !active) return;
    const t = clock.elapsedTime;
    const attr = points.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < 40; i += 1) {
      attr.setY(i, base[i * 3 + 1] + Math.sin(t * 1.2 + i) * 0.08);
    }
    attr.needsUpdate = true;
    const mat = points.current.material as THREE.PointsMaterial;
    mat.opacity = 0.35 + Math.sin(t * 2) * 0.15;
  });

  if (!active) return null;

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial color="#ddb882" size={0.06} transparent opacity={0.4} depthWrite={false} />
    </points>
  );
}

export function Forest() {
  const { state } = useSaunaGame();

  const treePositions = useMemo(() => {
    const spots: [number, number, number][] = [];
    for (let i = -6; i <= 6; i += 1) {
      spots.push([i * 1.6 - 0.4, 0, 4.5 + Math.abs(i % 3) * 0.7]);
      spots.push([i * 1.5 + 0.8, 0, 7 + (i % 2) * 0.9]);
      spots.push([-7.5, 0, 3 + i * 0.55]);
      spots.push([7.5, 0, 3.2 + i * 0.5]);
    }
    return spots;
  }, []);

  if (state.saunaType !== "woodfired") return null;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 5]} receiveShadow>
        <planeGeometry args={[22, 18]} />
        <meshStandardMaterial color="#1a2618" roughness={0.98} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 2.6]} receiveShadow>
        <circleGeometry args={[2.2, 24]} />
        <meshStandardMaterial color="#2a3224" roughness={0.96} />
      </mesh>

      <mesh position={[0, 0.05, 2.15]} receiveShadow castShadow>
        <boxGeometry args={[3.2, 0.12, 1.8]} />
        <meshStandardMaterial color="#3a2a1c" roughness={0.92} />
      </mesh>
      <mesh position={[-1.35, 0.45, 2.6]} castShadow>
        <boxGeometry args={[0.12, 0.7, 0.12]} />
        <meshStandardMaterial color="#2b2118" roughness={0.9} />
      </mesh>
      <mesh position={[1.35, 0.45, 2.6]} castShadow>
        <boxGeometry args={[0.12, 0.7, 0.12]} />
        <meshStandardMaterial color="#2b2118" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.85, 2.6]} castShadow>
        <boxGeometry args={[2.9, 0.08, 0.12]} />
        <meshStandardMaterial color="#4a3424" roughness={0.88} />
      </mesh>

      <group position={[1.8, 0.08, 3.4]}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35]} castShadow>
              <boxGeometry args={[0.16, 0.1, 0.1]} />
              <meshStandardMaterial color="#5a5148" roughness={0.95} />
            </mesh>
          );
        })}
      </group>

      {treePositions.map((pos, i) => (
        <Tree key={i} position={pos} />
      ))}

      <hemisphereLight intensity={0.28} color="#6a7a8a" groundColor="#0e160f" />
      <directionalLight
        castShadow
        intensity={0.35}
        color="#c8d4e0"
        position={[-4, 6, 8]}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight intensity={0.25} color="#8aa0b8" position={[0, 3.5, 5]} distance={12} />
      <Fireflies active={!state.reducedMotion && (state.playerMode === "outside" || state.doorOpen)} />
    </group>
  );
}
