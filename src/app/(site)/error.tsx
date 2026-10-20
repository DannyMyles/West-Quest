"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="section flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-050 text-danger">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted">We hit an unexpected error loading this page. You can try again, or head back home.</p>
      <div className="mt-1 flex gap-3">
        <button onClick={() => retry()} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Go home
        </Link>
      </div>
    </div>
  );
}
