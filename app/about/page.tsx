import type { Metadata } from "next";
import Link from "next/link";
import { copy, site, themeToneClass, themes } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `A short stance from ${site.author}.`,
};

export default function AboutPage() {
  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <h1 className="font-serif text-[1.85rem] font-semibold tracking-tight sm:text-4xl">About</h1>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-pretty text-ink sm:text-lg">
        <p>I’m {site.author}. I write as a fellow traveler, not as someone who has arrived.</p>
        <p>
          I am learning, in public, how to offer value from the inside out — without hustling to
          prove worth. The writing stays with value, habits, relationships, awareness, money,
          purpose, focus, and service.
        </p>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {themes.map((theme) => (
            <li key={theme.slug}>
              <Link
                href={`/articles?theme=${theme.slug}`}
                className={`theme-chip ${themeToneClass(theme.slug)} inline-flex min-h-9 w-full items-center justify-center rounded-md border px-2 py-2 text-sm`}
              >
                {theme.label}
              </Link>
            </li>
          ))}
        </ul>
        <p>
          If you are walking a similar path, you are welcome here. Join the weekly list, or write
          me at <span className="break-all">{site.email}</span>.
        </p>
        <p className="text-muted">{copy.bookQuiet}</p>
      </div>
    </main>
  );
}
