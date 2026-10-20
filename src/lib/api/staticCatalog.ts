import { ApiError } from "./client";

/**
 * Backend stand-in for the static preview build (NEXT_PUBLIC_STATIC_DEMO=1):
 * catalogue reads are answered from the exported snapshot
 * (scripts/export-static-catalog.mjs); anything that needs the live backend —
 * sign-in, checkout, reviews, the admin — gets a friendly "preview" error.
 * Loaded on demand, so the snapshot never ships in the normal build.
 */
type Query = Record<string, string | number | boolean | undefined | null> | undefined;

export const DEMO_MESSAGE = "This is a preview of the West Quest website — accounts and ordering open when the site goes live. For now, message us on WhatsApp.";

let catalog: Promise<{ products: Record<string, unknown>[]; categories: unknown[] }> | null = null;
const load = () => (catalog ??= import("@/data/static-catalog.json").then((m) => m.default as never));

export async function staticApi(method: string, path: string, query: Query): Promise<unknown> {
  if (method === "GET") {
    if (path === "/products") {
      const { products } = await load();
      const limit = Number(query?.limit ?? 50);
      const page = Number(query?.page ?? 1);
      const totalPages = Math.max(1, Math.ceil(products.length / limit));
      return { items: products.slice((page - 1) * limit, page * limit), total: products.length, page, limit, totalPages };
    }
    const slug = path.match(/^\/products\/([^/]+)$/)?.[1];
    if (slug) {
      const product = (await load()).products.find((p) => p.slug === decodeURIComponent(slug));
      if (!product) throw new ApiError(404, "NOT_FOUND", "Product not found");
      return product;
    }
    if (path === "/categories") return { items: (await load()).categories };
    if (path === "/banners" || path === "/reviews") return { items: [] };
    if (path === "/account/me") return { customer: null };
  }
  throw new ApiError(503, "DEMO", DEMO_MESSAGE);
}
