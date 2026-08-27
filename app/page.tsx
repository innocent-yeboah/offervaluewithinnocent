import Link from "next/link";
import SubscribeInvite from "@/components/SubscribeInvite";
import { getLiveArticles } from "@/lib/articles";
import { isKitConfigured } from "@/lib/kit";
import { copy, site, themes } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = await getLiveArticles();
  const latest = articles.slice(0, 3);
  const kitOpen = isKitConfigured();

  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <p className="text-sm uppercase tracking-[0.14em] text-gold">{copy.weeklyPromise}</p>
      <h1 className="font-serif mt-4 text-[1.85rem] font-semibold leading-tight tracking-tight text-balance text-ink sm:text-4xl lg:text-5xl">
        {site.headline}
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-pretty text-muted sm:text-lg">
        I’m {site.author}. I write as a fellow traveler — still learning how to live with value,
        honesty, and service. If that is your path too, you are welcome here.
      </p>

      <section className="mt-14" aria-labelledby="themes-heading">
        <h2 id="themes-heading" className="font-serif text-2xl font-semibold">
          What I write about
        </h2>
        <p className="mt-2 text-sm text-muted">
          Eight parts of one journey. They describe the path, not a library that is already full.
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {themes.map((theme) => (
            <li key={theme.slug}>
              <Link
                href={`/articles?theme=${theme.slug}`}
                className="flex min-h-12 items-center rounded-md border border-line px-3 py-3 text-sm text-ink hover:border-gold"
              >
                {theme.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="latest-heading">
        <h2 id="latest-heading" className="font-serif text-2xl font-semibold">
          Latest writing
        </h2>
        {latest.length === 0 ? (
          <p className="mt-4 text-muted">{copy.emptyArticles}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {latest.map((article) => (
              <li key={article.slug}>
                <Link href={`/articles/${article.slug}`} className="text-link hover:underline">
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4">
          <Link href="/articles" className="text-sm text-muted hover:text-ink">
            All writing
          </Link>
        </p>
      </section>

      <section className="mt-14">
        <SubscribeInvite kitOpen={kitOpen} />
      </section>
    </main>
  );
}
