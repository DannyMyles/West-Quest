"use client";

import { useState } from "react";
import { PackageSearch } from "lucide-react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

const PAGE_SIZE = 60;

export function ProductGrid({
  products,
  loading = false,
  emptyHint,
}: {
  products: Product[];
  loading?: boolean;
  emptyHint?: React.ReactNode;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Reset paging whenever the result set changes (new filter/search) — done
  // during render per the React "adjust state on prop change" guidance.
  const signature = `${products.length}:${products[0]?.sku ?? ""}:${products[products.length - 1]?.sku ?? ""}`;
  const [prevSignature, setPrevSignature] = useState(signature);
  if (signature !== prevSignature) {
    setPrevSignature(signature);
    setVisible(PAGE_SIZE);
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="tag-corner flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface py-20 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted">
          <PackageSearch className="h-6 w-6" />
        </span>
        <p className="text-sm font-semibold text-ink">No devices found</p>
        <p className="max-w-xs text-sm text-muted">{emptyHint ?? "Try a different search term or clear your filters."}</p>
        <Link href="/catalogue" className="btn-secondary mt-1">
          Browse all devices
        </Link>
      </div>
    );
  }

  const shown = products.slice(0, visible);
  const remaining = products.length - shown.length;

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {products.length} devices
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {shown.map((product, i) => (
          <ProductCard key={product.sku} product={product} priority={i < 4} />
        ))}
      </div>
      {remaining > 0 && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-secondary">
            Load more ({remaining})
          </button>
          <span className="text-xs text-muted">
            Showing {shown.length} of {products.length}
          </span>
        </div>
      )}
    </div>
  );
}
