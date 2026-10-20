import type { MetadataRoute } from "next";
import { fetchAllProducts } from "@/lib/api/products";
import { fetchCategories } from "@/lib/api/categories";

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Rebuilt at most once a minute. If the backend can't be reached, the request
// throws instead of publishing a sitemap with missing products: Next keeps
// serving the last good copy until the backend is back.
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/catalogue`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/faqs`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Only live data: hidden categories and products are excluded by the API itself.
  const [categories, products] = await Promise.all([fetchCategories(), fetchAllProducts()]);

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/catalogue?category=${encodeURIComponent(c.slug)}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/catalogue/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
