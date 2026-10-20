import Image from "next/image";
import { ProductGlyph } from "./ProductGlyph";
import { CategorySlug } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ProductImage({
  src,
  category,
  alt,
  className,
  imgClassName,
  iconClassName,
  priority,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  fit = "cover",
}: {
  src?: string;
  category: CategorySlug;
  alt: string;
  className?: string;
  /** Classes for the <img> itself. Put hover transforms here, not on the
   *  wrapper: a transformed wrapper becomes its own layer and breaks the
   *  multiply blend, so a white photo background shows through. */
  imgClassName?: string;
  iconClassName?: string;
  priority?: boolean;
  sizes?: string;
  /** `contain` shows the whole photo, multiply-blended so a white photo
   *  background takes on the colour of whatever surface it sits on. */
  fit?: "cover" | "contain";
}) {
  if (!src) {
    return <ProductGlyph category={category} className={className} iconClassName={iconClassName} />;
  }

  return (
    <div className={cn("relative overflow-hidden", fit === "contain" ? "" : "bg-surface-muted", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={src.startsWith("http")}
        className={cn(fit === "contain" ? "object-contain blend-white" : "object-cover", imgClassName)}
      />
    </div>
  );
}
