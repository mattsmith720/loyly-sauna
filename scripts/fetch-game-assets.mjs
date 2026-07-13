#!/usr/bin/env node
/**
 * Downloads CC0 game assets from Poly Haven into public/game/.
 * Run: node scripts/fetch-game-assets.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GAME = join(ROOT, "public", "game");

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

async function download(url, dest) {
  await mkdir(dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log("  ✓", dest.replace(ROOT, ""));
}

async function downloadPolyHavenModel(id, folderName) {
  const files = await fetchJson(`https://api.polyhaven.com/files/${id}`);
  const gltfEntry = files?.gltf?.["1k"]?.gltf;
  if (!gltfEntry?.url) throw new Error(`No 1k gltf for ${id}`);

  const baseDir = join(GAME, "models", folderName);
  const gltfUrl = gltfEntry.url;
  const gltfName = gltfUrl.split("/").pop();
  await download(gltfUrl, join(baseDir, gltfName));

  for (const [relPath, meta] of Object.entries(gltfEntry.include ?? {})) {
    await download(meta.url, join(baseDir, relPath));
  }
}

async function downloadTexture(id, maps) {
  const files = await fetchJson(`https://api.polyhaven.com/files/${id}`);
  const outDir = join(GAME, "textures", id);
  for (const map of maps) {
    const entry = files?.[map]?.["1k"]?.jpg;
    if (!entry?.url) {
      console.warn(`  skip ${map} (no 1k jpg)`);
      continue;
    }
    const name = `${id}_${map.toLowerCase()}_1k.jpg`;
    await download(entry.url, join(outDir, name));
  }
}

async function downloadHdri(id) {
  const files = await fetchJson(`https://api.polyhaven.com/files/${id}`);
  const entry = files?.hdri?.["1k"]?.hdr ?? files?.hdri?.["1k"]?.exr;
  if (!entry?.url) throw new Error(`No 1k hdri for ${id}`);
  const ext = entry.url.endsWith(".exr") ? "exr" : "hdr";
  await download(entry.url, join(GAME, "hdri", `${id}_1k.${ext}`));
}

async function main() {
  console.log("Fetching CC0 assets from Poly Haven…\n");

  console.log("Textures: wooden_planks");
  await downloadTexture("wooden_planks", ["Diffuse", "nor_gl", "Rough"]);

  console.log("HDRI: autumn_forest_02");
  await downloadHdri("autumn_forest_02");

  console.log("Model: Lantern_01 (ceiling light)");
  await downloadPolyHavenModel("Lantern_01", "lantern_01");

  console.log("Model: Barrel_01 (water bucket)");
  await downloadPolyHavenModel("Barrel_01", "barrel_01");

  console.log("\nDone. Update public/game/ASSETS.md if you add files.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
