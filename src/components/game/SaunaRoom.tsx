"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, MeshStandardMaterial, PointLight } from "three";
import { ROOM_DIMENSIONS, WALL_THICKNESS } from "@/lib/game/constants";
import { gameStore } from "@/lib/game/store";
import {
  createExteriorTexture,
  createStoneTextures,
  createWoodTextures,
} from "@/lib/game/textures";

interface StoneData {
  position: [number, number, number];
  scale: number;
}

const TEMP_MIN = 60;
const TEMP_MAX = 115;

function heatIntensity(temperatureC: number): number {
  const t = Math.min(1, Math.max(0, (temperatureC - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)));
  return 0.12 + t * t * 2.4;
}

function StoveStones() {
  const material = useMemo(() => {
    const textures = createStoneTextures();
    return new MeshStandardMaterial({
      color: "#5a5652",
      roughness: 0.95,
      metalness: 0.04,
      map: textures?.map ?? null,
      emissive: new Color("#ff5a1e"),
      emissiveMap: textures?.emissiveMap ?? null,
      emissiveIntensity: 0.4,
    });
  }, []);

  const glowLightRef = useRef<PointLight | null>(null);

  const stones = useMemo<StoneData[]>(
    () =>
      Array.from({ length: 22 }, (_, index) => {
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

  useEffect(() => {
    return () => {
      material.dispose();
      material.map?.dispose();
      material.emissiveMap?.dispose();
    };
  }, [material]);

  useFrame((clockState) => {
    const temperatureC = gameStore.getState().session.ritual.temperatureC;
    const base = heatIntensity(temperatureC);
    const flicker = 0.85 + Math.sin(clockState.clock.elapsedTime * 7.3) * 0.06 + Math.sin(clockState.clock.elapsedTime * 13.1) * 0.04;
    material.emissiveIntensity = base * flicker;
    const hot = Math.min(1, Math.max(0, (temperatureC - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)));
    material.emissive.setRGB(1, 0.32 + hot * 0.18, 0.09 + hot * 0.05);
    if (glowLightRef.current) {
      glowLightRef.current.intensity = (0.6 + base * 1.4) * flicker;
    }
  });

  return (
    <>
      <pointLight
        ref={glowLightRef}
        position={[0, 0.95, 0]}
        color="#ff7a2a"
        intensity={1}
        distance={2.6}
        decay={2}
      />
      {stones.map((stone, index) => (
        <mesh key={`stone-${index}`} position={stone.position} material={material} castShadow receiveShadow>
          <icosahedronGeometry args={[stone.scale, 0]} />
        </mesh>
      ))}
    </>
  );
}

function ExteriorWindow() {
  const exterior = useMemo(() => createExteriorTexture(), []);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        map: exterior ?? null,
        color: exterior ? "#ffffff" : "#243a52",
        emissive: new Color("#3a4d66"),
        emissiveMap: exterior ?? null,
        emissiveIntensity: 0.6,
        roughness: 1,
        metalness: 0,
      }),
    [exterior],
  );

  useEffect(() => {
    return () => {
      material.dispose();
      exterior?.dispose();
    };
  }, [material, exterior]);

  const frameMaterial = useMemo(
    () => new MeshStandardMaterial({ color: "#3f2a19", roughness: 0.7, metalness: 0.05 }),
    [],
  );
  useEffect(() => () => frameMaterial.dispose(), [frameMaterial]);

  const halfWidth = ROOM_DIMENSIONS.width / 2;
  const winW = 1.0;
  const winH = 0.78;

  return (
    <group position={[-halfWidth + 0.02, 1.55, 0.4]} rotation={[0, Math.PI / 2, 0]}>
      <mesh material={material}>
        <planeGeometry args={[winW, winH]} />
      </mesh>
      <mesh position={[0, 0, 0.01]} material={frameMaterial}>
        <boxGeometry args={[winW + 0.12, 0.06, 0.06]} />
      </mesh>
      <group position={[0, -winH / 2 - 0.03, 0.01]}>
        <mesh material={frameMaterial}>
          <boxGeometry args={[winW + 0.12, 0.06, 0.07]} />
        </mesh>
      </group>
      <group position={[0, winH / 2 + 0.03, 0.01]}>
        <mesh material={frameMaterial}>
          <boxGeometry args={[winW + 0.12, 0.06, 0.06]} />
        </mesh>
      </group>
      <mesh position={[-winW / 2 - 0.03, 0, 0.01]} material={frameMaterial}>
        <boxGeometry args={[0.06, winH + 0.12, 0.06]} />
      </mesh>
      <mesh position={[winW / 2 + 0.03, 0, 0.01]} material={frameMaterial}>
        <boxGeometry args={[0.06, winH + 0.12, 0.06]} />
      </mesh>
      <mesh position={[0, 0, 0.01]} material={frameMaterial}>
        <boxGeometry args={[0.035, winH, 0.05]} />
      </mesh>
      <mesh position={[0, 0, 0.01]} material={frameMaterial}>
        <boxGeometry args={[winW, 0.035, 0.05]} />
      </mesh>
      <pointLight position={[0, 0, 0.6]} color="#7fa8d6" intensity={0.5} distance={2.4} decay={2} />
    </group>
  );
}

export function SaunaRoom() {
  const halfWidth = ROOM_DIMENSIONS.width / 2;
  const halfDepth = ROOM_DIMENSIONS.depth / 2;
  const wallHeightCenter = ROOM_DIMENSIONS.height / 2;

  const wallMaterials = useMemo(() => {
    const make = (base: string, seed: number, repeat: [number, number], planks: number) => {
      const textures = createWoodTextures({ base, seed, repeat, planks });
      return new MeshStandardMaterial({
        color: base,
        roughness: 0.86,
        metalness: 0.02,
        map: textures?.map ?? null,
        bumpMap: textures?.bumpMap ?? null,
        bumpScale: 0.4,
      });
    };

    return {
      floor: make("#6a4425", 3, [3, 2], 8),
      ceiling: make("#4f331f", 9, [3, 2], 7),
      wallBack: make("#7a5030", 11, [3, 2], 7),
      wallFront: make("#754c2d", 17, [3, 2], 7),
      wallLeft: make("#6f492b", 21, [2, 2], 7),
      wallRight: make("#734d2f", 29, [2, 2], 7),
      bench: make("#a06d3c", 5, [2, 1], 4),
      benchLeg: make("#6e4526", 33, [1, 1], 2),
    };
  }, []);

  const accentMaterials = useMemo(
    () => ({
      stoveBody: new MeshStandardMaterial({ color: "#26262b", roughness: 0.4, metalness: 0.55 }),
      stoveTop: new MeshStandardMaterial({ color: "#34343a", roughness: 0.5, metalness: 0.4 }),
      bucketWood: new MeshStandardMaterial({ color: "#8a5a34", roughness: 0.72, metalness: 0.05 }),
      bucketBand: new MeshStandardMaterial({ color: "#b9bcc2", roughness: 0.32, metalness: 0.72 }),
      ladleHandle: new MeshStandardMaterial({ color: "#c09c6e", roughness: 0.68, metalness: 0.05 }),
      ladleBowl: new MeshStandardMaterial({ color: "#c2c6cc", roughness: 0.26, metalness: 0.78 }),
    }),
    [],
  );

  useEffect(() => {
    const wall = wallMaterials;
    const accents = accentMaterials;
    return () => {
      Object.values(wall).forEach((material) => {
        material.dispose();
        material.map?.dispose();
        material.bumpMap?.dispose();
      });
      Object.values(accents).forEach((material) => material.dispose());
    };
  }, [wallMaterials, accentMaterials]);

  return (
    <group>
      <mesh position={[0, -WALL_THICKNESS / 2, 0]} material={wallMaterials.floor} receiveShadow>
        <boxGeometry args={[ROOM_DIMENSIONS.width, WALL_THICKNESS, ROOM_DIMENSIONS.depth]} />
      </mesh>

      <mesh
        position={[0, ROOM_DIMENSIONS.height + WALL_THICKNESS / 2, 0]}
        material={wallMaterials.ceiling}
        receiveShadow
      >
        <boxGeometry args={[ROOM_DIMENSIONS.width, WALL_THICKNESS, ROOM_DIMENSIONS.depth]} />
      </mesh>

      <mesh
        position={[0, wallHeightCenter, -halfDepth - WALL_THICKNESS / 2]}
        material={wallMaterials.wallBack}
        receiveShadow
      >
        <boxGeometry args={[ROOM_DIMENSIONS.width, ROOM_DIMENSIONS.height, WALL_THICKNESS]} />
      </mesh>

      <mesh
        position={[0, wallHeightCenter, halfDepth + WALL_THICKNESS / 2]}
        material={wallMaterials.wallFront}
        receiveShadow
      >
        <boxGeometry args={[ROOM_DIMENSIONS.width, ROOM_DIMENSIONS.height, WALL_THICKNESS]} />
      </mesh>

      <mesh
        position={[-halfWidth - WALL_THICKNESS / 2, wallHeightCenter, 0]}
        material={wallMaterials.wallLeft}
        receiveShadow
      >
        <boxGeometry args={[WALL_THICKNESS, ROOM_DIMENSIONS.height, ROOM_DIMENSIONS.depth + WALL_THICKNESS * 2]} />
      </mesh>

      <mesh
        position={[halfWidth + WALL_THICKNESS / 2, wallHeightCenter, 0]}
        material={wallMaterials.wallRight}
        receiveShadow
      >
        <boxGeometry args={[WALL_THICKNESS, ROOM_DIMENSIONS.height, ROOM_DIMENSIONS.depth + WALL_THICKNESS * 2]} />
      </mesh>

      <ExteriorWindow />

      <group position={[-1.05, 0, -0.82]}>
        <mesh position={[0, 0.22, 0]} material={wallMaterials.bench} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.09, 0.78]} />
        </mesh>
        <mesh position={[0, 0.52, -0.34]} material={wallMaterials.bench} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.09, 0.42]} />
        </mesh>
        <mesh position={[-0.68, 0.11, -0.33]} material={wallMaterials.benchLeg} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.22, 0.1]} />
        </mesh>
        <mesh position={[0.68, 0.11, -0.33]} material={wallMaterials.benchLeg} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.22, 0.1]} />
        </mesh>
      </group>

      <group position={[1.18, 0, -0.92]}>
        <mesh position={[0, 0.36, 0]} material={accentMaterials.stoveBody} castShadow receiveShadow>
          <boxGeometry args={[0.62, 0.72, 0.62]} />
        </mesh>
        <mesh position={[0, 0.78, 0]} material={accentMaterials.stoveTop} castShadow receiveShadow>
          <boxGeometry args={[0.54, 0.2, 0.54]} />
        </mesh>
        <StoveStones />
      </group>

      <group position={[0.8, 0, -0.62]}>
        <mesh position={[0, 0.22, 0]} material={accentMaterials.bucketWood} castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.2, 0.26, 24]} />
        </mesh>
        <mesh position={[0, 0.3, 0]} material={accentMaterials.bucketBand} castShadow>
          <torusGeometry args={[0.168, 0.012, 10, 28]} />
        </mesh>
        <mesh position={[0, 0.14, 0]} material={accentMaterials.bucketBand} castShadow>
          <torusGeometry args={[0.188, 0.012, 10, 28]} />
        </mesh>
        <mesh position={[0, 0.35, 0]} material={accentMaterials.bucketBand} castShadow>
          <torusGeometry args={[0.14, 0.014, 12, 28]} />
        </mesh>

        <group position={[0.23, 0.42, -0.06]} rotation={[0, 0.38, -0.2]}>
          <mesh position={[0.28, 0.02, 0]} material={accentMaterials.ladleHandle} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.58, 10]} />
          </mesh>
          <mesh position={[0, 0, 0]} material={accentMaterials.ladleBowl} castShadow receiveShadow>
            <sphereGeometry args={[0.075, 16, 16]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
