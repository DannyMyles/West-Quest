"use client";

import { Clock, Tag } from "lucide-react";
import { useCountdownTo } from "@/hooks/useCountdown";
import { getOffer } from "@/lib/offers";
import { formatKES } from "@/lib/format";
import type { Product } from "@/lib/types";

/** Cash price line on the product page. On offer it shows the saving, the
 *  struck-through "was" price and, if the offer has an end date, a countdown. */
export function OfferPrice({ product }: { product: Product }) {
  const offer = getOffer(product);
  const countdown = useCountdownTo(offer?.endsAt);

  if (!offer) {
    return (
      <p className="mt-3 text-sm text-muted">
        RRP <span className="font-semibold text-ink">{formatKES(product.rrp)}</span> if paying cash
      </p>
    );
  }

  const hours = Number(countdown.hours);
  const days = Number.isFinite(hours) ? Math.floor(hours / 24) : 0;
  const clock = Number.isFinite(hours)
    ? `${days ? `${days}d ` : ""}${String(hours % 24).padStart(2, "0")}:${countdown.minutes}:${countdown.seconds}`
    : "--:--:--";

  return (
    <div className="mt-4 rounded-2xl bg-brand-050 p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="badge bg-brand text-white shadow-none">
          <Tag aria-hidden className="h-3 w-3" strokeWidth={2.2} /> {offer.percent}% off
        </span>
        <p className="text-sm text-ink">
          Cash price <span className="font-display text-xl font-semibold text-brand">{formatKES(product.rrp)}</span>{" "}
          <s className="text-muted">{formatKES(offer.wasPrice)}</s>
        </p>
      </div>
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="font-semibold text-brand-strong">You save {formatKES(offer.saving)}</span>
        {offer.endsAt && !countdown.done && (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-ink/70">
            <Clock aria-hidden className="h-3.5 w-3.5" /> Offer ends in {clock}
          </span>
        )}
      </p>
    </div>
  );
}
