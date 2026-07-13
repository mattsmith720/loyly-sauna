import {
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";

type Canvas2D = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D };

function createCanvas(size: number): Canvas2D | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  return { canvas, ctx };
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface WoodTextures {
  map: Texture;
  bumpMap: Texture;
}

/**
 * Generates a warm timber plank texture with vertical grain and a matching
 * grayscale bump map. Everything is drawn at runtime on a canvas so no binary
 * image assets need to be committed.
 */
export function createWoodTextures(options?: {
  seed?: number;
  base?: string;
  planks?: number;
  repeat?: [number, number];
}): WoodTextures | null {
  const size = 512;
  const color = createCanvas(size);
  const bump = createCanvas(size);
  if (!color || !bump) return null;

  const seed = options?.seed ?? 1;
  const planks = options?.planks ?? 6;
  const rand = mulberry32(seed);
  const base = options?.base ?? "#7a5030";

  const { ctx } = color;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const bctx = bump.ctx;
  bctx.fillStyle = "#808080";
  bctx.fillRect(0, 0, size, size);

  const plankHeight = size / planks;

  for (let p = 0; p < planks; p += 1) {
    const y0 = p * plankHeight;
    const tone = 0.86 + rand() * 0.26;
    ctx.fillStyle = shade(base, tone);
    ctx.fillRect(0, y0, size, plankHeight);

    for (let g = 0; g < 60; g += 1) {
      const gy = y0 + rand() * plankHeight;
      const alpha = 0.04 + rand() * 0.12;
      const dark = rand() > 0.5;
      ctx.strokeStyle = dark ? `rgba(40,24,12,${alpha})` : `rgba(226,188,140,${alpha * 0.8})`;
      ctx.lineWidth = 0.6 + rand() * 1.4;
      ctx.beginPath();
      const waviness = 6 + rand() * 14;
      for (let x = 0; x <= size; x += 8) {
        const yy = gy + Math.sin((x / size) * Math.PI * (1 + rand() * 2)) * waviness * 0.05;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();

      bctx.strokeStyle = dark ? "rgba(60,60,60,0.18)" : "rgba(200,200,200,0.14)";
      bctx.lineWidth = ctx.lineWidth;
      bctx.beginPath();
      for (let x = 0; x <= size; x += 8) {
        const yy = gy + Math.sin((x / size) * Math.PI * (1 + rand() * 2)) * waviness * 0.05;
        if (x === 0) bctx.moveTo(x, yy);
        else bctx.lineTo(x, yy);
      }
      bctx.stroke();
    }

    const knots = rand() > 0.6 ? 1 : 0;
    for (let k = 0; k < knots; k += 1) {
      const kx = rand() * size;
      const ky = y0 + plankHeight * (0.2 + rand() * 0.6);
      const kr = 4 + rand() * 8;
      const grd = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr * 2.4);
      grd.addColorStop(0, "rgba(48,28,14,0.55)");
      grd.addColorStop(0.5, "rgba(70,42,22,0.28)");
      grd.addColorStop(1, "rgba(70,42,22,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(kx, ky, kr * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(28,16,8,0.5)";
    ctx.fillRect(0, y0, size, 1.5);
    bctx.fillStyle = "rgba(20,20,20,0.9)";
    bctx.fillRect(0, y0, size, 2);
  }

  const repeat = options?.repeat ?? [2, 1];
  const map = finalizeTexture(color.canvas, repeat, true);
  const bumpMap = finalizeTexture(bump.canvas, repeat, false);
  return { map, bumpMap };
}

export interface StoneTextures {
  map: Texture;
  emissiveMap: Texture;
}

/**
 * Dark volcanic stone with bright cracks. The crack map is used as an emissive
 * map so heated stones glow through the fissures.
 */
export function createStoneTextures(seed = 7): StoneTextures | null {
  const size = 256;
  const color = createCanvas(size);
  const emissive = createCanvas(size);
  if (!color || !emissive) return null;

  const rand = mulberry32(seed);
  const { ctx } = color;
  ctx.fillStyle = "#4b4744";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 900; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const r = rand() * 3.5;
    const v = 40 + rand() * 70;
    ctx.fillStyle = `rgba(${v},${v},${v},${0.15 + rand() * 0.25})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const ectx = emissive.ctx;
  ectx.fillStyle = "#000000";
  ectx.fillRect(0, 0, size, size);
  ectx.strokeStyle = "#ffffff";
  ectx.lineCap = "round";

  for (let c = 0; c < 14; c += 1) {
    let x = rand() * size;
    let y = rand() * size;
    const steps = 6 + Math.floor(rand() * 10);
    ectx.lineWidth = 1 + rand() * 2.5;
    ectx.beginPath();
    ectx.moveTo(x, y);
    for (let s = 0; s < steps; s += 1) {
      x += (rand() - 0.5) * 40;
      y += (rand() - 0.5) * 40;
      ectx.lineTo(x, y);
    }
    ectx.stroke();
  }

  const glow = ectx.getImageData(0, 0, size, size);
  ectx.putImageData(glow, 0, 0);

  const map = finalizeTexture(color.canvas, [1, 1], true);
  const emissiveMap = finalizeTexture(emissive.canvas, [1, 1], false);
  return { map, emissiveMap };
}

/** Soft radial sprite used for steam / haze particles. */
export function createSoftParticleTexture(): Texture | null {
  const size = 128;
  const c = createCanvas(size);
  if (!c) return null;
  const { ctx } = c;
  const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.35, "rgba(255,255,255,0.55)");
  grd.addColorStop(0.7, "rgba(255,255,255,0.14)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(c.canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * A cozy snowy dusk exterior painted onto a canvas, shown behind the window.
 */
export function createExteriorTexture(): Texture | null {
  const w = 512;
  const h = 512;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const rand = mulberry32(23);

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#243a52");
  sky.addColorStop(0.45, "#3b4d63");
  sky.addColorStop(0.72, "#8a7f86");
  sky.addColorStop(0.86, "#d8a679");
  sky.addColorStop(1, "#e9c79a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const moonX = w * 0.74;
  const moonY = h * 0.24;
  const moon = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 60);
  moon.addColorStop(0, "rgba(255,248,224,0.95)");
  moon.addColorStop(0.5, "rgba(255,240,200,0.35)");
  moon.addColorStop(1, "rgba(255,240,200,0)");
  ctx.fillStyle = moon;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 60, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 60; i += 1) {
    const x = rand() * w;
    const y = rand() * h * 0.5;
    ctx.fillStyle = `rgba(255,255,255,${0.2 + rand() * 0.5})`;
    ctx.fillRect(x, y, 1.4, 1.4);
  }

  const drawTreeline = (baseY: number, color: string, count: number, maxH: number) => {
    ctx.fillStyle = color;
    for (let i = 0; i < count; i += 1) {
      const x = (i / count) * w + (rand() - 0.5) * 20;
      const th = maxH * (0.55 + rand() * 0.6);
      const tw = th * 0.42;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x - tw, baseY);
      ctx.lineTo(x, baseY - th);
      ctx.lineTo(x + tw, baseY);
      ctx.closePath();
      ctx.fill();
    }
  };
  drawTreeline(h * 0.82, "#2b3a3f", 22, 150);
  drawTreeline(h * 0.86, "#1d2a2e", 26, 110);

  const snow = ctx.createLinearGradient(0, h * 0.8, 0, h);
  snow.addColorStop(0, "#cdd6de");
  snow.addColorStop(1, "#e8eef3");
  ctx.fillStyle = snow;
  ctx.fillRect(0, h * 0.85, w, h * 0.15);

  for (let i = 0; i < 220; i += 1) {
    const x = rand() * w;
    const y = rand() * h;
    const r = rand() * 1.8 + 0.4;
    ctx.fillStyle = `rgba(255,255,255,${0.4 + rand() * 0.5})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function finalizeTexture(canvas: HTMLCanvasElement, repeat: [number, number], srgb: boolean): Texture {
  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 4;
  if (srgb) tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function shade(hex: string, factor: number): string {
  const parsed = hex.replace("#", "");
  const r = parseInt(parsed.slice(0, 2), 16);
  const g = parseInt(parsed.slice(2, 4), 16);
  const b = parseInt(parsed.slice(4, 6), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `rgb(${clamp(r * factor)},${clamp(g * factor)},${clamp(b * factor)})`;
}
