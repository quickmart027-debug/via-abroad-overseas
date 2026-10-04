"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { primaryNav, primaryCta } from "@/data/navigation";
import { business, callHref } from "@/lib/config";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const mobileMenuButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  React.useEffect(() => {
    // Close the mobile sheet whenever the route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  React.useEffect(() => {
    if (!mobileOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      mobileMenuButtonRef.current?.focus();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  const isTransparent = isHome && !scrolled && !mobileOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        isTransparent
          ? "bg-transparent"
          : "bg-navy-900/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.2)]"
      )}
    >
      <div className="container-outer flex h-18 items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/60 text-sm font-bold text-gold-300"
            aria-hidden="true"
          >
            V
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-white">
              VIA ABROAD <span className="text-gold-400">OVERSEAS</span>
            </span>
            <span className="hidden text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold-300/70 sm:block">
              Make The Move
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex xl:gap-1">
          {primaryNav.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-medium text-white/85 transition-colors hover:text-white xl:px-4",
                  active && "font-semibold text-white"
                )}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gold-400"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={callHref}
            className="hidden items-center gap-2 whitespace-nowrap text-sm font-medium text-white/80 transition-colors hover:text-white xl:flex"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {business.phoneDisplay}
          </a>
          <Button asChild size="default" className="whitespace-nowrap">
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {/* Phones use the bottom action bar for this; avoid a second gold CTA. */}
          <Button asChild size="sm" className="hidden px-4 md:inline-flex">
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
          <button
            ref={mobileMenuButtonRef}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-white"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-sheet"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

        {mobileOpen && (
          <div
            id="mobile-nav-sheet"
            className="sheet-in max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-white/10 bg-navy-900 shadow-xl lg:hidden"
          >
            <nav aria-label="Mobile" className="container-outer flex flex-col gap-1 py-4">
              {primaryNav.map((link) => {
                const active =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center rounded-xl px-4 text-base font-medium text-white/90",
                      active && "bg-white/10 font-semibold text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-2 flex flex-col gap-3 border-t border-white/10 pt-4">
                <a
                  href={callHref}
                  className="flex min-h-12 items-center gap-2 rounded-xl px-4 text-base font-medium text-white/90"
                >
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  Call {business.phoneDisplay}
                </a>
                <Button asChild size="lg" className="w-full">
                  <Link href={primaryCta.href}>{primaryCta.label}</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
    </header>
  );
}
