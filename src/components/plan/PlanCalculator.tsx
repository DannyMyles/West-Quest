"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, MessageCircle, ShoppingBag } from "lucide-react";
import { TERM_OPTIONS, dailyForTerm, estimateTotalCost } from "@/lib/finance";
import { formatKES } from "@/lib/format";
import { planForTier, type PaymentTier, type Product, type TermMonths } from "@/lib/types";
import { whatsappLink } from "@/lib/contact";
import { useCart, type AddResult } from "@/context/CartContext";
import { isOutOfStock } from "@/lib/badges";
import { cn } from "@/lib/cn";
import { getOffer } from "@/lib/offers";

/** The functional heart of the storefront: pick a tier and term, see the
 *  deposit + daily payment, then add the plan (or a cash purchase) to the cart. */
export function PlanCalculator({ product }: { product: Product }) {
  const retail = planForTier(product, "retail");
  const vip = planForTier(product, "vip");
  const [tier, setTier] = useState<PaymentTier>("retail");
  const [term, setTerm] = useState<TermMonths>(6);
  const [added, setAdded] = useState<{ result: AddResult; mode: "plan" | "cash" } | null>(null);
  const { addPlan, addCash } = useCart();
  const soldOut = isOutOfStock(product);

  const plan = tier === "vip" ? vip : retail;
  const offer = getOffer(product);

  const addCashItem = () => setAdded({ result: addCash(product), mode: "cash" });

  if (!plan) {
    // No financing plan: a straightforward cash-sale item (e.g. an accessory).
    return (
      <div className="relative rounded-2xl bg-surface p-5 shadow-md sm:p-6">
        <span className="ledger-tick absolute right-4 top-4 text-accent" aria-hidden />
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Price</p>
        <p className="flex items-baseline gap-2">
          <span className={cn("font-display text-4xl font-semibold", offer ? "text-brand" : "text-ink")}>{formatKES(product.rrp)}</span>
          {offer && <s className="text-base text-muted">{formatKES(offer.wasPrice)}</s>}
        </p>
        <p className="mt-1 text-sm text-muted">Paid in full — we confirm availability and delivery over WhatsApp.</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button type="button" disabled={soldOut} onClick={addCashItem} className="btn-primary h-12 flex-1">
            <ShoppingBag className="h-4 w-4" /> {soldOut ? "Out of stock" : "Add to cart"}
          </button>
          <a
            href={whatsappLink(`Hi West Quest, I'd like to ask about the ${product.name} (${formatKES(product.rrp)}).`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary h-12 flex-1"
          >
            <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
          </a>
        </div>
        {added && <AddedNote added={added} />}
      </div>
    );
  }

  const daily = dailyForTerm(plan, term);
  const total = estimateTotalCost(plan, term);
  const waMessage = `Hi West Quest, I'm interested in the ${product.name} on the ${tier.toUpperCase()} plan — ${term} months, KSh ${plan.depositAmount.toLocaleString()} deposit, KSh ${daily.toLocaleString()}/day.`;

  return (
    <div className="relative rounded-2xl bg-surface p-5 shadow-md sm:p-6">
      <span className="ledger-tick absolute right-4 top-4 text-accent" aria-hidden />

      {vip && (
        <div className="mb-5 flex rounded-full bg-surface-muted p-1">
          {(["retail", "vip"] as PaymentTier[]).map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={cn("flex-1 rounded-full py-2 text-sm font-semibold transition-colors", tier === t ? "bg-brand text-white shadow-sm" : "text-ink/70 hover:text-ink")}
            >
              {t === "retail" ? "Retail" : "VIP"}
            </button>
          ))}
        </div>
      )}
      {tier === "vip" && (
        <p className="mb-4 rounded-lg bg-accent-050 px-3 py-2 text-xs text-accent-strong">
          Lower deposit for qualifying customers — we&apos;ll confirm if you qualify after checkout.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Deposit today</p>
          <p className="font-display text-2xl font-semibold text-ink sm:text-3xl">{formatKES(plan.depositAmount)}</p>
          <p className="text-xs text-muted">{plan.depositPercent}% of RRP</p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Then daily</p>
          <p className="font-display text-2xl font-semibold text-accent sm:text-3xl">{formatKES(daily)}</p>
          <p className="text-xs text-muted">for {term} months</p>
        </div>
      </div>

      <div className="mt-5 flex rounded-full bg-surface-muted p-1">
        {TERM_OPTIONS.map((t) => (
          <button
            key={t}
            onClick={() => setTerm(t)}
            className={cn("flex-1 rounded-full py-2 text-sm font-semibold transition-colors", term === t ? "bg-ink text-white shadow-sm" : "text-ink/70 hover:text-ink")}
          >
            {t} months
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted">
        Estimated total over {term} months: <span className="font-semibold text-ink">{formatKES(total)}</span> (deposit + daily rate ×
        days — an estimate, not a contractual figure).
      </p>

      <button
        type="button"
        disabled={soldOut}
        onClick={() => setAdded({ result: addPlan(product, tier, term), mode: "plan" })}
        className="btn-primary mt-5 h-12 w-full"
      >
        <ShoppingBag className="h-4 w-4" /> {soldOut ? "Out of stock" : `Add ${term}-month plan to cart`}
      </button>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" disabled={soldOut} onClick={addCashItem} className="btn-secondary h-11 px-3">
          Buy outright · {formatKES(product.rrp)}
        </button>
        <a href={whatsappLink(waMessage)} target="_blank" rel="noopener noreferrer" className="btn-secondary h-11 px-3">
          <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
        </a>
      </div>

      {added && <AddedNote added={added} />}
    </div>
  );
}

function AddedNote({ added }: { added: { result: AddResult; mode: "plan" | "cash" } }) {
  const text =
    added.result === "exists"
      ? "This plan is already in your cart."
      : added.result === "increased"
        ? "Added another one to your cart."
        : added.mode === "plan"
          ? "Plan added to your cart."
          : "Added to your cart.";
  return (
    <div role="status" className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-accent-050 px-4 py-3 text-sm">
      <span className="flex items-center gap-2 font-medium text-accent-strong">
        <Check className="h-4 w-4" /> {text}
      </span>
      <span className="flex items-center gap-4 font-semibold">
        <Link href="/cart" className="text-ink underline decoration-brand/40 underline-offset-4 hover:text-brand">
          View cart
        </Link>
        <Link href="/checkout" className="flex items-center gap-1 text-brand hover:text-brand-strong">
          Checkout <ArrowRight className="h-4 w-4" />
        </Link>
      </span>
    </div>
  );
}
