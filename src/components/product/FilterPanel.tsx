"use client";

import { X } from "lucide-react";
import type { Product, Category } from "@/lib/types";
import { formatKES } from "@/lib/format";
import { sortOptions, type SortOption, type ProductFilterState } from "@/lib/productFilters";
import { cn } from "@/lib/cn";

export type { SortOption } from "@/lib/productFilters";

export function SortSelect({ sort, onSortChange, className }: { sort: SortOption; onSortChange: (s: SortOption) => void; className?: string }) {
  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">Sort devices</span>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="appearance-none rounded-full border border-border bg-surface py-2.5 pl-4 pr-9 text-sm font-medium text-ink outline-none focus:border-brand"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-3.5 h-4 w-4 text-muted" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-5 first:pt-0 last:border-0 last:pb-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      {children}
    </div>
  );
}

export function ProductFilters({
  filters,
  onChange,
  products,
  categories,
  bounds,
}: {
  filters: ProductFilterState;
  onChange: (patch: Partial<ProductFilterState>) => void;
  products: Product[];
  categories: Category[];
  bounds: [number, number];
}) {
  const countFor = (slug: string | null) => (slug === null ? products.length : products.filter((p) => p.category === slug).length);
  const brands = [...new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b)))].sort();

  return (
    <div className="flex flex-col">
      <Section title="Category">
        <div className="flex flex-col gap-0.5">
          {[{ slug: null, name: "All devices" }, ...categories].map((c) => {
            const active = filters.category === c.slug;
            return (
              <button
                key={c.slug ?? "all"}
                onClick={() => onChange({ category: c.slug })}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                  active ? "bg-brand-050 font-semibold text-brand" : "text-ink/75 hover:bg-surface-muted hover:text-ink"
                )}
              >
                {c.name}
                <span className="text-xs text-muted">{countFor(c.slug)}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {brands.length > 1 && (
        <Section title="Brand">
          <div className="flex flex-wrap gap-1.5">
            {brands.map((b) => (
              <button key={b} onClick={() => onChange({ query: filters.query === b ? "" : b })} className="chip">
                {b}
              </button>
            ))}
          </div>
        </Section>
      )}

      <Section title="RRP (KES)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            value={filters.minRrp ?? ""}
            onChange={(e) => onChange({ minRrp: e.target.value ? Number(e.target.value) : null })}
            className="field min-w-0 px-3 py-2"
            aria-label="Minimum RRP"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            value={filters.maxRrp ?? ""}
            onChange={(e) => onChange({ maxRrp: e.target.value ? Number(e.target.value) : null })}
            className="field min-w-0 px-3 py-2"
            aria-label="Maximum RRP"
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {formatKES(bounds[0])} – {formatKES(bounds[1])}
        </p>
      </Section>

      <Section title="Availability">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/80">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange({ inStockOnly: e.target.checked })}
            className="h-4 w-4 rounded border-border-strong text-brand focus:ring-brand"
          />
          In stock only
        </label>
        <label className="mt-2.5 flex cursor-pointer items-center gap-2.5 text-sm text-ink/80">
          <input
            type="checkbox"
            checked={filters.onOfferOnly}
            onChange={(e) => onChange({ onOfferOnly: e.target.checked })}
            className="h-4 w-4 rounded border-border-strong text-brand focus:ring-brand"
          />
          On offer only
        </label>
      </Section>
    </div>
  );
}

export function ActiveFilterChips({
  filters,
  categoryName,
  onChange,
  onClearAll,
}: {
  filters: ProductFilterState;
  categoryName?: string | null;
  onChange: (patch: Partial<ProductFilterState>) => void;
  onClearAll: () => void;
}) {
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (filters.category && categoryName) chips.push({ key: "cat", label: categoryName, clear: () => onChange({ category: null }) });
  if (filters.minRrp != null || filters.maxRrp != null)
    chips.push({
      key: "rrp",
      label: `${filters.minRrp != null ? formatKES(filters.minRrp) : "Any"} – ${filters.maxRrp != null ? formatKES(filters.maxRrp) : "Any"}`,
      clear: () => onChange({ minRrp: null, maxRrp: null }),
    });
  if (filters.inStockOnly) chips.push({ key: "stock", label: "In stock", clear: () => onChange({ inStockOnly: false }) });
  if (filters.onOfferOnly) chips.push({ key: "offers", label: "On offer", clear: () => onChange({ onOfferOnly: false }) });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button key={chip.key} onClick={chip.clear} className="chip chip-active gap-1 pr-2">
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}
      <button onClick={onClearAll} className="text-xs font-semibold text-brand hover:text-brand-strong">
        Clear all
      </button>
    </div>
  );
}
