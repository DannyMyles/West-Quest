"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Page numbers to show: first, last, current ±1, with "…" gaps. */
function pageList(page: number, count: number): (number | "gap")[] {
  const keep = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count));
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

/** "Showing 26–50 of 225" plus Previous / numbered pages / Next. Renders
 *  nothing when everything fits on one page. */
export function Pagination({
  page,
  pageSize,
  total,
  onPage,
  label = "items",
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  label?: string;
}) {
  const count = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const btn = "flex h-9 min-w-9 items-center justify-center rounded-[8px] border px-2.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav aria-label="Pagination" className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">
        Showing <span className="font-medium text-ink">{from}–{to}</span> of <span className="font-medium text-ink">{total}</span> {label}
      </p>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page" className={cn(btn, "border-border bg-white text-ink hover:border-border-strong")}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageList(page, count).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-sm text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(btn, p === page ? "border-brand bg-brand text-white" : "border-border bg-white text-ink hover:border-border-strong")}
            >
              {p}
            </button>
          )
        )}
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= count} aria-label="Next page" className={cn(btn, "border-border bg-white text-ink hover:border-border-strong")}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
