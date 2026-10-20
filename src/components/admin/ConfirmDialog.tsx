"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Lightweight replacement for `window.confirm` — focus-trapped, Esc to
 *  cancel, supports arbitrary body content (e.g. a reassignment picker). */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-panel-dark/40 backdrop-blur-[2px]" onClick={() => !busy && onCancel()} />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
            initial={{ scale: 0.96, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <div className="flex gap-3">
              {danger && (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-050 text-danger">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-ink">{title}</h2>
                {body && <div className="mt-2 text-sm leading-relaxed text-muted">{body}</div>}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={onCancel} disabled={busy} className="btn-ghost disabled:opacity-60">
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className={
                  danger
                    ? "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-danger px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-95 disabled:opacity-60"
                    : "btn-primary disabled:opacity-60"
                }
              >
                {busy ? "Working…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
