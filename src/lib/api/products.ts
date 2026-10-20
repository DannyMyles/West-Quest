import { api } from "./client";
import type { PaymentPlan, Product, ProductBadge, ProductSpec } from "@/lib/types";


interface RawProduct {
  id: number;
  slug: string;
  sku: string;
  name: string;
  category: string;
  brand: string | null;
  modelCode: string | null;
  ram: string | null;
  storage: string | null;
  rrp: number;
  wasPrice: number | null;
  offerEndsAt: string | null;
  description: string;
  specs: ProductSpec[];
  inStock: boolean;
  stockCount: number | null;
  badge: ProductBadge | null;
  rating: number | null;
  reviewCount: number | null;
  featured: boolean;
  featureRank: number | null;
  images: string[];
  paymentPlans: PaymentPlan[];
  updatedAt?: string;
  // admin-only
  active?: boolean;
  adminNotes?: string | null;
}

export function toProduct(r: RawProduct): Product {
  return {
    id: r.id,
    slug: r.slug,
    sku: r.sku,
    name: r.name,
    category: r.category,
    brand: r.brand,
    modelCode: r.modelCode,
    ram: r.ram,
    storage: r.storage,
    rrp: r.rrp,
    wasPrice: r.wasPrice ?? null,
    offerEndsAt: r.offerEndsAt ?? null,
    description: r.description,
    specs: r.specs ?? [],
    inStock: r.inStock,
    stockCount: r.stockCount,
    badge: r.badge ?? undefined,
    rating: r.rating,
    reviewCount: r.reviewCount,
    featured: r.featured,
    featureRank: r.featureRank,
    images: r.images ?? [],
    paymentPlans: r.paymentPlans ?? [],
    updatedAt: r.updatedAt,
    active: r.active ?? true,
    adminNotes: r.adminNotes,
  };
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductQuery {
  q?: string;
  category?: string;
  brand?: string;
  ram?: string;
  storage?: string;
  minRrp?: number;
  maxRrp?: number;
  inStock?: boolean;
  featured?: boolean;
  active?: boolean; // admin only
  sort?: "featured" | "rrp-asc" | "rrp-desc" | "name" | "newest" | "discount";
  page?: number;
  limit?: number;
}

/** What the admin can send when creating/updating a product (payment plans
 *  are managed separately — see lib/api/paymentPlans.ts). */
export interface ProductInput {
  name: string;
  sku: string;
  category: string;
  slug?: string;
  brand?: string | null;
  modelCode?: string | null;
  ram?: string | null;
  storage?: string | null;
  rrp: number;
  wasPrice?: number | null;
  offerEndsAt?: string | null;
  description?: string;
  specs?: ProductSpec[];
  inStock?: boolean;
  stockCount?: number | null;
  badge?: ProductBadge | null;
  rating?: number | null;
  reviewCount?: number | null;
  featured?: boolean;
  featureRank?: number | null;
  active?: boolean;
  adminNotes?: string | null;
}

async function page(path: string, query: ProductQuery): Promise<Page<Product>> {
  const res = await api<Page<RawProduct>>(path, { query: query as Record<string, string | number | boolean | undefined> });
  return { ...res, items: res.items.map(toProduct) };
}

// --- storefront ---------------------------------------------------------------
export const fetchProductsPage = (query: ProductQuery = {}) => page("/products", query);

/** Every visible product (the storefront filters/searches client-side). */
export async function fetchAllProducts(): Promise<Product[]> {
  const out: Product[] = [];
  for (let p = 1; p <= 25; p++) {
    const res = await fetchProductsPage({ page: p, limit: 200, sort: "name" });
    out.push(...res.items);
    if (p >= res.totalPages) break;
  }
  return out;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    return toProduct(await api<RawProduct>(`/products/${encodeURIComponent(slug)}`));
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

// --- admin ----------------------------------------------------------------------
export const adminListProducts = (query: ProductQuery = {}) => page("/admin/products", query);

export async function adminAllProducts(): Promise<Product[]> {
  const out: Product[] = [];
  for (let p = 1; p <= 25; p++) {
    const res = await adminListProducts({ page: p, limit: 200, sort: "name" });
    out.push(...res.items);
    if (p >= res.totalPages) break;
  }
  return out;
}

export async function adminGetProduct(id: number): Promise<Product> {
  return toProduct(await api<RawProduct>(`/admin/products/${id}`));
}

export async function adminCreateProduct(input: ProductInput): Promise<Product> {
  return toProduct(await api<RawProduct>("/admin/products", { method: "POST", json: input }));
}

export async function adminUpdateProduct(id: number, patch: Partial<Omit<ProductInput, "slug">>): Promise<Product> {
  return toProduct(await api<RawProduct>(`/admin/products/${id}`, { method: "PATCH", json: patch }));
}

export const adminDeleteProduct = (id: number) => api<void>(`/admin/products/${id}`, { method: "DELETE" });

export interface BulkResult {
  created: number;
  updated: number;
  errors: { row: number; sku: string | null; message: string }[];
}
export const adminBulkUpsert = (items: ProductInput[]) =>
  api<BulkResult>("/admin/products/bulk", { method: "POST", json: { items } });
