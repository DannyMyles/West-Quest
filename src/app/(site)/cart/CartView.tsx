"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CartLine } from "@/components/cart/CartLine";
import { CartSummary } from "@/components/cart/CartSummary";

export function CartView() {
  const { items, ready, count } = useCart();

  return (
    <div className="section py-10 sm:py-14">
      <h1 className="font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[40px]">Your cart</h1>
      {ready && count > 0 && (
        <p className="mt-1.5 text-sm text-muted">
          {count} {count === 1 ? "item" : "items"}
        </p>
      )}

      {!ready ? (
        <div className="mt-8 h-48 animate-shimmer rounded-2xl" />
      ) : items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-3xl bg-surface-muted px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-brand shadow-sm">
            <ShoppingBag className="h-6 w-6" />
          </span>
          <p className="mt-4 font-display text-2xl text-ink">Your cart is empty</p>
          <p className="mt-1 max-w-sm text-sm text-muted">Pick a device and a plan — or pay in full — and it&apos;ll wait here for you.</p>
          <Link href="/catalogue" className="btn-primary mt-6 h-11">
            Browse devices <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <ul className="divide-y divide-dashed divide-border-strong rounded-3xl bg-surface px-5 shadow-md sm:px-6">
            {items.map((item) => (
              <CartLine key={item.key} item={item} />
            ))}
          </ul>

          <aside className="rounded-3xl bg-surface p-6 shadow-md lg:sticky lg:top-32">
            <h2 className="font-display text-xl font-medium text-ink">Summary</h2>
            <div className="mt-4">
              <CartSummary />
            </div>
            <Link href="/checkout" className="btn-primary mt-6 h-12 w-full">
              Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/catalogue" className="mt-3 block text-center text-sm font-semibold text-ink/70 hover:text-brand">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
