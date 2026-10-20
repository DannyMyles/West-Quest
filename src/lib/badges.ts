import { CalendarClock, Crown, Flame, Hourglass, PackageX, Sparkles, Tag, Trophy, TriangleAlert, type LucideIcon } from "lucide-react";
import { planForTier, type Product } from "@/lib/types";
import { formatKES } from "@/lib/format";
import { getOffer } from "@/lib/offers";

export type BadgeVariant = "offer" | "new" | "best-seller" | "popular" | "limited" | "sold-out" | "low-stock" | "vip" | "deposit";

export const badgeConfig: Record<BadgeVariant, { label: string; icon: LucideIcon; className: string }> = {
  // Promotional — set by the team in the admin.
  offer: { label: "On offer", icon: Tag, className: "bg-brand text-white" },
  new: { label: "New", icon: Sparkles, className: "bg-accent text-white" },
  "best-seller": { label: "Best seller", icon: Trophy, className: "bg-panel-dark text-glow" },
  popular: { label: "Popular", icon: Flame, className: "bg-[#fbe3d6] text-brand-strong" },
  limited: { label: "Limited", icon: Hourglass, className: "bg-panel-dark text-white" },
  // Derived from live product data.
  "sold-out": { label: "Sold out", icon: PackageX, className: "bg-ink/80 text-white" },
  "low-stock": { label: "Few left", icon: TriangleAlert, className: "bg-warning-050 text-warning" },
  vip: { label: "VIP deposit", icon: Crown, className: "bg-surface/95 text-accent-strong" },
  deposit: { label: "Low deposit", icon: CalendarClock, className: "bg-surface/95 text-accent-strong" },
};

export interface ProductBadgeInfo {
  variant: BadgeVariant;
  /** Overrides the variant's default label (e.g. "Only 2 left"). */
  label?: string;
}

const explicitMap: Record<string, BadgeVariant> = {
  New: "new",
  "Best Seller": "best-seller",
  Popular: "popular",
  Limited: "limited",
};

export function isOutOfStock(product: Product): boolean {
  if (product.stockCount === 0) return true;
  return !product.inStock;
}

/** The badges for a product card, most important first, at most `max`.
 *  The team's own badge (New, Best Seller…) comes first after "Sold out";
 *  the rest are facts read from the product — stock, VIP pricing, and the
 *  deposit needed to take a financed device home. */
export function getProductBadges(product: Product, max = 2): ProductBadgeInfo[] {
  const out: ProductBadgeInfo[] = [];
  const soldOut = isOutOfStock(product);
  if (soldOut) out.push({ variant: "sold-out" });
  const offer = getOffer(product);
  if (offer) out.push({ variant: "offer", label: `Save ${formatKES(offer.saving)}` });
  if (product.badge && explicitMap[product.badge]) out.push({ variant: explicitMap[product.badge] });
  if (!soldOut && typeof product.stockCount === "number" && product.stockCount <= 3) {
    out.push({ variant: "low-stock", label: `Only ${product.stockCount} left` });
  }
  const vip = planForTier(product, "vip");
  const retail = planForTier(product, "retail");
  if (vip) out.push({ variant: "vip", label: `VIP ${vip.depositPercent}% deposit` });
  else if (retail) out.push({ variant: "deposit", label: `${formatKES(retail.depositAmount)} deposit` });
  return out.slice(0, max);
}
