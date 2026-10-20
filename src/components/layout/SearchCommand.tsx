"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, CornerDownLeft, Search, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { searchProducts } from "@/services/productService";
import { categoryIcon } from "@/lib/categoryIcons";
import { cheapestDaily } from "@/lib/finance";
import { formatKES } from "@/lib/format";
import { planForTier, type Product } from "@/lib/types";
import { cn } from "@/lib/cn";

const MAX_PRODUCTS = 6;
const POPULAR_BRANDS = 8;

type Option = { id: string; href: string };

/** Highlights each query term inside `text`. */
function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.trim().split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!terms.length) return <>{text}</>;
  const parts = text.split(new RegExp(`(${terms.join("|")})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-transparent font-semibold text-brand">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function priceLine(p: Product) {
  const plan = planForTier(p, "retail");
  return plan ? `From ${formatKES(cheapestDaily(plan))}/day` : formatKES(p.rrp);
}

/**
 * Site search as a combobox: suggestions (popular brands, categories) when
 * empty, live product / category / brand matches while typing, full keyboard
 * support. `inline` drops a panel under the header field; `sheet` renders the
 * same content in place for the full-screen mobile search.
 */
export function SearchCommand({ variant = "inline", autoFocus = false, onDone }: { variant?: "inline" | "sheet"; autoFocus?: boolean; onDone?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { products } = useProducts();
  const { categories } = useCategories();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(variant === "sheet");
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const sheet = variant === "sheet";
  const q = query.trim();

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) if (p.brand) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([b]) => b);
  }, [products]);

  const matches = useMemo(() => (q ? searchProducts(products, q) : []), [products, q]);
  const lower = q.toLowerCase();
  const catMatches = q ? categories.filter((c) => c.name.toLowerCase().includes(lower)).slice(0, 3) : categories;
  const brandMatches = q ? brands.filter((b) => b.toLowerCase().includes(lower)).slice(0, 4) : brands.slice(0, POPULAR_BRANDS);
  const shownProducts = matches.slice(0, MAX_PRODUCTS);
  const allHref = `/catalogue?q=${encodeURIComponent(q)}`;

  const options: Option[] = [
    ...shownProducts.map((p) => ({ id: `p-${p.sku}`, href: `/catalogue/${p.slug}` })),
    ...catMatches.map((c) => ({ id: `c-${c.slug}`, href: `/catalogue?category=${c.slug}` })),
    ...brandMatches.map((b) => ({ id: `b-${b}`, href: `/catalogue?q=${encodeURIComponent(b)}` })),
    ...(q && matches.length ? [{ id: "all", href: allHref }] : []),
  ];
  const optionIndex = (id: string) => options.findIndex((o) => o.id === id);
  const optId = (id: string) => `${listId}-${id}`;

  // Close the inline panel on route change and on outside clicks.
  useEffect(() => {
    if (sheet) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname, sheet]);

  useEffect(() => {
    if (sheet || !open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, sheet]);

  // "/" focuses the header search from anywhere that isn't a text field.
  useEffect(() => {
    if (sheet) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  function go(href: string) {
    setOpen(sheet);
    inputRef.current?.blur();
    onDone?.();
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      if (!options.length) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && options[active]) go(options[active].href);
      else go(q ? allHref : "/catalogue");
    } else if (e.key === "Escape") {
      if (query) setQuery("");
      else if (sheet) onDone?.();
      else {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
  }

  const activeId = active >= 0 && options[active] ? optId(options[active].id) : undefined;

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);
  const showPanel = sheet || open;

  const rowClass = (id: string) =>
    cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors", optionIndex(id) === active ? "bg-surface-muted" : "hover:bg-surface-muted/70");

  const panel = (
    <div className={cn(sheet ? "" : "max-h-[min(60vh,480px)] overflow-y-auto p-2")}>
      {q && shownProducts.length > 0 && (
        <Group title="Devices">
          {shownProducts.map((p) => {
            const id = `p-${p.sku}`;
            return (
              <Link
                key={id}
                id={optId(id)}
                role="option"
                aria-selected={optionIndex(id) === active}
                href={`/catalogue/${p.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(`/catalogue/${p.slug}`);
                }}
                onMouseEnter={() => setActive(optionIndex(id))}
                className={rowClass(id)}
              >
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                  {p.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt="" className="h-full w-full object-contain p-1 blend-white" loading="lazy" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">
                    <Highlight text={p.name} query={q} />
                  </span>
                  <span className="mt-0.5 block font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">{p.brand ?? p.category}</span>
                </span>
                <span className="hidden shrink-0 text-right text-xs font-semibold text-accent sm:block">{priceLine(p)}</span>
              </Link>
            );
          })}
        </Group>
      )}

      {q && matches.length === 0 && catMatches.length === 0 && brandMatches.length === 0 && (
        <div className="px-4 py-8 text-center">
          <p className="font-display text-xl text-ink">Nothing matches “{q}”</p>
          <p className="mt-1 text-sm text-muted">Check the spelling, or try a brand like {brands.slice(0, 3).join(", ")}.</p>
        </div>
      )}

      {brandMatches.length > 0 && (
        <Group title={q ? "Brands" : "Popular brands"}>
          <div className="flex flex-wrap gap-1.5 px-3 pb-1 pt-0.5">
            {brandMatches.map((b) => {
              const id = `b-${b}`;
              return (
                <Link
                  key={id}
                  id={optId(id)}
                  role="option"
                  aria-selected={optionIndex(id) === active}
                  href={`/catalogue?q=${encodeURIComponent(b)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(`/catalogue?q=${encodeURIComponent(b)}`);
                  }}
                  onMouseEnter={() => setActive(optionIndex(id))}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                    optionIndex(id) === active ? "bg-ink text-white" : "bg-surface-muted text-ink/80 hover:bg-brand-050 hover:text-brand"
                  )}
                >
                  <Highlight text={b} query={q} />
                </Link>
              );
            })}
          </div>
        </Group>
      )}

      {catMatches.length > 0 && (
        <Group title={q ? "Categories" : "Browse categories"}>
          <div className={cn(!q && "grid sm:grid-cols-2")}>
            {catMatches.map((c) => {
              const id = `c-${c.slug}`;
              const Icon = categoryIcon(c.icon ?? c.slug);
              return (
                <Link
                  key={id}
                  id={optId(id)}
                  role="option"
                  aria-selected={optionIndex(id) === active}
                  href={`/catalogue?category=${c.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(`/catalogue?category=${c.slug}`);
                  }}
                  onMouseEnter={() => setActive(optionIndex(id))}
                  className={rowClass(id)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-050 text-brand">
                    <Icon className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                  <span className="flex-1 text-sm font-medium text-ink">
                    <Highlight text={c.name} query={q} />
                  </span>
                  <span className="font-mono text-[11px] text-muted">{c.productCount ?? 0}</span>
                </Link>
              );
            })}
          </div>
        </Group>
      )}

    </div>
  );

  const seeAll = (
    q && matches.length > 0 && (
        <div className={cn("border-t border-dashed border-border-strong", sheet ? "mt-2 pt-2" : "px-2 py-2")}>
          <Link
            id={optId("all")}
            role="option"
            aria-selected={optionIndex("all") === active}
            href={allHref}
            onClick={(e) => {
              e.preventDefault();
              go(allHref);
            }}
            onMouseEnter={() => setActive(optionIndex("all"))}
            className={cn(rowClass("all"), "justify-between text-sm font-semibold text-ink")}
          >
            <span>
              See all {matches.length} {matches.length === 1 ? "result" : "results"} for “{q}”
            </span>
            <ArrowRight className="h-4 w-4 text-brand" />
          </Link>
        </div>
      )
  );

  return (
    <div ref={wrapRef} className={cn("relative", !sheet && "mx-auto w-full max-w-xl")}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(q ? allHref : "/catalogue");
        }}
        className={cn(
          "flex items-center gap-2 rounded-full px-4 transition-[background-color,box-shadow]",
          sheet ? "h-12 bg-surface shadow-md" : "h-11",
          !sheet && (showPanel ? "bg-surface shadow-lg ring-1 ring-border" : "bg-surface-muted hover:bg-[#efe5d6]")
        )}
      >
        <Search className={cn("h-4 w-4 shrink-0", showPanel ? "text-brand" : "text-muted")} />
        <input
          ref={inputRef}
          value={query}
          autoFocus={autoFocus}
          data-autofocus={autoFocus || undefined}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          aria-label="Search devices"
          placeholder="Search phones, tablets, brands…"
          enterKeyHint="search"
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted/80 focus-visible:outline-none"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setActive(-1);
              inputRef.current?.focus();
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/8 text-ink/60 transition-colors hover:bg-ink/15 hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          !sheet && (
            <kbd className="hidden rounded-md bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted shadow-sm lg:block">/</kbd>
          )
        )}
      </form>

      {showPanel &&
        (sheet ? (
          <div id={listId} role="listbox" aria-label="Search suggestions" className="mt-4">
            {panel}
            {seeAll}
          </div>
        ) : (
          <div className="absolute inset-x-0 top-full z-50 mt-2 min-w-[min(560px,90vw)] overflow-hidden rounded-2xl bg-surface shadow-xl ring-1 ring-border/70">
            <div id={listId} role="listbox" aria-label="Search suggestions">
              {panel}
              {seeAll}
            </div>
            <div className="hidden items-center justify-between border-t border-border/70 bg-surface-muted/60 px-4 py-2 text-[11px] text-muted lg:flex">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-surface px-1 font-mono shadow-sm">↑</kbd>
                  <kbd className="rounded bg-surface px-1 font-mono shadow-sm">↓</kbd> to move
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="flex items-center rounded bg-surface px-1 shadow-sm">
                    <CornerDownLeft className="h-3 w-3" />
                  </kbd>{" "}
                  to open
                </span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-surface px-1 font-mono shadow-sm">esc</kbd> to close
              </span>
            </div>
          </div>
        ))}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-1.5">
      <p className="px-3 pb-1.5 pt-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted">
        {title}
      </p>
      {children}
    </div>
  );
}
