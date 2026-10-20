"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dailyForTerm } from "@/lib/finance";
import { planForTier, type PaymentTier, type Product, type TermMonths } from "@/lib/types";
import type { CheckoutItem } from "@/lib/api/account";

const STORAGE_KEY = "wq-cart-v1";
export const MAX_CASH_QTY = 20;

interface CartBase {
  key: string;
  slug: string;
  sku: string;
  name: string;
  brand: string | null;
  image?: string;
  category: string;
  rrp: number;
}
export type CartItem =
  | (CartBase & { mode: "plan"; tier: PaymentTier; termMonths: TermMonths; depositAmount: number; dailyAmount: number; quantity: 1 })
  | (CartBase & { mode: "cash"; quantity: number });

export type AddResult = "added" | "increased" | "exists";

interface CartState {
  items: CartItem[];
  /** False until the saved cart has been read from this browser. */
  ready: boolean;
  count: number;
  addPlan: (product: Product, tier: PaymentTier, termMonths: TermMonths) => AddResult;
  addCash: (product: Product, quantity?: number) => AddResult;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  totals: { cash: number; deposits: number; daily: number };
  toCheckout: () => CheckoutItem[];
}

const CartContext = createContext<CartState | null>(null);

function base(product: Product): Omit<CartBase, "key"> {
  return {
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    brand: product.brand ?? null,
    image: product.images?.[0],
    category: product.category,
    rrp: product.rrp,
  };
}

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Read the saved cart after mount so server and first client render match.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable: the cart lasts for this visit only */
    }
  }, [items, ready]);

  const addPlan = useCallback(
    (product: Product, tier: PaymentTier, termMonths: TermMonths): AddResult => {
      const plan = planForTier(product, tier);
      const key = `${product.slug}:plan:${tier}:${termMonths}`;
      if (!plan || items.some((i) => i.key === key)) return "exists";
      setItems([
        ...items,
        { key, ...base(product), mode: "plan", tier, termMonths, depositAmount: plan.depositAmount, dailyAmount: dailyForTerm(plan, termMonths), quantity: 1 },
      ]);
      return "added";
    },
    [items]
  );

  const addCash = useCallback(
    (product: Product, quantity = 1): AddResult => {
      const key = `${product.slug}:cash`;
      if (items.some((i) => i.key === key)) {
        setItems(items.map((i) => (i.key === key ? { ...i, quantity: Math.min(MAX_CASH_QTY, i.quantity + quantity) } : i)) as CartItem[]);
        return "increased";
      }
      setItems([...items, { key, ...base(product), mode: "cash", quantity: Math.min(MAX_CASH_QTY, quantity) }]);
      return "added";
    },
    [items]
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key && i.mode === "cash" ? { ...i, quantity: Math.max(1, Math.min(MAX_CASH_QTY, quantity)) } : i))
    );
  }, []);

  const remove = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartState>(() => {
    const totals = { cash: 0, deposits: 0, daily: 0 };
    for (const i of items) {
      if (i.mode === "cash") totals.cash += i.rrp * i.quantity;
      else {
        totals.deposits += i.depositAmount;
        totals.daily += i.dailyAmount;
      }
    }
    return {
      items,
      ready,
      count: items.reduce((n, i) => n + i.quantity, 0),
      addPlan,
      addCash,
      setQuantity,
      remove,
      clear,
      totals,
      toCheckout: () =>
        items.map((i) =>
          i.mode === "plan"
            ? { mode: "plan" as const, productSlug: i.slug, tier: i.tier, termMonths: i.termMonths }
            : { mode: "cash" as const, productSlug: i.slug, quantity: i.quantity }
        ),
    };
  }, [items, ready, addPlan, addCash, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
