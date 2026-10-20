/** Categories are data-driven (managed in /admin/categories),
 *  so a slug is just a string. */
export type CategorySlug = string;

export interface Category {
  id?: number;
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  /** A key understood by `categoryIcon()` — an icon name ("smartphone") or
   *  the slug itself. Unknown values fall back to a generic package icon. */
  icon: string;
  /** Hidden from the storefront when `false`. Defaults to `true`. */
  active?: boolean;
  /** Ascending sort key for nav / department order. Defaults to `0`. */
  order?: number;
  /** Number of (active) products in the department. */
  productCount?: number;
  /** Photo of one of the department's products, from the server (null when none). */
  image?: string | null;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export type ProductBadge = "New" | "Best Seller" | "Popular" | "Limited";

export type BannerLayout = "photo" | "product";

export interface Banner {
  /** Numeric for saved banners, a string for the built-in fallback slides. */
  id: string | number;
  eyebrow?: string;
  headline: string;
  subcopy?: string;
  image: string;
  /** Built-in slides only: alternative same-origin product photos; the hero
   *  shows the first one shot on white. */
  images?: string[];
  layout?: BannerLayout;
  /** "#rrggbb" — colour of the badge and the primary button. */
  accent?: string;
  badge?: string;
  ctaLabel?: string;
  ctaHref?: string;
  cta2Label?: string;
  cta2Href?: string;
  dealEndsAt?: string | null;
  active?: boolean;
  order?: number;
}

export type PaymentTier = "retail" | "vip";
export type TermMonths = 6 | 9 | 12;

export interface PaymentPlan {
  tier: PaymentTier;
  depositPercent: number;
  depositAmount: number;
  daily6: number;
  daily9: number;
  daily12: number;
}

export interface Product {
  /** Database id (used by the admin API). */
  id?: number;
  sku: string;
  slug: string;
  name: string;
  category: CategorySlug;
  brand?: string | null;
  modelCode?: string | null;
  ram?: string | null;
  storage?: string | null;
  /** Recommended retail (cash) price, KES. */
  rrp: number;
  /** "Was" price: the product is on offer while this is above `rrp`. */
  wasPrice?: number | null;
  /** ISO end of the offer; null/absent means it runs until cleared. */
  offerEndsAt?: string | null;
  description: string;
  specs: ProductSpec[];
  inStock: boolean;
  /** Units on hand. 1–3 surfaces a "Low stock" badge; 0 means out of stock. */
  stockCount?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  badge?: ProductBadge;
  /** Last change (ISO); used for sitemap dates. */
  updatedAt?: string;
  images?: string[];
  featured?: boolean;
  /** Hidden from the storefront when `false`. Defaults to `true`. */
  active?: boolean;
  featureRank?: number | null;
  adminNotes?: string | null;
  /** Retail is always present once financing is set up; VIP is the exception. */
  paymentPlans: PaymentPlan[];
}

export function planForTier(product: Product, tier: PaymentTier): PaymentPlan | undefined {
  return product.paymentPlans.find((p) => p.tier === tier);
}

// --- applications / reviews -------------------------------------------------------
export type ApplicationStatus = "pending" | "contacted" | "approved" | "rejected";

export interface Application {
  id: number;
  /** Customer-facing reference, e.g. "WQ-K7Q2XM" — used by /track. */
  ref: string;
  product: { sku: string; name: string; slug: string };
  tier: PaymentTier;
  termMonths: TermMonths;
  rrp: number;
  depositAmount: number;
  dailyAmount: number;
  customer: {
    name: string;
    phone: string;
    idNumber?: string | null;
    location?: string | null;
  };
  notes?: string | null;
  status: ApplicationStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AdminReview extends Review {
  productId: number;
  productSku: string;
  productName: string;
  productSlug: string;
  approved: boolean;
}
