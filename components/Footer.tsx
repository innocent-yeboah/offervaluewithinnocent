import Link from "next/link";
import { site } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line mt-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          {site.author}
          <span className="mx-2" aria-hidden="true">
            ·
          </span>
          <a className="text-link underline-offset-4 hover:underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </p>
        <p className="flex gap-4">
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <Link href="/feed.xml" className="hover:text-ink">
            RSS
          </Link>
        </p>
      </div>
    </footer>
  );
}
