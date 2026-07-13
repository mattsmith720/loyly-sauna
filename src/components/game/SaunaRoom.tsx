"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useSaunaGame } from "./useSaunaGame";
import type { InteractableId } from "./sauna-game-state";
import { BarrelModel, LanternModel } from "./assets/GameModels";
import { WoodPlankMaterial } from "./assets/WoodMaterial";
import { WoodStove, Woodpile } from "./WoodStove";

const CEDAR = "#6b4423";
const CEDAR_LIGHT = "#8f6138";
const CEDAR_DARK = "#4a2f1a";
const CEDAR_MID = "#7a5230";
const ROOM_WIDTH = 4;
const ROOM_DEPTH = 3.6;
const ROOM_HEIGHT = 2.46;
const WALL_THICKNESS = 0.08;
const FRONT_Z = ROOM_DEPTH / 2 - WALL_THICKNESS / 2;
const BACK_Z = -FRONT_Z;

export const ELECTRIC_HEATER_POSITION: [number, number, number] = [1.22, 0, -1.08];
export const ELECTRIC_STONES_ORIGIN: [number, number, number] = [1.22, 1.18, -1.02];

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
    <mesh position={position} userData={{ interactableId: id }} castShadow receiveShadow>
      {geometry === "box" ? (
        <boxGeometry args={args as [number, number, number]} />
      ) : (
        <cylinderGeometry args={args as [number, number, number, number]} />
      )}
      <meshStandardMaterial
        color={focused ? "#ddb882" : color}
        emissive={focused ? "#5a3010" : "#000000"}
        emissiveIntensity={focused ? 0.4 : 0}
        roughness={0.76}
        metalness={0.02}
      />
    </mesh>
  );
}

type WallPanelProps = {
  position: [number, number, number];
  size: [number, number, number];
  repeat: [number, number];
  color?: string;
  roughness?: number;
};

function WallPanel({ position, size, repeat, color, roughness = 0.84 }: WallPanelProps) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <WoodPlankMaterial
        repeat={repeat}
        color={color}
        roughness={roughness}
        normalScale={[0.5, 0.5]}
      />
    </mesh>
  );
}

export function Heater() {
  const { state } = useSaunaGame();
  const glow = state.heaterOn ? Math.min(1.3, (state.temperature - 45) / 42) : 0.02;
  const targetGlow = state.heaterOn ? (state.heaterTarget - 70) / 20 : 0;
  const stones = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => {
        const ring = Math.floor(index / 10);
        const col = index % 10;
        const radius = ring === 0 ? 0.2 : ring === 1 ? 0.15 : 0.1;
        const theta = (col / 10) * Math.PI * 2 + ring * 0.16;
        return {
          x: Math.cos(theta) * radius,
          y: 1.02 + ring * 0.09 + (index % 2) * 0.014,
          z: Math.sin(theta) * radius,
          s: 0.045 + (index % 3) * 0.008,
        };
      }),
    [],
  );

  return (
    <group position={ELECTRIC_HEATER_POSITION}>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.38, 0.1, 28]} />
        <meshStandardMaterial color="#9f978f" roughness={0.35} metalness={0.55} />
      </mesh>
      <mesh position={[0, 0.54, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.29, 0.9, 28]} />
        <meshStandardMaterial color="#d0c8bf" roughness={0.3} metalness={0.52} />
      </mesh>
      {Array.from({ length: 16 }).map((_, index) => {
        const theta = (index / 16) * Math.PI * 2;
        return (
          <mesh
            key={`heater-rail-${index}`}
            position={[Math.cos(theta) * 0.27, 0.56, Math.sin(theta) * 0.27]}
            castShadow
          >
            <boxGeometry args={[0.028, 0.88, 0.028]} />
            <meshStandardMaterial color="#8a8076" roughness={0.2} metalness={0.64} />
          </mesh>
        );
      })}
      {stones.map((stone, index) => (
        <mesh key={`heater-stone-${index}`} position={[stone.x, stone.y, stone.z]} castShadow>
          <dodecahedronGeometry args={[stone.s, 0]} />
          <meshStandardMaterial
            color="#5b5752"
            emissive="#ff8c3a"
            emissiveIntensity={glow * (0.18 + (index % 4) * 0.07)}
            roughness={0.95}
          />
        </mesh>
      ))}
      <mesh position={[0, 1.14, 0]} userData={{ interactableId: "stones" as InteractableId }}>
        <cylinderGeometry args={[0.3, 0.3, 0.4, 18]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh position={[0.31, 0.56, 0.12]} castShadow>
        <boxGeometry args={[0.13, 0.34, 0.16]} />
        <meshStandardMaterial
          color={state.focusedInteractable === "heater" ? "#d6aa72" : "#bdb3a8"}
          emissive={state.focusedInteractable === "heater" ? "#6b4520" : "#000000"}
          emissiveIntensity={state.focusedInteractable === "heater" ? 0.3 : 0}
          roughness={0.3}
          metalness={0.48}
        />
      </mesh>
      <Interactable
        id="heater"
        position={[0.31, 0.56, 0.12]}
        args={[0.14, 0.34, 0.16]}
        geometry="box"
        color="#bdb3a8"
      />
      <Text
        position={[0.31, 0.82, 0.14]}
        fontSize={0.058}
        color="#f4efe8"
        anchorX="center"
        anchorY="middle"
      >
        {state.heaterOn ? `${Math.round(state.heaterTarget)}°` : "OFF"}
      </Text>
      <pointLight
        intensity={state.heaterOn ? 0.95 + glow * 0.75 + targetGlow * 0.2 : 0}
        color="#ffd5a8"
        position={[0, 1.14, 0.1]}
        distance={3.2}
      />
    </group>
  );
}

function SaunaProps() {
  const { state } = useSaunaGame();

  return (
    <group>
      {!state.holdingLadle && (
        <>
          <Interactable id="ladle" position={[-1.48, 1.04, -0.3]} args={[0.08, 0.4, 0.08]} geometry="box" />
          <mesh position={[-1.48, 1.28, -0.3]}>
            <torusGeometry args={[0.09, 0.016, 8, 16]} />
            <meshStandardMaterial color="#784e2b" roughness={0.8} />
          </mesh>
        </>
      )}
      {state.holdingLadle && (
        <mesh userData={{ interactableId: "ladle" as InteractableId }} visible={false} position={[-1.48, 1.04, -0.3]}>
          <boxGeometry args={[0.2, 0.4, 0.2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      <group position={[1.05, 0, -0.36]}>
        <BarrelModel position={[0, 0.22, 0]} scale={0.35} />
        <mesh position={[0, 0.22, 0]} userData={{ interactableId: "bucket" as InteractableId }}>
          <cylinderGeometry args={[0.22, 0.22, 0.45, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

function BenchDeck({
  position,
  slatCount,
  slatSize,
  slatStep,
  frameSize,
  frameColor,
  slatColor,
}: {
  position: [number, number, number];
  slatCount: number;
  slatSize: [number, number, number];
  slatStep: number;
  frameSize: [number, number, number];
  frameColor?: string;
  slatColor?: string;
}) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={frameSize} />
        <WoodPlankMaterial repeat={[2, 1]} color={frameColor} roughness={0.86} normalScale={[0.44, 0.44]} />
      </mesh>
      {Array.from({ length: slatCount }).map((_, index) => (
        <mesh
          key={index}
          position={[
            frameSize[0] / 2 - slatSize[0] / 2 - 0.03 - index * slatStep,
            frameSize[1] / 2 + slatSize[1] / 2 + 0.01,
            0,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={slatSize} />
          <WoodPlankMaterial repeat={[1.7, 0.72]} color={slatColor} roughness={0.8} normalScale={[0.34, 0.34]} />
        </mesh>
      ))}
    </group>
  );
}

function LauteetBenches({ woodfired }: { woodfired: boolean }) {
  return (
    <group>
      <BenchDeck
        position={[1.24, 0.35, 0.05]}
        slatCount={7}
        slatSize={[0.08, 0.026, 1.62]}
        slatStep={0.1}
        frameSize={[0.76, 0.07, 1.64]}
        frameColor={woodfired ? CEDAR_DARK : "#a78f73"}
        slatColor={woodfired ? CEDAR : "#d6c5ae"}
      />
      <BenchDeck
        position={[1.56, 0.78, 0.05]}
        slatCount={5}
        slatSize={[0.076, 0.025, 1.62]}
        slatStep={0.096}
        frameSize={[0.5, 0.07, 1.64]}
        frameColor={woodfired ? "#5b3c23" : "#b39d83"}
        slatColor={woodfired ? CEDAR_LIGHT : "#e3d6c2"}
      />
      <mesh position={[1.52, 1.03, 0.05]} castShadow>
        <boxGeometry args={[0.05, 0.43, 1.64]} />
        <WoodPlankMaterial repeat={[1.1, 1.8]} color={woodfired ? CEDAR_MID : "#c6b39c"} roughness={0.84} />
      </mesh>
      <mesh position={[1.36, 0.57, -0.75]} castShadow>
        <boxGeometry args={[0.22, 0.42, 0.22]} />
        <WoodPlankMaterial repeat={[1, 1]} color={woodfired ? CEDAR_DARK : "#9f8c75"} roughness={0.88} />
      </mesh>
      <Interactable
        id="bench"
        position={[1.56, 0.96, 0.05]}
        args={[0.52, 0.14, 1.58]}
        geometry="box"
        color={woodfired ? CEDAR : "#d8c4a8"}
      />

      <BenchDeck
        position={[-1.3, 0.34, 0.1]}
        slatCount={5}
        slatSize={[0.078, 0.024, 1.2]}
        slatStep={0.1}
        frameSize={[0.58, 0.068, 1.24]}
        frameColor={woodfired ? CEDAR_DARK : "#9f8c75"}
        slatColor={woodfired ? CEDAR_MID : "#cdb89f"}
      />
      {!woodfired && (
        <mesh position={[1.56, 0.47, 0.04]}>
          <boxGeometry args={[0.48, 0.03, 1.58]} />
          <meshStandardMaterial color="#ffe5c4" emissive="#ffd6a1" emissiveIntensity={0.08} roughness={0.45} />
        </mesh>
      )}
    </group>
  );
}

function DoorAssembly() {
  const { state } = useSaunaGame();
  const hingeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!hingeRef.current) return;
    const target = state.doorOpen ? -1.12 : 0;
    hingeRef.current.rotation.y = THREE.MathUtils.damp(hingeRef.current.rotation.y, target, 8, delta);
  });

  return (
    <group position={[0, 0, FRONT_Z + 0.005]}>
      <mesh position={[0, 1.1, -0.02]} castShadow>
        <boxGeometry args={[1.08, 2.24, 0.09]} />
        <WoodPlankMaterial repeat={[1.6, 2.4]} color={CEDAR_DARK} roughness={0.9} />
      </mesh>
      <group ref={hingeRef} position={[-0.52, 0, 0.03]}>
        <Interactable id="door" position={[0.52, 1.1, 0]} args={[1.04, 2.2, 0.08]} geometry="box" color={CEDAR_MID} />
        <mesh position={[0.52, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.04, 2.2, 0.08]} />
          <WoodPlankMaterial repeat={[2, 3]} color={CEDAR} roughness={0.82} normalScale={[0.5, 0.5]} />
        </mesh>
        <mesh position={[0.89, 1.1, 0.05]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#dcb889" metalness={0.5} roughness={0.32} />
        </mesh>
        <mesh position={[0.02, 1.76, 0.05]}>
          <boxGeometry args={[0.04, 0.1, 0.03]} />
          <meshStandardMaterial color="#4a3f33" roughness={0.4} metalness={0.48} />
        </mesh>
        <mesh position={[0.02, 0.44, 0.05]}>
          <boxGeometry args={[0.04, 0.1, 0.03]} />
          <meshStandardMaterial color="#4a3f33" roughness={0.4} metalness={0.48} />
        </mesh>
      </group>
    </group>
  );
}

function CeilingLantern({ woodfired }: { woodfired: boolean }) {
  const { state } = useSaunaGame();
  return (
    <>
      <group position={[0, 2.14, 0.15]}>
        <LanternModel scale={0.22} rotation={[0, Math.PI, 0]} />
        <mesh position={[0, 0.1, 0]} userData={{ interactableId: "lights" as InteractableId }}>
          <boxGeometry args={[0.27, 0.27, 0.27]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <pointLight
        intensity={state.lightsOn ? (woodfired ? 0.7 : 1) : 0.05}
        color={woodfired ? "#f0e4cc" : "#fff6e9"}
        position={[0, 2.05, 0.15]}
        distance={6}
      />
      <mesh position={[-1.85, 1.35, 1.16]} userData={{ interactableId: "lights" as InteractableId }} castShadow>
        <boxGeometry args={[0.08, 0.14, 0.04]} />
        <meshStandardMaterial
          color={state.focusedInteractable === "lights" ? "#ddb882" : "#5a5148"}
          emissive={state.lightsOn ? "#ddb882" : "#000000"}
          emissiveIntensity={state.lightsOn ? 0.25 : 0}
          roughness={0.7}
        />
      </mesh>
    </>
  );
}

function WoodfiredBackWall() {
  return (
    <group>
      <WallPanel
        position={[-1.75, 1.22, BACK_Z]}
        size={[0.5, ROOM_HEIGHT, WALL_THICKNESS]}
        repeat={[1.1, 3]}
        color={CEDAR}
      />
      <WallPanel
        position={[0.7, 1.22, BACK_Z]}
        size={[2.6, ROOM_HEIGHT, WALL_THICKNESS]}
        repeat={[4.4, 3]}
        color={CEDAR_MID}
      />
      <WallPanel
        position={[-1.05, 0.52, BACK_Z]}
        size={[0.9, 1.04, WALL_THICKNESS]}
        repeat={[1.4, 1.4]}
        color={CEDAR_LIGHT}
      />
      <WallPanel
        position={[-1.05, 2.05, BACK_Z]}
        size={[0.9, 0.82, WALL_THICKNESS]}
        repeat={[1.4, 1.2]}
        color={CEDAR_MID}
      />

      <mesh position={[-1.05, 1.35, BACK_Z + 0.005]} castShadow>
        <planeGeometry args={[0.86, 0.58]} />
        <meshStandardMaterial color="#9ab5c6" roughness={0.06} metalness={0.16} transparent opacity={0.42} />
      </mesh>
      <mesh position={[-1.05, 1.35, BACK_Z + 0.02]} castShadow>
        <boxGeometry args={[0.94, 0.66, 0.06]} />
        <WoodPlankMaterial repeat={[1.3, 0.9]} color="#5a3b21" roughness={0.86} />
      </mesh>
      <mesh position={[-1.05, 1.35, BACK_Z + 0.05]} castShadow>
        <boxGeometry args={[0.05, 0.58, 0.04]} />
        <WoodPlankMaterial repeat={[1, 1]} color="#4f321b" roughness={0.88} />
      </mesh>
      <mesh position={[-1.05, 1.35, BACK_Z + 0.05]} castShadow>
        <boxGeometry args={[0.86, 0.05, 0.04]} />
        <WoodPlankMaterial repeat={[1.8, 1]} color="#4f321b" roughness={0.88} />
      </mesh>
      <pointLight intensity={0.16} color="#9bc4da" position={[-1.05, 1.5, BACK_Z - 0.24]} distance={2.2} />
    </group>
  );
}

function ElectricBackWall() {
  return (
    <group>
      <WallPanel
        position={[0, 1.22, BACK_Z]}
        size={[ROOM_WIDTH, ROOM_HEIGHT, WALL_THICKNESS]}
        repeat={[5.8, 3]}
        color="#d9c8af"
        roughness={0.72}
      />
      {Array.from({ length: 7 }).map((_, index) => (
        <mesh key={index} position={[-1.65 + index * 0.55, 1.22, BACK_Z + 0.04]} castShadow>
          <boxGeometry args={[0.06, 2.3, 0.04]} />
          <meshStandardMaterial color="#c9b79f" roughness={0.62} />
        </mesh>
      ))}
    </group>
  );
}

function SideWalls({ woodfired }: { woodfired: boolean }) {
  return (
    <>
      <WallPanel
        position={[-ROOM_WIDTH / 2 + WALL_THICKNESS / 2, 1.22, 0]}
        size={[WALL_THICKNESS, ROOM_HEIGHT, ROOM_DEPTH]}
        repeat={[4.4, 3]}
        color={woodfired ? CEDAR_MID : "#d8c8b2"}
        roughness={woodfired ? 0.86 : 0.72}
      />
      <WallPanel
        position={[ROOM_WIDTH / 2 - WALL_THICKNESS / 2, 1.22, 0]}
        size={[WALL_THICKNESS, ROOM_HEIGHT, ROOM_DEPTH]}
        repeat={[4.4, 3]}
        color={woodfired ? CEDAR : "#d2c0a8"}
        roughness={woodfired ? 0.84 : 0.7}
      />
    </>
  );
}

function FrontWall({ woodfired }: { woodfired: boolean }) {
  return (
    <group>
      <WallPanel
        position={[-1.26, 1.22, FRONT_Z]}
        size={[1.48, ROOM_HEIGHT, WALL_THICKNESS]}
        repeat={[2.2, 3]}
        color={woodfired ? CEDAR_MID : "#dac7ad"}
        roughness={woodfired ? 0.86 : 0.73}
      />
      <WallPanel
        position={[1.26, 1.22, FRONT_Z]}
        size={[1.48, ROOM_HEIGHT, WALL_THICKNESS]}
        repeat={[2.2, 3]}
        color={woodfired ? CEDAR_MID : "#dac7ad"}
        roughness={woodfired ? 0.86 : 0.73}
      />
      <WallPanel
        position={[0, 2.34, FRONT_Z]}
        size={[1.04, 0.24, WALL_THICKNESS]}
        repeat={[1.6, 0.8]}
        color={woodfired ? "#5f3d24" : "#ccb89f"}
      />
      <DoorAssembly />
    </group>
  );
}

export function SaunaRoom() {
  const { state } = useSaunaGame();
  const woodfired = state.saunaType === "woodfired";

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <WoodPlankMaterial
          repeat={woodfired ? [6.4, 4.8] : [6, 4.4]}
          color={woodfired ? "#85603f" : "#cdb89d"}
          roughness={woodfired ? 0.88 : 0.72}
          normalScale={woodfired ? [0.42, 0.42] : [0.3, 0.3]}
        />
      </mesh>
      {Array.from({ length: 10 }).map((_, index) => (
        <mesh key={index} position={[-1.8 + index * 0.4, 0.022, 0]} receiveShadow>
          <boxGeometry args={[0.05, 0.02, ROOM_DEPTH]} />
          <meshStandardMaterial
            color={woodfired ? "#664224" : "#b9a287"}
            roughness={woodfired ? 0.95 : 0.75}
            metalness={0.01}
          />
        </mesh>
      ))}

      {woodfired ? <WoodfiredBackWall /> : <ElectricBackWall />}
      <SideWalls woodfired={woodfired} />
      <FrontWall woodfired={woodfired} />

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <WoodPlankMaterial
          repeat={woodfired ? [5, 3.8] : [5.4, 4]}
          color={woodfired ? "#5a432f" : "#d9ccb9"}
          roughness={woodfired ? 0.9 : 0.76}
          normalScale={woodfired ? [0.36, 0.36] : [0.24, 0.24]}
        />
      </mesh>

      <CeilingLantern woodfired={woodfired} />
      <SaunaProps />
      <LauteetBenches woodfired={woodfired} />

      {woodfired ? (
        <>
          <WoodStove />
          <Woodpile />
          <mesh position={[-0.72, ROOM_HEIGHT + 0.04, -1.24]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.08, 16]} />
            <meshStandardMaterial color="#4a443d" roughness={0.8} metalness={0.46} />
          </mesh>
        </>
      ) : (
        <Heater />
      )}
    </group>
  );
}
