import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Wallet, Headset, Star } from "lucide-react";
import { getProducts, getProductBySlug, getRelatedProducts } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Rating } from "@/components/ui/Rating";
import { PlanCalculator } from "@/components/plan/PlanCalculator";
import { OfferPrice } from "@/components/product/OfferPrice";
import { formatKES } from "@/lib/format";

// Regenerate periodically so products added/edited via the admin dashboard
// show up without a full rebuild; new slugs still render on-demand.
export const revalidate = 60;

export async function generateStaticParams() {
  // If the backend is down at build time, render every page on demand instead.
  try {
    const products = await getProducts();
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const image = product.images?.[0];
  return {
    title: product.name,
    description: `${product.description} RRP ${formatKES(product.rrp)}. Buy on deposit with daily payments — apply in minutes.`,
    alternates: { canonical: `/catalogue/${product.slug}` },
    openGraph: {
      title: `${product.name} · West Quest Limited`,
      description: product.description,
      url: `/catalogue/${product.slug}`,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await getProducts().catch(() => [product]);
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === product.category);
  const related = getRelatedProducts(all, product);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const productImages = product.images ?? [];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: productImages,
    category: category?.name,
    ...(product.rating != null
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: Math.max(1, product.reviewCount ?? 1) } }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Catalogue", item: `${siteUrl}/catalogue` },
      ...(category ? [{ "@type": "ListItem", position: 3, name: category.name, item: `${siteUrl}/catalogue?category=${category.slug}` }] : []),
      { "@type": "ListItem", position: category ? 4 : 3, name: product.name, item: `${siteUrl}/catalogue/${product.slug}` },
    ],
  };

  return (
    <div className="section py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbJsonLd]) }} />
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/catalogue" className="hover:text-ink">
          Catalogue
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/catalogue?category=${product.category}`} className="hover:text-ink">
          {category?.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
        <ScrollReveal y={16}>
          <ProductGallery product={product} />
        </ScrollReveal>

        <ScrollReveal y={16} delay={0.1}>
          <p className="font-mono text-xs uppercase tracking-wide text-muted">{product.brand ? `${product.brand} · ${category?.name ?? ""}` : category?.name}</p>
          <h1 className="mt-1.5 font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[40px]">{product.name}</h1>

          {product.rating != null && (
            <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
              <Rating value={product.rating} showNumber />
              <span className="underline-offset-2 hover:underline">{product.reviewCount ?? 0} reviews</span>
            </a>
          )}

          <OfferPrice product={product} />

          <p className="mt-4 line-clamp-3 max-w-lg text-sm leading-relaxed text-muted">{product.description}</p>

          {product.specs.length > 0 && (
            <div className="rounded-xl mt-6 grid grid-cols-1 gap-2 bg-surface-muted/50 p-4 sm:grid-cols-2">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex justify-between gap-2 text-sm">
                  <span className="text-muted">{spec.label}</span>
                  <span className="font-medium text-ink">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-7">
            <PlanCalculator product={product} />
          </div>

          <p className="mt-4 text-xs text-muted">SKU: {product.sku}</p>
        </ScrollReveal>
      </div>

      {/* Reassurance cards */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoCard icon={ShieldCheck} title="Genuine devices" body="Every device is genuine stock with its standard manufacturer warranty." />
        <InfoCard icon={Wallet} title="Transparent terms" body="Deposit and daily rate are fixed up front — no hidden fees along the way." />
        <InfoCard icon={Headset} title="WhatsApp support" body="A real person confirms your application and answers questions, every step." />
      </div>

      <div className="rounded-2xl mt-10 bg-surface shadow-md p-6">
        <h2 className="text-base font-semibold text-ink">Description</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{product.description}</p>
      </div>

      <ProductReviews sku={product.sku} productName={product.name} fallbackRating={product.rating} fallbackCount={product.reviewCount} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold tracking-tight text-ink">
            <Star className="h-5 w-5 text-brand" /> You may also like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, title, body }: { icon: typeof ShieldCheck; title: string; body: string }) {
  return (
    <div className="rounded-xl relative bg-surface shadow-md p-4">
      <span className="ledger-tick right-2 top-2 text-accent/40" />
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-050 text-brand">
        <Icon className="h-4.5 w-4.5" strokeWidth={1.7} />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{body}</p>
    </div>
  );
}
