"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPanel } from "@/components/account/AuthPanel";
import { useAccount } from "@/context/AccountContext";

/** Only same-site paths are allowed as a post-login destination. */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export function LoginView() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { customer, loading } = useAccount();

  useEffect(() => {
    if (!loading && customer) router.replace(next);
  }, [customer, loading, next, router]);

  return (
    <div className="section grid gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div className="max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand">Your account</p>
        <h1 className="mt-2 font-display text-4xl font-medium leading-tight tracking-[-0.015em] text-ink sm:text-5xl">
          Track every plan and order in <em className="text-brand">one place.</em>
        </h1>
        <p className="mt-4 text-muted">
          Sign in with your phone number to check out, follow your applications from review to approval, and see your order history.
        </p>
      </div>
      <div className="mx-auto w-full max-w-md rounded-3xl bg-surface p-6 shadow-md sm:p-8">
        <AuthPanel initialMode={params.get("mode") === "register" ? "register" : "signin"} onDone={() => router.replace(next)} />
      </div>
    </div>
  );
}
