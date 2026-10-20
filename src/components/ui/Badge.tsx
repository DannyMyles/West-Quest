import { createElement } from "react";
import { cn } from "@/lib/cn";
import { badgeConfig, type BadgeVariant } from "@/lib/badges";

export function Badge({ variant, label, className }: { variant: BadgeVariant; label?: string; className?: string }) {
  const config = badgeConfig[variant];
  return (
    <span className={cn("badge", config.className, className)}>
      {createElement(config.icon, { "aria-hidden": true, className: "h-3 w-3 shrink-0", strokeWidth: 2.2 })}
      {label ?? config.label}
    </span>
  );
}
