import { fetchActiveBanners } from "@/lib/api/banners";
import { fetchCategories } from "@/lib/api/categories";
import { getProducts } from "@/services/productService";
import { cheapestDaily } from "@/lib/finance";
import { formatKES } from "@/lib/format";
import { planForTier, type Banner, type Product } from "@/lib/types";

const TAGLINES: Record<string, string> = {
  smartphones: "The phone you want, a little every day.",
  tablets: "Bigger screens, smaller payments.",
  accessories: "Everything your devices are missing.",
  audio: "Sound that goes where you go.",
  gaming: "Play now. Pay as you go.",
  cameras: "Capture every moment.",
  storage: "Room for everything you make.",
  laptops: "Work anywhere. Own it sooner.",
};

function topBrands(items: Product[], n = 3) {
  const counts = new Map<string, number>();
  for (const p of items) if (p.brand) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([b]) => b);
}

function listJoin(words: string[]) {
  return words.length < 2 ? (words[0] ?? "") : `${words.slice(0, -1).join(", ")} & ${words.at(-1)}`;
}

/** One slide per category (max 6), built from the server's category photos
 *  and live product data (cheapest daily rate, leading brands). Shown on the
 *  homepage until the admin saves slides of their own. */
export async function categorySlides(): Promise<Banner[]> {
  const [categories, products] = await Promise.all([fetchCategories(), getProducts().catch(() => [] as Product[])]);
  return categories
    .filter((c) => c.image)
    .slice(0, 6)
    .map((c, i) => {
      const items = products.filter((p) => p.category === c.slug);
      const dailies = items.map((p) => planForTier(p, "retail")).filter((p) => p != null).map(cheapestDaily);
      const fromDaily = dailies.length ? Math.min(...dailies) : null;
      const fromCash = items.length ? Math.min(...items.map((p) => p.rrp)) : null;
      const brands = listJoin(topBrands(items));
      const count = c.productCount ?? items.length;
      const images = [...items]
        .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
        .map((p) => p.images?.[0])
        .filter((src): src is string => Boolean(src));
      return {
        id: `category-${c.slug}`,
        eyebrow: c.name,
        headline: TAGLINES[c.slug] ?? `${c.name}, within reach.`,
        subcopy: brands
          ? `${count} to choose from — ${brands} and more${fromDaily ? ", on a small deposit and daily payments." : "."}`
          : c.description || undefined,
        image: images[0] ?? c.image!,
        images,
        layout: "product" as const,
        badge: fromDaily ? `From ${formatKES(fromDaily)}/day` : fromCash ? formatKES(fromCash) : `${count} devices`,
        ctaLabel: `Shop ${c.shortName.toLowerCase()}`,
        ctaHref: `/catalogue?category=${c.slug}`,
        cta2Label: "How it works",
        cta2Href: "/faqs",
        active: true,
        order: i,
      };
    });
}

/**
 * Slides for the homepage carousel. Admin-managed banners win. If none exist
 * yet, one slide per category is shown, so the hero is never empty.
 */
export async function getBanners(): Promise<Banner[]> {
  try {
    const remote = await fetchActiveBanners();
    if (remote.length > 0) return remote;
  } catch {
    /* fall through to category slides */
  }
  try {
    return await categorySlides();
  } catch {
    return [];
  }
}
