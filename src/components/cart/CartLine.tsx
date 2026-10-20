"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { MAX_CASH_QTY, useCart, type CartItem } from "@/context/CartContext";
import { formatKES } from "@/lib/format";
import { usePhotoOnWhite } from "@/hooks/usePhotoOnWhite";
import { cn } from "@/lib/cn";

/** One cart row. `editable` adds quantity steppers and a remove button. */
export function CartLine({ item, editable = true }: { item: CartItem; editable?: boolean }) {
  const { setQuantity, remove } = useCart();
  const onWhite = usePhotoOnWhite(item.image);

  return (
    <li className="flex gap-4 py-5">
      <Link href={`/catalogue/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:h-24 sm:w-24">
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className={cn("h-full w-full", onWhite === false ? "object-cover" : "blend-white object-contain p-2")} />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-brand">{item.brand ?? item.category}</p>
            <Link href={`/catalogue/${item.slug}`} className="mt-0.5 line-clamp-2 font-medium text-ink hover:text-brand">
              {item.name}
            </Link>
          </div>
          {editable && (
            <button
              type="button"
              onClick={() => remove(item.key)}
              aria-label={`Remove ${item.name}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger-050 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
          {item.mode === "plan" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-050 px-2.5 py-1 text-xs font-medium text-accent-strong">
              {item.tier === "vip" ? "VIP" : "Retail"} plan · {item.termMonths} months
            </span>
          ) : editable ? (
            <div className="flex items-center rounded-full bg-surface-muted p-0.5">
              <Stepper label="Decrease quantity" disabled={item.quantity <= 1} onClick={() => setQuantity(item.key, item.quantity - 1)}>
                <Minus className="h-3.5 w-3.5" />
              </Stepper>
              <span className="w-8 text-center font-mono text-sm tabular-nums" aria-live="polite">
                {item.quantity}
              </span>
              <Stepper label="Increase quantity" disabled={item.quantity >= MAX_CASH_QTY} onClick={() => setQuantity(item.key, item.quantity + 1)}>
                <Plus className="h-3.5 w-3.5" />
              </Stepper>
            </div>
          ) : (
            <span className="text-xs text-muted">Qty {item.quantity}</span>
          )}

          <div className="text-right">
            {item.mode === "plan" ? (
              <>
                <p className="font-display text-lg font-semibold leading-tight text-ink">{formatKES(item.depositAmount)} deposit</p>
                <p className="text-xs text-muted">
                  then <span className="font-semibold text-accent">{formatKES(item.dailyAmount)}/day</span>
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-lg font-semibold leading-tight text-ink">{formatKES(item.rrp * item.quantity)}</p>
                {item.quantity > 1 && <p className="text-xs text-muted">{formatKES(item.rrp)} each</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function Stepper({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn("flex h-8 w-8 items-center justify-center rounded-full transition-colors", disabled ? "text-muted/40" : "text-ink hover:bg-surface")}
    >
      {children}
    </button>
  );
}
