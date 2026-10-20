/**
 * Applications submitted (or tracked) on this device, so /track can offer
 * them with one tap instead of making the customer find their reference
 * again. Kept only in this browser's localStorage; nothing is sent anywhere.
 */
export interface RecentApplication {
  ref: string;
  phone: string;
  productName?: string;
  placedAt?: string;
}

const KEY = "west-quest-applications";
const MAX = 8;

export function getRecentApplications(): RecentApplication[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((o) => o && typeof o.ref === "string" && typeof o.phone === "string") : [];
  } catch {
    return [];
  }
}

export function rememberApplication(application: RecentApplication) {
  try {
    const rest = getRecentApplications().filter((o) => o.ref !== application.ref);
    window.localStorage.setItem(KEY, JSON.stringify([application, ...rest].slice(0, MAX)));
  } catch {
    /* storage unavailable (private mode) — tracking still works by typing */
  }
}

export function forgetApplication(ref: string) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(getRecentApplications().filter((o) => o.ref !== ref)));
  } catch {
    /* ignore */
  }
}
