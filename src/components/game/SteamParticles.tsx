"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
} from "three";
import { createSoftParticleTexture } from "@/lib/game/textures";
import { gameStore } from "@/lib/game/store";

interface SteamParticlesProps {
  origin?: [number, number, number];
  count?: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  scale: number;
  seed: number;
  active: boolean;
}

const VERTEX_SHADER = /* glsl */ `
  attribute float aOpacity;
  attribute float aScale;
  varying float vOpacity;
  void main() {
    vOpacity = aOpacity;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aScale * (320.0 / max(0.1, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec3 uColor;
  varying float vOpacity;
  void main() {
    vec4 tex = texture2D(uTexture, gl_PointCoord);
    if (tex.a < 0.01) discard;
    gl_FragColor = vec4(uColor, tex.a * vOpacity);
  }
`;

export function SteamParticles({ origin = [1.18, 1.0, -0.92], count = 180 }: SteamParticlesProps) {
  const texture = useMemo(() => createSoftParticleTexture(), []);

  const { points, geometry, positions, opacities, scales } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const opacities = new Float32Array(count);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3 + 1] = -50;
      scales[i] = 1;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("aOpacity", new BufferAttribute(opacities, 1));
    geometry.setAttribute("aScale", new BufferAttribute(scales, 1));

    const material = new ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uColor: { value: new Color("#f3ead9") },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    const points = new Points(geometry, material);
    points.frustumCulled = false;
    return { points, geometry, positions, opacities, scales };
  }, [count, texture]);

  const particlesRef = useRef<Particle[]>(
    Array.from({ length: count }, () => ({
      x: 0,
      y: -50,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 1,
      scale: 1,
      seed: Math.random() * 1000,
      active: false,
    })),
  );
  const cursorRef = useRef(0);
  const emitBudgetRef = useRef(0);
  const lastLoylyRef = useRef<number | null>(gameStore.getState().session.ritual.lastLoylyAtMs);
  const elapsedRef = useRef(0);

  useEffect(() => {
    return () => {
      geometry.dispose();
      (points.material as ShaderMaterial).dispose();
      texture?.dispose();
    };
  }, [geometry, points, texture]);

  const spawn = (upwardBoost: number, spread: number, sizeBoost: number) => {
    const particles = particlesRef.current;
    let cursor = cursorRef.current;
    for (let attempt = 0; attempt < count; attempt += 1) {
      const particle = particles[cursor];
      cursor = (cursor + 1) % count;
      if (particle.active) continue;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * spread;
      particle.x = origin[0] + Math.cos(angle) * radius;
      particle.y = origin[1] + (Math.random() - 0.5) * 0.08;
      particle.z = origin[2] + Math.sin(angle) * radius;
      particle.vx = Math.cos(angle) * (0.04 + Math.random() * 0.08);
      particle.vz = Math.sin(angle) * (0.04 + Math.random() * 0.08);
      particle.vy = 0.18 + Math.random() * 0.22 + upwardBoost;
      particle.maxLife = 2.2 + Math.random() * 2.4;
      particle.life = particle.maxLife;
      particle.scale = (0.9 + Math.random() * 1.2) * sizeBoost;
      particle.seed = Math.random() * 1000;
      particle.active = true;
      cursorRef.current = cursor;
      return;
    }
    cursorRef.current = cursor;
  };

  useFrame((_, rawDelta) => {
    const delta = Math.min(0.05, rawDelta);
    elapsedRef.current += delta;
    const state = gameStore.getState();
    const humidity = state.session.ritual.humidityPercent;
    const phase = state.session.phase;
    const humidity01 = Math.min(1, Math.max(0, humidity / 100));

    const lastLoyly = state.session.ritual.lastLoylyAtMs;
    if (lastLoyly !== null && lastLoyly !== lastLoylyRef.current) {
      lastLoylyRef.current = lastLoyly;
      const burst = Math.round(26 + humidity01 * 60);
      for (let i = 0; i < burst; i += 1) {
        spawn(0.5 + humidity01 * 0.8, 0.16, 1.2);
      }
    } else if (lastLoyly === null) {
      lastLoylyRef.current = null;
    }

    if (phase !== "idle") {
      const rate = 1 + humidity01 * 10;
      emitBudgetRef.current += rate * delta;
      while (emitBudgetRef.current >= 1) {
        emitBudgetRef.current -= 1;
        spawn(0, 0.09, 0.8 + humidity01 * 0.45);
      }
    }

    const particles = particlesRef.current;
    const time = elapsedRef.current;
    for (let i = 0; i < count; i += 1) {
      const particle = particles[i];
      if (!particle.active) {
        opacities[i] = 0;
        continue;
      }
      particle.life -= delta;
      if (particle.life <= 0) {
        particle.active = false;
        particle.y = -50;
        positions[i * 3 + 1] = -50;
        opacities[i] = 0;
        continue;
      }

      const t = 1 - particle.life / particle.maxLife;
      particle.vy += delta * 0.12;
      particle.vy *= 0.992;
      const swirl = Math.sin(time * 1.3 + particle.seed) * 0.05;
      particle.x += (particle.vx + swirl * 0.4) * delta;
      particle.y += particle.vy * delta;
      particle.z += (particle.vz + Math.cos(time * 1.1 + particle.seed) * 0.05 * 0.4) * delta;

      positions[i * 3] = particle.x;
      positions[i * 3 + 1] = particle.y;
      positions[i * 3 + 2] = particle.z;

      const fadeIn = Math.min(1, t / 0.18);
      const fadeOut = Math.min(1, particle.life / 1.1);
      opacities[i] = fadeIn * fadeOut * 0.2;
      scales[i] = particle.scale * (0.75 + t * 1.8);
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aOpacity.needsUpdate = true;
    geometry.attributes.aScale.needsUpdate = true;
  });

  return <primitive object={points} />;
}
