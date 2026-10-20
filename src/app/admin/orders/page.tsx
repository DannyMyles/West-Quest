"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Copy, ChevronRight } from "lucide-react";
import { adminListOrders, adminUpdateOrder, type Order, type OrderStatus } from "@/lib/api/account";
import { ORDER_STATUSES, orderStatusStyles, whatsappForOrder } from "./orderStatus";
import { errorMessage } from "@/lib/api/client";
import { useToast } from "@/context/ToastContext";
import { formatKES } from "@/lib/format";
import { Pagination } from "@/components/admin/Pagination";

const PAGE = 15;

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AdminOrdersPage() {
  const { push } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(
    async (signal?: { cancelled: boolean }) => {
      setLoading(true);
      setError(false);
      try {
        const res = await adminListOrders({ status: filter === "all" ? undefined : filter, q: debouncedQ || undefined, page, limit: PAGE });
        if (signal?.cancelled) return;
        setOrders(res.items);
        setTotal(res.total);
      } catch {
        if (!signal?.cancelled) setError(true);
      } finally {
        if (!signal?.cancelled) setLoading(false);
      }
    },
    [filter, debouncedQ, page]
  );

  useEffect(() => {
    const signal = { cancelled: false };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [load]);

  async function handleStatusChange(id: number, status: OrderStatus) {
    try {
      const updated = await adminUpdateOrder(id, { status });
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't update status") });
      void load();
    }
  }

  function copyRef(ref: string) {
    navigator.clipboard?.writeText(ref);
    push({ type: "success", message: `Copied ${ref}` });
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-ink">Cash orders</h1>
      <p className="mb-4 text-sm text-muted">Items customers chose to pay for in full. Plans on deposit are under Applications.</p>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ref, name or phone" className="input h-9 w-56 py-1.5" />
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...ORDER_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter === s ? "bg-brand text-white" : "bg-surface-muted text-ink/70 hover:text-ink"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : error ? (
        <div className="rounded-xl border border-danger/30 bg-danger-050 p-4 text-sm text-danger">
          Couldn&apos;t load orders — is the backend running?{" "}
          <button onClick={() => load()} className="font-semibold underline">
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted">{filter === "all" && !debouncedQ ? "No cash orders yet." : "No orders match that filter."}</p>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => copyRef(o.ref)} className="flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 font-mono text-xs font-semibold text-ink hover:bg-brand-050 hover:text-brand" title="Copy reference">
                        {o.ref} <Copy className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-semibold text-ink">{o.customer.name}</span>
                      <span className="text-xs text-muted">{fmtDate(o.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {o.customer.phone}
                      {o.customer.location ? ` · ${o.customer.location}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)} className={`rounded-full border-0 px-3 py-1 text-xs font-medium capitalize ${orderStatusStyles[o.status]}`}>
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand/40">
                      Details <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => window.open(whatsappForOrder(o), "_blank", "noopener,noreferrer")}
                      title="Opens WhatsApp with a status update — review and send"
                      className="flex items-center gap-1.5 rounded-full bg-whatsapp px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Notify customer
                    </button>
                  </div>
                </div>
                <ul className="mt-3 space-y-0.5 border-t border-border pt-3 text-sm">
                  {o.items.map((i) => (
                    <li key={i.sku} className="flex justify-between gap-3">
                      <span className="truncate text-ink">
                        {i.quantity} × {i.name}
                      </span>
                      <span className="shrink-0 text-muted">{formatKES(i.unitPrice * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-muted">
                  Total <b className="text-ink">{formatKES(o.total)}</b>
                </p>
                {o.notes && <p className="mt-2 text-xs text-muted">Note: {o.notes}</p>}
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={PAGE}
            total={total}
            label="orders"
            onPage={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </div>
  );
}
