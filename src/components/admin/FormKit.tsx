"use client";

import { cn } from "@/lib/cn";

/* Shared building blocks for admin data-entry forms: a titled section card,
   a labelled field (label, "Optional" tag, hint, error), an input with a
   prefix/suffix (e.g. "KSh"), an on/off switch and a sticky save bar.
   Pair with the .admin-input class from globals.css. */

export function FormCard({
  title,
  description,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-[12px] border border-border bg-white shadow-[0_1px_2px_rgba(25,21,42,0.04)]", className)}>
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] leading-snug text-muted">{description}</p>}
      </header>
      <div className={cn("flex flex-col gap-4 p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  optional,
  error,
  children,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  optional?: boolean;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="flex items-baseline justify-between gap-2 text-[13px] font-medium text-ink">
        {label}
        {optional && <span className="text-[11px] font-normal text-muted">Optional</span>}
      </span>
      {children}
      {error ? <span className="text-xs text-danger">{error}</span> : hint && <span className="text-xs leading-snug text-muted">{hint}</span>}
    </label>
  );
}

/** An input with fixed text before/after it, e.g. `<Affix prefix="KSh">`. */
export function Affix({ prefix, suffix, children }: { prefix?: string; suffix?: string; children: React.ReactNode }) {
  return (
    <span className="admin-affix">
      {prefix && <span className="pl-3 text-sm text-muted">{prefix}</span>}
      {children}
      {suffix && <span className="pr-3 text-sm text-muted">{suffix}</span>}
    </span>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-start justify-between gap-4 rounded-[8px] text-left disabled:opacity-60"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-xs leading-snug text-muted">{description}</span>}
      </span>
      <span
        aria-hidden
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors group-focus-visible:ring-4 group-focus-visible:ring-ink/15",
          checked ? "bg-accent-strong" : "bg-border-strong"
        )}
      >
        <span className={cn("absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200", checked && "translate-x-4")} />
      </span>
    </button>
  );
}

/** A selectable card for mutually exclusive options (used like a radio). */
export function ChoiceCard({
  selected,
  onSelect,
  title,
  description,
  icon,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-[8px] border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/10",
        selected ? "border-ink bg-surface-muted/60 ring-1 ring-ink" : "border-border hover:border-border-strong"
      )}
    >
      {icon && <span className="mt-0.5 shrink-0 text-ink/70">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-xs leading-snug text-muted">{description}</span>}
      </span>
      <span aria-hidden className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", selected ? "border-ink" : "border-border-strong")}>
        {selected && <span className="h-2 w-2 rounded-full bg-ink" />}
      </span>
    </button>
  );
}

/** Save/cancel actions that stay visible at the bottom of long forms. */
export function SaveBar({ children, note }: { children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-2 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(25,21,42,0.05)] backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-end gap-3">
        {note && <div className="mr-auto text-sm">{note}</div>}
        {children}
      </div>
    </div>
  );
}
