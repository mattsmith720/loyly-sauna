"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useSaunaGame } from "./useSaunaGame";

const PARTICLE_COUNT = 120;

type SteamProps = {
  burstId: number;
  origin: [number, number, number];
};

export function Steam({ burstId, origin }: SteamProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  const life = useRef(0);
  const lastBurst = useRef(0);
  const { state } = useSaunaGame();

  const geometry = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      positions[i * 3] = origin[0] + (Math.random() - 0.5) * 0.35;
      positions[i * 3 + 1] = origin[1] + Math.random() * 0.2;
      positions[i * 3 + 2] = origin[2] + (Math.random() - 0.5) * 0.25;
    }
    return new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(positions, 3));
  }, [origin]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const density = state.reducedMotion ? 0.35 : 1;
    if (burstId !== lastBurst.current) {
      lastBurst.current = burstId;
      life.current = 1;
      const positions = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        velocities.current[i * 3] = (Math.random() - 0.5) * 0.25;
        velocities.current[i * 3 + 1] = 0.6 + Math.random() * 0.8;
        velocities.current[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
        positions.setXYZ(
          i,
          origin[0] + (Math.random() - 0.5) * 0.3,
          origin[1] + Math.random() * 0.15,
          origin[2] + (Math.random() - 0.5) * 0.2,
        );
      }
      positions.needsUpdate = true;
    }

    if (life.current <= 0) {
      pointsRef.current.visible = false;
      return;
    }

    pointsRef.current.visible = true;
    life.current = Math.max(0, life.current - delta * 0.35);
    const positions = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const x = positions.getX(i) + velocities.current[i * 3] * delta * density;
      const y = positions.getY(i) + velocities.current[i * 3 + 1] * delta * density;
      const z = positions.getZ(i) + velocities.current[i * 3 + 2] * delta * density;
      positions.setXYZ(i, x, y, z);
    }
    positions.needsUpdate = true;
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = life.current * 0.55 * density;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        color="#f0e6d6"
        size={0.08}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
