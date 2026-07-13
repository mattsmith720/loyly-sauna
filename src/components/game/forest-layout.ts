export type ForestTree = {
  x: number;
  z: number;
  trunkRadius: number;
  trunkHeight: number;
  canopyRadius: number;
  canopyHeight: number;
  canopyLift: number;
  hue: number;
  saturation: number;
  lightness: number;
};

export type EllipseBounds = {
  centerX: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
  minZ: number;
};

const TREE_COUNT = 120;

function fract(value: number) {
  return value - Math.floor(value);
}

function rand(seed: number) {
  return fract(Math.sin(seed * 127.1 + 311.7) * 43758.5453123);
}

function buildTrees() {
  const trees: ForestTree[] = [];
  const ringCenterX = 0;
  const ringCenterZ = 10.5;

  for (let i = 0; i < TREE_COUNT; i += 1) {
    const angle = (i / TREE_COUNT) * Math.PI * 2 + rand(i + 91) * 0.32;
    const radius = 7.2 + rand(i + 173) * 5.2;
    const x = ringCenterX + Math.cos(angle) * radius + (rand(i + 619) - 0.5) * 1.4;
    const z = ringCenterZ + Math.sin(angle) * radius + (rand(i + 887) - 0.5) * 1.5;
    const clearanceX = x;
    const clearanceZ = z - 5.2;
    const clearanceRadius = Math.sqrt(clearanceX * clearanceX + clearanceZ * clearanceZ);
    if (z < 2.2 || clearanceRadius < 4.1) continue;

    trees.push({
      x,
      z,
      trunkRadius: 0.12 + rand(i + 151) * 0.06,
      trunkHeight: 2 + rand(i + 199) * 1.8,
      canopyRadius: 0.8 + rand(i + 233) * 0.85,
      canopyHeight: 1.9 + rand(i + 277) * 1.9,
      canopyLift: 0.9 + rand(i + 311) * 0.4,
      hue: 0.27 + rand(i + 353) * 0.06,
      saturation: 0.3 + rand(i + 389) * 0.16,
      lightness: 0.18 + rand(i + 421) * 0.1,
    });
  }

  return trees;
}

export const WOODFIRED_FOREST_BOUNDS: EllipseBounds = {
  centerX: 0,
  centerZ: 10.8,
  radiusX: 10.8,
  radiusZ: 9.8,
  minZ: 1.55,
};

export const WOODFIRED_FOREST_TREES = buildTrees();
