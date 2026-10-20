"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { fetchApprovedReviews } from "@/lib/api/reviews";
import type { Review } from "@/lib/types";
import { Rating } from "@/components/ui/Rating";
import { Skeleton } from "@/components/ui/Skeleton";
import { ReviewForm } from "./ReviewForm";

export function ProductReviews({
  sku,
  productName,
  fallbackRating,
  fallbackCount,
}: {
  sku: string;
  productName: string;
  fallbackRating?: number | null;
  fallbackCount?: number | null;
}) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchApprovedReviews(sku)
      .then((r) => active && setReviews(r))
      .catch(() => active && setReviews([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [sku]);

  const list = reviews ?? [];
  const average = list.length > 0 ? list.reduce((s, r) => s + r.rating, 0) / list.length : (fallbackRating ?? null);
  const count = list.length > 0 ? list.length : (fallbackCount ?? 0);

  return (
    <section id="reviews" className="mt-16 scroll-mt-24">
      <h2 className="text-xl font-bold tracking-tight text-ink">Ratings &amp; Reviews</h2>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : list.length === 0 ? (
          <div className="tag-corner flex flex-col items-center gap-2 border border-dashed border-border bg-surface px-6 py-12 text-center">
            <MessageSquare className="h-8 w-8 text-muted" />
            <p className="text-sm font-medium text-ink">{average != null ? "No written reviews yet" : "No reviews yet"}</p>
            <p className="max-w-xs text-sm text-muted">
              {average != null
                ? "This device is rated by customers but has no written reviews so far."
                : "Be the first to review this device — message us on WhatsApp after your application is approved."}
            </p>
            {average != null && <Rating value={average} count={count} showNumber className="mt-1" />}
          </div>
        ) : (
          <>
            <div className="rounded-2xl flex items-center gap-3 bg-surface shadow-md p-4">
              <span className="text-3xl font-bold text-ink">{average?.toFixed(1)}</span>
              <div>
                <Rating value={average ?? 0} size="md" />
                <p className="mt-0.5 text-xs text-muted">
                  {count} {count === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-4">
              {list.map((r) => (
                <li key={r.id} className="rounded-2xl bg-surface shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">{r.customerName}</span>
                    <Rating value={r.rating} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{r.comment}</p>
                </li>
              ))}
            </ul>
          </>
        )}

        {!loading && <ReviewForm sku={sku} productName={productName} />}
      </div>
    </section>
  );
}
