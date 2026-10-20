"use client";

import { ProductImage } from "@/components/ui/ProductImage";
import { usePhotoOnWhite } from "@/hooks/usePhotoOnWhite";
import type { CategorySlug } from "@/lib/types";
import { cn } from "@/lib/cn";

/** Card thumbnail: a photo shot on white is padded and blended into the
 *  card's sand surface; any other photo (a dark or full-bleed marketing
 *  shot) fills the frame edge to edge instead of sitting in it as a box. */
export function CardPhoto({
  src,
  category,
  alt,
  priority,
  dimmed,
}: {
  src?: string;
  category: CategorySlug;
  alt: string;
  priority?: boolean;
  dimmed?: boolean;
}) {
  const onWhite = usePhotoOnWhite(src);
  const fill = onWhite === false;

  return (
    <ProductImage
      src={src}
      category={category}
      alt={alt}
      priority={priority}
      fit={fill ? "cover" : "contain"}
      className={cn(
        "h-full w-full bg-surface-muted",
        !fill && "p-5 sm:p-7",
        dimmed && "opacity-60"
      )}
      imgClassName="transition-transform duration-500 group-hover:scale-[1.05]"
      iconClassName="h-16 w-16 sm:h-20 sm:w-20"
    />
  );
}
