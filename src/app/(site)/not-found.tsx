import { NotFoundView } from "@/components/layout/NotFoundView";

// Catches notFound() calls thrown from inside storefront pages (e.g. a
// product slug that no longer exists) — inherits this group's layout, so
// the navbar/footer/etc. stay in place instead of a bare page.
export default function SiteNotFound() {
  return <NotFoundView />;
}
