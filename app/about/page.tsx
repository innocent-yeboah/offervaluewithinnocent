import type { Metadata } from "next";
import { copy, site, themes } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `A short stance from ${site.author}.`,
};

export default function AboutPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">About</h1>
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink">
        <p>I’m {site.author}. I write as a fellow traveler, not as someone who has arrived.</p>
        <p>
          I am learning, in public, how to offer value from the inside out — without hustling to
          prove worth. The writing stays with value, habits, relationships, awareness, money,
          purpose, focus, and service.
        </p>
        <ul className="grid grid-cols-2 gap-2 text-base text-muted sm:grid-cols-4">
          {themes.map((theme) => (
            <li key={theme.slug}>{theme.label}</li>
          ))}
        </ul>
        <p>
          If you are walking a similar path, you are welcome here. Join the weekly list, or write
          me at {site.email}.
        </p>
        <p className="text-muted">{copy.bookQuiet}</p>
      </div>
    </main>
  );
}
