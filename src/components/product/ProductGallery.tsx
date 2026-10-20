"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductImage } from "@/components/ui/ProductImage";
import { cn } from "@/lib/cn";

const badgeStyles: Record<string, string> = {
  New: "bg-brand text-white",
  "Best Seller": "bg-panel-dark text-white",
  Popular: "bg-brand-050 text-brand",
  Limited: "bg-panel-dark text-white",
};

export function ProductGallery({ product }: { product: Product }) {
  // Photos come from the server. A product without any shows the category glyph.
  const images: string[] = product.images ?? [];
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (!zoomOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomOpen(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + images.length) % images.length);
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [zoomOpen, images.length]);

  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const thumbs =
    images.length > 1 ? (
      <div
        role="tablist"
        aria-label="Product photos"
        className="flex gap-2 overflow-x-auto pb-1 lg:max-h-[34rem] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0"
      >
        {images.map((src, i) => (
          <button
            key={src}
            role="tab"
            aria-selected={active === i}
            aria-label={`Photo ${i + 1} of ${images.length}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className={cn(
              "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-white p-0.5 transition-shadow lg:h-16 lg:w-16",
              active === i ? "border-accent-strong shadow-[0_0_0_2px_var(--color-accent-strong)]" : "border-border hover:border-ink/40"
            )}
          >
            <ProductImage src={src} category={product.category} alt={`${product.name} view ${i + 1}`} className="h-full w-full rounded-md" sizes="64px" fit="contain" />
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
      {thumbs && <div className="order-2 lg:order-1 lg:w-16 lg:shrink-0">{thumbs}</div>}

      <div className="order-1 min-w-0 flex-1 lg:order-2">
        <div className="relative">
          {product.badge && (
            <span className={cn("absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-semibold", badgeStyles[product.badge])}>
              {product.badge}
            </span>
          )}
          <button
            onClick={() => setZoomOpen(true)}
            aria-label="Open full-size image"
            onPointerMove={(e) => {
              if (e.pointerType !== "mouse") return;
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            onPointerLeave={() => setZoom(null)}
            className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl bg-surface shadow-md"
          >
            <div
              className="h-full w-full transition-transform duration-150 ease-out"
              style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : { transform: "scale(1)" }}
            >
              <ProductImage
                src={images[active]}
                category={product.category}
                alt={product.name}
                className="h-full w-full"
                iconClassName="h-28 w-28 sm:h-36 sm:w-36"
                sizes="(min-width: 1024px) 40vw, 90vw"
                priority
                fit="contain"
              />
            </div>
            <span className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-md">
              <ZoomIn className="h-4 w-4" />
            </span>
          </button>
        </div>
        <p className="mt-2 hidden text-center text-xs text-accent-strong lg:block">Hover to zoom · click to see full view</p>
      </div>

      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10"
          >
            <button
              aria-label="Close"
              onClick={() => setZoomOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
            >
              <X className="h-5 w-5" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive((i) => (i - 1 + images.length) % images.length);
                  }}
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive((i) => (i + 1) % images.length);
                  }}
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-full max-h-[85vh] w-full max-w-2xl"
            >
              <ProductImage src={images[active]} category={product.category} alt={product.name} className="h-full w-full rounded-2xl" sizes="90vw" fit="contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
