// Exports a read-only snapshot of the live catalogue for the static preview
// build (NEXT_PUBLIC_STATIC_DEMO=1), e.g. a frontend-only deploy on Vercel.
//
// Reads ONLY the backend's public API — it never writes to the database.
// Writes:
//   public/products/<slug>/<n>.jpg   optimized copies of each product photo
//   src/data/static-catalog.json     products + categories (API shapes), image
//                                    URLs pointing at the static files above
//   src/data/static-images.json      slug → static image paths (small; used in
//                                    every mode so cards prefer the static files)
//
// Usage (backend running):  node scripts/export-static-catalog.mjs
// To swap in a better photo later, replace public/products/<slug>/1.jpg (same
// name) — or upload it in the admin and re-run this script.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = (process.env.BACKEND_URL ?? "http://127.0.0.1:4000").replace(/\/+$/, "");
const OUT_IMG = path.join(ROOT, "public", "products");
const OUT_DATA = path.join(ROOT, "src", "data");
const MAX_SIDE = 1000;

async function getJson(p) {
  const res = await fetch(`${API}/api${p}`);
  if (!res.ok) throw new Error(`GET ${p} → ${res.status}`);
  return res.json();
}

/** "/images/p/123?v=…" or "http://host/images/p/123?v=…" → "123". */
const imageId = (url) => url.match(/\/images\/p\/(\d+)/)?.[1] ?? null;

async function main() {
  const products = [];
  for (let page = 1; page <= 50; page++) {
    const res = await getJson(`/products?page=${page}&limit=200&sort=name`);
    products.push(...res.items);
    if (page >= res.totalPages) break;
  }
  const { items: categories } = await getJson("/categories");

  await fs.rm(OUT_IMG, { recursive: true, force: true });
  await fs.mkdir(OUT_IMG, { recursive: true });
  await fs.mkdir(OUT_DATA, { recursive: true });

  const staticById = new Map();
  let bytes = 0;
  let done = 0;
  const queue = [...products];
  async function worker() {
    for (let p = queue.shift(); p; p = queue.shift()) {
      const paths = [];
      for (const [i, url] of p.images.entries()) {
        const src = url.startsWith("http") ? url : `${API}${url}`;
        const res = await fetch(src);
        if (!res.ok) throw new Error(`${p.slug}: image ${src} → ${res.status}`);
        const input = Buffer.from(await res.arrayBuffer());
        const jpeg = await sharp(input)
          .rotate()
          .flatten({ background: "#ffffff" }) // transparent PNGs → white, like the storefront expects
          .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80, mozjpeg: true })
          .toBuffer();
        const rel = `/products/${p.slug}/${i + 1}.jpg`;
        await fs.mkdir(path.join(OUT_IMG, p.slug), { recursive: true });
        await fs.writeFile(path.join(ROOT, "public", rel), jpeg);
        bytes += jpeg.length;
        paths.push(rel);
        const id = imageId(url);
        if (id) staticById.set(id, rel);
      }
      p.images = paths;
      if (++done % 50 === 0) console.log(`  ${done}/${products.length} products`);
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));

  for (const c of categories) {
    const id = c.image ? imageId(c.image) : null;
    c.image = id && staticById.has(id) ? staticById.get(id) : null;
  }

  const imagesBySlug = Object.fromEntries(products.filter((p) => p.images.length).map((p) => [p.slug, p.images]));
  await fs.writeFile(
    path.join(OUT_DATA, "static-catalog.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), categories, products })
  );
  await fs.writeFile(path.join(OUT_DATA, "static-images.json"), JSON.stringify(imagesBySlug));

  console.log(
    `\nExported ${products.length} products, ${categories.length} categories, ${staticById.size} photos (${(bytes / 1048576).toFixed(1)} MB) to public/products/`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
