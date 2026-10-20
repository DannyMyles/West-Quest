"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Star, Check, Trash2, Undo2 } from "lucide-react";
import { adminReviews, adminSetReviewApproved, adminDeleteReview } from "@/lib/api/reviews";
import { errorMessage } from "@/lib/api/client";
import { invalidateAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/context/ToastContext";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { AdminReview } from "@/lib/types";

type Tab = "pending" | "published";

const PAGE = 20;

export default function AdminReviewsPage() {
  const { push } = useToast();
  const [tab, setTab] = useState<Tab>("pending");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [shown, setShown] = useState<AdminReview[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);
  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminReview | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let live = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(false);
    adminReviews({ approved: tab === "published", page, limit: PAGE })
      .then((res) => {
        if (!live) return;
        setShown(res.items);
        setTotal(res.total);
        setPendingCount(res.pendingCount);
      })
      .catch(() => live && setError(true))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [tab, page, nonce]);

  async function setApproved(r: AdminReview, approved: boolean) {
    setBusyId(r.id);
    try {
      await adminSetReviewApproved(r.id, approved);
      setShown((prev) => prev.filter((x) => x.id !== r.id));
      setTotal((n) => Math.max(0, n - 1));
      setPendingCount((n) => Math.max(0, n + (approved ? -1 : 1)));
      invalidateAdminData("admin:stats");
      push({ type: "success", message: approved ? "Review published" : "Review unpublished" });
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't update review") });
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminDeleteReview(pendingDelete.id);
      setShown((prev) => prev.filter((x) => x.id !== pendingDelete.id));
      setTotal((n) => Math.max(0, n - 1));
      if (!pendingDelete.approved) setPendingCount((n) => Math.max(0, n - 1));
      invalidateAdminData("admin:stats");
      push({ type: "success", message: "Review deleted" });
      setPendingDelete(null);
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't delete review") });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink">Reviews</h1>
        <button onClick={refresh} className="text-sm font-medium text-muted hover:text-brand">
          Refresh
        </button>
      </div>

      <div className="mb-5 inline-flex rounded-full border border-border bg-white p-1 text-sm">
        {(["pending", "published"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 font-medium capitalize transition-colors ${tab === t ? "bg-brand text-white" : "text-muted hover:text-ink"}`}
          >
            {t}
            {t === "pending" ? ` (${pendingCount})` : ""}
          </button>
        ))}
      </div>

      {loading && shown.length === 0 ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : error ? (
        <div className="rounded-xl border border-danger/30 bg-danger-050 p-4 text-sm text-danger">
          Couldn&apos;t load reviews — is the backend running?{" "}
          <button onClick={refresh} className="font-semibold underline">
            Retry
          </button>
        </div>
      ) : shown.length === 0 ? (
        <p className="text-sm text-muted">{tab === "pending" ? "Nothing waiting for approval. 🎉" : "No published reviews yet."}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-border-strong"}`} />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-ink">{r.customerName}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    <Link href={`/catalogue/${r.productSlug}`} className="hover:text-brand">
                      {r.productName}
                    </Link>
                    {` · ${new Date(r.createdAt).toLocaleDateString("en-KE")}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {r.approved ? (
                    <button onClick={() => setApproved(r, false)} disabled={busyId === r.id} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink hover:border-brand/40 disabled:opacity-50">
                      <Undo2 className="h-3.5 w-3.5" /> Unpublish
                    </button>
                  ) : (
                    <button onClick={() => setApproved(r, true)} disabled={busyId === r.id} className="flex items-center gap-1.5 rounded-full bg-success px-3 py-1.5 text-xs font-medium text-white hover:brightness-95 disabled:opacity-50">
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  <button onClick={() => setPendingDelete(r)} className="text-muted hover:text-red-500" aria-label="Delete review">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">{r.comment}</p>
            </div>
          ))}
          <Pagination
            page={page}
            pageSize={PAGE}
            total={total}
            label="reviews"
            onPage={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}

      <ConfirmDialog open={pendingDelete !== null} danger busy={deleting} title="Delete this review?" body="This permanently removes the review. If it's just off-topic or spam you can unpublish instead." confirmLabel="Delete review" onConfirm={confirmDelete} onCancel={() => setPendingDelete(null)} />
    </div>
  );
}
