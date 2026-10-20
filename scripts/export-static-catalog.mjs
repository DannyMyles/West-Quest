// Exports a small, read-only demo snapshot of the live catalogue for the
// static preview build — used automatically when no BACKEND_URL is set (e.g.
// a frontend-only deploy on Vercel), or forced with NEXT_PUBLIC_STATIC_DEMO=1.
//
// Reads ONLY the backend's public API — it never writes to the database.
// Picks a curated set of products per category (photos on white first, then
// featured, then financeable, rotating brands) and writes:
//   public/products/<slug>/1.jpg     compressed copy of each product's photo
//   src/data/static-catalog.json     those products + categories (API shapes)
//
// Usage (backend running):  npm run export:static
// To use a different photo, replace public/products/<slug>/1.jpg (same name).
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = (process.env.BACKEND_URL ?? "http://127.0.0.1:4000").replace(/\/+$/, "");
const OUT_IMG = path.join(ROOT, "public", "products");
const OUT_DATA = path.join(ROOT, "src", "data");
const MAX_SIDE = 800;
const QUALITY = 74;

/** How many products each category contributes to the demo. */
const QUOTA = { smartphones: 14, tablets: 8, accessories: 8, audio: 8, gaming: 8, cameras: 5, storage: 4, laptops: 5 };
const DEFAULT_QUOTA = 5;

async function getJson(p) {
  const res = await fetch(`${API}/api${p}`);
  if (!res.ok) throw new Error(`GET ${p} → ${res.status}`);
  return res.json();
}

async function download(url) {
  const res = await fetch(url.startsWith("http") ? url : `${API}${url}`);
  if (!res.ok) throw new Error(`image ${url} → ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Share of edge pixels that are near-white — clean product shots score ~1. */
async function edgeWhiteness(buf) {
  const size = 48;
  const { data } = await sharp(buf).flatten({ background: "#ffffff" }).resize(size, size, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  let light = 0;
  let edge = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (x > 1 && x < size - 2 && y > 1 && y < size - 2) continue;
      const i = (y * size + x) * 3;
      if (data[i] > 249 && data[i + 1] > 249 && data[i + 2] > 249) light++;
      edge++;
    }
  }
  return light / edge;
}

/** Best-first within each brand, then take one per brand per round so a
 *  single brand can't fill the whole category. */
function pickDiverse(ranked, quota) {
  const byBrand = new Map();
  for (const item of ranked) {
    const key = item.p.brand ?? "—";
    byBrand.set(key, [...(byBrand.get(key) ?? []), item]);
  }
  const picked = [];
  while (picked.length < quota && byBrand.size) {
    for (const [brand, items] of [...byBrand.entries()]) {
      if (picked.length >= quota) break;
      picked.push(items.shift());
      if (!items.length) byBrand.delete(brand);
    }
  }
  return picked;
}

async function main() {
  const products = [];
  for (let page = 1; page <= 50; page++) {
    const res = await getJson(`/products?page=${page}&limit=200&sort=featured`);
    products.push(...res.items);
    if (page >= res.totalPages) break;
  }
  const { items: categories } = await getJson("/categories");

  // Score every candidate's main photo.
  const scored = [];
  const queue = products.filter((p) => p.images?.length);
  async function scorer() {
    for (let p = queue.shift(); p; p = queue.shift()) {
      const buf = await download(p.images[0]);
      scored.push({ p, buf, white: await edgeWhiteness(buf) });
    }
  }
  await Promise.all(Array.from({ length: 6 }, scorer));

  // Clean on-white shots fill each quota first (brand-rotated); marketing or
  // lifestyle photos only top up a category that runs short. The same photo
  // used by several variants is shown once.
  const score = ({ p }) => (p.featured ? 2 : 0) + (p.paymentPlans?.length ? 1 : 0);
  const seen = new Set();
  const unique = scored.filter((s) => {
    const h = crypto.createHash("sha1").update(s.buf).digest("hex");
    if (seen.has(h)) return false;
    seen.add(h);
    return true;
  });
  const chosen = [];
  for (const c of categories) {
    const quota = QUOTA[c.slug] ?? DEFAULT_QUOTA;
    const inCat = unique.filter((s) => s.p.category === c.slug).sort((a, b) => score(b) - score(a));
    const clean = pickDiverse(inCat.filter((s) => s.white > 0.9), quota);
    const rest = pickDiverse(inCat.filter((s) => s.white <= 0.9), quota - clean.length);
    chosen.push(...clean, ...rest);
  }

  await fs.rm(OUT_IMG, { recursive: true, force: true });
  await fs.mkdir(OUT_DATA, { recursive: true });
  let bytes = 0;
  for (const item of chosen) {
    const jpeg = await sharp(item.buf)
      .rotate()
      .flatten({ background: "#ffffff" })
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer();
    const rel = `/products/${item.p.slug}/1.jpg`;
    await fs.mkdir(path.join(OUT_IMG, item.p.slug), { recursive: true });
    await fs.writeFile(path.join(ROOT, "public", rel), jpeg);
    bytes += jpeg.length;
    item.p.images = [rel];
  }

  const demoProducts = chosen.map((c) => c.p);
  const demoCategories = categories
    .map((c) => {
      const inCat = demoProducts.filter((p) => p.category === c.slug);
      return { ...c, productCount: inCat.length, image: inCat[0]?.images[0] ?? null };
    })
    .filter((c) => c.productCount > 0);

  await fs.writeFile(
    path.join(OUT_DATA, "static-catalog.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), categories: demoCategories, products: demoProducts })
  );

  console.log(`Demo set: ${demoProducts.length} products in ${demoCategories.length} categories, ${(bytes / 1048576).toFixed(1)} MB of photos.`);
  for (const c of demoCategories) console.log(`  ${c.slug.padEnd(12)} ${c.productCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
