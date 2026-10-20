"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, AlertTriangle, Eye, EyeOff, Search, ImageOff } from "lucide-react";
import { adminAllProducts, adminDeleteProduct, adminUpdateProduct } from "@/lib/api/products";
import { useAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/context/ToastContext";
import { formatKES } from "@/lib/format";
import { cheapestDaily } from "@/lib/finance";
import { planForTier } from "@/lib/types";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { Product } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 5;
const KEY = "admin:products";
const PAGE_SIZE = 25;

export default function AdminProductsPage() {
  const { push } = useToast();
  const { data, loading, error, refresh, mutate } = useAdminData<Product[]>(KEY, adminAllProducts);
  const products = useMemo(() => data ?? [], [data]);

  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);

  const departments = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => (!department || p.category === department) && (!q || `${p.name} ${p.sku} ${p.brand ?? ""}`.toLowerCase().includes(q)));
  }, [products, query, department]);
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageRows = shown.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const reload = useCallback(() => refresh(), [refresh]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminDeleteProduct(pendingDelete.id!);
      mutate(products.filter((p) => p.id !== pendingDelete.id));
      push({ type: "success", message: `Deleted "${pendingDelete.name}"` });
      setPendingDelete(null);
    } catch {
      push({ type: "error", message: "Couldn't delete — try again" });
    } finally {
      setDeleting(false);
    }
  }

  async function toggleActive(p: Product) {
    setBusyId(p.id ?? null);
    const next = p.active === false;
    try {
      await adminUpdateProduct(p.id!, { active: next });
      mutate(products.map((x) => (x.id === p.id ? { ...x, active: next } : x)));
      push({ type: "success", message: next ? "Product is now visible" : "Product hidden from storefront" });
    } catch {
      push({ type: "error", message: "Couldn't update visibility" });
    } finally {
      setBusyId(null);
    }
  }

  const lowStock = products.filter((p) => typeof p.stockCount === "number" && p.stockCount <= LOW_STOCK_THRESHOLD).sort((a, b) => (a.stockCount ?? 0) - (b.stockCount ?? 0));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Products</h1>
          {!loading && !error && <p className="mt-0.5 text-sm text-muted">{shown.length === products.length ? `${products.length} products` : `${shown.length} of ${products.length} products`}</p>}
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white">
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : error ? (
        <div className="rounded-xl border border-danger/30 bg-danger-050 p-4 text-sm text-danger">
          Couldn&apos;t load products — is the backend running?{" "}
          <button onClick={reload} className="font-semibold underline">
            Retry
          </button>
        </div>
      ) : (
        <>
          {lowStock.length > 0 && (
            <div className="mb-6 rounded-2xl border border-warning/30 bg-warning-050 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-warning">
                <AlertTriangle className="h-4 w-4" /> Low stock ({lowStock.length})
              </p>
              <ul className="mt-2 divide-y divide-warning/20">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <Link href={`/admin/products/${p.id}`} className="font-medium text-ink hover:text-brand">
                      {p.name}
                    </Link>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${(p.stockCount ?? 0) <= 0 ? "bg-danger text-white" : "bg-white text-warning"}`}>{p.stockCount} left</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {products.length === 0 ? (
            <p className="text-sm text-muted">No products yet. Add your first one, or run the catalogue import script.</p>
          ) : (
            <>
              <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by name, SKU or brand"
                    aria-label="Search products"
                    className="admin-input pl-9"
                  />
                </div>
                <select
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by category"
                  className="admin-input capitalize sm:w-52"
                >
                  <option value="">All categories</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d.replace(/-/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="overflow-x-auto rounded-[12px] border border-border bg-white">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">RRP</th>
                      <th className="px-4 py-3">From / day</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Visible</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {shown.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">
                          No products match your search.
                        </td>
                      </tr>
                    )}
                    {pageRows.map((p) => {
                      const retail = planForTier(p, "retail");
                      return (
                        <tr key={p.id} className={p.active === false ? "opacity-55" : undefined}>
                          <td className="px-4 py-2.5">
                            <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[6px] border border-border bg-white">
                                {p.images?.[0] ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={p.images[0]} alt="" loading="lazy" className="h-full w-full object-contain p-0.5" />
                                ) : (
                                  <ImageOff className="h-4 w-4 text-muted" />
                                )}
                              </span>
                              <span className="min-w-0">
                                <span className="block font-medium text-ink hover:underline">
                                  {p.name}
                                  {p.badge && <span className="ml-2 rounded-full bg-brand-050 px-1.5 py-0.5 text-[10px] font-semibold text-brand">{p.badge}</span>}
                                  {planForTier(p, "vip") && <span className="ml-1 rounded-full bg-accent-050 px-1.5 py-0.5 text-[10px] font-semibold text-accent-strong">VIP</span>}
                                </span>
                                <span className="block font-mono text-[11px] text-muted">{p.sku}</span>
                              </span>
                            </Link>
                          </td>
                          <td className="px-4 py-3 capitalize text-muted">{p.category.replace(/-/g, " ")}</td>
                          <td className="px-4 py-3 text-ink">{formatKES(p.rrp)}</td>
                          <td className="px-4 py-3 text-ink">{retail ? formatKES(cheapestDaily(retail)) : "—"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                typeof p.stockCount === "number"
                                  ? p.stockCount <= 0
                                    ? "bg-red-100 text-red-600"
                                    : p.stockCount <= LOW_STOCK_THRESHOLD
                                      ? "bg-warning-050 text-warning"
                                      : "bg-success/10 text-success"
                                  : p.inStock
                                    ? "bg-success/10 text-success"
                                    : "bg-red-100 text-red-600"
                              }`}
                            >
                              {typeof p.stockCount === "number" ? `${p.stockCount} in stock` : p.inStock ? "In stock" : "Out of stock"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => toggleActive(p)} disabled={busyId === p.id} aria-label={p.active === false ? "Show in storefront" : "Hide from storefront"} className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-brand disabled:opacity-50">
                              {p.active === false ? (
                                <>
                                  <EyeOff className="h-4 w-4" /> Hidden
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4" /> Visible
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-3">
                              <Link href={`/admin/products/${p.id}`} className="text-muted hover:text-brand" aria-label={`Edit ${p.name}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                              <button onClick={() => setPendingDelete(p)} className="text-muted hover:text-red-500" aria-label={`Delete ${p.name}`}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={current}
                pageSize={PAGE_SIZE}
                total={shown.length}
                label="products"
                onPage={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        danger
        busy={deleting}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        body="This permanently removes the product from the store. Its photos and payment plans are deleted with it. Hide it instead if you might sell it again."
        confirmLabel="Delete product"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
