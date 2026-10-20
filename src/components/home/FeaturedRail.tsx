"use client";

import { useProducts } from "@/hooks/useProducts";
import { selectBestSellers } from "@/services/productService";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { SectionHeading } from "./SectionHeading";

export function FeaturedRail() {
  const { products, loading } = useProducts();
  const featured = selectBestSellers(products, 8);

  if (!loading && featured.length === 0) return null;

  return (
    <section className="section py-14 sm:py-20">
      <SectionHeading index="03" eyebrow="Popular right now" title="Featured devices" href="/catalogue" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : featured.map((p, i) => <ProductCard key={p.sku} product={p} priority={i < 4} />)}
      </div>
    </section>
  );
}
