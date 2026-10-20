import { Info } from "lucide-react";

/** Shown in the static preview build where sign-in and ordering need the live backend. */
export function PreviewNotice({ title = "Preview mode", children }: { title?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-accent-050 p-6 sm:p-7">
      <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent-strong">
        <Info aria-hidden className="h-4 w-4" /> {title}
      </p>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/80">
        This is a preview of the West Quest website. Accounts, order tracking and online checkout switch on when the site goes live — until
        then, our team takes orders on WhatsApp.
      </p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
