"use client";

import { useMemo, useRef, useState } from "react";
import { Reorder } from "framer-motion";
import { Trash2, Pencil, Plus, Eye, EyeOff, GripVertical, Upload, ImageIcon } from "lucide-react";
import { adminBanners, adminCreateBanner, adminUpdateBanner, adminDeleteBanner, adminReorderBanners, adminUploadBannerImage } from "@/lib/api/banners";
import { errorMessage } from "@/lib/api/client";
import { useAdminData, invalidateAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/context/ToastContext";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ChoiceCard, Field, FormCard, Switch } from "@/components/admin/FormKit";
import type { Banner, BannerLayout } from "@/lib/types";

/** Quick picks for the button/badge colour; any #rrggbb works. */
const ACCENT_PRESETS = [
  { name: "Clay", hex: "#b5481f" },
  { name: "Clay strong", hex: "#923716" },
  { name: "Teal", hex: "#1f6b5c" },
  { name: "Teal strong", hex: "#17544a" },
  { name: "Apricot", hex: "#f2c48d" },
  { name: "Espresso", hex: "#241a12" },
];

const emptyForm = {
  eyebrow: "",
  headline: "",
  subcopy: "",
  image: "",
  layout: "photo" as BannerLayout,
  accent: "",
  badge: "",
  ctaLabel: "",
  ctaHref: "",
  cta2Label: "",
  cta2Href: "",
  dealEndsAt: "",
  active: true,
};

const KEY = "admin:banners";

/** Local datetime-input value ("YYYY-MM-DDTHH:mm") from an ISO string, or
 *  "" when unset — the inverse of `new Date(value).toISOString()`. */
function toDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminBannersPage() {
  const { push } = useToast();
  const { data, loading, error, refresh, mutate } = useAdminData<Banner[]>(KEY, adminBanners);
  const banners = useMemo(() => data ?? [], [data]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const reorderTimer = useRef<number | null>(null);

  function startEdit(b: Banner) {
    setEditingId(b.id);
    setForm({
      eyebrow: b.eyebrow ?? "",
      headline: b.headline,
      subcopy: b.subcopy ?? "",
      image: b.image,
      layout: b.layout ?? "photo",
      accent: b.accent ?? "",
      badge: b.badge ?? "",
      ctaLabel: b.ctaLabel ?? "",
      ctaHref: b.ctaHref ?? "",
      cta2Label: b.cta2Label ?? "",
      cta2Href: b.cta2Href ?? "",
      dealEndsAt: toDatetimeLocal(b.dealEndsAt),
      active: b.active !== false,
    });
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.headline.trim()) return;
    if (!/^https?:\/\//i.test(form.image.trim()) && !form.image.trim().startsWith("/")) {
      setFormError("Enter an image URL starting with http(s):// (or a /path on this site)");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const fields = {
        eyebrow: form.eyebrow.trim() || null,
        headline: form.headline.trim(),
        subcopy: form.subcopy.trim() || null,
        image: form.image.trim(),
        layout: form.layout,
        accent: form.accent || null,
        badge: form.badge.trim() || null,
        ctaLabel: form.ctaLabel.trim() || null,
        ctaHref: form.ctaHref.trim() || null,
        cta2Label: form.cta2Label.trim() || null,
        cta2Href: form.cta2Href.trim() || null,
        dealEndsAt: form.dealEndsAt ? new Date(form.dealEndsAt).toISOString() : null,
        active: form.active,
      };
      if (typeof editingId === "number") await adminUpdateBanner(editingId, fields);
      else await adminCreateBanner(fields);
      invalidateAdminData(KEY);
      refresh();
      push({ type: "success", message: editingId ? "Slide updated" : "Slide added" });
      resetForm();
    } catch (err) {
      push({ type: "error", message: errorMessage(err, "Couldn't save slide") });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(b: Banner) {
    setBusyId(b.id);
    const next = b.active === false;
    try {
      await adminUpdateBanner(b.id as number, { active: next });
      mutate(banners.map((x) => (x.id === b.id ? { ...x, active: next } : x)));
      push({ type: "success", message: next ? "Slide is now visible" : "Slide hidden" });
    } catch {
      push({ type: "error", message: "Couldn't update visibility" });
    } finally {
      setBusyId(null);
    }
  }

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setFormError(null);
    try {
      const url = await adminUploadBannerImage(file);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setFormError(errorMessage(err, "Couldn't upload the picture"));
    } finally {
      setUploading(false);
    }
  }

  function handleReorder(next: Banner[]) {
    mutate(next);
    if (reorderTimer.current) window.clearTimeout(reorderTimer.current);
    reorderTimer.current = window.setTimeout(async () => {
      try {
        await adminReorderBanners(next.map((b) => b.id as number));
        invalidateAdminData(KEY);
      } catch {
        push({ type: "error", message: "Couldn't save new order" });
        refresh();
      }
    }, 500);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await adminDeleteBanner(pendingDelete.id as number);
      mutate(banners.filter((b) => b.id !== pendingDelete.id));
      push({ type: "success", message: `Deleted "${pendingDelete.headline}"` });
      setPendingDelete(null);
    } catch {
      push({ type: "error", message: "Couldn't delete slide" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_440px]">
      <div className="min-w-0">
        <h1 className="mb-1 text-xl font-semibold text-ink">Homepage Banners</h1>
        <p className="mb-6 text-sm text-muted">Drag to reorder — this is the order slides play in.</p>
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : error ? (
          <div className="rounded-xl border border-danger/30 bg-danger-050 p-4 text-sm text-danger">
            Couldn&apos;t load banners.{" "}
            <button onClick={() => refresh()} className="font-semibold underline">
              Retry
            </button>
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-border bg-white p-6 text-center text-sm text-muted">No slides yet — add one with the form.</div>
        ) : (
          <Reorder.Group axis="y" values={banners} onReorder={handleReorder} className="flex flex-col gap-2">
            {banners.map((b) => (
              <Reorder.Item key={b.id} value={b} className={`flex items-center gap-3 rounded-2xl border border-border bg-white p-3 ${b.active === false ? "opacity-55" : ""}`}>
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted active:cursor-grabbing" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt="" className="h-14 w-20 shrink-0 rounded-lg border border-border object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{b.headline}</p>
                  {b.eyebrow && <p className="truncate text-xs text-muted">{b.eyebrow}</p>}
                </div>
                <button onClick={() => toggleActive(b)} disabled={busyId === b.id} className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted hover:text-brand disabled:opacity-50" aria-label={b.active === false ? "Show slide" : "Hide slide"}>
                  {b.active === false ? (
                    <>
                      <EyeOff className="h-4 w-4" /> Hidden
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" /> Visible
                    </>
                  )}
                </button>
                <div className="flex shrink-0 items-center gap-3">
                  <button onClick={() => startEdit(b)} className="text-muted hover:text-brand" aria-label={`Edit ${b.headline}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setPendingDelete(b)} className="text-muted hover:text-red-500" aria-label={`Delete ${b.headline}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FormCard title={editingId ? "Edit slide" : "Add slide"}>
            <Field label="Headline">
              <input required placeholder="e.g. Your next phone, one day at a time" value={form.headline} onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))} className="admin-input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Eyebrow" optional>
                <input placeholder="e.g. New this week" value={form.eyebrow} onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))} className="admin-input" />
              </Field>
              <Field label="Badge" optional>
                <input placeholder="e.g. VIP" value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} className="admin-input" />
              </Field>
            </div>
            <Field label="Description" optional>
              <textarea rows={2} placeholder="One or two short lines under the headline" value={form.subcopy} onChange={(e) => setForm((f) => ({ ...f, subcopy: e.target.value }))} className="admin-input min-h-0" />
            </Field>
          </FormCard>

          <FormCard title="Picture">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-border bg-surface-muted">
                {form.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted" />
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-border px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-border-strong hover:bg-surface-muted/60">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : form.image ? "Replace" : "Upload picture"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    void handleUpload(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <Field label="…or picture address" hint="A link starting with https:// or a /path on this site.">
              <input required placeholder="https://…" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} className="admin-input" />
            </Field>
            <div role="radiogroup" aria-label="Picture style" className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-ink">Picture style</span>
              <ChoiceCard selected={form.layout === "photo"} onSelect={() => setForm((f) => ({ ...f, layout: "photo" }))} title="Lifestyle photo" description="A wide picture fills the banner." />
              <ChoiceCard selected={form.layout === "product"} onSelect={() => setForm((f) => ({ ...f, layout: "product" }))} title="Product on white" description="A device photo on a light stage." />
            </div>
          </FormCard>

          <FormCard title="Buttons & colour">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-ink">Colour</span>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_PRESETS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    aria-pressed={form.accent === c.hex}
                    onClick={() => setForm((f) => ({ ...f, accent: c.hex }))}
                    className={`h-8 w-8 rounded-full border border-black/10 transition-transform hover:scale-110 ${form.accent === c.hex ? "ring-2 ring-ink ring-offset-2" : ""}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                <input type="color" aria-label="Custom colour" value={form.accent || "#b5481f"} onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))} className="h-8 w-10 cursor-pointer rounded-[6px] border border-border bg-transparent" />
                {form.accent && (
                  <button type="button" onClick={() => setForm((f) => ({ ...f, accent: "" }))} className="text-xs text-muted underline hover:text-ink">
                    Reset
                  </button>
                )}
              </div>
              <span className="text-xs text-muted">Used for the badge and the main button.</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Main button" optional>
                <input placeholder="Browse devices" value={form.ctaLabel} onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))} className="admin-input" />
              </Field>
              <Field label="Links to">
                <input placeholder="/catalogue?category=smartphones" value={form.ctaHref} onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))} className="admin-input" />
              </Field>
              <Field label="Second button" optional>
                <input placeholder="How it works" value={form.cta2Label} onChange={(e) => setForm((f) => ({ ...f, cta2Label: e.target.value }))} className="admin-input" />
              </Field>
              <Field label="Links to">
                <input placeholder="/faqs" value={form.cta2Href} onChange={(e) => setForm((f) => ({ ...f, cta2Href: e.target.value }))} className="admin-input" />
              </Field>
            </div>
          </FormCard>

          <FormCard title="Visibility">
            <Switch checked={form.active} onChange={(active) => setForm((f) => ({ ...f, active }))} label="Visible in storefront" description="Off keeps the slide saved but hidden." />
            <Field label="Flash-deal countdown" optional hint="Shows a live countdown on the slide until this time.">
              <input type="datetime-local" value={form.dealEndsAt} onChange={(e) => setForm((f) => ({ ...f, dealEndsAt: e.target.value }))} className="admin-input" />
            </Field>
          </FormCard>

          {formError && <p className="text-sm text-danger">{formError}</p>}
          <div className="flex gap-2">
            <AnimatedButton type="submit" variant="primary" isLoading={saving} className="flex-1">
              {editingId ? (
                "Save changes"
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add slide
                </>
              )}
            </AnimatedButton>
            {editingId && (
              <AnimatedButton type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </AnimatedButton>
            )}
          </div>
        </form>
      </div>

      <ConfirmDialog open={pendingDelete !== null} danger busy={deleting} title={`Delete "${pendingDelete?.headline ?? ""}"?`} confirmLabel="Delete slide" onConfirm={confirmDelete} onCancel={() => setPendingDelete(null)} body={<span>This slide will no longer show on the homepage.</span>} />
    </div>
  );
}
