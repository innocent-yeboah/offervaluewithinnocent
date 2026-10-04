import Link from "next/link";
import { navLinks, site, themeToneClass, themes, whatsappHref } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="mt-12 sm:mt-16">
      <div className="flex h-1.5 w-full overflow-hidden" aria-hidden="true">
        {themes.map((theme) => (
          <span
            key={theme.slug}
            className={`footer-band ${themeToneClass(theme.slug)} block min-h-full flex-1`}
          />
        ))}
      </div>
      <div className="site-footer border-t border-line">
        <div className="site-pad mx-auto flex max-w-3xl flex-col gap-8 py-8 text-sm text-muted sm:py-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex shrink-0 flex-col gap-2">
            <p className="flex items-center gap-2 font-serif text-base text-ink">
              <span className="theme-dot theme-value" aria-hidden="true" />
              {site.author}
            </p>
            <a
              className="text-link underline-offset-4 hover:underline"
              href={`mailto:${site.email}`}
            >
              {site.email}
            </a>
            <a
              className="w-fit text-link underline-offset-4 hover:underline"
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp {site.whatsappDisplay}
            </a>
            <a
              className="w-fit text-link underline-offset-4 hover:underline"
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-1" aria-label="Footer">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center hover:text-ink">
                {link.label}
              </Link>
            ))}
            <Link href="/saved" className="inline-flex min-h-11 items-center hover:text-ink">
              Saved
            </Link>
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-ink">
              Privacy
            </Link>
            <Link href="/feed.xml" className="inline-flex min-h-11 items-center hover:text-ink">
              RSS
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
