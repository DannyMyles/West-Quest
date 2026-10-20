"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Copy, ChevronRight } from "lucide-react";
import { adminListApplications, adminUpdateApplication } from "@/lib/api/applications";
import { errorMessage } from "@/lib/api/client";
import { useToast } from "@/context/ToastContext";
import { formatKES, toMsisdn } from "@/lib/format";
import { BRAND_NAME } from "@/lib/contact";
import type { Application, ApplicationStatus } from "@/lib/types";
import { Pagination } from "@/components/admin/Pagination";

const statuses: ApplicationStatus[] = ["pending", "contacted", "approved", "rejected"];

const statusStyles: Record<ApplicationStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  contacted: "bg-sky-100 text-sky-700",
  approved: "bg-success/10 text-success",
  rejected: "bg-red-100 text-red-600",
};

const PAGE = 15;

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function whatsappForApplication(a: Application): string {
  const first = a.customer.name.split(" ")[0] || "there";
  const trackUrl = `${window.location.origin}/account`;
  const update: Record<ApplicationStatus, string> = {
    pending: "we've received your application and will review it shortly.",
    contacted: "we're verifying your details — we'll be in touch shortly.",
    approved: `your application is approved! Bring your deposit of ${formatKES(a.depositAmount)} to collect your ${a.product.name}.`,
    rejected: "unfortunately we couldn't approve your application this time.",
  };
  const lines = [
    `Hi ${first} 👋`,
    "",
    `Update on your ${BRAND_NAME} application ${a.ref}: ${update[a.status]}`,
    "",
    `${a.product.name} — ${a.tier.toUpperCase()} plan, ${a.termMonths} months`,
    `Deposit: ${formatKES(a.depositAmount)} · Daily: ${formatKES(a.dailyAmount)}`,
    "",
    a.status === "rejected" ? "" : `Track it any time: ${trackUrl}`,
  ].filter((l, i, all) => l !== "" || (all[i - 1] ?? "") !== "");
  return `https://wa.me/${toMsisdn(a.customer.phone)}?text=${encodeURIComponent(lines.join("\n").trim())}`;
}

export default function AdminApplicationsPage() {
  const { push } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
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
        const res = await adminListApplications({ status: filter === "all" ? undefined : filter, q: debouncedQ || undefined, page, limit: PAGE });
        if (signal?.cancelled) return;
        setApplications(res.items);
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

  async function handleStatusChange(id: number, status: ApplicationStatus) {
    try {
      const updated = await adminUpdateApplication(id, { status });
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
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
      <h1 className="mb-4 text-xl font-semibold text-ink">Applications</h1>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ref, name or phone" className="input h-9 w-56 py-1.5" />
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...statuses] as const).map((s) => (
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

      {loading && applications.length === 0 ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : error ? (
        <div className="rounded-xl border border-danger/30 bg-danger-050 p-4 text-sm text-danger">
          Couldn&apos;t load applications — is the backend running?{" "}
          <button onClick={() => load()} className="font-semibold underline">
            Retry
          </button>
        </div>
      ) : applications.length === 0 ? (
        <p className="text-sm text-muted">{filter === "all" && !debouncedQ ? "No applications yet." : "No applications match that filter."}</p>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {applications.map((a) => (
              <div key={a.id} className="rounded-2xl border border-border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => copyRef(a.ref)} className="flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 font-mono text-xs font-semibold text-ink hover:bg-brand-050 hover:text-brand" title="Copy reference">
                        {a.ref} <Copy className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-semibold text-ink">{a.customer.name}</span>
                      <span className="text-xs text-muted">{fmtDate(a.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {a.customer.phone}
                      {a.customer.location ? ` · ${a.customer.location}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {a.product.name} · {a.tier.toUpperCase()} · {a.termMonths}mo
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <select value={a.status} onChange={(e) => handleStatusChange(a.id, e.target.value as ApplicationStatus)} className={`rounded-full border-0 px-3 py-1 text-xs font-medium capitalize ${statusStyles[a.status]}`}>
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <Link href={`/admin/applications/${a.id}`} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand/40">
                      Details <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => window.open(whatsappForApplication(a), "_blank", "noopener,noreferrer")}
                      title="Opens WhatsApp with a status update and tracking link — review and send"
                      className="flex items-center gap-1.5 rounded-full bg-whatsapp px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Notify customer
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-sm">
                  <span className="text-muted">
                    RRP <b className="text-ink">{formatKES(a.rrp)}</b>
                  </span>
                  <span className="text-muted">
                    Deposit <b className="text-ink">{formatKES(a.depositAmount)}</b>
                  </span>
                  <span className="text-muted">
                    Daily <b className="text-ink">{formatKES(a.dailyAmount)}</b>
                  </span>
                  {a.customer.idNumber && (
                    <span className="text-muted">
                      ID <b className="text-ink">{a.customer.idNumber}</b>
                    </span>
                  )}
                </div>
                {a.notes && <p className="mt-2 text-xs text-muted">Note: {a.notes}</p>}
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            pageSize={PAGE}
            total={total}
            label="applications"
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
