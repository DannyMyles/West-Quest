import { PackageX } from "lucide-react";
import { AnimatedLinkButton } from "@/components/ui/AnimatedButton";

/** Shared "page not found" content, used by both the root not-found.tsx
 *  (completely unmatched URLs) and the (site) one (a notFound() call from
 *  inside a storefront page, e.g. a bad product slug) — so a 404 never
 *  loses the navbar/footer the rest of the site always has. */
export function NotFoundView() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
        <PackageX className="h-8 w-8 text-muted" />
      </div>
      <h1 className="text-xl font-semibold text-ink">Page not found</h1>
      <p className="text-sm text-muted">The page or device you&apos;re looking for doesn&apos;t exist or may have been moved.</p>
      <AnimatedLinkButton href="/catalogue" variant="primary" className="mt-2">
        Browse Devices
      </AnimatedLinkButton>
    </div>
  );
}
