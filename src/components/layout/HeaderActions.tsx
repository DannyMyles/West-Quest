"use client";

import Link from "next/link";
import { ShoppingBag, UserRound } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAccount } from "@/context/AccountContext";
import { cn } from "@/lib/cn";

/** Cart button with a live item count. `compact` is the mobile icon-only form. */
export function CartButton({ compact = false }: { compact?: boolean }) {
  const { count, ready } = useCart();
  const label = `Cart${ready && count ? `, ${count} ${count === 1 ? "item" : "items"}` : ""}`;

  if (compact) {
    return (
      <Link href="/cart" aria-label={label} className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink/70 hover:bg-surface-muted">
        <ShoppingBag className="h-5 w-5" />
        {ready && count > 0 && <Count n={count} />}
      </Link>
    );
  }
  return (
    <Link href="/cart" aria-label={label} className="btn-primary relative h-11 pl-4 pr-5">
      <ShoppingBag className="h-[18px] w-[18px]" />
      Cart
      {ready && count > 0 && (
        <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 font-mono text-[11px] font-semibold text-brand">
          {count}
        </span>
      )}
    </Link>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 font-mono text-[10px] font-semibold text-white ring-2 ring-background">
      {n > 99 ? "99+" : n}
    </span>
  );
}

/** Account link: the customer's first name once signed in, else "Sign in". */
export function AccountButton({ compact = false }: { compact?: boolean }) {
  const { customer, loading } = useAccount();
  const first = customer?.name.split(/\s+/)[0];

  if (compact) {
    return (
      <Link
        href={customer ? "/account" : "/login"}
        aria-label={customer ? "My account" : "Sign in"}
        className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 hover:bg-surface-muted"
      >
        <UserRound className="h-5 w-5" />
      </Link>
    );
  }
  return (
    <Link
      href={customer ? "/account" : "/login"}
      className={cn("flex items-center gap-2 text-sm font-semibold text-ink/75 transition-colors hover:text-ink", loading && "opacity-0")}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-ink">
        {first ? <span className="font-display text-[15px]">{first[0].toUpperCase()}</span> : <UserRound className="h-4 w-4" />}
      </span>
      {first ?? "Sign in"}
    </Link>
  );
}
