"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { adminCreateProduct, adminUpdateProduct, type ProductInput } from "@/lib/api/products";
import { adminCategories } from "@/lib/api/categories";
import { adminUploadImages } from "@/lib/api/images";
import { adminRemovePlan, adminUpsertPlan, type PaymentPlanInput } from "@/lib/api/paymentPlans";
import { errorMessage } from "@/lib/api/client";
import { useAdminData, invalidateAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/context/ToastContext";
import { categories as seedCategories } from "@/lib/data/categories";
import { ImageManager } from "./ImageManager";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Affix, Field, FormCard, SaveBar, Switch } from "@/components/admin/FormKit";
import { planForTier } from "@/lib/types";
import type { Product, ProductSpec, CategorySlug, ProductBadge, Category } from "@/lib/types";

const BADGE_OPTIONS: ProductBadge[] = ["New", "Best Seller", "Popular", "Limited"];

interface PlanFields {
  depositPercent: string;
  depositAmount: string;
  daily6: string;
  daily9: string;
  daily12: string;
}
const emptyPlan: PlanFields = { depositPercent: "", depositAmount: "", daily6: "", daily9: "", daily12: "" };

function planToFields(p: ReturnType<typeof planForTier>): PlanFields {
  if (!p) return emptyPlan;
  return {
    depositPercent: String(p.depositPercent),
    depositAmount: String(p.depositAmount),
    daily6: String(p.daily6),
    daily9: String(p.daily9),
    daily12: String(p.daily12),
  };
}

function PlanFieldset({ value, onChange }: { value: PlanFields; onChange: (next: PlanFields) => void }) {
  const set = <K extends keyof PlanFields>(key: K, v: string) => onChange({ ...value, [key]: v });
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Field label="Deposit %">
        <Affix suffix="%">
          <input type="number" min={0} max={100} inputMode="decimal" value={value.depositPercent} onChange={(e) => set("depositPercent", e.target.value)} />
        </Affix>
      </Field>
      <Field label="Deposit amount">
        <Affix prefix="KSh">
          <input type="number" min={0} inputMode="numeric" value={value.depositAmount} onChange={(e) => set("depositAmount", e.target.value)} />
        </Affix>
      </Field>
      <span />
      <Field label="Daily (6mo)">
        <Affix prefix="KSh">
          <input type="number" min={0} inputMode="numeric" value={value.daily6} onChange={(e) => set("daily6", e.target.value)} />
        </Affix>
      </Field>
      <Field label="Daily (9mo)">
        <Affix prefix="KSh">
          <input type="number" min={0} inputMode="numeric" value={value.daily9} onChange={(e) => set("daily9", e.target.value)} />
        </Affix>
      </Field>
      <Field label="Daily (12mo)">
        <Affix prefix="KSh">
          <input type="number" min={0} inputMode="numeric" value={value.daily12} onChange={(e) => set("daily12", e.target.value)} />
        </Affix>
      </Field>
    </div>
  );
}

const PLAN_KEYS: (keyof PlanFields)[] = ["depositPercent", "depositAmount", "daily6", "daily9", "daily12"];
const planIsEmpty = (f: PlanFields) => PLAN_KEYS.every((k) => !f[k]);
const planIsComplete = (f: PlanFields) => PLAN_KEYS.every((k) => f[k] !== "");

function planPayload(f: PlanFields): PaymentPlanInput | null {
  if (!planIsComplete(f)) return null;
  return {
    depositPercent: Number(f.depositPercent),
    depositAmount: Number(f.depositAmount),
    daily6: Number(f.daily6),
    daily9: Number(f.daily9),
    daily12: Number(f.daily12),
  };
}

export function ProductForm({ initial }: { initial?: Product }) {
  const router = useRouter();
  const { push } = useToast();
  const { data: liveCategories } = useAdminData<Category[]>("admin:categories", adminCategories);
  const categories = liveCategories && liveCategories.length > 0 ? liveCategories : seedCategories;
  const isEdit = Boolean(initial);

  const [sku, setSku] = useState(initial?.sku ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<CategorySlug>(initial?.category ?? categories[0]?.slug ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [modelCode, setModelCode] = useState(initial?.modelCode ?? "");
  const [ram, setRam] = useState(initial?.ram ?? "");
  const [storage, setStorage] = useState(initial?.storage ?? "");
  const [rrp, setRrp] = useState(initial?.rrp?.toString() ?? "");
  const [wasPrice, setWasPrice] = useState(initial?.wasPrice?.toString() ?? "");
  const [offerEnds, setOfferEnds] = useState(toLocalInput(initial?.offerEndsAt));
  const [stockCount, setStockCount] = useState(initial?.stockCount?.toString() ?? "");
  const [rating, setRating] = useState(initial?.rating?.toString() ?? "");
  const [reviewCount, setReviewCount] = useState(initial?.reviewCount?.toString() ?? "");
  const [badge, setBadge] = useState<string>(initial?.badge ?? "");
  const [featureRank, setFeatureRank] = useState(initial?.featureRank?.toString() ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [active, setActive] = useState(initial?.active ?? true);
  const [staged, setStaged] = useState<File[]>([]);
  const [specs, setSpecs] = useState<ProductSpec[]>(initial?.specs ?? []);

  const hadVip = Boolean(initial && planForTier(initial, "vip"));
  const [retailPlan, setRetailPlan] = useState<PlanFields>(planToFields(initial && planForTier(initial, "retail")));
  const [vipEnabled, setVipEnabled] = useState(hadVip);
  const [vipPlan, setVipPlan] = useState<PlanFields>(planToFields(initial && planForTier(initial, "vip")));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!sku.trim() || !name.trim() || !rrp.trim()) {
      setError("SKU, name and RRP are required.");
      return;
    }
    if (!planIsEmpty(retailPlan) && !planIsComplete(retailPlan)) {
      setError("Fill in every Retail plan field, or clear them all if this item has no financing plan (e.g. an accessory sold for cash).");
      return;
    }
    const was = wasPrice.trim() === "" ? null : Number(wasPrice);
    if (was !== null && was <= Number(rrp)) {
      setError("The \"was\" price must be higher than the RRP — or clear it if this product isn't on offer.");
      return;
    }
    if (was === null && offerEnds) {
      setError("Set a \"was\" price for the offer, or clear the end date.");
      return;
    }
    const retail = planPayload(retailPlan);
    const hadRetail = Boolean(initial && planForTier(initial, "retail"));

    const vip = vipEnabled ? planPayload(vipPlan) : null;
    if (vipEnabled && !vip) {
      setError("Fill in all VIP plan fields, or turn VIP off for this product.");
      return;
    }

    setSaving(true);
    try {
      const payload: Omit<ProductInput, "slug"> = {
        sku: sku.trim(),
        name: name.trim(),
        category,
        brand: brand.trim() || null,
        modelCode: modelCode.trim() || null,
        ram: ram.trim() || null,
        storage: storage.trim() || null,
        rrp: Number(rrp),
        wasPrice: was,
        offerEndsAt: was !== null && offerEnds ? new Date(offerEnds).toISOString() : null,
        description: description.trim(),
        specs: specs.filter((s) => s.label.trim() && s.value.trim()),
        inStock,
        stockCount: stockCount.trim() === "" ? null : Number(stockCount),
        rating: rating.trim() === "" ? null : Number(rating),
        reviewCount: reviewCount.trim() === "" ? null : Number(reviewCount),
        badge: (badge as ProductBadge) || null,
        featureRank: featureRank.trim() === "" ? null : Number(featureRank),
        featured,
        active,
      };

      let productId: number;
      if (initial?.id) {
        await adminUpdateProduct(initial.id, payload);
        productId = initial.id;
      } else {
        const created = await adminCreateProduct(payload);
        productId = created.id!;
        if (staged.length > 0) {
          try {
            await adminUploadImages(productId, staged);
          } catch (e) {
            invalidateAdminData("admin:products");
            push({ type: "error", message: `Product saved, but photos failed: ${errorMessage(e, "upload error")}` });
          }
        }
      }

      if (retail) {
        await adminUpsertPlan(productId, "retail", retail);
      } else if (hadRetail) {
        await adminRemovePlan(productId, "retail");
      }
      if (vip) {
        await adminUpsertPlan(productId, "vip", vip);
      } else if (hadVip) {
        await adminRemovePlan(productId, "vip");
      }

      invalidateAdminData("admin:products");
      invalidateAdminData("admin:stats");
      push({ type: "success", message: isEdit ? "Product updated" : "Product created" });
      router.push("/admin/products");
    } catch (err) {
      const msg = errorMessage(err, "Couldn't save product. Check your connection and try again.");
      setError(msg);
      push({ type: "error", message: "Couldn't save product" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <FormCard title="Product details" description="What shoppers see on the product page and in search.">
            <Field label="Name">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Infinix GT 50 Pro (12+256)" className="admin-input" />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="SKU" hint={isEdit ? "The SKU can't be changed after creation." : "Your unique stock code."}>
                <input required disabled={isEdit} value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. INF-X6891-12+256" className="admin-input font-mono" />
              </Field>
              <Field label="Category">
                <select value={category} onChange={(e) => setCategory(e.target.value as CategorySlug)} className="admin-input">
                  {category && !categories.some((c) => c.slug === category) && <option value={category}>{category} (unknown)</option>}
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                      {c.active === false ? " (hidden)" : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Brand" optional>
                <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Infinix" className="admin-input" />
              </Field>
              <Field label="Model code" optional>
                <input value={modelCode} onChange={(e) => setModelCode(e.target.value)} placeholder="e.g. X6891" className="admin-input font-mono" />
              </Field>
              <Field label="RAM" optional>
                <input value={ram} onChange={(e) => setRam(e.target.value)} placeholder="e.g. 12GB" className="admin-input" />
              </Field>
              <Field label="Storage" optional>
                <input value={storage} onChange={(e) => setStorage(e.target.value)} placeholder="e.g. 256GB" className="admin-input" />
              </Field>
            </div>
            <Field label="Description">
              <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Key features, what's in the box, who it's for…" className="admin-input" />
            </Field>
          </FormCard>

          <FormCard title="Payment Plans" description="RRP is the cash price. Leave both plans blank for a cash-only item (e.g. an accessory); fill in Retail to offer financing, and turn on VIP only if this product also qualifies for VIP pricing.">
            <Field label="RRP" hint="The recommended retail (cash) price.">
              <Affix prefix="KSh">
                <input type="number" min={0} inputMode="numeric" value={rrp} onChange={(e) => setRrp(e.target.value)} placeholder="0" />
              </Affix>
            </Field>

            <OfferFields rrp={rrp} wasPrice={wasPrice} onWasPrice={setWasPrice} offerEnds={offerEnds} onOfferEnds={setOfferEnds} />

            <div className="rounded-[10px] border border-border p-4">
              <p className="mb-3 text-sm font-semibold text-ink">Retail plan</p>
              <PlanFieldset value={retailPlan} onChange={setRetailPlan} />
            </div>

            <div className="rounded-[10px] border border-border p-4">
              <Switch checked={vipEnabled} onChange={setVipEnabled} label="Offer a VIP plan for this product" description="Lower deposit for qualifying customers." />
              {vipEnabled && (
                <div className="mt-4">
                  <PlanFieldset value={vipPlan} onChange={setVipPlan} />
                </div>
              )}
            </div>
          </FormCard>

          <FormCard title="Specifications" description="Shown as a table on the product page, e.g. RAM → 12GB.">
            {specs.length === 0 ? (
              <p className="rounded-[8px] border border-dashed border-border px-4 py-5 text-center text-sm text-muted">No specifications yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,3fr)_40px] gap-2 px-0.5 text-xs font-medium text-muted sm:grid">
                  <span>Label</span>
                  <span>Value</span>
                </div>
                {specs.map((spec, i) => (
                  <div key={i} className="grid grid-cols-[minmax(0,1fr)_40px] gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_40px]">
                    <input
                      aria-label={`Specification ${i + 1} label`}
                      placeholder="Label"
                      value={spec.label}
                      onChange={(e) => setSpecs((prev) => prev.map((s, j) => (j === i ? { ...s, label: e.target.value } : s)))}
                      className="admin-input"
                    />
                    <input
                      aria-label={`Specification ${i + 1} value`}
                      placeholder="Value"
                      value={spec.value}
                      onChange={(e) => setSpecs((prev) => prev.map((s, j) => (j === i ? { ...s, value: e.target.value } : s)))}
                      className="admin-input col-start-1 sm:col-start-auto"
                    />
                    <button
                      type="button"
                      aria-label={`Remove specification ${i + 1}`}
                      onClick={() => setSpecs((prev) => prev.filter((_, j) => j !== i))}
                      className="col-start-2 row-start-1 flex h-10 w-10 items-center justify-center rounded-[8px] text-muted transition-colors hover:bg-danger-050 hover:text-danger sm:col-start-auto sm:row-start-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setSpecs((prev) => [...prev, { label: "", value: "" }])}
              className="flex w-fit items-center gap-1.5 rounded-[8px] border border-border px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-border-strong hover:bg-surface-muted/60"
            >
              <Plus className="h-4 w-4" /> Add specification
            </button>
          </FormCard>

          <FormCard title="Photos" description="JPG, PNG or WebP. The first photo is the main one shoppers see.">
            {initial?.id ? (
              <ImageManager productId={initial.id} />
            ) : (
              <div className="flex flex-wrap gap-3">
                {staged.map((file, i) => (
                  <span key={`${file.name}-${i}`} className="group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(file)} alt="" className="h-28 w-28 rounded-[8px] border border-border bg-white object-contain p-1" />
                    {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-panel-dark px-1.5 py-0.5 text-[10px] font-semibold text-white">Main</span>}
                    <button
                      type="button"
                      onClick={() => setStaged((prev) => prev.filter((_, j) => j !== i))}
                      aria-label="Remove photo"
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white text-muted shadow-sm transition-colors hover:text-danger"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[8px] border-2 border-dashed border-border-strong/70 text-muted transition-colors hover:border-ink/40 hover:bg-surface-muted/50 hover:text-ink">
                  <Upload className="h-5 w-5" />
                  <span className="text-xs font-medium">Add photos</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      setStaged((prev) => [...prev, ...files]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            )}
          </FormCard>
        </div>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-6">
          <FormCard title="Status">
            <Switch checked={active} onChange={setActive} label="Visible in storefront" description="Off hides it from shoppers without deleting it." />
            <Switch checked={inStock} onChange={setInStock} label="In stock" description="Off marks it as out of stock." />
            <Field label="Stock count" optional hint="1–3 shows a “Low stock” warning.">
              <input type="number" min={0} inputMode="numeric" value={stockCount} onChange={(e) => setStockCount(e.target.value)} className="admin-input" />
            </Field>
          </FormCard>

          <FormCard title="Merchandising">
            <Switch checked={featured} onChange={setFeatured} label="Featured on homepage" description="Adds it to the homepage's popular picks." />
            <Field label="Badge" optional>
              <select value={badge} onChange={(e) => setBadge(e.target.value)} className="admin-input">
                <option value="">No badge</option>
                {BADGE_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Feature rank" optional hint="Lower numbers show first.">
              <input type="number" min={0} inputMode="numeric" value={featureRank} onChange={(e) => setFeatureRank(e.target.value)} className="admin-input" />
            </Field>
          </FormCard>

          <FormCard title="Ratings" description="Shown as stars on the product.">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rating" optional>
                <Affix suffix="/ 5">
                  <input type="number" min={0} max={5} step={0.1} value={rating} onChange={(e) => setRating(e.target.value)} />
                </Affix>
              </Field>
              <Field label="Reviews" optional>
                <input type="number" min={0} inputMode="numeric" value={reviewCount} onChange={(e) => setReviewCount(e.target.value)} className="admin-input" />
              </Field>
            </div>
          </FormCard>
        </aside>
      </div>

      <SaveBar note={error && <span className="text-danger">{error}</span>}>
        <Link href="/admin/products" className="rounded-full px-5 py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:bg-black/5 hover:text-ink">
          Cancel
        </Link>
        <AnimatedButton type="submit" variant="primary" isLoading={saving}>
          {isEdit ? "Save changes" : "Create product"}
        </AnimatedButton>
      </SaveBar>
    </form>
  );
}

/** ISO timestamp → value for an <input type="datetime-local"> in the browser's timezone. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "Was" price + optional end date. The product shows as on offer while the
 *  was price is above the RRP and the end date (if any) hasn't passed. */
function OfferFields({
  rrp,
  wasPrice,
  onWasPrice,
  offerEnds,
  onOfferEnds,
}: {
  rrp: string;
  wasPrice: string;
  onWasPrice: (v: string) => void;
  offerEnds: string;
  onOfferEnds: (v: string) => void;
}) {
  const now = Number(rrp);
  const was = Number(wasPrice);
  const valid = wasPrice.trim() !== "" && was > now && now > 0;
  const [openedAt] = useState(() => Date.now());
  const ended = offerEnds !== "" && new Date(offerEnds).getTime() <= openedAt;
  const status = !wasPrice.trim()
    ? "Not on offer."
    : !valid
      ? "The was price must be higher than the RRP."
      : ended
        ? "This offer has ended — it no longer shows on the site."
        : `Shows as "Save KSh ${(was - now).toLocaleString()}" (${Math.round(((was - now) / was) * 100)}% off)${offerEnds ? " until the end date" : " until you clear it"}.`;

  return (
    <div className="rounded-[10px] border border-border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">Special offer</p>
        {(wasPrice || offerEnds) && (
          <button
            type="button"
            onClick={() => {
              onWasPrice("");
              onOfferEnds("");
            }}
            className="text-xs font-semibold text-muted underline underline-offset-2 hover:text-ink"
          >
            Clear offer
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Was price" optional hint="The old price, shown struck through. The RRP above becomes the offer price.">
          <Affix prefix="KSh">
            <input type="number" min={0} inputMode="numeric" value={wasPrice} onChange={(e) => onWasPrice(e.target.value)} placeholder="e.g. 13500" />
          </Affix>
        </Field>
        <Field label="Offer ends" optional hint="Leave empty to run until you clear it.">
          <input type="datetime-local" value={offerEnds} onChange={(e) => onOfferEnds(e.target.value)} className="admin-input" />
        </Field>
      </div>
      <p className={`mt-3 text-xs ${wasPrice.trim() && (!valid || ended) ? "text-warning" : "text-muted"}`}>{status}</p>
    </div>
  );
}
