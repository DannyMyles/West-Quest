"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { SearchCommand } from "./SearchCommand";
import { AccountButton, CartButton } from "./HeaderActions";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/cn";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { categories } = useCategories();
  const pathname = usePathname();
  const menuRef = useFocusTrap<HTMLDivElement>(mobileOpen, () => setMobileOpen(false));
  const searchRef = useFocusTrap<HTMLDivElement>(searchOpen, () => setSearchOpen(false));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Close overlays after a route change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [searchOpen]);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 bg-background/90 backdrop-blur-lg transition-shadow",
          scrolled && "shadow-md"
        )}
      >
        <div className="section flex h-16 items-center gap-4 lg:h-[72px]">
          <Link href="/" aria-label="West Quest Limited — home" className="shrink-0">
            <BrandLogo />
          </Link>

          <div className="hidden min-w-0 flex-1 lg:block">
            <SearchCommand />
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            <div
              className="relative py-4"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                className={cn(
                  "flex items-center gap-1 text-sm font-semibold transition-colors",
                  categoriesOpen ? "text-brand" : "text-ink/75 hover:text-ink"
                )}
                aria-expanded={categoriesOpen}
              >
                Categories
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", categoriesOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full w-64 pt-2"
                  >
                    <div className="rounded-2xl overflow-hidden bg-surface p-2 shadow-xl">
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/catalogue?category=${c.slug}`}
                          className="block rounded-lg px-3 py-2 text-sm text-ink/80 transition-colors hover:bg-surface-muted hover:text-brand"
                        >
                          {c.name}
                        </Link>
                      ))}
                      <Link
                        href="/catalogue"
                        className="mt-1 block rounded-lg border-t border-border px-3 py-2 pt-3 text-sm font-semibold text-brand hover:bg-surface-muted"
                      >
                        View all devices →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/account"
              className={cn(
                "text-sm font-semibold transition-colors",
                isActive("/account") ? "text-brand" : "text-ink/75 hover:text-ink"
              )}
            >
              My orders
            </Link>

            <Link
              href="/contact"
              className={cn(
                "text-sm font-semibold transition-colors",
                isActive("/contact") ? "text-brand" : "text-ink/75 hover:text-ink"
              )}
            >
              Contact
            </Link>

            <AccountButton />
            <CartButton />
          </nav>

          {/* Mobile actions */}
          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 hover:bg-surface-muted"
            >
              <Search className="h-5 w-5" />
            </button>
            <AccountButton compact />
            <CartButton compact />
            <button
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 hover:bg-surface-muted"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {categories.length > 0 && (
          <nav aria-label="Categories" className="hidden lg:block">
            <div className="section flex h-10 items-center gap-6 overflow-x-auto text-[13px] font-medium text-ink/65">
              {categories.map((c) => {
                const href = `/catalogue?category=${c.slug}`;
                return (
                  <Link key={c.slug} href={href} className="shrink-0 transition-colors hover:text-brand">
                    {c.name}
                  </Link>
                );
              })}
              <span aria-hidden className="h-px flex-1 border-t border-dashed border-border-strong" />
              <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">Deposit + daily · 6/9/12 months</span>
            </div>
          </nav>
        )}
      </header>

      {/* Mobile full-screen search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            ref={searchRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[70] overflow-y-auto bg-background px-4 pb-6 pt-3 lg:hidden"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-xl font-medium text-ink">Search</span>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 hover:bg-surface-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SearchCommand variant="sheet" autoFocus onDone={() => setSearchOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile slide-over menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              ref={menuRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed right-0 top-0 z-[60] flex h-full w-[86%] max-w-sm flex-col bg-surface shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <BrandLogo />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-surface-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <Link href="/catalogue" className="block rounded-xl bg-brand-050 px-4 py-3 text-sm font-semibold text-brand">
                  Browse all devices
                </Link>
                <p className="mb-2 mt-5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Categories</p>
                <div className="flex flex-col">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/catalogue?category=${c.slug}`}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-surface-muted hover:text-brand"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
                <div className="mt-5 border-t border-border pt-4">
                  <Link href="/account" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-surface-muted">
                    My orders
                  </Link>
                  <Link href="/contact" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-surface-muted">
                    Contact
                  </Link>
                  <Link href="/about" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-surface-muted">
                    About Us
                  </Link>
                  <Link href="/faqs" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-surface-muted">
                    How it works &amp; FAQs
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
