import Link from "next/link";
import { ArrowRight, MapPin, Phone, Clock } from "lucide-react";
import { getCategories } from "@/services/categoryService";
import { getProducts } from "@/services/productService";
import { WhatsAppIcon } from "./WhatsAppButton";
import Image from "next/image";
import {
  WHATSAPP_NUMBER,
  SUPPORT_PHONE_DISPLAY,
  STORE_ADDRESS,
  STORE_MAPS_URL,
  STORE_HOURS,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  TIKTOK_URL,
} from "@/lib/contact";

const TOP_BRANDS = 12;

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.28C16.3 4.19 15.32 4.1 14.2 4.1c-2.34 0-3.95 1.43-3.95 4.04V10.5H7.75v3h2.5V21h3.25Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.9v2.6c-1.3.1-2.5-.3-3.6-1v5.9c0 3.5-2.4 6.1-5.8 6.1C7 22.5 4.7 20 4.9 16.6c.2-2.9 2.4-5.2 5.6-5.2.3 0 .6 0 .9.1v2.9c-.3-.1-.6-.2-1-.2-1.5 0-2.7 1.3-2.5 2.9.1 1.4 1.3 2.5 2.7 2.5 1.6 0 2.7-1.2 2.7-2.9V3h3.2Z" />
    </svg>
  );
}

const socials = [
  { href: FACEBOOK_URL, label: "Facebook", Icon: FacebookIcon },
  { href: INSTAGRAM_URL, label: "Instagram", Icon: InstagramIcon },
  { href: TIKTOK_URL, label: "TikTok", Icon: TikTokIcon },
];

const help = [
  { href: "/about", label: "About us" },
  { href: "/faqs", label: "How it works & FAQs" },
  { href: "/account", label: "My orders" },
  { href: "/contact", label: "Contact us" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
];

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">{children}</h4>;
}

export async function Footer() {
  const year = new Date().getFullYear();
  const [categories, products] = await Promise.all([getCategories(), getProducts().catch(() => [])]);

  const brandCounts = new Map<string, number>();
  for (const p of products) if (p.brand) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  const brands = [...brandCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_BRANDS).map(([b]) => b);

  return (
    <footer className="mt-10 bg-panel-dark text-white">
      <div className="section">
        <div className="flex flex-col gap-6 border-b border-dashed border-white/15 py-12 sm:py-16 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-xl font-display text-4xl font-medium leading-[1.05] tracking-[-0.015em] sm:text-5xl">
            Your next device, <em className="text-glow">within reach.</em>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/catalogue" className="btn-primary h-11 px-6">
              Browse devices <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp h-11 px-6">
              <WhatsAppIcon className="h-4 w-4" /> Chat with us
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-4 lg:grid-cols-[1.3fr_1fr_1.4fr_1fr_1.2fr] lg:gap-10">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Image src="/brand/west-quest-logo-on-dark.svg" alt="West Quest Limited" width={890} height={680} unoptimized className="h-28 w-auto" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              Phones, tablets and more on a deposit, with small daily payments over 6, 9 or 12 months.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/75 transition-colors hover:bg-glow hover:text-glow-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <ColumnTitle>Shop</ColumnTitle>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/catalogue?category=${c.slug}`} className="transition-colors hover:text-glow">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {brands.length > 0 && (
            <div className="col-span-2 md:col-span-1">
              <ColumnTitle>Top brands</ColumnTitle>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {brands.map((b) => (
                  <li key={b}>
                    <Link
                      href={`/catalogue?q=${encodeURIComponent(b)}`}
                      className="inline-block rounded-full bg-white/6 px-3 py-1.5 text-xs font-medium text-white/75 transition-colors hover:bg-glow hover:text-glow-foreground"
                    >
                      {b}
                    </Link>
                  </li>
                ))}
              </ul>
              {brandCounts.size > brands.length && (
                <Link href="/catalogue" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-glow hover:text-white">
                  All {brandCounts.size} brands <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )}

          <div>
            <ColumnTitle>Help</ColumnTitle>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              {help.map((h) => (
                <li key={h.href}>
                  <Link href={h.href} className="transition-colors hover:text-glow">
                    {h.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <ColumnTitle>Visit</ColumnTitle>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-glow/70" />
                <a href={STORE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-glow">
                  {STORE_ADDRESS}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-glow/70" />
                <a href={`tel:${SUPPORT_PHONE_DISPLAY.replace(/\s/g, "")}`} className="transition-colors hover:text-glow">
                  {SUPPORT_PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-glow/70" />
                {STORE_HOURS}
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-white/10 py-6 text-xs text-white/45 sm:flex-row">
          <span>&copy; {year} West Quest Limited. All rights reserved.</span>
          <span className="font-mono">Deposit · Daily · Done</span>
        </div>
      </div>
    </footer>
  );
}
