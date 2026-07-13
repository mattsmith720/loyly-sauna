/**
 * Regenerate site images at 2400px width for retina displays.
 * Run: node scripts/regenerate-images.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const imagesDir = path.join(publicDir, "images");
const galleryDir = path.join(imagesDir, "gallery");

const TARGET_WIDTH = 2400;
const JPEG = { quality: 92, mozjpeg: true, progressive: true };

const galleryDownloads = [
  ["recovery-studio.jpg", "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2400&q=92", "images/gallery/recovery-studio.jpg"],
  ["sauna-interior.jpg", "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2400&q=92", "images/gallery/sauna-interior.jpg"],
  ["wellness-spa.jpg", "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=2400&q=92", "images/gallery/wellness-spa.jpg"],
  ["timber-care.jpg", "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=2400&q=92", "images/gallery/timber-care.jpg"],
  ["cold-plunge.jpg", "https://images.unsplash.com/photo-1626224583814-f87db24ac4ea?auto=format&fit=crop&w=2400&q=92", "images/gallery/cold-plunge.jpg"],
  ["hotel-spa.jpg", "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=2400&q=92", "images/gallery/hotel-spa.jpg"],
];

async function downloadOrUpscale(url, dest, fallbackRelative) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const buf = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buf)
      .resize({ width: TARGET_WIDTH, withoutEnlargement: false, kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: 0.6 })
      .jpeg(JPEG)
      .toBuffer();
    await fs.writeFile(dest, meta);
    const info = await sharp(meta).metadata();
    console.log(`✓ ${path.basename(dest)} → ${info.width}x${info.height} (download)`);
  } catch {
    const src = path.join(publicDir, fallbackRelative);
    const buf = await fs.readFile(src);
    const out = await sharp(buf)
      .resize({ width: TARGET_WIDTH, withoutEnlargement: false, kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: 0.8 })
      .jpeg(JPEG)
      .toBuffer();
    await fs.writeFile(dest, out);
    const info = await sharp(out).metadata();
    console.log(`✓ ${path.basename(dest)} → ${info.width}x${info.height} (upscaled)`);
  }
}

async function upscaleLocal(relativePath) {
  const src = path.join(publicDir, relativePath);
  const buf = await fs.readFile(src);
  const out = await sharp(buf)
    .resize({ width: TARGET_WIDTH, withoutEnlargement: false, kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.8 })
    .jpeg(JPEG)
    .toBuffer();
  await fs.writeFile(src, out);
  const info = await sharp(out).metadata();
  console.log(`✓ ${relativePath} → ${info.width}x${info.height}`);
}

async function buildOgImage() {
  const after = path.join(imagesDir, "after.jpg");
  const dest = path.join(publicDir, "og-image.jpg");
  await sharp(after)
    .resize(2400, 1260, { fit: "cover", position: "centre", kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.5 })
    .jpeg(JPEG)
    .toFile(dest);
  console.log("✓ og-image.jpg → 2400x1260");
}

async function main() {
  await fs.mkdir(galleryDir, { recursive: true });

  console.log("Downloading gallery at 2400px…");
  for (const [name, url, fallback] of galleryDownloads) {
    await downloadOrUpscale(url, path.join(galleryDir, name), fallback);
  }

  console.log("Upscaling hero before/after…");
  await upscaleLocal("images/before.jpg");
  await upscaleLocal("images/after.jpg");

  console.log("Building OG image…");
  await buildOgImage();

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
