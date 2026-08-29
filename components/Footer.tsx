import Link from "next/link";
import { site, themeToneClass, themes } from "@/lib/site";

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
        <div className="site-pad mx-auto flex max-w-3xl flex-col gap-6 py-8 text-sm text-muted sm:flex-row sm:items-end sm:justify-between sm:py-10">
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-2 font-serif text-base text-ink">
              <span className="theme-dot theme-value" aria-hidden="true" />
              {site.author}
            </p>
            <a
              className="break-all text-link underline-offset-4 hover:underline"
              href={`mailto:${site.email}`}
            >
              {site.email}
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
