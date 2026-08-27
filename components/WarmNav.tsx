"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks, site } from "@/lib/site";
import ThemeToggle from "@/components/ThemeToggle";

export default function WarmNav() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
        <Link
          href="/"
          className="font-serif text-lg font-semibold tracking-tight text-ink no-underline sm:text-xl"
        >
          {site.name}
        </Link>
        {isAdmin ? (
          <nav className="flex items-center gap-4 text-sm" aria-label="Admin">
            <Link href="/admin" className="text-muted hover:text-ink">
              Writing
            </Link>
            <Link href="/" className="text-muted hover:text-ink">
              Public site
            </Link>
            <ThemeToggle />
          </nav>
        ) : (
          <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm" aria-label="Main">
            {navLinks
              .filter((link) => link.href !== "/")
              .map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={active ? "text-ink" : "text-muted hover:text-ink"}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            <ThemeToggle />
          </nav>
        )}
      </div>
    </header>
  );
}
