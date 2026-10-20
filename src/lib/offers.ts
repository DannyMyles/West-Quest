import type { Product } from "@/lib/types";

export interface Offer {
  wasPrice: number;
  saving: number;
  /** Whole-number percentage off the "was" price. */
  percent: number;
  endsAt: string | null;
}

/** The product's live offer, or null. The API already hides expired offers;
 *  this re-checks the end date for pages left open past it. */
export function getOffer(product: Product, now = Date.now()): Offer | null {
  const was = product.wasPrice;
  if (was == null || was <= product.rrp) return null;
  if (product.offerEndsAt && new Date(product.offerEndsAt).getTime() <= now) return null;
  const saving = was - product.rrp;
  return { wasPrice: was, saving, percent: Math.round((saving / was) * 100), endsAt: product.offerEndsAt ?? null };
}
