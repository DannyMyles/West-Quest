import { api } from "./client";
import type { Banner, BannerLayout } from "@/lib/types";

interface RawBanner {
  id: number;
  eyebrow: string | null;
  headline: string;
  subcopy: string | null;
  image: string;
  layout: BannerLayout;
  accent: string | null;
  badge: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  cta2Label: string | null;
  cta2Href: string | null;
  dealEndsAt: string | null;
  active: boolean;
  order: number;
}

const toBanner = (r: RawBanner): Banner => ({
  id: r.id,
  eyebrow: r.eyebrow ?? undefined,
  headline: r.headline,
  subcopy: r.subcopy ?? undefined,
  image: r.image,
  layout: r.layout,
  accent: r.accent ?? undefined,
  badge: r.badge ?? undefined,
  ctaLabel: r.ctaLabel ?? undefined,
  ctaHref: r.ctaHref ?? undefined,
  cta2Label: r.cta2Label ?? undefined,
  cta2Href: r.cta2Href ?? undefined,
  dealEndsAt: r.dealEndsAt,
  active: r.active,
  order: r.order,
});

export const fetchActiveBanners = () => api<{ items: RawBanner[] }>("/banners").then((r) => r.items.map(toBanner));
export const adminBanners = () => api<{ items: RawBanner[] }>("/admin/banners").then((r) => r.items.map(toBanner));

export interface BannerInput {
  eyebrow?: string | null;
  headline: string;
  subcopy?: string | null;
  image: string;
  layout?: BannerLayout;
  accent?: string | null;
  badge?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  cta2Label?: string | null;
  cta2Href?: string | null;
  dealEndsAt?: string | null;
  active?: boolean;
}

export const adminCreateBanner = (input: BannerInput) =>
  api<RawBanner>("/admin/banners", { method: "POST", json: input }).then(toBanner);

export const adminUpdateBanner = (id: number, patch: Partial<BannerInput>) =>
  api<RawBanner>(`/admin/banners/${id}`, { method: "PATCH", json: patch }).then(toBanner);

export const adminDeleteBanner = (id: number) => api<void>(`/admin/banners/${id}`, { method: "DELETE" });

/** `ids` = every banner id, in the new display order. */
export const adminReorderBanners = (ids: number[]) =>
  api<{ items: RawBanner[] }>("/admin/banners/order", { method: "PUT", json: { ids } }).then((r) => r.items.map(toBanner));

/** Uploads a picture to the server and returns the URL to store in a banner's `image`. */
export function adminUploadBannerImage(file: File) {
  const form = new FormData();
  form.append("image", file, file.name);
  return api<{ url: string }>("/admin/banners/image", { method: "POST", form }).then((r) => r.url);
}
