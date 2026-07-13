"use client";

import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const WOOD_BASE = "/game/textures/wooden_planks";

export function useWoodPlankMaps() {
  const [map, normalMap, roughnessMap] = useTexture([
    `${WOOD_BASE}/wooden_planks_diffuse_1k.jpg`,
    `${WOOD_BASE}/wooden_planks_nor_gl_1k.jpg`,
    `${WOOD_BASE}/wooden_planks_rough_1k.jpg`,
  ]);

  for (const tex of [map, normalMap, roughnessMap]) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
  }

  return { map, normalMap, roughnessMap };
}

export const GAME_MODELS = {
  lantern: "/game/models/lantern_01/Lantern_01_1k.gltf",
  barrel: "/game/models/barrel_01/Barrel_01_1k.gltf",
} as const;

export const GAME_HDRI = "/game/hdri/autumn_forest_02_1k.hdr";
