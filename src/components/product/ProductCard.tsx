import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CardPhoto } from "./CardPhoto";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { PlanBadge } from "@/components/plan/PlanBadge";
import { Product, planForTier } from "@/lib/types";
import { formatKES } from "@/lib/format";
import { getProductBadges, isOutOfStock } from "@/lib/badges";
import { cn } from "@/lib/cn";
import { getOffer } from "@/lib/offers";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const badges = getProductBadges(product);
  const soldOut = isOutOfStock(product);
  const financed = Boolean(planForTier(product, "retail"));
  const offer = getOffer(product);
  const cta = soldOut ? "Notify me" : financed ? "View plans" : "Buy now";

  return (
    <Link
      href={`/catalogue/${product.slug}`}
      className="tag-hole card-hover group relative flex h-full flex-col overflow-hidden rounded-2xl bg-surface shadow-md"
    >
      <div className="relative m-2 mb-0 overflow-hidden rounded-xl bg-surface-muted">
        <div className="absolute right-2.5 top-2.5 z-10 flex flex-col items-end gap-1.5">
          {badges.map((b) => (
            <Badge key={b.variant} variant={b.variant} label={b.label} />
          ))}
        </div>

        <div className="aspect-square">
          <CardPhoto src={product.images?.[0]} category={product.category} alt={product.name} priority={priority} dimmed={soldOut} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-3.5">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-brand">
          {product.brand || product.category.replace(/-/g, " ")}
        </p>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-medium leading-snug text-ink">{product.name}</h3>
        {product.rating != null && <Rating value={product.rating} count={product.reviewCount} className="mt-1" />}

        <div className="mt-auto pt-3">
          <div className="border-t border-dashed border-border-strong pt-3">
            <PlanBadge product={product} />
            {financed && (
              <p className="text-xs text-muted">
                {offer ? "Cash" : "RRP"} {formatKES(product.rrp)}
                {offer && <s className="ml-1.5 text-muted/80">{formatKES(offer.wasPrice)}</s>}
              </p>
            )}
            <StockLine product={product} soldOut={soldOut} />
          </div>

          <span className="mt-3 flex items-center justify-between text-sm font-semibold">
            <span className={soldOut ? "text-muted" : "text-ink transition-colors group-hover:text-brand"}>{cta}</span>
            <span
              aria-hidden
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                soldOut ? "bg-surface-muted text-muted" : "bg-brand-050 text-brand group-hover:bg-brand group-hover:text-white"
              )}
            >
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/** One quiet line under the price: in stock / only N left / out of stock. */
function StockLine({ product, soldOut }: { product: Product; soldOut: boolean }) {
  const few = !soldOut && product.stockCount != null && product.stockCount > 0 && product.stockCount <= 3;
  return (
    <p className={cn("mt-1 flex items-center gap-1.5 text-xs", soldOut || !few ? "text-muted" : "text-warning")}>
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", soldOut ? "bg-muted" : few ? "bg-warning" : "bg-accent")} />
      {soldOut ? "Out of stock" : few ? `Only ${product.stockCount} left` : "In stock"}
    </p>
  );
}
