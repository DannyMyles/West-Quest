import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Editorial section header: a numbered mono eyebrow, a serif title and an
 *  optional "view all" link aligned to the baseline. */
export function SectionHeading({
  index,
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
      <div>
        <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-brand">
          <span>{index}</span>
          <span aria-hidden className="h-px w-6 bg-brand/40" />
          <span className="text-muted">{eyebrow}</span>
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium leading-tight tracking-[-0.015em] text-ink sm:text-[40px]">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-ink hover:text-brand sm:flex">
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
