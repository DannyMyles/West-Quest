import { fetchAllProducts, fetchProductBySlug } from "@/lib/api/products";
import { cheapestDaily } from "@/lib/finance";
import { planForTier } from "@/lib/types";
import type { Product } from "@/lib/types";
import type { SortOption } from "@/lib/productFilters";
import { getOffer } from "@/lib/offers";

/** The backend API is the source of truth; it only returns visible products. */
export async function getProducts(): Promise<Product[]> {
  return fetchAllProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return fetchProductBySlug(slug);
}

export function searchProducts(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  const terms = q.split(/\s+/).filter(Boolean);
  return products.filter((p) => {
    const haystack = [
      p.name,
      p.sku,
      p.brand ?? "",
      p.category.replace(/-/g, " "),
      p.description,
      ...p.specs.map((s) => `${s.label} ${s.value}`),
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

export function getRelatedProducts(all: Product[], product: Product, max = 4): Product[] {
  return all.filter((p) => p.category === product.category && p.sku !== product.sku).slice(0, max);
}

/** Home-page rail selectors — each is defensive so an empty result just
 *  hides the rail rather than erroring. */

/** Worth putting on the homepage: has a retail plan, photographed and in stock. */
const presentable = (p: Product) => planForTier(p, "retail") !== undefined && (p.images?.length ?? 0) > 0 && p.inStock;

/** Takes one product per category in turn, so a rail shows variety instead
 *  of several near-identical items from the same category. */
function spreadAcrossCategories(list: Product[], max: number): Product[] {
  const byCat = new Map<string, Product[]>();
  for (const p of list) byCat.set(p.category, [...(byCat.get(p.category) ?? []), p]);
  const queues = [...byCat.values()];
  const out: Product[] = [];
  while (out.length < max && queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.shift();
      if (next && out.length < max) out.push(next);
    }
  }
  return out;
}

export function selectBestSellers(all: Product[], max = 8): Product[] {
  const picked = all.filter((p) => p.badge === "Best Seller" || p.badge === "Popular" || p.featured);
  if (picked.length >= 4) return picked.slice(0, max);
  const ranked = all
    .filter((p) => presentable(p) && !picked.includes(p))
    .sort((a, b) => (a.featureRank ?? Infinity) - (b.featureRank ?? Infinity) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
  return [...picked, ...spreadAcrossCategories(ranked, max)].slice(0, max);
}

/** Products tagged "New" first, then the most recently added. `exclude`
 *  keeps it from repeating what another rail already shows. */
export function selectNewArrivals(all: Product[], max = 8, exclude: Set<string> = new Set()): Product[] {
  const fresh = all.filter((p) => !exclude.has(p.sku));
  const tagged = fresh.filter((p) => p.badge === "New");
  if (tagged.length >= 4) return tagged.slice(0, max);
  const newest = fresh.filter((p) => presentable(p) && p.badge !== "New").sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  return [...tagged, ...spreadAcrossCategories(newest, max)].slice(0, max);
}

export interface ProductFilters {
  category?: string | null;
  query?: string;
  sort?: SortOption;
  minRrp?: number | null;
  maxRrp?: number | null;
  inStockOnly?: boolean;
  onOfferOnly?: boolean;
}

export function filterAndSortProducts(
  products: Product[],
  { category, query, sort, minRrp, maxRrp, inStockOnly, onOfferOnly }: ProductFilters
): Product[] {
  let list = products;
  if (category) list = list.filter((p) => p.category === category);
  if (query) list = searchProducts(list, query);
  if (typeof minRrp === "number") list = list.filter((p) => p.rrp >= minRrp);
  if (typeof maxRrp === "number") list = list.filter((p) => p.rrp <= maxRrp);
  if (inStockOnly) list = list.filter((p) => p.inStock && p.stockCount !== 0);
  if (onOfferOnly) list = list.filter((p) => getOffer(p));

  const dailyOf = (p: Product) => {
    const plan = planForTier(p, "retail");
    return plan ? cheapestDaily(plan) : Infinity;
  };

  const sorted = [...list];
  if (sort === "rrp-asc") {
    sorted.sort((a, b) => a.rrp - b.rrp);
  } else if (sort === "rrp-desc") {
    sorted.sort((a, b) => b.rrp - a.rrp);
  } else if (sort === "daily-asc") {
    sorted.sort((a, b) => dailyOf(a) - dailyOf(b));
  } else if (sort === "saving") {
    sorted.sort((a, b) => (getOffer(b)?.saving ?? 0) - (getOffer(a)?.saving ?? 0));
  } else if (sort === "name-asc") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  return sorted;
}

export function rrpBounds(products: Product[]): [number, number] {
  if (products.length === 0) return [0, 0];
  const rrps = products.map((p) => p.rrp);
  return [Math.min(...rrps), Math.max(...rrps)];
}
