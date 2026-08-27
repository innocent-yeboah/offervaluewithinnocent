"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { navLinks, site } from "@/lib/site";
import ThemeToggle from "@/components/ThemeToggle";

export default function WarmNav() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const publicLinks = navLinks.filter((link) => link.href !== "/");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="site-pad mx-auto flex max-w-3xl items-center justify-between gap-3 py-3 sm:py-4">
        <Link
          href="/"
          className="min-w-0 font-serif text-base font-semibold leading-snug tracking-tight text-ink no-underline sm:text-xl"
        >
          {site.name}
        </Link>
        {isAdmin ? (
          <nav className="flex shrink-0 items-center gap-3 text-sm sm:gap-4" aria-label="Admin">
            <Link href="/admin" className="inline-flex min-h-11 items-center text-muted hover:text-ink">
              Writing
            </Link>
            <Link href="/" className="inline-flex min-h-11 items-center text-muted hover:text-ink">
              Site
            </Link>
            <ThemeToggle />
          </nav>
        ) : (
          <>
            <nav className="hidden items-center gap-5 text-sm md:flex" aria-label="Main">
              {publicLinks.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex min-h-11 items-center ${active ? "text-ink" : "text-muted hover:text-ink"}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <ThemeToggle />
            </nav>
            <div className="flex shrink-0 items-center gap-1 md:hidden">
              <ThemeToggle />
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-ink"
                aria-expanded={open}
                aria-controls={menuId}
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((current) => !current)}
              >
                <span className="flex w-5 flex-col gap-[5px]" aria-hidden="true">
                  <span className={`h-0.5 w-full bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
                  <span className={`h-0.5 w-full bg-ink ${open ? "opacity-0" : ""}`} />
                  <span className={`h-0.5 w-full bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
                </span>
              </button>
            </div>
          </>
        )}
      </div>
      {open && !isAdmin ? (
        <nav id={menuId} className="border-t border-line md:hidden" aria-label="Main">
          <ul className="site-pad mx-auto flex max-w-3xl flex-col py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {publicLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex min-h-12 items-center text-base ${active ? "text-ink" : "text-muted"}`}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
