import type { Metadata } from "next";
import Link from "next/link";
import AuthorPortrait from "@/components/AuthorPortrait";
import { getLiveArticles } from "@/lib/articles";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "A fellow traveler, still learning",
  description:
    "I’m Innocent Golden. This is not a story of arrival. It is a story of becoming, and I am still in the middle of it.",
};

export const dynamic = "force-dynamic";

const learnings = [
  "That money flows through relationship, not through force.",
  "That habits are built in the quiet moments, not the grand ones.",
  "That service comes before selling, and always will.",
  "That the person I am becoming matters more than the things I am building.",
] as const;

export default async function AboutPage() {
  const latest = (await getLiveArticles())[0];

  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <h1 className="font-serif text-[1.85rem] font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
        A fellow traveler, still learning
      </h1>

      <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
        <AuthorPortrait size="about" />
        <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">I’m {site.author}.</p>
      </div>

      <div className="mt-10 space-y-5 text-base leading-relaxed text-pretty text-ink sm:text-lg">
        <p>This is not a story of arrival. It is a story of becoming, and I am still in the middle of it.</p>
        <p>
          I have not always known how to offer value. I have spent years chasing things that did not
          satisfy, building things that did not last, and wondering why effort did not always lead to
          reward. I have felt the weight of wanting to matter, to provide, to become someone worth
          trusting, without knowing how to get there.
        </p>
        <p>Through that journey, I have learned a few things worth sharing:</p>
        <ul className="space-y-3 border-l-2 border-gold/60 pl-5">
          {learnings.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p>
          This site is where I write about what I am learning. Not as an expert. As a fellow traveler.
          If you are also trying to live with more honesty, deeper service, and lasting value, then you
          are welcome here.
        </p>
        <p>Each week, I share a new piece of the journey.</p>
        <p>
          You can{" "}
          {latest ? (
            <Link href={`/articles/${latest.slug}`} className="text-link underline-offset-4 hover:underline">
              read the latest writing
            </Link>
          ) : (
            <Link href="/articles" className="text-link underline-offset-4 hover:underline">
              read the latest writing
            </Link>
          )}
          , or{" "}
          <Link href="/newsletter" className="text-link underline-offset-4 hover:underline">
            join the weekly list
          </Link>{" "}
          to receive each new post in your inbox.
        </p>
        <p className="font-serif text-xl text-ink sm:text-2xl">Welcome. You belong here.</p>
      </div>
    </main>
  );
}
