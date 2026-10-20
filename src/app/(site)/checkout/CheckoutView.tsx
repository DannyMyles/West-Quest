"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAccount } from "@/context/AccountContext";
import { AuthPanel } from "@/components/account/AuthPanel";
import { CartLine } from "@/components/cart/CartLine";
import { CartSummary } from "@/components/cart/CartSummary";
import { checkout, type Order } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import { whatsappLink } from "@/lib/contact";
import { formatKES } from "@/lib/format";
import type { Application } from "@/lib/types";
import { cn } from "@/lib/cn";

type Placed = { applications: Application[]; order: Order | null };

export function CheckoutView() {
  const { items, ready, clear, toCheckout } = useCart();
  const { customer, loading, logout } = useAccount();
  const [location, setLocation] = useState<string | null>(null);
  const [idNumber, setIdNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Placed | null>(null);

  const hasPlans = items.some((i) => i.mode === "plan");
  // Prefill from the account until the customer types their own.
  const locationValue = location ?? customer?.location ?? "";

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (locationValue.trim().length < 2) {
      setError("Tell us where you are so we can arrange collection or delivery.");
      return;
    }
    setBusy(true);
    try {
      const result = await checkout({ items: toCheckout(), location: locationValue.trim(), idNumber: idNumber.trim() || null, notes: notes.trim() || null });
      setPlaced(result);
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (placed) return <Confirmation placed={placed} />;

  if (ready && items.length === 0) {
    return (
      <div className="section py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-brand">
          <ShoppingBag className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-display text-3xl text-ink">Nothing to check out yet</h1>
        <Link href="/catalogue" className="btn-primary mt-6 h-11">
          Browse devices <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="section py-10 sm:py-14">
      <h1 className="font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[40px]">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="space-y-6">
          <Step n={1} title="Your account" done={Boolean(customer)}>
            {loading ? (
              <div className="h-24 animate-shimmer rounded-2xl" />
            ) : customer ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-ink">
                  Signed in as <span className="font-semibold">{customer.name}</span> · <span className="font-mono">{customer.phone}</span>
                </p>
                <button type="button" onClick={() => logout()} className="text-sm font-semibold text-ink/60 underline underline-offset-2 hover:text-brand">
                  Not you?
                </button>
              </div>
            ) : (
              <div className="max-w-md">
                <p className="mb-4 text-sm text-muted">Sign in or create an account so you can follow your order and applications afterwards.</p>
                <AuthPanel initialMode="register" />
              </div>
            )}
          </Step>

          <form id="checkout-form" onSubmit={placeOrder} className={cn(!customer && "pointer-events-none opacity-50")}>
            <Step n={2} title="Collection details" done={false}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-ink">Where are you?</span>
                  <input
                    className="field"
                    value={locationValue}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Westlands, Nairobi"
                    autoComplete="address-level2"
                    disabled={!customer}
                    required
                  />
                  <span className="mt-1 block text-xs text-muted">So we can arrange collection or delivery.</span>
                </label>
                {hasPlans && (
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink">
                      National ID number <span className="font-normal text-muted">(optional)</span>
                    </span>
                    <input className="field" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} inputMode="numeric" disabled={!customer} />
                    <span className="mt-1 block text-xs text-muted">Speeds up plan approval.</span>
                  </label>
                )}
                <label className={cn("block", !hasPlans && "sm:col-span-2")}>
                  <span className="mb-1.5 block text-sm font-medium text-ink">
                    Notes <span className="font-normal text-muted">(optional)</span>
                  </span>
                  <input className="field" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Colour, best time to call…" disabled={!customer} />
                </label>
              </div>
            </Step>
          </form>
        </div>

        <aside className="rounded-3xl bg-surface p-6 shadow-md lg:sticky lg:top-32">
          <h2 className="font-display text-xl font-medium text-ink">Your order</h2>
          <ul className="divide-y divide-dashed divide-border-strong">
            {items.map((item) => (
              <CartLine key={item.key} item={item} editable={false} />
            ))}
          </ul>
          <div className="mt-2 border-t border-border pt-4">
            <CartSummary />
          </div>
          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-danger-050 px-3 py-2.5 text-sm text-danger">
              {error}
            </p>
          )}
          <button type="submit" form="checkout-form" disabled={!customer || busy || !ready} className="btn-primary mt-5 h-12 w-full">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {customer ? "Place order" : "Sign in to place your order"}
          </button>
          <Link href="/cart" className="mt-3 block text-center text-sm font-semibold text-ink/70 hover:text-brand">
            Edit cart
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Step({ n, title, done, children }: { n: number; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-surface p-6 shadow-md sm:p-7">
      <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-medium text-ink">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm", done ? "bg-accent text-white" : "bg-surface-muted text-ink")}>
          {done ? <CheckCircle2 className="h-4 w-4" /> : n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Confirmation({ placed }: { placed: Placed }) {
  const refs = [...placed.applications.map((a) => a.ref), ...(placed.order ? [placed.order.ref] : [])];
  return (
    <div className="section max-w-3xl py-12 sm:py-16">
      <div className="rounded-3xl bg-surface p-6 text-center shadow-md sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-050 text-accent">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-medium text-ink sm:text-4xl">Thank you — we&apos;ve got it.</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Our team will contact you on WhatsApp shortly to confirm the details. You can follow everything from your account.
        </p>

        <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
          {placed.applications.map((a) => (
            <li key={a.ref} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-muted px-4 py-3">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">{a.product.name}</span>
                <span className="text-xs text-muted">
                  Plan · {a.termMonths} months · {formatKES(a.dailyAmount)}/day
                </span>
              </span>
              <span className="tag-corner-sm shrink-0 bg-surface px-3 py-1 font-mono text-sm font-semibold text-ink">{a.ref}</span>
            </li>
          ))}
          {placed.order && (
            <li className="flex items-center justify-between gap-3 rounded-2xl bg-surface-muted px-4 py-3">
              <span>
                <span className="block text-sm font-medium text-ink">
                  Cash order · {placed.order.items.reduce((n, i) => n + i.quantity, 0)} item(s)
                </span>
                <span className="text-xs text-muted">{formatKES(placed.order.total)}</span>
              </span>
              <span className="tag-corner-sm shrink-0 bg-surface px-3 py-1 font-mono text-sm font-semibold text-ink">{placed.order.ref}</span>
            </li>
          )}
        </ul>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/account" className="btn-primary h-12 px-6">
            View my orders
          </Link>
          <a
            href={whatsappLink(`Hi West Quest, I've just placed an order: ${refs.join(", ")}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp h-12 px-6"
          >
            Continue on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
