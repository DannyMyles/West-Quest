/**
 * The `wq_admin` cookie read by `src/proxy.ts`. Purely a UX gate to
 * keep the admin shell from rendering for people who never signed in —
 * real access control is the backend's session cookie.
 */
const COOKIE = "wq_admin";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export function markAdminSession() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=1; path=/; max-age=${MAX_AGE}; samesite=lax`;
}

export function clearAdminSession() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=; path=/; max-age=0; samesite=lax`;
}
