import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

/** Renders nothing when `value` is null/undefined so products without a
 *  rating simply have no stars — never an empty "0 stars". */
export function Rating({
  value,
  count,
  size = "sm",
  showNumber = false,
  className,
}: {
  value?: number | null;
  count?: number | null;
  size?: "sm" | "md";
  showNumber?: boolean;
  className?: string;
}) {
  if (value == null) return null;
  const rounded = Math.round(value * 2) / 2;
  const star = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <div className={cn("flex items-center gap-1", className)} aria-label={`Rated ${value.toFixed(1)} out of 5${count ? ` from ${count} reviews` : ""}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
          return (
            <span key={i} className="relative">
              <Star className={cn(star, "text-border-strong")} strokeWidth={1.6} />
              {fill > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star className={cn(star, "fill-amber-400 text-amber-400")} strokeWidth={1.6} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showNumber && <span className="text-xs font-medium text-ink/70">{value.toFixed(1)}</span>}
      {count != null && count > 0 && <span className="text-xs text-muted">({count})</span>}
    </div>
  );
}
