"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { cn } from "@/lib/cn";
import { SectionHeading } from "./SectionHeading";

const MAX_BRANDS = 8;
const PER_BRAND = 8;

/** One "Shop by brand" section with a tab per top brand (by number of
 *  products), instead of a separate stacked rail for every brand. */
export function BrandRails() {
  const { products, loading } = useProducts();
  const [picked, setPicked] = useState<string | null>(null);

  const byBrand = new Map<string, typeof products>();
  for (const p of products) {
    if (!p.brand) continue;
    byBrand.set(p.brand, [...(byBrand.get(p.brand) ?? []), p]);
  }
  const brands = [...byBrand.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, MAX_BRANDS)
    .map(([brand]) => brand);
  const active = picked && brands.includes(picked) ? picked : brands[0];
  const items = active ? (byBrand.get(active) ?? []) : [];
  // Prefer devices with photos so the shelf doesn't fill with placeholders.
  const shown = [...items].sort((a, b) => Number(Boolean(b.images?.length)) - Number(Boolean(a.images?.length))).slice(0, PER_BRAND);

  if (!loading && brands.length === 0) return null;

  return (
    <section className="section py-14 sm:py-20">
      <SectionHeading index="04" eyebrow="Brands we carry" title="Shop by brand" />

      <div role="tablist" aria-label="Brands" className="no-scrollbar -mx-4 mb-7 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {brands.map((b) => (
          <button
            key={b}
            role="tab"
            type="button"
            aria-selected={b === active}
            onClick={() => setPicked(b)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              b === active ? "bg-ink text-white" : "bg-surface-muted text-ink/75 hover:bg-brand-050 hover:text-brand"
            )}
          >
            {b}
            <span className={cn("ml-1.5 font-mono text-[11px] font-normal", b === active ? "text-white/60" : "text-muted")}>{byBrand.get(b)?.length}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={active ?? undefined} className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />) : shown.map((p) => <ProductCard key={p.sku} product={p} />)}
      </div>

      {active && items.length > PER_BRAND && (
        <div className="mt-8 flex justify-center">
          <Link href={`/catalogue?q=${encodeURIComponent(active)}`} className="btn-secondary">
            All {items.length} {active} devices <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
