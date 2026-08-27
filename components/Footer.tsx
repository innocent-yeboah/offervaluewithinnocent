import Link from "next/link";
import { site } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-line sm:mt-16">
      <div className="site-pad mx-auto flex max-w-3xl flex-col gap-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:py-10">
        <p className="leading-relaxed">
          {site.author}
          <span className="mx-2" aria-hidden="true">
            ·
          </span>
          <a
            className="break-all text-link underline-offset-4 hover:underline"
            href={`mailto:${site.email}`}
          >
            {site.email}
          </a>
        </p>
        <p className="flex gap-6">
          <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-ink">
            Privacy
          </Link>
          <Link href="/feed.xml" className="inline-flex min-h-11 items-center hover:text-ink">
            RSS
          </Link>
        </p>
      </div>
    </footer>
  );
}
