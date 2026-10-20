export function formatKES(amount: number | null): string {
  if (amount === null) return "Price on request";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Normalises a Kenyan mobile number to the local 07XX XXX XXX / 01XX XXX XXX
 *  display form, accepting 2547…, +2547…, 7…, 07… inputs. */
export function formatPhoneKE(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("254")) local = "0" + local.slice(3);
  else if (local.length === 9 && (local.startsWith("7") || local.startsWith("1")))
    local = "0" + local;
  if (local.length !== 10) return raw.trim();
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

/** Digits-only MSISDN in 2547XXXXXXXX form for wa.me / tel links. */
export function toMsisdn(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.length === 9) return "254" + digits;
  return digits;
}
