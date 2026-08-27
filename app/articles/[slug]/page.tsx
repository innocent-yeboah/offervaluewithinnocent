import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarkdownBody from "@/components/MarkdownBody";
import SubscribeInvite from "@/components/SubscribeInvite";
import { getLiveArticleBySlug, getRelatedArticles } from "@/lib/articles";
import { formatArticleDate } from "@/lib/dates";
import { isKitConfigured } from "@/lib/kit";
import { copy, site, themeLabel } from "@/lib/site";
import Link from "next/link";

export const dynamic = "force-dynamic";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getLiveArticleBySlug(slug);
  if (!article) {
    return { title: "Let’s try that again together?" };
  }
  return {
    title: article.title,
    description: article.excerpt ?? site.headline,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getLiveArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const related = await getRelatedArticles(article.theme, article.slug);
  const kitOpen = isKitConfigured();
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(article.title)}`;

  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <p className="text-xs uppercase leading-relaxed tracking-wide text-muted">
        {themeLabel(article.theme)}
        <span className="mx-2" aria-hidden="true">
          ·
        </span>
        {article.published_at ? formatArticleDate(article.published_at) : ""}
        <span className="mx-2" aria-hidden="true">
          ·
        </span>
        {article.reading_minutes} min read
      </p>
      <h1 className="font-serif mt-3 text-[1.85rem] font-semibold leading-tight tracking-tight text-balance break-words sm:text-4xl">
        {article.title}
      </h1>
      {article.cover_image_path ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.cover_image_path}
          alt=""
          className="mt-8 h-auto w-full rounded-md"
        />
      ) : null}
      <div className="mt-10">
        <MarkdownBody markdown={article.body_markdown} />
      </div>

      <p className="mt-12 border-t border-line pt-8 text-muted">
        {copy.writeMe}{" "}
        <a className="break-all text-link underline-offset-4 hover:underline" href={mailto}>
          {site.email}
        </a>
      </p>

      {related.length > 0 ? (
        <section className="mt-10" aria-labelledby="related-heading">
          <h2 id="related-heading" className="font-serif text-xl font-semibold">
            More in {themeLabel(article.theme)}
          </h2>
          <ul className="mt-3 space-y-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`/articles/${item.slug}`} className="text-link hover:underline">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12">
        <SubscribeInvite kitOpen={kitOpen} />
      </section>
    </main>
  );
}
