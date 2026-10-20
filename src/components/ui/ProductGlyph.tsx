"use client";

import { categoryIconMap, DEFAULT_CATEGORY_ICON } from "@/lib/categoryIcons";
import { cn } from "@/lib/cn";

const gradientMap: Record<string, string> = {
  smartphones: "from-violet-100 via-white to-fuchsia-50",
  tablets: "from-indigo-100 via-white to-violet-100",
  accessories: "from-amber-50 via-white to-orange-50",
};
const DEFAULT_GRADIENT = "from-violet-50 via-white to-slate-50";

const iconColorMap: Record<string, string> = {
  smartphones: "text-brand",
  tablets: "text-brand",
  accessories: "text-accent-strong",
};
const DEFAULT_COLOR = "text-brand/70";

export function ProductGlyph({
  category,
  className,
  iconClassName,
}: {
  category: string;
  className?: string;
  iconClassName?: string;
}) {
  const key = category.toLowerCase();
  const Icon = categoryIconMap[key] ?? categoryIconMap[key.replace(/s$/, "")] ?? DEFAULT_CATEGORY_ICON;
  return (
    <div className={cn("relative flex items-center justify-center bg-gradient-to-br", gradientMap[category] ?? DEFAULT_GRADIENT, className)}>
      <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.8),transparent_50%)]" />
      <Icon strokeWidth={1.1} className={cn("relative", iconColorMap[category] ?? DEFAULT_COLOR, iconClassName)} />
    </div>
  );
}
