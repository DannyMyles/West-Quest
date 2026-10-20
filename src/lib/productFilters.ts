import type { ReadonlyURLSearchParams } from "next/navigation";

export type SortOption = "featured" | "rrp-asc" | "rrp-desc" | "name-asc" | "daily-asc" | "saving";

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "daily-asc", label: "Lowest daily payment" },
  { value: "saving", label: "Biggest saving" },
  { value: "rrp-asc", label: "Price: Low to High" },
  { value: "rrp-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
];

export interface ProductFilterState {
  category: string | null;
  query: string;
  sort: SortOption;
  minRrp: number | null;
  maxRrp: number | null;
  inStockOnly: boolean;
  onOfferOnly: boolean;
}

export const emptyFilters: ProductFilterState = {
  category: null,
  query: "",
  sort: "featured",
  minRrp: null,
  maxRrp: null,
  inStockOnly: false,
  onOfferOnly: false,
};

function num(value: string | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function parseFilters(params: URLSearchParams | ReadonlyURLSearchParams): ProductFilterState {
  const sort = params.get("sort") as SortOption | null;
  return {
    category: params.get("category") || null,
    query: params.get("q") ?? "",
    sort: sort && sortOptions.some((o) => o.value === sort) ? sort : "featured",
    minRrp: num(params.get("min")),
    maxRrp: num(params.get("max")),
    inStockOnly: params.get("instock") === "1",
    onOfferOnly: params.get("offers") === "1",
  };
}

export function filtersToParams(f: ProductFilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.category) p.set("category", f.category);
  if (f.query.trim()) p.set("q", f.query.trim());
  if (f.sort !== "featured") p.set("sort", f.sort);
  if (f.minRrp != null) p.set("min", String(f.minRrp));
  if (f.maxRrp != null) p.set("max", String(f.maxRrp));
  if (f.inStockOnly) p.set("instock", "1");
  if (f.onOfferOnly) p.set("offers", "1");
  return p;
}

export function activeFilterCount(f: ProductFilterState): number {
  let n = 0;
  if (f.category) n++;
  if (f.minRrp != null || f.maxRrp != null) n++;
  if (f.inStockOnly) n++;
  if (f.onOfferOnly) n++;
  return n;
}
