import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import AuthorPortrait from "@/components/AuthorPortrait";
import SubscribeInvite from "@/components/SubscribeInvite";
import { getLiveArticles } from "@/lib/articles";
import { isKitConfigured } from "@/lib/kit";
import { copy, site, themeToneClass, themes } from "@/lib/site";

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
      <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
        <AuthorPortrait size="home" />
        <p className="max-w-2xl text-base leading-relaxed text-pretty text-muted sm:text-lg">
          I’m {site.author}. I write as a fellow traveler, still learning. Not as an expert. If you
          are trying to live with more honesty, deeper service, and lasting value, you are welcome
          here.
        </p>
      </div>

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
                className={`theme-tile ${themeToneClass(theme.slug)} flex min-h-12 items-center rounded-md border px-3 py-3 pl-4 text-sm font-medium`}
              >
                {theme.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-14 text-base leading-relaxed text-pretty text-ink">
        Start here:{" "}
        {latest[0] ? (
          <Link href={`/articles/${latest[0].slug}`} className="text-link hover:underline">
            Read the latest article
          </Link>
        ) : (
          "Read the latest article"
        )}
        , or{" "}
        <a href="#weekly-list" className="text-link hover:underline">
          join the weekly list
        </a>
        .
      </p>

      <section className="mt-8" aria-labelledby="latest-heading">
        <h2 id="latest-heading" className="font-serif text-2xl font-semibold">
          Latest writing
        </h2>
        {latest.length === 0 ? (
          <p className="mt-4 text-muted">{copy.emptyArticles}</p>
        ) : (
          <div className="mt-6">
            {latest.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
        <p className="mt-4">
          <Link href="/articles" className="text-sm text-muted hover:text-ink">
            All writing
          </Link>
        </p>
      </section>

      <section className="mt-14" id="weekly-list" aria-label="Join the weekly list">
        <SubscribeInvite kitOpen={kitOpen} />
      </section>
    </main>
  );
}
