"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useWoodPlankMaps } from "./game-assets";

type WoodPlankMaterialProps = {
  repeat?: [number, number];
  color?: string;
  roughness?: number;
  metalness?: number;
  normalScale?: [number, number];
};

function cloneTexture(source: THREE.Texture, repeatX: number, repeatY: number) {
  const texture = source.clone();
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.needsUpdate = true;
  return texture;
}

export function WoodPlankMaterial({
  repeat = [2, 2],
  color,
  roughness = 0.9,
  metalness = 0.02,
  normalScale = [0.45, 0.45],
}: WoodPlankMaterialProps) {
  const { map: baseMap, normalMap: baseNormalMap, roughnessMap: baseRoughnessMap } = useWoodPlankMaps();
  const [repeatX, repeatY] = repeat;

  const map = useMemo(() => cloneTexture(baseMap, repeatX, repeatY), [baseMap, repeatX, repeatY]);
  const normalMap = useMemo(
    () => cloneTexture(baseNormalMap, repeatX, repeatY),
    [baseNormalMap, repeatX, repeatY],
  );
  const roughnessMap = useMemo(
    () => cloneTexture(baseRoughnessMap, repeatX, repeatY),
    [baseRoughnessMap, repeatX, repeatY],
  );
  const normalScaleVector = useMemo(
    () => new THREE.Vector2(normalScale[0], normalScale[1]),
    [normalScale[0], normalScale[1]],
  );

  useEffect(
    () => () => {
      map.dispose();
      normalMap.dispose();
      roughnessMap.dispose();
    },
    [map, normalMap, roughnessMap],
  );

  return (
    <meshStandardMaterial
      map={map}
      normalMap={normalMap}
      roughnessMap={roughnessMap}
      color={color}
      roughness={roughness}
      metalness={metalness}
      normalScale={normalScaleVector}
    />
  );
}
