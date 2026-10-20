"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToast, type ToastType } from "@/context/ToastContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";

const icons: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const accent: Record<ToastType, string> = {
  success: "text-success",
  error: "text-danger",
  info: "text-brand",
};

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const reduced = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-6 sm:right-auto sm:top-auto sm:items-start"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout={!reduced}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-border bg-surface p-3.5 pr-2.5 shadow-lg"
              role="status"
              aria-live="polite"
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", accent[toast.type])} />
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-ink">{toast.message}</p>
                {toast.action && (
                  <Link
                    href={toast.action.href}
                    onClick={() => dismiss(toast.id)}
                    className="mt-1 inline-block text-xs font-semibold text-brand hover:text-brand-strong"
                  >
                    {toast.action.label} →
                  </Link>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
