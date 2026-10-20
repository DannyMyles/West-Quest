"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Crown, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { WhatsAppIcon } from "./WhatsAppButton";
import { cheapestDaily } from "@/lib/finance";
import { formatKES } from "@/lib/format";
import { whatsappLink } from "@/lib/contact";
import { planForTier, type Product } from "@/lib/types";
import { getOffer, type Offer } from "@/lib/offers";

const DELAY_MS = 20_000;
const SCROLL_TRIGGER = 0.6;
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;
const DISMISSED_KEY = "wq-promo-dismissed-at";
const SEEN_KEY = "wq-promo-seen";
/** Pages where the visitor is mid-task — never interrupt there. */
const QUIET_PATHS = ["/cart", "/checkout", "/login", "/account", "/contact", "/catalogue/", "/admin"];

type Promo =
  | { kind: "offer"; product: Product; offer: Offer }
  | { kind: "deal"; product: Product; daily: number }
  | { kind: "vip" }
  | { kind: "whatsapp" };

function read(store: () => Storage, key: string) {
  try {
    return store().getItem(key);
  } catch {
    return null;
  }
}
function write(store: () => Storage, key: string, value: string) {
  try {
    store().setItem(key, value);
  } catch {
    /* storage unavailable — the popup just may show again */
  }
}

function eligible() {
  if (read(() => sessionStorage, SEEN_KEY)) return false;
  const dismissed = Number(read(() => localStorage, DISMISSED_KEY) ?? 0);
  return !dismissed || Date.now() - dismissed > SNOOZE_MS;
}

function pickPromo(products: Product[]): Promo {
  // Live offers come first most of the time.
  const offers = products
    .filter((p) => p.images?.length && p.inStock !== false)
    .map((p) => ({ product: p, offer: getOffer(p) }))
    .filter((o): o is { product: Product; offer: Offer } => o.offer !== null);
  if (offers.length && Math.random() < 0.7) {
    return { kind: "offer", ...offers[Math.floor(Math.random() * offers.length)] };
  }
  const deals = products
    .filter((p) => p.images?.length && p.inStock !== false)
    .map((p) => ({ product: p, plan: planForTier(p, "retail") }))
    .filter((d) => d.plan)
    .map((d) => ({ product: d.product, daily: cheapestDaily(d.plan!) }));
  const roll = Math.random();
  if (deals.length && roll < 0.6) {
    const pool = deals.filter((d) => d.product.featured).length ? deals.filter((d) => d.product.featured) : deals;
    return { kind: "deal", ...pool[Math.floor(Math.random() * pool.length)] };
  }
  return roll < 0.8 ? { kind: "vip" } : { kind: "whatsapp" };
}

/** An occasional, dismissible promo card: shown at most once per session,
 *  after the visitor has spent a while on the page or scrolled most of it,
 *  and not again for a few days after they close it. Non-modal — it never
 *  blocks the page or steals focus. */
export function PromoPopup() {
  const pathname = usePathname();
  const { products } = useProducts();
  const reduced = useReducedMotion();
  const [promo, setPromo] = useState<Promo | null>(null);
  const productsRef = useRef(products);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const quiet = QUIET_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (quiet || promo || !eligible()) return;
    let fired = false;
    const fire = () => {
      if (fired || !eligible()) return;
      fired = true;
      write(() => sessionStorage, SEEN_KEY, "1");
      setPromo(pickPromo(productsRef.current));
    };
    const timer = window.setTimeout(fire, DELAY_MS);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > SCROLL_TRIGGER) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [quiet, promo]);

  // Navigating into a quiet page hides an open card.
  const visible = promo && !quiet;

  const close = useCallback(() => {
    write(() => localStorage, DISMISSED_KEY, String(Date.now()));
    setPromo(null);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, close]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="dialog"
          aria-modal="false"
          aria-labelledby="promo-title"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="fixed inset-x-3 bottom-3 z-[65] overflow-hidden rounded-3xl bg-surface shadow-[0_28px_70px_-18px_rgba(20,12,6,0.55)] ring-1 ring-black/10 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[400px]"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close promotion"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-ink/60 shadow-sm transition-colors hover:bg-ink hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <PromoBody promo={promo} onAction={close} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-brand">{children}</p>;
}

function PromoBody({ promo, onAction }: { promo: Promo; onAction: () => void }) {
  if (promo.kind === "offer") {
    const { product, offer } = promo;
    return (
      <div className="flex gap-4 p-4 pr-12 sm:p-5 sm:pr-12">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-surface-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.images![0]} alt="" className="blend-white h-full w-full object-contain p-2" />
          <span className="absolute left-1.5 top-1.5 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">-{offer.percent}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <Eyebrow>Special offer · save {formatKES(offer.saving)}</Eyebrow>
          <h2 id="promo-title" className="mt-1 line-clamp-2 font-display text-lg font-medium leading-snug text-ink">
            {product.name}
          </h2>
          <p className="mt-1 flex items-baseline gap-2 text-sm">
            <span className="font-display text-lg font-semibold text-brand">{formatKES(product.rrp)}</span>
            <s className="text-muted">{formatKES(offer.wasPrice)}</s>
          </p>
          <Link
            href={`/catalogue/${product.slug}`}
            onClick={onAction}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline decoration-brand/40 decoration-2 underline-offset-4 hover:text-brand"
          >
            See the offer <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (promo.kind === "deal") {
    const { product, daily } = promo;
    return (
      <div className="flex gap-4 p-4 pr-12 sm:p-5 sm:pr-12">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-surface-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.images![0]} alt="" className="h-full w-full object-contain p-2 blend-white" />
        </div>
        <div className="min-w-0 flex-1">
          <Eyebrow>Deal of the day</Eyebrow>
          <h2 id="promo-title" className="mt-1 line-clamp-2 font-display text-lg font-medium leading-snug text-ink">
            {product.name}
          </h2>
          <p className="mt-1 text-sm text-muted">
            From <span className="font-display text-lg font-semibold text-accent">{formatKES(daily)}</span>/day
          </p>
          <Link
            href={`/catalogue/${product.slug}`}
            onClick={onAction}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline decoration-brand/40 decoration-2 underline-offset-4 hover:text-brand"
          >
            See the plan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (promo.kind === "vip") {
    return (
      <div className="relative bg-panel-dark p-6 pr-12 text-white">
        <span className="ledger-tick bottom-5 right-5 text-glow/70" aria-hidden />
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-glow/15 text-glow">
          <Crown className="h-5 w-5" strokeWidth={1.7} />
        </span>
        <p className="mt-4 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-glow">VIP pricing</p>
        <h2 id="promo-title" className="mt-1 font-display text-2xl font-medium leading-tight">
          Lower deposits for <em className="text-glow">returning</em> customers.
        </h2>
        <p className="mt-2 text-sm text-white/65">Selected devices start from a 10% deposit. Apply and we&apos;ll tell you if you qualify.</p>
        <Link href="/catalogue" onClick={onAction} className="btn-glow mt-5 h-10">
          Browse devices <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 pr-12">
      <Eyebrow>Need a hand?</Eyebrow>
      <h2 id="promo-title" className="mt-1 font-display text-2xl font-medium leading-tight text-ink">
        Talk to a real person on WhatsApp.
      </h2>
      <p className="mt-2 text-sm text-muted">Ask about a device, a plan or your application — we usually reply within minutes.</p>
      <a
        href={whatsappLink("Hi West Quest, I'd like some help choosing a device.")}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onAction}
        className="btn-whatsapp mt-5 h-10"
      >
        <WhatsAppIcon className="h-4 w-4" /> Chat with us
      </a>
    </div>
  );
}
