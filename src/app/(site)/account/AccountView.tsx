"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LogOut, PackageOpen } from "lucide-react";
import { useAccount } from "@/context/AccountContext";
import { AuthPanel } from "@/components/account/AuthPanel";
import { STATIC_DEMO } from "@/lib/api/client";
import { PreviewNotice } from "@/components/account/PreviewNotice";
import { fetchActivity, type Order } from "@/lib/api/account";
import { formatKES } from "@/lib/format";
import { whatsappLink } from "@/lib/contact";
import type { Application } from "@/lib/types";
import { cn } from "@/lib/cn";

const APP_STEPS = ["pending", "contacted", "approved"] as const;
const APP_LABEL: Record<Application["status"], string> = {
  pending: "Received",
  contacted: "In review",
  approved: "Approved",
  rejected: "Not approved",
};
const ORDER_STEPS = ["pending", "confirmed", "completed"] as const;
const ORDER_LABEL: Record<Order["status"], string> = {
  pending: "Received",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const dateFmt = new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", year: "numeric" });

export function AccountView() {
  const { customer, loading, logout } = useAccount();
  const [data, setData] = useState<{ applications: Application[]; orders: Order[] } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!customer) return;
    let active = true;
    fetchActivity()
      .then((d) => active && setData(d))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [customer]);

  if (loading) return <div className="section py-14"><div className="h-64 animate-shimmer rounded-3xl" /></div>;

  if (!customer) {
    return (
      <div className="section grid gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="max-w-md">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand">My orders</p>
          <h1 className="mt-2 font-display text-4xl font-medium leading-tight tracking-[-0.015em] text-ink sm:text-5xl">Sign in to track your orders.</h1>
          <p className="mt-4 text-muted">See every plan application and cash order you&apos;ve placed, and where each one is.</p>
        </div>
        {STATIC_DEMO ? (
          <PreviewNotice />
        ) : (
          <div className="mx-auto w-full max-w-md rounded-3xl bg-surface p-6 shadow-md sm:p-8">
            <AuthPanel />
          </div>
        )}
      </div>
    );
  }

  const empty = data && data.applications.length === 0 && data.orders.length === 0;

  return (
    <div className="section py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand">My orders</p>
          <h1 className="mt-1 font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[40px]">Hi, {customer.name.split(/\s+/)[0]}.</h1>
          <p className="mt-1 font-mono text-sm text-muted">{customer.phone}</p>
        </div>
        <button type="button" onClick={() => logout()} className="btn-secondary h-10">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      {error && <p className="mt-8 rounded-2xl bg-danger-050 p-4 text-sm text-danger">We couldn&apos;t load your orders. Please refresh the page.</p>}
      {!data && !error && <div className="mt-8 h-48 animate-shimmer rounded-3xl" />}

      {empty && (
        <div className="mt-8 flex flex-col items-center rounded-3xl bg-surface-muted px-6 py-16 text-center">
          <PackageOpen className="h-10 w-10 text-brand" strokeWidth={1.5} />
          <p className="mt-4 font-display text-2xl text-ink">No orders yet</p>
          <p className="mt-1 text-sm text-muted">When you check out, your plans and orders will show up here.</p>
          <Link href="/catalogue" className="btn-primary mt-6 h-11">
            Browse devices <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {data && data.applications.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-medium text-ink">Plan applications</h2>
          <ul className="mt-4 grid gap-4 lg:grid-cols-2">
            {data.applications.map((a) => (
              <li key={a.ref} className="rounded-3xl bg-surface p-5 shadow-md sm:p-6">
                <Header refCode={a.ref} date={a.createdAt} />
                <Link href={`/catalogue/${a.product.slug}`} className="mt-3 block font-medium text-ink hover:text-brand">
                  {a.product.name}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  {a.tier === "vip" ? "VIP" : "Retail"} · {a.termMonths} months · {formatKES(a.depositAmount)} deposit ·{" "}
                  <span className="font-semibold text-accent">{formatKES(a.dailyAmount)}/day</span>
                </p>
                <Progress steps={APP_STEPS} labels={APP_LABEL} status={a.status} failed={a.status === "rejected"} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {data && data.orders.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-medium text-ink">Cash orders</h2>
          <ul className="mt-4 grid gap-4 lg:grid-cols-2">
            {data.orders.map((o) => (
              <li key={o.ref} className="rounded-3xl bg-surface p-5 shadow-md sm:p-6">
                <Header refCode={o.ref} date={o.createdAt} />
                <ul className="mt-3 space-y-1 text-sm">
                  {o.items.map((i) => (
                    <li key={i.sku} className="flex justify-between gap-3">
                      <Link href={`/catalogue/${i.slug}`} className="truncate text-ink hover:text-brand">
                        {i.quantity} × {i.name}
                      </Link>
                      <span className="shrink-0 text-muted">{formatKES(i.unitPrice * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 flex justify-between border-t border-dashed border-border-strong pt-2 text-sm font-semibold text-ink">
                  <span>Total</span>
                  <span>{formatKES(o.total)}</span>
                </p>
                <Progress steps={ORDER_STEPS} labels={ORDER_LABEL} status={o.status} failed={o.status === "cancelled"} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {data && !empty && (
        <p className="mt-10 text-sm text-muted">
          Questions about an order?{" "}
          <a href={whatsappLink("Hi West Quest, I have a question about my order.")} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline underline-offset-2 hover:text-brand">
            Message us on WhatsApp
          </a>
          .
        </p>
      )}
    </div>
  );
}

function Header({ refCode, date }: { refCode: string; date: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="tag-corner-sm bg-surface-muted px-3 py-1 font-mono text-sm font-semibold text-ink">{refCode}</span>
      <span className="text-xs text-muted">{dateFmt.format(new Date(date))}</span>
    </div>
  );
}

function Progress<S extends string>({
  steps,
  labels,
  status,
  failed,
}: {
  steps: readonly S[];
  labels: Record<string, string>;
  status: string;
  failed: boolean;
}) {
  const reached = failed ? 0 : Math.max(0, steps.indexOf(status as S));
  return (
    <div className="mt-5">
      <div className="flex gap-1.5" aria-hidden>
        {steps.map((s, i) => (
          <span key={s} className={cn("h-1.5 flex-1 rounded-full", failed ? (i === 0 ? "bg-danger/60" : "bg-ink/10") : i <= reached ? "bg-accent" : "bg-ink/10")} />
        ))}
      </div>
      <p className={cn("mt-2 text-sm font-semibold", failed ? "text-danger" : "text-accent-strong")}>
        <span className="sr-only">Status: </span>
        {labels[status]}
      </p>
    </div>
  );
}
