"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useSaunaGame } from "./useSaunaGame";

const PARTICLE_COUNT = 140;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type SteamProps = {
  burstId: number;
  origin: [number, number, number];
};

export function Steam({ burstId, origin }: SteamProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  const activeCount = useRef(0);
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
    const humidityBoost = clamp((state.humidity - 28) / 58, 0, 1);
    const motionDensity = state.reducedMotion ? 0.45 : 1;
    if (burstId !== lastBurst.current) {
      lastBurst.current = burstId;
      activeCount.current = Math.max(
        14,
        Math.round(PARTICLE_COUNT * motionDensity * (0.65 + humidityBoost * 0.6)),
      );
      life.current = 0.82 + humidityBoost * 0.5;
      const positions = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        if (i < activeCount.current) {
          velocities.current[i * 3] = (Math.random() - 0.5) * (0.18 + humidityBoost * 0.2);
          velocities.current[i * 3 + 1] = 0.52 + Math.random() * (0.78 + humidityBoost * 0.46);
          velocities.current[i * 3 + 2] = (Math.random() - 0.5) * (0.15 + humidityBoost * 0.17);
          positions.setXYZ(
            i,
            origin[0] + (Math.random() - 0.5) * (0.26 + humidityBoost * 0.15),
            origin[1] + Math.random() * (0.12 + humidityBoost * 0.14),
            origin[2] + (Math.random() - 0.5) * (0.18 + humidityBoost * 0.12),
          );
        } else {
          velocities.current[i * 3] = 0;
          velocities.current[i * 3 + 1] = 0;
          velocities.current[i * 3 + 2] = 0;
          positions.setXYZ(i, origin[0], origin[1] - 4, origin[2]);
        }
      }
      pointsRef.current.geometry.setDrawRange(0, activeCount.current);
      positions.needsUpdate = true;
    }

    if (life.current <= 0) {
      pointsRef.current.visible = false;
      pointsRef.current.geometry.setDrawRange(0, 0);
      return;
    }

    pointsRef.current.visible = true;
    life.current = Math.max(0, life.current - delta * (state.reducedMotion ? 0.48 : 0.34));
    const positions = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const drift = state.reducedMotion ? 0.72 : 1;
    for (let i = 0; i < activeCount.current; i += 1) {
      const x = positions.getX(i) + velocities.current[i * 3] * delta * drift;
      const y = positions.getY(i) + velocities.current[i * 3 + 1] * delta * drift;
      const z = positions.getZ(i) + velocities.current[i * 3 + 2] * delta * drift;
      positions.setXYZ(i, x, y, z);
    }
    positions.needsUpdate = true;
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = life.current * (state.reducedMotion ? 0.3 : 0.5) * (0.82 + humidityBoost * 0.5);
    material.size = 0.07 + humidityBoost * 0.04;
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
