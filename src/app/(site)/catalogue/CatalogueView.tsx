"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useMounted } from "@/hooks/useMounted";
import { filterAndSortProducts, rrpBounds } from "@/services/productService";
import { parseFilters, filtersToParams, activeFilterCount, emptyFilters, type ProductFilterState } from "@/lib/productFilters";
import { SearchBar } from "@/components/product/SearchBar";
import { ProductFilters, SortSelect, ActiveFilterChips } from "@/components/product/FilterPanel";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ErrorState } from "@/components/ui/ErrorState";

export function CatalogueView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products: allProducts, loading: rawLoading, error, retry } = useProducts();
  const { categories } = useCategories();
  const mounted = useMounted();

  const dataReady = mounted && !rawLoading;
  const products = useMemo(() => (dataReady ? allProducts : []), [dataReady, allProducts]);
  const loading = !dataReady;

  const urlFilters = parseFilters(searchParams);
  const [filters, setFilters] = useState<ProductFilterState>(urlFilters);
  const [urlKey, setUrlKey] = useState(searchParams.toString());
  const currentKey = searchParams.toString();
  if (currentKey !== urlKey) {
    setUrlKey(currentKey);
    setFilters(urlFilters);
  }

  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useFocusTrap<HTMLDivElement>(sheetOpen, () => setSheetOpen(false));

  function commit(next: ProductFilterState) {
    setFilters(next);
    const qs = filtersToParams(next).toString();
    router.replace(qs ? `/catalogue?${qs}` : "/catalogue", { scroll: false });
  }

  function patch(p: Partial<ProductFilterState>) {
    commit({ ...filters, ...p });
  }

  const bounds = useMemo(() => rrpBounds(products), [products]);

  const filtered = useMemo(
    () =>
      filterAndSortProducts(products, {
        category: filters.category,
        query: filters.query,
        sort: filters.sort,
        minRrp: filters.minRrp,
        maxRrp: filters.maxRrp,
        inStockOnly: filters.inStockOnly,
        onOfferOnly: filters.onOfferOnly,
      }),
    [products, filters]
  );

  const activeCategoryName = filters.category ? (categories.find((c) => c.slug === filters.category)?.name ?? filters.category) : null;
  const count = activeFilterCount(filters);

  return (
    <div className="section py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[40px]">
          {activeCategoryName ?? (filters.query ? `Results for “${filters.query}”` : "All Devices")}
        </h1>
        <p className="mt-1.5 text-sm text-muted" aria-live="polite">
          {loading ? "Loading devices…" : `${filtered.length} ${filtered.length === 1 ? "device" : "devices"}`}
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl bg-surface p-5 shadow-md lg:top-32">
            <ProductFilters filters={filters} onChange={patch} products={products} categories={categories} bounds={bounds} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <SearchBar value={filters.query} onChange={(q) => patch({ query: q })} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <button onClick={() => setSheetOpen(true)} className="btn-secondary lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {count > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </button>
                <SortSelect sort={filters.sort} onSortChange={(s) => patch({ sort: s })} className="ml-auto" />
              </div>
            </div>
            <ActiveFilterChips
              filters={filters}
              categoryName={activeCategoryName}
              onChange={patch}
              onClearAll={() => commit({ ...emptyFilters, query: filters.query })}
            />
          </div>

          {error ? (
            <ErrorState onRetry={retry} />
          ) : (
            <ProductGrid products={filtered} loading={loading} emptyHint="No devices match these filters. Try widening your price range or clearing filters." />
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Filter devices"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-[80] flex max-h-[85vh] flex-col rounded-t-3xl bg-surface lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-base font-semibold text-ink">Filters</h2>
                <button
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close filters"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-surface-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-2">
                <ProductFilters filters={filters} onChange={patch} products={products} categories={categories} bounds={bounds} />
              </div>
              <div className="flex gap-3 border-t border-border p-4">
                <button onClick={() => commit({ ...emptyFilters, query: filters.query })} className="btn-secondary flex-1">
                  Clear all
                </button>
                <button onClick={() => setSheetOpen(false)} className="btn-primary flex-1">
                  Show {filtered.length} results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
