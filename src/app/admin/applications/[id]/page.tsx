"use client";

import { use, useEffect, useState } from "react";
import { MessageCircle, Copy } from "lucide-react";
import { adminGetApplication, adminUpdateApplication } from "@/lib/api/applications";
import { errorMessage } from "@/lib/api/client";
import { useToast } from "@/context/ToastContext";
import { formatKES, toMsisdn } from "@/lib/format";
import { PageHeader } from "@/components/admin/PageHeader";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import type { Application, ApplicationStatus } from "@/lib/types";

const statuses: ApplicationStatus[] = ["pending", "contacted", "approved", "rejected"];

const statusStyles: Record<ApplicationStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  contacted: "bg-sky-100 text-sky-700",
  approved: "bg-success/10 text-success",
  rejected: "bg-red-100 text-red-600",
};

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { push } = useToast();
  const [application, setApplication] = useState<Application | null | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const n = Number(id);
    if (!Number.isInteger(n) || n < 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setApplication(null);
      return;
    }
    adminGetApplication(n)
      .then((a) => {
        setApplication(a);
        setNotes(a.adminNotes ?? "");
      })
      .catch(() => setApplication(null));
  }, [id]);

  async function updateStatus(status: ApplicationStatus) {
    if (!application) return;
    try {
      const updated = await adminUpdateApplication(application.id, { status });
      setApplication(updated);
      push({ type: "success", message: "Status updated" });
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't update status") });
    }
  }

  async function saveNotes() {
    if (!application) return;
    setSaving(true);
    try {
      const updated = await adminUpdateApplication(application.id, { adminNotes: notes.trim() || null });
      setApplication(updated);
      push({ type: "success", message: "Notes saved" });
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't save notes") });
    } finally {
      setSaving(false);
    }
  }

  if (application === undefined) return <p className="text-sm text-muted">Loading…</p>;
  if (application === null) return <p className="text-sm text-muted">Application not found.</p>;

  const a = application;
  const waMessage = `Hi ${a.customer.name.split(" ")[0] || "there"}, an update on your West Quest application ${a.ref}.`;
  const waHref = `https://wa.me/${toMsisdn(a.customer.phone)}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`Application ${a.ref}`}
        description={a.product.name}
        back={{ href: "/admin/applications", label: "Applications" }}
        actions={
          <button onClick={() => navigator.clipboard?.writeText(a.ref)} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand/40">
            <Copy className="h-3.5 w-3.5" /> Copy ref
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <section className="rounded-[12px] border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Plan</h2>
            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted">Device</dt>
                <dd className="font-medium text-ink">{a.product.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Tier</dt>
                <dd className="font-medium capitalize text-ink">{a.tier}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Term</dt>
                <dd className="font-medium text-ink">{a.termMonths} months</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">RRP</dt>
                <dd className="font-medium text-ink">{formatKES(a.rrp)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Deposit</dt>
                <dd className="font-medium text-ink">{formatKES(a.depositAmount)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Daily payment</dt>
                <dd className="font-medium text-ink">{formatKES(a.dailyAmount)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[12px] border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Customer</h2>
            <dl className="mt-3 grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Name</dt>
                <dd className="font-medium text-ink">{a.customer.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Phone</dt>
                <dd className="font-medium text-ink">{a.customer.phone}</dd>
              </div>
              {a.customer.location && (
                <div>
                  <dt className="text-xs text-muted">Location</dt>
                  <dd className="font-medium text-ink">{a.customer.location}</dd>
                </div>
              )}
              {a.customer.idNumber && (
                <div>
                  <dt className="text-xs text-muted">ID number</dt>
                  <dd className="font-medium text-ink">{a.customer.idNumber}</dd>
                </div>
              )}
            </dl>
            {a.notes && (
              <p className="mt-3 rounded-lg bg-surface-muted/60 p-3 text-sm text-ink/80">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Customer note</span>
                <br />
                {a.notes}
              </p>
            )}
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="mt-4 flex w-fit items-center gap-1.5 rounded-full bg-whatsapp px-4 py-2 text-sm font-semibold text-white hover:brightness-95">
              <MessageCircle className="h-4 w-4" /> Message on WhatsApp
            </a>
          </section>

          <section className="rounded-[12px] border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Internal notes</h2>
            <p className="mb-2 mt-1 text-xs text-muted">Never shown to the customer.</p>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="admin-input" placeholder="Verification status, call notes, anything the team should know…" />
            <AnimatedButton type="button" variant="secondary" isLoading={saving} onClick={saveNotes} className="mt-3">
              Save notes
            </AnimatedButton>
          </section>
        </div>

        <aside className="flex flex-col gap-3">
          <section className="rounded-[12px] border border-border bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">Status</h2>
            <select value={a.status} onChange={(e) => updateStatus(e.target.value as ApplicationStatus)} className={`mt-3 w-full rounded-full border-0 px-3 py-2 text-sm font-medium capitalize ${statusStyles[a.status]}`}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="mt-3 text-xs text-muted">Submitted {new Date(a.createdAt).toLocaleString("en-KE")}</p>
            <p className="text-xs text-muted">Updated {new Date(a.updatedAt).toLocaleString("en-KE")}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
