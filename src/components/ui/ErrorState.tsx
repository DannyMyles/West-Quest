import { AlertTriangle, WifiOff } from "lucide-react";
import { cn } from "@/lib/cn";

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this right now. Please try again.",
  onRetry,
  variant = "error",
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: "error" | "network";
  className?: string;
}) {
  const Icon = variant === "network" ? WifiOff : AlertTriangle;
  return (
    <div
      className={cn("tag-corner flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface px-6 py-16 text-center", className)}
      role="alert"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-050 text-danger">
        <Icon className="h-6 w-6" />
      </span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="max-w-xs text-sm text-muted">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-1">
          Try again
        </button>
      )}
    </div>
  );
}
