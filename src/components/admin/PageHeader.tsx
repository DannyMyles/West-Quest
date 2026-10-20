import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Title row for admin sub-pages, with an optional "back" link above it. */
export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className="mx-auto mb-6 flex max-w-6xl flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink">
            <ChevronLeft className="h-4 w-4" /> {back.label}
          </Link>
        )}
        <h1 className="truncate text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
