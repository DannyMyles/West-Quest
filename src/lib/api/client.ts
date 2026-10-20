/**
 * Thin fetch wrapper for the West Quest backend (Node + MariaDB).
 *
 * - In the browser it calls same-origin `/api/...`; `next.config.ts` rewrites
 *   that to the backend, so the admin session cookie is first-party and no CORS
 *   is involved.
 * - On the server (RSC, sitemap, build) it calls the backend directly at
 *   `BACKEND_URL`.
 */
const BACKEND_URL = (process.env.BACKEND_URL ?? "http://127.0.0.1:4000").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
  /** The server understood the request but refused it (validation, duplicate…). */
  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  json?: unknown;
  form?: FormData;
  query?: Query;
  signal?: AbortSignal;
  /** Server-side reads are cached for this many seconds (default 60). */
  revalidate?: number;
}

function buildUrl(path: string, query?: Query) {
  const base = typeof window === "undefined" ? BACKEND_URL : "";
  const url = `${base}/api${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/** Demo build: no backend, catalogue served from a bundled snapshot (decided in next.config.ts). */
export const STATIC_DEMO = process.env.WQ_STATIC_DEMO === "1";

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const method = opts.method ?? "GET";
  if (STATIC_DEMO) {
    const { staticApi } = await import("./staticCatalog");
    return (await staticApi(method, path, opts.query)) as T;
  }
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;
  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  } else if (opts.form) {
    body = opts.form; // the browser sets the multipart boundary
  }

  const init: RequestInit & { next?: { revalidate: number } } = {
    method,
    headers,
    body,
    signal: opts.signal,
    credentials: "include",
  };
  if (typeof window === "undefined" && method === "GET") {
    init.next = { revalidate: opts.revalidate ?? 60 };
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), init);
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(0, "NETWORK", "Couldn't reach the server. Check your connection and try again.");
  }

  if (res.status === 204) return undefined as T;

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    const e = (data as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
    throw new ApiError(
      res.status,
      e?.code ?? (res.status >= 500 ? "SERVER_ERROR" : "REQUEST_FAILED"),
      e?.message ?? (res.status >= 500 ? "The server ran into a problem. Please try again." : "Request failed"),
      e?.details
    );
  }
  return data as T;
}

/** Human-readable message from any thrown value (for toasts / inline errors). */
export function errorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof ApiError) {
    const first = Array.isArray(err.details) ? (err.details[0] as { path?: string; message?: string } | undefined) : undefined;
    return first?.message && err.code === "VALIDATION_ERROR"
      ? `${first.path ? first.path + ": " : ""}${first.message}`
      : err.message;
  }
  return err instanceof Error ? err.message : fallback;
}
