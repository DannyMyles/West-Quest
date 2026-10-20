"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Package, Tags, GalleryHorizontal, FileText, Star, UserCog, LogOut, ShoppingBag } from "lucide-react";
import { adminLogout } from "@/lib/api/auth";
import { clearAdminSession } from "@/lib/adminSession";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/banners", label: "Banners", icon: GalleryHorizontal },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/orders", label: "Cash orders", icon: ShoppingBag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/account", label: "Account", icon: UserCog },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status, retry } = useAdminAuth();

  async function handleSignOut() {
    try {
      await adminLogout();
    } catch {
      // Session may already be gone; clearing the marker is what matters.
    }
    clearAdminSession();
    router.push("/admin/login");
  }

  if (pathname === "/admin/login") return <>{children}</>;

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Loading…</div>;
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium text-ink">Couldn&apos;t verify your access just now.</p>
        <p className="max-w-xs text-xs text-muted">This is usually a network blip, not a permissions problem. Your sign-in is still active.</p>
        <button onClick={retry} className="btn-primary mt-1">
          Try again
        </button>
      </div>
    );
  }

  if (status === "signed-out") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium text-ink">Please sign in to continue.</p>
        <Link href="/admin/login" className="rounded-full bg-panel-dark px-5 py-2 text-sm font-medium text-white">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-muted print:bg-white">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-white sm:flex print:hidden">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-display text-sm font-semibold text-white">WQ</span>
          <span className="text-sm font-semibold text-ink">Admin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === item.href ? "bg-brand/10 text-brand" : "text-ink/70 hover:bg-surface-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <p className="truncate px-3 pb-2 text-xs text-muted">{user?.email}</p>
          <button onClick={handleSignOut} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink/70 hover:bg-surface-muted">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3 sm:hidden print:hidden">
          <span className="text-sm font-semibold text-ink">West Quest Admin</span>
          <button onClick={handleSignOut} className="text-sm text-muted">
            Sign out
          </button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-white px-3 py-2 sm:hidden print:hidden">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${pathname === item.href ? "bg-brand text-white" : "bg-surface-muted text-ink/70"}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="p-4 sm:p-8 print:p-0">{children}</main>
      </div>
    </div>
  );
}
