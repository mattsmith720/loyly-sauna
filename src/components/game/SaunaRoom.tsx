"use client";

import { Text } from "@react-three/drei";
import { useSaunaGame } from "./useSaunaGame";
import type { InteractableId } from "./sauna-game-state";
import { BarrelModel, LanternModel } from "./assets/GameModels";
import { WoodPlankMaterial } from "./assets/WoodMaterial";
import { WoodStove, Woodpile } from "./WoodStove";

const CEDAR = "#6b4423";
const CEDAR_LIGHT = "#8b5e34";
const CEDAR_DARK = "#4a2f1a";
const CEDAR_MID = "#7a5230";

type InteractableProps = {
  id: InteractableId;
  position: [number, number, number];
  args: [number, number, number] | [number, number, number, number];
  geometry: "box" | "cylinder";
  color?: string;
};

function Interactable({ id, position, args, geometry, color = CEDAR_LIGHT }: InteractableProps) {
  const { state } = useSaunaGame();
  const focused = state.focusedInteractable === id;

  return (
    <mesh
      position={position}
      userData={{ interactableId: id }}
      castShadow
      receiveShadow
    >
      {geometry === "box" ? (
        <boxGeometry args={args as [number, number, number]} />
      ) : (
        <cylinderGeometry args={args as [number, number, number, number]} />
      )}
      <meshStandardMaterial
        color={focused ? "#ddb882" : color}
        emissive={focused ? "#5a3010" : "#000000"}
        emissiveIntensity={focused ? 0.4 : 0}
        roughness={0.82}
        metalness={0.02}
      />
    </mesh>
  );
}

function WoodSlats({
  count,
  start,
  step,
  size,
}: {
  count: number;
  start: [number, number, number];
  step: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          position={[start[0] + step[0] * i, start[1] + step[1] * i, start[2] + step[2] * i]}
          receiveShadow
        >
          <boxGeometry args={size} />
          <meshStandardMaterial color={i % 2 === 0 ? CEDAR_LIGHT : CEDAR_MID} roughness={0.88} />
        </mesh>
      ))}
    </>
  );
}

export function Heater() {
  const { state } = useSaunaGame();
  const glow = state.heaterOn ? Math.min(1.2, (state.temperature - 45) / 40) : 0.04;
  const targetGlow = state.heaterOn ? (state.heaterTarget - 70) / 20 : 0;

  return (
    <group position={[0, 0, -1.45]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 0.72, 0.5]} />
        <meshStandardMaterial color={CEDAR_DARK} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.84, 0.05]} castShadow>
        <boxGeometry args={[0.98, 0.38, 0.4]} />
        <meshStandardMaterial
          color="#3a342e"
          emissive="#ff6a1a"
          emissiveIntensity={glow * 1.5 + targetGlow * 0.3}
          roughness={0.7}
        />
      </mesh>
      {Array.from({ length: 18 }).map((_, index) => {
        const row = Math.floor(index / 6);
        const col = index % 6;
        return (
          <mesh key={index} position={[-0.35 + col * 0.14, 0.95 + row * 0.1, 0.08]} castShadow>
            <sphereGeometry args={[0.055 + (index % 3) * 0.008, 10, 10]} />
            <meshStandardMaterial
              color="#5a5148"
              emissive="#ff7a22"
              emissiveIntensity={glow}
              roughness={0.95}
            />
          </mesh>
        );
      })}
      <mesh position={[0, 1.02, 0.12]} userData={{ interactableId: "stones" as InteractableId }}>
        <boxGeometry args={[0.9, 0.4, 0.28]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Interactable id="heater" position={[0.72, 0.55, 0.22]} args={[0.14, 0.24, 0.1]} geometry="box" />
      <Text
        position={[0.72, 0.82, 0.18]}
        fontSize={0.065}
        color="#c4b8a8"
        anchorX="center"
        anchorY="middle"
      >
        {state.heaterOn ? `${Math.round(state.heaterTarget)}°` : "OFF"}
      </Text>
      <pointLight
        intensity={state.heaterOn ? 1.8 + glow : 0.05}
        color="#ff7a33"
        position={[0, 1.15, 0.2]}
        distance={3.5}
      />
    </group>
  );
}

export function SaunaProps() {
  const { state } = useSaunaGame();

  return (
    <group>
      {!state.holdingLadle && (
        <>
          <Interactable id="ladle" position={[-1.55, 1.05, -0.2]} args={[0.07, 0.38, 0.07]} geometry="box" />
          <mesh position={[-1.55, 1.28, -0.2]}>
            <torusGeometry args={[0.09, 0.016, 8, 16]} />
            <meshStandardMaterial color="#784e2b" roughness={0.8} />
          </mesh>
        </>
      )}
      {state.holdingLadle && (
        <mesh userData={{ interactableId: "ladle" as InteractableId }} visible={false} position={[-1.55, 1.05, -0.2]}>
          <boxGeometry args={[0.2, 0.4, 0.2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      <group position={[1.2, 0, -1.05]}>
        <BarrelModel position={[0, 0.22, 0]} scale={0.35} />
        <mesh
          position={[0, 0.22, 0]}
          userData={{ interactableId: "bucket" as InteractableId }}
        >
          <cylinderGeometry args={[0.22, 0.22, 0.45, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* Lower and upper benches */}
      <mesh position={[1.35, 0.38, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.58, 0.07, 1.55]} />
        <meshStandardMaterial color={CEDAR} roughness={0.88} />
      </mesh>
      <mesh position={[1.35, 0.22, 0.55]} castShadow>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color={CEDAR_DARK} roughness={0.9} />
      </mesh>
      <mesh position={[1.35, 0.22, -0.35]} castShadow>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color={CEDAR_DARK} roughness={0.9} />
      </mesh>
      <Interactable id="bench" position={[1.35, 0.78, 0.1]} args={[0.58, 0.08, 1.55]} geometry="box" color={CEDAR} />
      <mesh position={[1.52, 1.05, 0.1]} castShadow>
        <boxGeometry args={[0.06, 0.45, 1.55]} />
        <meshStandardMaterial color={CEDAR_MID} roughness={0.88} />
      </mesh>

      {/* Second bench on left */}
      <mesh position={[-1.35, 0.38, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.07, 1.4]} />
        <meshStandardMaterial color={CEDAR} roughness={0.88} />
      </mesh>
      <mesh position={[-1.35, 0.72, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.07, 1.4]} />
        <meshStandardMaterial color={CEDAR_LIGHT} roughness={0.86} />
      </mesh>

      <group position={[0, 0, 1.48]}>
        <mesh position={[0, 1.05, -0.02]} castShadow>
          <boxGeometry args={[1.05, 2.15, 0.1]} />
          <meshStandardMaterial color={CEDAR_DARK} roughness={0.9} />
        </mesh>
        <group rotation={[0, state.doorOpen ? -1.15 : 0, 0]} position={[-0.48, 0, 0]}>
          <Interactable id="door" position={[0.48, 1.05, 0]} args={[0.96, 2.1, 0.06]} geometry="box" color={CEDAR_MID} />
          <mesh position={[0.85, 1.05, 0.04]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#ddb882" metalness={0.4} roughness={0.35} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export function SaunaRoom() {
  const { state } = useSaunaGame();

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[4, 3.6]} />
        <WoodPlankMaterial repeat={[3, 2.5]} />
      </mesh>
      <WoodSlats count={9} start={[-1.8, 0.02, -1.5]} step={[0.45, 0, 0]} size={[0.4, 0.03, 3]} />

      <mesh position={[0, 1.2, -1.8]} receiveShadow>
        <planeGeometry args={[4, 2.4]} />
        <WoodPlankMaterial repeat={[2.5, 1.8]} />
      </mesh>
      <WoodSlats count={10} start={[-1.8, 0.35, -1.78]} step={[0, 0.22, 0]} size={[3.6, 0.08, 0.04]} />

      <mesh rotation={[0, Math.PI / 2, 0]} position={[-2, 1.2, 0]} receiveShadow>
        <planeGeometry args={[3.6, 2.4]} />
        <meshStandardMaterial color={CEDAR} roughness={0.92} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[2, 1.2, 0]} receiveShadow>
        <planeGeometry args={[3.6, 2.4]} />
        <meshStandardMaterial color={CEDAR_LIGHT} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.2, 1.8]} receiveShadow>
        <planeGeometry args={[4, 2.4]} />
        <meshStandardMaterial color={CEDAR} roughness={0.92} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.4, 0]} receiveShadow>
        <planeGeometry args={[4, 3.6]} />
        <meshStandardMaterial color="#2b2622" roughness={0.98} />
      </mesh>

      {/* Ceiling lantern (CC0 Poly Haven) */}
      <group position={[0, 2.15, 0.2]}>
        <LanternModel scale={0.22} rotation={[0, Math.PI, 0]} />
        <mesh
          position={[0, 0.1, 0]}
          userData={{ interactableId: "lights" as InteractableId }}
        >
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <pointLight
        intensity={state.lightsOn ? 0.65 : 0.04}
        color="#f0e6d6"
        position={[0, 2.05, 0.2]}
        distance={5}
      />
      {/* Light switch on wall */}
      <mesh
        position={[-1.85, 1.35, 1.2]}
        userData={{ interactableId: "lights" as InteractableId }}
        castShadow
      >
        <boxGeometry args={[0.08, 0.14, 0.04]} />
        <meshStandardMaterial
          color={state.focusedInteractable === "lights" ? "#ddb882" : "#5a5148"}
          emissive={state.lightsOn ? "#ddb882" : "#000000"}
          emissiveIntensity={state.lightsOn ? 0.25 : 0}
          roughness={0.7}
        />
      </mesh>

      {state.saunaType === "woodfired" ? (
        <>
          <WoodStove />
          <Woodpile />
        </>
      ) : (
        <Heater />
      )}
      <SaunaProps />
    </group>
  );
}
