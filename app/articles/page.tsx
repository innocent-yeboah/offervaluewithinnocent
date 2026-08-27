import type { Metadata } from "next";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import { searchLiveArticles } from "@/lib/articles";
import { copy, isThemeSlug, themes } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Articles",
  description: "Weekly writing on value, habits, relationships, and service.",
};

type ArticlesPageProps = {
  searchParams: Promise<{ theme?: string; q?: string }>;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams;
  const theme = params.theme && isThemeSlug(params.theme) ? params.theme : undefined;
  const q = params.q?.trim() ?? "";
  const articles = await searchLiveArticles(q, theme);

  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <h1 className="font-serif text-[1.85rem] font-semibold tracking-tight text-balance sm:text-4xl">
        Articles
      </h1>
      <p className="mt-3 text-muted">{copy.weeklyPromise}</p>

      <form className="mt-8 flex flex-col gap-3 sm:flex-row" method="get" action="/articles">
        <label className="sr-only" htmlFor="q">
          Search writing
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Search titles and writing"
          className="min-h-11 flex-1 rounded-md border border-line bg-paper px-3 py-2 text-base text-ink"
        />
        {theme ? <input type="hidden" name="theme" value={theme} /> : null}
        <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-4 text-sm">
          Search
        </button>
      </form>

      <ul className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden" aria-label="Themes">
        <li className="shrink-0">
          <Link
            href="/articles"
            className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-xs ${!theme ? "border-ink text-ink" : "border-line text-muted"}`}
          >
            All
          </Link>
        </li>
        {themes.map((item) => (
          <li key={item.slug} className="shrink-0">
            <Link
              href={`/articles?theme=${item.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-xs ${theme === item.slug ? "border-ink text-ink" : "border-line text-muted"}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        {articles.length === 0 ? (
          <p className="text-muted">
            {q || theme
              ? "Nothing here matches that yet. The writing is still beginning."
              : copy.emptyArticles}
          </p>
        ) : (
          articles.map((article) => <ArticleCard key={article.slug} article={article} />)
        )}
      </div>
    </main>
  );
}
