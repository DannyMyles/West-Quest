"use client";

import { Suspense, useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { adminLogin, adminMe } from "@/lib/api/auth";
import { errorMessage } from "@/lib/api/client";
import { markAdminSession } from "@/lib/adminSession";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const dest = params.get("from") || "/admin";

  function finish() {
    markAdminSession();
    router.replace(dest);
  }

  // The session cookie outlives the `wq_admin` marker — if it's still valid,
  // restore the marker and go straight in.
  useEffect(() => {
    let active = true;
    adminMe()
      .then(() => active && finish())
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await adminLogin(email, password);
      finish();
    } catch (err) {
      setError(errorMessage(err, "Couldn't sign in. Try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div aria-hidden className="absolute inset-0 bg-panel-dark" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_15%_20%,rgba(199,138,46,0.22),transparent_45%),radial-gradient(circle_at_85%_75%,rgba(231,200,120,0.16),transparent_45%)]"
      />

      <div className="tag-corner relative w-full max-w-sm border border-white/15 bg-surface/95 p-8 shadow-xl backdrop-blur">
        <span className="ledger-tick right-4 top-4 text-accent/60" />
        <div className="mb-6">
          <BrandLogo />
          <p className="mt-3 text-xs text-muted">Sign in to manage the store</p>
        </div>

        <div className="flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-xs font-medium text-ink/70">
                Email
              </label>
              <input id="admin-email" required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-xs font-medium text-ink/70">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  required
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  aria-pressed={showPw}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <AnimatedButton type="submit" variant="primary" isLoading={submitting} className="w-full">
              {submitting ? "Signing in…" : "Sign in"}
            </AnimatedButton>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginCard />
    </Suspense>
  );
}
