import { cheapestDaily } from "@/lib/finance";
import { formatKES } from "@/lib/format";
import { planForTier, type Product } from "@/lib/types";
import { cn } from "@/lib/cn";
import { getOffer } from "@/lib/offers";

/** Compact "From KSh X/day" teaser for product cards, using the cheapest
 *  retail entry point (12-month daily rate) so cards stay scannable without
 *  the full plan calculator. */
export function PlanBadge({ product, className }: { product: Product; className?: string }) {
  const plan = planForTier(product, "retail");
  if (!plan) {
    const offer = getOffer(product);
    return (
      <p className={cn("flex items-baseline gap-1.5", className)}>
        <span className={cn("font-display text-xl font-semibold", offer ? "text-brand" : "text-ink")}>{formatKES(product.rrp)}</span>
        {offer ? <s className="text-xs text-muted">{formatKES(offer.wasPrice)}</s> : <span className="text-xs text-muted">cash</span>}
      </p>
    );
  }

  return (
    <p className={cn("flex items-baseline gap-1", className)}>
      <span className="text-xs text-muted">From</span>
      <span className="font-display text-xl font-semibold text-accent">
        {formatKES(cheapestDaily(plan))}
      </span>
      <span className="text-xs text-muted">/day</span>
    </p>
  );
}
