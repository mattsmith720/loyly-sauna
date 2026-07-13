"use client";

import { useGLTF } from "@react-three/drei";
import { GAME_MODELS } from "./game-assets";

type ModelProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
};

export function LanternModel({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: ModelProps) {
  const { scene } = useGLTF(GAME_MODELS.lantern);
  const s = typeof scale === "number" ? [scale, scale, scale] : scale;
  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={rotation}
      scale={s as [number, number, number]}
      castShadow
      receiveShadow
    />
  );
}

export function BarrelModel({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: ModelProps) {
  const { scene } = useGLTF(GAME_MODELS.barrel);
  const s = typeof scale === "number" ? [scale, scale, scale] : scale;
  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={rotation}
      scale={s as [number, number, number]}
      castShadow
      receiveShadow
    />
  );
}

useGLTF.preload(GAME_MODELS.lantern);
useGLTF.preload(GAME_MODELS.barrel);
