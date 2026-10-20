"use client";

import { use, useEffect, useState } from "react";
import { MessageCircle, Copy } from "lucide-react";
import { adminGetOrder, adminUpdateOrder, type Order, type OrderStatus } from "@/lib/api/account";
import { errorMessage } from "@/lib/api/client";
import { useToast } from "@/context/ToastContext";
import { formatKES } from "@/lib/format";
import { PageHeader } from "@/components/admin/PageHeader";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ORDER_STATUSES, orderStatusStyles, whatsappForOrder } from "../orderStatus";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { push } = useToast();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const n = Number(id);
    if (!Number.isInteger(n) || n < 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrder(null);
      return;
    }
    adminGetOrder(n)
      .then((o) => {
        setOrder(o);
        setNotes(o.adminNotes ?? "");
      })
      .catch(() => setOrder(null));
  }, [id]);

  async function updateStatus(status: OrderStatus) {
    if (!order) return;
    try {
      setOrder(await adminUpdateOrder(order.id, { status }));
      push({ type: "success", message: "Status updated" });
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't update status") });
    }
  }

  async function saveNotes() {
    if (!order) return;
    setSaving(true);
    try {
      setOrder(await adminUpdateOrder(order.id, { adminNotes: notes.trim() || null }));
      push({ type: "success", message: "Notes saved" });
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't save notes") });
    } finally {
      setSaving(false);
    }
  }

  if (order === undefined) return <p className="text-sm text-muted">Loading…</p>;
  if (order === null) return <p className="text-sm text-muted">Order not found.</p>;

  const o = order;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`Order ${o.ref}`}
        description={`${o.items.reduce((n, i) => n + i.quantity, 0)} item(s) · ${formatKES(o.total)}`}
        back={{ href: "/admin/orders", label: "Cash orders" }}
        actions={
          <button onClick={() => navigator.clipboard?.writeText(o.ref)} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand/40">
            <Copy className="h-3.5 w-3.5" /> Copy ref
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <section className="rounded-[12px] border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Items</h2>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 text-right font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Unit</th>
                  <th className="pb-2 text-right font-medium">Line</th>
                </tr>
              </thead>
              <tbody>
                {o.items.map((i) => (
                  <tr key={i.sku} className="border-t border-border">
                    <td className="py-2">
                      <span className="font-medium text-ink">{i.name}</span>
                      <span className="block font-mono text-xs text-muted">{i.sku}</span>
                    </td>
                    <td className="py-2 text-right">{i.quantity}</td>
                    <td className="py-2 text-right">{formatKES(i.unitPrice)}</td>
                    <td className="py-2 text-right font-medium">{formatKES(i.unitPrice * i.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={3} className="pt-2 text-right font-semibold">
                    Total
                  </td>
                  <td className="pt-2 text-right font-semibold">{formatKES(o.total)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="rounded-[12px] border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Customer</h2>
            <dl className="mt-3 grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Name</dt>
                <dd className="font-medium text-ink">{o.customer.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Phone</dt>
                <dd className="font-medium text-ink">{o.customer.phone}</dd>
              </div>
              {o.customer.location && (
                <div>
                  <dt className="text-xs text-muted">Location</dt>
                  <dd className="font-medium text-ink">{o.customer.location}</dd>
                </div>
              )}
            </dl>
            {o.notes && (
              <p className="mt-3 rounded-lg bg-surface-muted/60 p-3 text-sm text-ink/80">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Customer note</span>
                <br />
                {o.notes}
              </p>
            )}
            <button
              type="button"
              onClick={() => window.open(whatsappForOrder(o), "_blank", "noopener,noreferrer")}
              className="mt-4 flex w-fit items-center gap-1.5 rounded-full bg-whatsapp px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
            >
              <MessageCircle className="h-4 w-4" /> Message on WhatsApp
            </button>
          </section>

          <section className="rounded-[12px] border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Internal notes</h2>
            <p className="mb-2 mt-1 text-xs text-muted">Never shown to the customer.</p>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="admin-input" placeholder="Payment received, delivery arranged…" />
            <AnimatedButton type="button" variant="secondary" isLoading={saving} onClick={saveNotes} className="mt-3">
              Save notes
            </AnimatedButton>
          </section>
        </div>

        <aside className="flex flex-col gap-3">
          <section className="rounded-[12px] border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Status</h2>
            <select value={o.status} onChange={(e) => updateStatus(e.target.value as OrderStatus)} className={`mt-3 w-full rounded-full border-0 px-3 py-2 text-sm font-medium capitalize ${orderStatusStyles[o.status]}`}>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="mt-3 text-xs text-muted">Placed {new Date(o.createdAt).toLocaleString("en-KE")}</p>
            <p className="text-xs text-muted">Updated {new Date(o.updatedAt).toLocaleString("en-KE")}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
