import {
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";

export interface WoodTextureOptions {
  base: string;
  grain: string;
  highlight: string;
  plankCount: number;
  vertical?: boolean;
}

function createCanvas(size: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  return { canvas, ctx };
}

// Deterministic value noise so textures look identical between renders and
// avoid distracting sparkle from per-frame randomness.
function hashNoise(x: number, y: number, seed: number): number {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function finalizeTexture(canvas: HTMLCanvasElement, repeatX: number, repeatY: number): CanvasTexture {
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

export function createWoodTexture(options: WoodTextureOptions): Texture | null {
  const created = createCanvas(512);
  if (!created) {
    return null;
  }

  const { canvas, ctx } = created;
  const { base, grain, highlight, plankCount, vertical = false } = options;
  const size = canvas.width;

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const plankSpan = size / plankCount;

  for (let plank = 0; plank < plankCount; plank += 1) {
    const start = plank * plankSpan;
    const shadeSeed = hashNoise(plank * 3.1, plank * 1.7, plank + 1);
    const shade = 0.86 + shadeSeed * 0.22;

    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = shade > 1 ? highlight : grain;
    if (vertical) {
      ctx.fillRect(0, start, size, plankSpan);
    } else {
      ctx.fillRect(start, 0, plankSpan, size);
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(20, 12, 6, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (vertical) {
      ctx.moveTo(0, start);
      ctx.lineTo(size, start);
    } else {
      ctx.moveTo(start, 0);
      ctx.lineTo(start, size);
    }
    ctx.stroke();
  }

  const grainLines = 220;
  for (let line = 0; line < grainLines; line += 1) {
    const t = line / grainLines;
    const along = t * size;
    const wobble = hashNoise(line * 2.3, 4.1, line) * 14 - 7;
    const alpha = 0.05 + hashNoise(line, line * 1.3, line + 5) * 0.12;
    ctx.strokeStyle = `rgba(52, 30, 14, ${alpha})`;
    ctx.lineWidth = 0.6 + hashNoise(line, 7.7, line) * 1.4;
    ctx.beginPath();
    if (vertical) {
      ctx.moveTo(0, along + wobble);
      ctx.bezierCurveTo(size * 0.33, along - wobble, size * 0.66, along + wobble, size, along - wobble);
    } else {
      ctx.moveTo(along + wobble, 0);
      ctx.bezierCurveTo(along - wobble, size * 0.33, along + wobble, size * 0.66, along - wobble, size);
    }
    ctx.stroke();
  }

  const knots = 5;
  for (let knot = 0; knot < knots; knot += 1) {
    const kx = hashNoise(knot * 9.1, 2.2, knot) * size;
    const ky = hashNoise(3.3, knot * 5.4, knot + 2) * size;
    const radius = 6 + hashNoise(knot, knot, knot) * 12;
    const gradient = ctx.createRadialGradient(kx, ky, 1, kx, ky, radius);
    gradient.addColorStop(0, "rgba(38, 20, 8, 0.7)");
    gradient.addColorStop(1, "rgba(38, 20, 8, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(kx, ky, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  return finalizeTexture(canvas, vertical ? 1 : 1, 1);
}

export function createStoneTexture(): Texture | null {
  const created = createCanvas(256);
  if (!created) {
    return null;
  }

  const { canvas, ctx } = created;
  const size = canvas.width;

  ctx.fillStyle = "#4a4643";
  ctx.fillRect(0, 0, size, size);

  const cells = 42;
  for (let i = 0; i < cells; i += 1) {
    const cx = hashNoise(i * 1.7, 0.3, i) * size;
    const cy = hashNoise(0.9, i * 2.1, i + 3) * size;
    const radius = 6 + hashNoise(i, i, i) * 20;
    const tone = Math.floor(60 + hashNoise(i, 5.5, i) * 60);
    const gradient = ctx.createRadialGradient(cx, cy, 1, cx, cy, radius);
    gradient.addColorStop(0, `rgba(${tone + 20}, ${tone + 14}, ${tone + 8}, 0.9)`);
    gradient.addColorStop(1, `rgba(${tone - 20}, ${tone - 24}, ${tone - 28}, 0.15)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  return finalizeTexture(canvas, 1, 1);
}

// A soft radial alpha sprite used for steam particles.
export function createSteamSprite(): Texture | null {
  const created = createCanvas(128);
  if (!created) {
    return null;
  }

  const { canvas, ctx } = created;
  const size = canvas.width;
  const center = size / 2;

  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.85)");
  gradient.addColorStop(0.35, "rgba(255, 253, 248, 0.5)");
  gradient.addColorStop(0.7, "rgba(240, 240, 240, 0.16)");
  gradient.addColorStop(1, "rgba(240, 240, 240, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// A painted snowy dusk scene rendered onto a canvas, used behind the window.
export function createWindowSceneTexture(): Texture | null {
  const created = createCanvas(512);
  if (!created) {
    return null;
  }

  const { canvas, ctx } = created;
  const width = canvas.width;
  const height = canvas.height;

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#243049");
  sky.addColorStop(0.45, "#3d4a63");
  sky.addColorStop(0.7, "#6d6274");
  sky.addColorStop(1, "#c58f6d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width * 0.72, height * 0.7, 10, width * 0.72, height * 0.7, width * 0.55);
  glow.addColorStop(0, "rgba(255, 205, 150, 0.55)");
  glow.addColorStop(1, "rgba(255, 205, 150, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const stars = 60;
  ctx.fillStyle = "rgba(235, 240, 255, 0.8)";
  for (let i = 0; i < stars; i += 1) {
    const sx = hashNoise(i * 2.7, 1.1, i) * width;
    const sy = hashNoise(0.6, i * 3.3, i) * height * 0.4;
    const r = hashNoise(i, i, i) * 1.2;
    ctx.globalAlpha = 0.4 + hashNoise(i, 4.4, i) * 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Distant tree line.
  ctx.fillStyle = "#1c2434";
  const treeBase = height * 0.66;
  for (let x = -20; x < width + 20; x += 26) {
    const treeHeight = 60 + hashNoise(x * 0.11, 2.0, x) * 70;
    const halfWidth = 16 + hashNoise(x * 0.2, 4.0, x) * 8;
    ctx.beginPath();
    ctx.moveTo(x, treeBase);
    ctx.lineTo(x + halfWidth, treeBase - treeHeight);
    ctx.lineTo(x + halfWidth * 2, treeBase);
    ctx.closePath();
    ctx.fill();
  }

  // Snowy ground.
  const ground = ctx.createLinearGradient(0, treeBase - 20, 0, height);
  ground.addColorStop(0, "#d9dbe6");
  ground.addColorStop(1, "#aeb4c9");
  ctx.fillStyle = ground;
  ctx.fillRect(0, treeBase - 10, width, height - treeBase + 10);

  // Snowflakes.
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  for (let i = 0; i < 160; i += 1) {
    const sx = hashNoise(i * 5.1, 6.7, i) * width;
    const sy = hashNoise(7.3, i * 1.9, i) * height;
    const r = 0.8 + hashNoise(i, i * 2, i) * 1.8;
    ctx.globalAlpha = 0.35 + hashNoise(i, 9.1, i) * 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
