import Link from "next/link";
import { formatArticleDate } from "@/lib/dates";
import { themeLabel, themeToneClass } from "@/lib/site";
import type { PublicArticle } from "@/lib/articles";

export default function ArticleCard({ article }: { article: PublicArticle }) {
  return (
    <article className="border-b border-line py-6 first:pt-0">
      <p className="text-xs uppercase leading-relaxed tracking-wide text-muted">
        <span className={`theme-mark ${themeToneClass(article.theme)} inline-flex items-center gap-1.5`}>
          <span className="theme-dot" aria-hidden="true" />
          {themeLabel(article.theme)}
        </span>
        <span className="mx-2" aria-hidden="true">
          ·
        </span>
        {article.published_at ? formatArticleDate(article.published_at) : ""}
        <span className="mx-2" aria-hidden="true">
          ·
        </span>
        {article.reading_minutes} min read
      </p>
      <h2 className="font-serif mt-1 text-xl font-semibold tracking-tight text-balance break-words sm:text-2xl">
        <Link href={`/articles/${article.slug}`} className="text-ink hover:text-link">
          {article.title}
        </Link>
      </h2>
      {article.excerpt ? <p className="mt-2 text-muted">{article.excerpt}</p> : null}
    </article>
  );
}
