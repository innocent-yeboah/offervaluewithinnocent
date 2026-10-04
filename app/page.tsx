import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleImage from "@/components/ArticleImage";
import ArticleMark from "@/components/ArticleMark";
import AuthorPortrait from "@/components/AuthorPortrait";
import SubscribeInvite from "@/components/SubscribeInvite";
import { articleThumbnail, getLiveArticles, pickLeadArticle } from "@/lib/articles";
import { isKitConfigured } from "@/lib/kit";
import { copy, FLAGSHIP_SLUG, site, themeLabel, themeToneClass, themes } from "@/lib/site";
import { formatArticleDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = await getLiveArticles();
  const lead = pickLeadArticle(articles);
  const leadIsFlagship = lead?.slug === FLAGSHIP_SLUG;
  const leadImage = lead ? articleThumbnail(lead) : null;
  const latest = articles.filter((article) => article.slug !== lead?.slug).slice(0, 3);
  const kitOpen = isKitConfigured();

  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-8 sm:py-12">
      <p className="max-w-2xl text-base leading-relaxed text-pretty text-ink sm:text-lg">{copy.homeFor}</p>
      <h1 className="font-serif mt-4 text-[1.75rem] font-semibold leading-tight tracking-tight text-balance text-ink sm:text-4xl">
        {copy.homePromise}
      </h1>

      <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
        <AuthorPortrait size="home" />
        <div className="max-w-xl">
          <p className="text-base leading-relaxed text-pretty text-muted">
            I’m {site.author}. {copy.homeIntro}
          </p>
          <div className="mt-5 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-5">
            {lead ? (
              <Link
                href={`/articles/${lead.slug}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-button px-4 text-sm font-medium text-paper"
              >
                {copy.readLead}
              </Link>
            ) : (
              <Link
                href="/articles"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-button px-4 text-sm font-medium text-paper"
              >
                {copy.readLead}
              </Link>
            )}
            <a
              href="#weekly-list"
              className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink"
            >
              {copy.joinWeekly}
            </a>
          </div>
        </div>
      </div>

      {lead ? (
        <section className="lead-piece mt-8 rounded-lg border border-line px-4 py-5 sm:mt-10 sm:px-6 sm:py-6" aria-labelledby="start-here-heading">
          <p className="text-sm uppercase tracking-[0.14em] text-gold-ink">{copy.startHere}</p>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
          {leadImage ? (
            <ArticleImage src={leadImage} alt={lead.title} priority variant="lead" />
          ) : (
            <ArticleMark title={lead.title} theme={lead.theme} variant="lead" />
          )}
          <div className="min-w-0 flex-1">
          <h2 id="start-here-heading" className="font-serif text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl">
            <Link href={`/articles/${lead.slug}`} className="text-ink hover:text-link">
              {lead.title}
            </Link>
          </h2>
          <p className="mt-2 text-xs uppercase leading-relaxed tracking-wide text-muted">
            <span className={`theme-mark ${themeToneClass(lead.theme)} inline-flex items-center gap-1.5`}>
              <span className="theme-dot" aria-hidden="true" />
              {themeLabel(lead.theme)}
            </span>
            {lead.published_at ? (
              <>
                <span className="mx-2" aria-hidden="true">
                  ·
                </span>
                {formatArticleDate(lead.published_at)}
              </>
            ) : null}
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            {lead.reading_minutes} min read
          </p>
          <p className="mt-4 text-base leading-relaxed text-pretty text-ink">
            {leadIsFlagship ? copy.flagshipFrame : copy.flagshipStandIn}
          </p>
          {lead.excerpt ? <p className="mt-3 leading-relaxed text-muted">{lead.excerpt}</p> : null}
          <p className="mt-4">
            <Link
              href={`/articles/${lead.slug}`}
              className="inline-flex min-h-11 items-center text-link underline-offset-4 hover:underline"
            >
              {copy.readThisPiece}
            </Link>
          </p>
          </div>
          </div>
        </section>
      ) : null}

      <section className="mt-12 sm:mt-14" aria-labelledby="themes-heading">
        <h2 id="themes-heading" className="font-serif text-2xl font-semibold">
          What I write about
        </h2>
        <p className="mt-2 text-sm text-muted">
          Eight parts of one journey, in this order. They describe the path, not a library that is
          already full.
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

      <section className="mt-12 sm:mt-14" aria-labelledby="latest-heading">
        <h2 id="latest-heading" className="font-serif text-2xl font-semibold">
          Latest writing
        </h2>
        {articles.length === 0 ? (
          <p className="mt-4 text-muted">{copy.emptyArticles}</p>
        ) : latest.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            <Link href="/articles" className="text-link hover:underline">
              All writing
            </Link>
          </p>
        ) : (
          <div className="mt-6">
            {latest.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
        {latest.length > 0 ? (
          <p className="mt-4">
            <Link href="/articles" className="text-sm text-muted hover:text-ink">
              All writing
            </Link>
          </p>
        ) : null}
      </section>

      <section className="mt-12 sm:mt-14" aria-labelledby="work-with-me-heading">
        <div className="rounded-lg border border-line px-4 py-5 sm:px-6 sm:py-6">
          <h2 id="work-with-me-heading" className="font-serif text-2xl font-semibold">
            Work with me
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-pretty text-muted">
            I also help African business owners, with a focus on Ghana, put a clearer system around
            how they win and serve customers.
          </p>
          <p className="mt-5">
            <Link
              href="/work-with-me"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-button px-4 text-sm font-medium text-paper"
            >
              See how to start
            </Link>
          </p>
        </div>
      </section>

      <section className="mt-12 scroll-mt-24 sm:mt-14" id="weekly-list" aria-label="Join the weekly list">
        <SubscribeInvite kitOpen={kitOpen} />
      </section>
    </main>
  );
}
