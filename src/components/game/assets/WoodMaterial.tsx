"use client";

import { useWoodPlankMaps } from "./game-assets";

type WoodPlankMaterialProps = {
  repeat?: [number, number];
  color?: string;
};

export function WoodPlankMaterial({ repeat = [2, 2], color }: WoodPlankMaterialProps) {
  const { map, normalMap, roughnessMap } = useWoodPlankMaps();

  map.repeat.set(repeat[0], repeat[1]);
  normalMap.repeat.set(repeat[0], repeat[1]);
  roughnessMap.repeat.set(repeat[0], repeat[1]);

  return (
    <meshStandardMaterial
      map={map}
      normalMap={normalMap}
      roughnessMap={roughnessMap}
      color={color}
      roughness={0.92}
      metalness={0.02}
    />
  );
}
