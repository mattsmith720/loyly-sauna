"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  type Points,
  ShaderMaterial,
} from "three";
import { createSteamSprite } from "@/lib/game/textures";
import { gameStore } from "@/lib/game/store";

const MAX_PARTICLES = 240;
const BURST_PARTICLES = 60;

interface ParticlePool {
  px: Float32Array;
  py: Float32Array;
  pz: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  vz: Float32Array;
  age: Float32Array;
  life: Float32Array;
  baseScale: Float32Array;
}

const vertexShader = /* glsl */ `
  attribute float aScale;
  attribute float aOpacity;
  varying float vOpacity;

  void main() {
    vOpacity = aOpacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aScale * (320.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec3 uColor;
  varying float vOpacity;

  void main() {
    vec4 tex = texture2D(uTexture, gl_PointCoord);
    if (tex.a < 0.01) discard;
    gl_FragColor = vec4(uColor, tex.a * vOpacity);
  }
`;

interface SteamParticlesProps {
  origin: [number, number, number];
}

export function SteamParticles({ origin }: SteamParticlesProps) {
  const pointsRef = useRef<Points>(null);
  const lastPourCount = useRef(0);
  const ambientAccumulator = useRef(0);

  const pool = useMemo<ParticlePool>(
    () => ({
      px: new Float32Array(MAX_PARTICLES),
      py: new Float32Array(MAX_PARTICLES),
      pz: new Float32Array(MAX_PARTICLES),
      vx: new Float32Array(MAX_PARTICLES),
      vy: new Float32Array(MAX_PARTICLES),
      vz: new Float32Array(MAX_PARTICLES),
      age: new Float32Array(MAX_PARTICLES),
      life: new Float32Array(MAX_PARTICLES),
      baseScale: new Float32Array(MAX_PARTICLES),
    }),
    [],
  );

  const { geometry, material, positionAttr, scaleAttr, opacityAttr } = useMemo(() => {
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const scales = new Float32Array(MAX_PARTICLES);
    const opacities = new Float32Array(MAX_PARTICLES);
    for (let i = 0; i < MAX_PARTICLES; i += 1) {
      positions[i * 3 + 1] = -9999;
    }

    const geo = new BufferGeometry();
    const positionAttribute = new BufferAttribute(positions, 3);
    const scaleAttribute = new BufferAttribute(scales, 1);
    const opacityAttribute = new BufferAttribute(opacities, 1);
    positionAttribute.setUsage(DynamicDrawUsage);
    scaleAttribute.setUsage(DynamicDrawUsage);
    opacityAttribute.setUsage(DynamicDrawUsage);
    geo.setAttribute("position", positionAttribute);
    geo.setAttribute("aScale", scaleAttribute);
    geo.setAttribute("aOpacity", opacityAttribute);

    const sprite = createSteamSprite();
    const mat = new ShaderMaterial({
      uniforms: {
        uTexture: { value: sprite },
        uColor: { value: new Color("#f4efe6") },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    return {
      geometry: geo,
      material: mat,
      positionAttr: positionAttribute,
      scaleAttr: scaleAttribute,
      opacityAttr: opacityAttribute,
    };
  }, []);

  const spawnParticle = (index: number, burst: boolean) => {
    const spread = burst ? 0.16 : 0.1;
    pool.px[index] = (Math.random() - 0.5) * spread;
    pool.py[index] = burst ? 0.02 : Math.random() * 0.08;
    pool.pz[index] = (Math.random() - 0.5) * spread;

    const outward = burst ? 0.35 : 0.12;
    pool.vx[index] = (Math.random() - 0.5) * outward;
    pool.vz[index] = (Math.random() - 0.5) * outward;
    pool.vy[index] = burst ? 0.7 + Math.random() * 0.5 : 0.22 + Math.random() * 0.2;

    pool.age[index] = 0;
    pool.life[index] = burst ? 1.6 + Math.random() * 1.1 : 2.6 + Math.random() * 1.8;
    pool.baseScale[index] = (burst ? 26 : 20) + Math.random() * 16;
  };

  const emit = (count: number, burst: boolean) => {
    let spawned = 0;
    for (let i = 0; i < MAX_PARTICLES && spawned < count; i += 1) {
      if (pool.age[i] >= pool.life[i]) {
        spawnParticle(i, burst);
        spawned += 1;
      }
    }
  };

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const state = gameStore.getState();
    const steamLevel = state.sauna.steamLevel;
    const isActive = state.session.phase === "playing";

    if (state.sauna.pourCount !== lastPourCount.current) {
      lastPourCount.current = state.sauna.pourCount;
      if (isActive) {
        emit(BURST_PARTICLES, true);
      }
    }

    if (isActive && steamLevel > 0.02) {
      ambientAccumulator.current += delta * (6 + steamLevel * 26);
      const toSpawn = Math.floor(ambientAccumulator.current);
      if (toSpawn > 0) {
        ambientAccumulator.current -= toSpawn;
        emit(toSpawn, false);
      }
    }

    const positions = positionAttr.array as Float32Array;
    const scales = scaleAttr.array as Float32Array;
    const opacities = opacityAttr.array as Float32Array;

    for (let i = 0; i < MAX_PARTICLES; i += 1) {
      if (pool.age[i] >= pool.life[i]) {
        opacities[i] = 0;
        positions[i * 3 + 1] = -9999;
        continue;
      }

      pool.age[i] += delta;
      const lifeRatio = pool.age[i] / pool.life[i];

      pool.vy[i] += delta * 0.12;
      pool.vx[i] *= 1 - delta * 0.7;
      pool.vz[i] *= 1 - delta * 0.7;
      pool.px[i] += pool.vx[i] * delta;
      pool.py[i] += pool.vy[i] * delta;
      pool.pz[i] += pool.vz[i] * delta;

      positions[i * 3] = pool.px[i];
      positions[i * 3 + 1] = pool.py[i];
      positions[i * 3 + 2] = pool.pz[i];

      const fadeIn = Math.min(1, lifeRatio / 0.18);
      const fadeOut = 1 - Math.max(0, (lifeRatio - 0.4) / 0.6);
      opacities[i] = Math.max(0, fadeIn * fadeOut) * 0.5;
      scales[i] = pool.baseScale[i] * (0.5 + lifeRatio * 1.3);
    }

    positionAttr.needsUpdate = true;
    scaleAttr.needsUpdate = true;
    opacityAttr.needsUpdate = true;

    if (pointsRef.current) {
      pointsRef.current.visible = true;
    }
  });

  return (
    <points ref={pointsRef} position={origin} geometry={geometry} material={material} frustumCulled={false} />
  );
}
