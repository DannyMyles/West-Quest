"use client";

import { createElement } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useBestPhoto } from "@/hooks/usePhotoOnWhite";
import { categoryIcon } from "@/lib/categoryIcons";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/cn";
import { SectionHeading } from "./SectionHeading";

const COLS = 4;
/** The feature tile takes a 2×2 block, next to four 1×1 tiles. */
const BENTO_HEAD = 5;

/** Column spans for the tiles after the bento block, so the last row is
 *  always filled edge to edge (e.g. 1 leftover → full width, 3 → 2+1+1). */
function tailSpans(n: number): number[] {
  const spans: number[] = [];
  for (let left = n; left > 0; left -= COLS) {
    const row = Math.min(COLS, left);
    if (row === 3) spans.push(2, 1, 1);
    else spans.push(...Array(row).fill(COLS / row));
  }
  return spans;
}

const LG_SPAN: Record<number, string> = { 1: "lg:col-span-1", 2: "lg:col-span-2", 4: "lg:col-span-4" };

export function CategoryTiles() {
  const { categories } = useCategories();
  const { products } = useProducts();
  if (categories.length === 0) return null;

  // Photo candidates per category: featured devices first. Product image
  // URLs are same-origin, so they can be checked for a white background.
  const photos = new Map<string, string[]>();
  for (const p of [...products].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))) {
    const src = p.images?.[0];
    if (src) photos.set(p.category, [...(photos.get(p.category) ?? []), src]);
  }

  const ordered = [...categories].sort((a, b) => (b.productCount ?? 0) - (a.productCount ?? 0));
  const spans = tailSpans(Math.max(0, ordered.length - BENTO_HEAD));

  return (
    <section className="section py-16 sm:py-24">
      <SectionHeading index="01" eyebrow="Browse the shelves" title="Shop by category" href="/catalogue" linkLabel="All devices" />
      <div className="grid auto-rows-[minmax(190px,auto)] grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[230px] lg:grid-cols-4">
        {ordered.map((c, i) => {
          const feature = i === 0;
          const span = i >= BENTO_HEAD ? spans[i - BENTO_HEAD] : feature ? 2 : 1;
          return (
            <CategoryTile
              key={c.slug}
              category={c}
              photos={photos.get(c.slug) ?? []}
              feature={feature}
              wide={span >= 2 && !feature}
              className={cn(feature ? "col-span-2 lg:row-span-2" : span >= 2 ? "col-span-2" : "col-span-1", !feature && LG_SPAN[span])}
            />
          );
        })}
      </div>
    </section>
  );
}

function CategoryTile({
  category: c,
  photos,
  feature,
  wide,
  className,
}: {
  category: Category;
  photos: string[];
  feature: boolean;
  wide: boolean;
  className?: string;
}) {
  const best = useBestPhoto(photos);
  const cover = best?.onWhite === false;

  return (
    <Link
      href={`/catalogue?category=${c.slug}`}
      className={cn(
        "group relative isolate flex flex-col overflow-hidden rounded-3xl bg-surface-muted p-5 transition-colors duration-300 hover:bg-[#efe3d1] sm:p-6",
        feature && "sm:p-8",
        className
      )}
    >
      {photos.length ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute",
            cover
              ? "inset-0 -z-10"
              : feature
                ? "bottom-0 right-0 h-[88%] w-[50%] lg:-right-[4%] lg:h-[72%] lg:w-[78%]"
                : wide
                  ? "bottom-0 right-0 h-[88%] w-[48%]"
                  : "-right-[6%] bottom-0 h-[62%] w-[70%]",
            !best && "opacity-0"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {best && <img src={best.src} alt="" loading="lazy" className={cn(
                "h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]",
                cover ? "object-cover" : "object-contain object-bottom blend-white"
              )} />}
          {cover && <div className="absolute inset-0 bg-linear-to-b from-[#21170f]/70 via-[#21170f]/20 to-transparent" />}
        </div>
      ) : (
        createElement(categoryIcon(c.icon ?? c.slug), {
          "aria-hidden": true,
          className: "absolute -bottom-4 -right-4 h-32 w-32 text-border-strong/60",
          strokeWidth: 1,
        })
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className={cn(wide && "max-w-[48%]", feature && "max-w-[50%] lg:max-w-none")}>
          <h3
            className={cn(
              "font-display font-medium leading-[1.05] tracking-[-0.015em]",
              feature ? "text-[32px] sm:text-[44px]" : "text-[22px] sm:text-[26px]",
              cover ? "text-white" : "text-ink"
            )}
          >
            {c.name}
          </h3>
          <p className={cn("mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em]", cover ? "text-white/75" : "text-muted")}>
            {c.productCount ?? 0} devices
          </p>
          {feature && c.description && <p className={cn("mt-4 hidden max-w-[17rem] text-sm leading-relaxed sm:block", cover ? "text-white/80" : "text-muted")}>{c.description}</p>}
        </div>
        <span
          className={cn(
            "h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
            feature || wide ? "flex" : "hidden sm:flex",
            cover ? "bg-white/90 text-ink group-hover:bg-brand group-hover:text-white" : "bg-surface text-ink shadow-sm group-hover:bg-brand group-hover:text-white"
          )}
        >
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
