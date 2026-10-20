"use client";

import { useCart } from "@/context/CartContext";
import { formatKES } from "@/lib/format";

/** "What you pay" breakdown: deposits + cash due now, plus the daily total. */
export function CartSummary() {
  const { totals, items } = useCart();
  const plans = items.filter((i) => i.mode === "plan").length;
  const dueNow = totals.deposits + totals.cash;

  return (
    <dl className="space-y-2.5 text-sm">
      {plans > 0 && (
        <div className="flex justify-between gap-4">
          <dt className="text-muted">
            Deposits ({plans} {plans === 1 ? "plan" : "plans"})
          </dt>
          <dd className="font-medium text-ink">{formatKES(totals.deposits)}</dd>
        </div>
      )}
      {totals.cash > 0 && (
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Paid in full</dt>
          <dd className="font-medium text-ink">{formatKES(totals.cash)}</dd>
        </div>
      )}
      <div className="flex items-baseline justify-between gap-4 border-t border-dashed border-border-strong pt-3">
        <dt className="font-semibold text-ink">Due on collection</dt>
        <dd className="font-display text-2xl font-semibold text-ink">{formatKES(dueNow)}</dd>
      </div>
      {totals.daily > 0 && (
        <div className="flex justify-between gap-4 rounded-xl bg-accent-050 px-3 py-2.5">
          <dt className="text-accent-strong">Then daily, from approval</dt>
          <dd className="font-semibold text-accent-strong">{formatKES(totals.daily)}/day</dd>
        </div>
      )}
      <p className="pt-1 text-xs leading-relaxed text-muted">
        Nothing is charged online. Our team confirms each plan and order with you on WhatsApp before you pay.
      </p>
    </dl>
  );
}
