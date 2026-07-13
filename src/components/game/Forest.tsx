"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useSaunaGame } from "./useSaunaGame";
import { WOODFIRED_FOREST_TREES } from "./forest-layout";

function ForestTrees() {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const canopyLowerRef = useRef<THREE.InstancedMesh>(null);
  const canopyUpperRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!trunkRef.current || !canopyLowerRef.current || !canopyUpperRef.current) return;
    const dummy = new THREE.Object3D();
    const trunkColor = new THREE.Color();
    const canopyColor = new THREE.Color();

    WOODFIRED_FOREST_TREES.forEach((tree, index) => {
      dummy.position.set(tree.x, tree.trunkHeight * 0.5, tree.z);
      dummy.scale.set(tree.trunkRadius, tree.trunkHeight, tree.trunkRadius);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(index, dummy.matrix);
      trunkColor.setHSL(0.08, 0.35, 0.16 + (index % 5) * 0.01);
      trunkRef.current?.setColorAt(index, trunkColor);

      dummy.position.set(tree.x, tree.trunkHeight * tree.canopyLift, tree.z);
      dummy.scale.set(tree.canopyRadius, tree.canopyHeight, tree.canopyRadius);
      dummy.updateMatrix();
      canopyLowerRef.current?.setMatrixAt(index, dummy.matrix);
      canopyColor.setHSL(tree.hue, tree.saturation, tree.lightness);
      canopyLowerRef.current?.setColorAt(index, canopyColor);

      dummy.position.set(tree.x, tree.trunkHeight * (tree.canopyLift + 0.55), tree.z);
      dummy.scale.set(tree.canopyRadius * 0.72, tree.canopyHeight * 0.66, tree.canopyRadius * 0.72);
      dummy.updateMatrix();
      canopyUpperRef.current?.setMatrixAt(index, dummy.matrix);
      canopyUpperRef.current?.setColorAt(index, canopyColor.offsetHSL(-0.01, -0.02, 0.06));
    });

    trunkRef.current.instanceMatrix.needsUpdate = true;
    canopyLowerRef.current.instanceMatrix.needsUpdate = true;
    canopyUpperRef.current.instanceMatrix.needsUpdate = true;

    if (trunkRef.current.instanceColor) trunkRef.current.instanceColor.needsUpdate = true;
    if (canopyLowerRef.current.instanceColor) canopyLowerRef.current.instanceColor.needsUpdate = true;
    if (canopyUpperRef.current.instanceColor) canopyUpperRef.current.instanceColor.needsUpdate = true;
  }, []);

  return (
    <>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, WOODFIRED_FOREST_TREES.length]} castShadow>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial roughness={0.97} metalness={0.02} vertexColors />
      </instancedMesh>
      <instancedMesh ref={canopyLowerRef} args={[undefined, undefined, WOODFIRED_FOREST_TREES.length]} castShadow>
        <coneGeometry args={[1, 1, 10]} />
        <meshStandardMaterial roughness={0.92} metalness={0} vertexColors />
      </instancedMesh>
      <instancedMesh ref={canopyUpperRef} args={[undefined, undefined, WOODFIRED_FOREST_TREES.length]} castShadow>
        <coneGeometry args={[1, 1, 10]} />
        <meshStandardMaterial roughness={0.9} metalness={0} vertexColors />
      </instancedMesh>
    </>
  );
}

function Fireflies({ active }: { active: boolean }) {
  const points = useRef<THREE.Points>(null);
  const base = useMemo(() => {
    const count = 24;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.4 + ((i * 0.73) % 5.1);
      arr[i * 3] = Math.cos(angle) * radius + Math.sin(i * 1.17) * 0.8;
      arr[i * 3 + 1] = 0.5 + ((i * 0.37) % 1.6);
      arr[i * 3 + 2] = 5.2 + Math.sin(i * 0.82) * 3.1;
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
    for (let i = 0; i < 24; i += 1) {
      attr.setY(i, base[i * 3 + 1] + Math.sin(t * 0.7 + i * 1.3) * 0.05);
    }
    attr.needsUpdate = true;
    const mat = points.current.material as THREE.PointsMaterial;
    mat.opacity = 0.24 + Math.sin(t * 1.2) * 0.08;
  });

  if (!active) return null;

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial color="#f8cf95" size={0.05} transparent opacity={0.28} depthWrite={false} />
    </points>
  );
}

export function Forest() {
  const { state } = useSaunaGame();
  const groundMap = useMemo(() => {
    const size = 128;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const index = (y * size + x) * 4;
        const nx = x / size - 0.5;
        const ny = y / size - 0.5;
        const dist = Math.sqrt(nx * nx + ny * ny);
        const grain = Math.sin((x + y) * 0.17) * 0.5 + Math.cos((x - y) * 0.23) * 0.5;
        const moss = Math.max(0, 1 - dist * 1.5);
        const tone = 52 + grain * 18 + moss * 14;
        data[index] = tone * 0.52;
        data[index + 1] = tone * 0.76;
        data[index + 2] = tone * 0.4;
        data[index + 3] = 255;
      }
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);

  const showDenseForest = state.playerMode === "outside" || state.doorOpen;
  const warmGlow = state.fireLit ? 0.34 + Math.min(0.7, state.fireFuel / 150) : 0.18;

  if (state.saunaType !== "woodfired") return null;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 10.8]} receiveShadow>
        <planeGeometry args={[34, 30]} />
        <meshStandardMaterial map={groundMap} color="#31412f" roughness={0.98} metalness={0} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 5.4]} receiveShadow>
        <circleGeometry args={[5.1, 48]} />
        <meshStandardMaterial color="#3c4b35" roughness={0.97} metalness={0} />
      </mesh>

      <mesh position={[0, 0.08, 2.38]} receiveShadow castShadow>
        <boxGeometry args={[3.3, 0.16, 2.3]} />
        <meshStandardMaterial color="#5f4026" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.03, 3.6]} receiveShadow castShadow>
        <boxGeometry args={[1.68, 0.08, 0.5]} />
        <meshStandardMaterial color="#6d4a2e" roughness={0.9} />
      </mesh>

      {[
        [-1.46, 0.6, 1.54],
        [1.46, 0.6, 1.54],
        [-1.46, 0.6, 3.22],
        [1.46, 0.6, 3.22],
      ].map((position, index) => (
        <mesh key={`porch-post-${index}`} position={position as [number, number, number]} castShadow>
          <boxGeometry args={[0.13, 1.2, 0.13]} />
          <meshStandardMaterial color="#4a3320" roughness={0.88} />
        </mesh>
      ))}

      <mesh position={[0, 1.22, 3.22]} castShadow>
        <boxGeometry args={[3.06, 0.09, 0.12]} />
        <meshStandardMaterial color="#6f4c2e" roughness={0.84} />
      </mesh>

      <mesh position={[-1.14, 0.66, 3.22]} castShadow>
        <boxGeometry args={[0.08, 0.66, 0.1]} />
        <meshStandardMaterial color="#7c5634" roughness={0.86} />
      </mesh>
      <mesh position={[1.14, 0.66, 3.22]} castShadow>
        <boxGeometry args={[0.08, 0.66, 0.1]} />
        <meshStandardMaterial color="#7c5634" roughness={0.86} />
      </mesh>

      <group position={[2.9, 0.04, 6.8]}>
        {Array.from({ length: 10 }).map((_, index) => {
          const angle = (index / 10) * Math.PI * 2;
          return (
            <mesh key={`camp-ring-${index}`} position={[Math.cos(angle) * 0.46, 0, Math.sin(angle) * 0.46]} castShadow>
              <dodecahedronGeometry args={[0.1, 0]} />
              <meshStandardMaterial color="#5a5751" roughness={0.96} />
            </mesh>
          );
        })}
      </group>

      {showDenseForest && <ForestTrees />}

      <pointLight intensity={warmGlow} color="#ffbf86" position={[0, 1.5, 2.45]} distance={8.2} />
      <pointLight intensity={0.22} color="#8faac3" position={[0, 3.6, 6.8]} distance={18} />
      <Fireflies active={!state.reducedMotion && showDenseForest} />
    </group>
  );
}
