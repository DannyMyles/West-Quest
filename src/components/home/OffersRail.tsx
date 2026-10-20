"use client";

import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/product/ProductCard";
import { getOffer } from "@/lib/offers";

const MAX = 10;

/** Homepage band of products on offer (biggest saving first). Renders
 *  nothing when there are no live offers. */
export function OffersRail() {
  const { products } = useProducts();
  const offers = products
    .map((p) => ({ p, offer: getOffer(p) }))
    .filter((x) => x.offer)
    .sort((a, b) => b.offer!.saving - a.offer!.saving)
    .slice(0, MAX)
    .map((x) => x.p);

  if (offers.length === 0) return null;

  return (
    <section className="bg-brand text-white">
      <div className="section py-14 sm:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-white/75">
              <Tag aria-hidden className="h-3.5 w-3.5" /> Limited-time offers
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium leading-tight tracking-[-0.015em] sm:text-[44px]">
              On offer <em className="text-glow">right now.</em>
            </h2>
          </div>
          <Link href="/catalogue?offers=1&sort=saving" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-glow">
            See all offers <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <ul className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 text-ink sm:mx-0 sm:px-0">
          {offers.map((p) => (
            <li key={p.sku} className="w-[240px] shrink-0 snap-start sm:w-[280px]">
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
