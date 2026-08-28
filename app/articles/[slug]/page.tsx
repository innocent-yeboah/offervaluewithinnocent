import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import MarkdownBody from "@/components/MarkdownBody";
import ArticleActions from "@/components/ArticleActions";
import SubscribeInvite from "@/components/SubscribeInvite";
import ArticleThoughts from "@/components/ArticleThoughts";
import {
  articleShareDescription,
  getContinueArticle,
  getLiveArticleBySlug,
  getRelatedArticles,
} from "@/lib/articles";
import { formatArticleDate } from "@/lib/dates";
import { isKitConfigured } from "@/lib/kit";
import { copy, site, themeLabel, themeToneClass } from "@/lib/site";
import { getPublishedThoughts } from "@/lib/thoughts";
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
  const description = articleShareDescription(article);
  const url = `${site.url}/articles/${article.slug}`;
  const shareImage = article.cover_image_path
    ? { url: article.cover_image_path, alt: article.title }
    : {
        url: `/articles/${article.slug}/opengraph-image`,
        alt: article.title,
        width: 1200,
        height: 630,
      };

  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url,
      siteName: site.name,
      locale: "en",
      publishedTime: article.published_at ?? undefined,
      authors: [site.author],
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [shareImage.url],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getLiveArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const related = await getRelatedArticles(article.theme, article.slug);
  const nextPiece = await getContinueArticle(article.slug);
  const thoughts = await getPublishedThoughts(article.id);
  const moreInTheme = nextPiece
    ? related.filter((item) => item.slug !== nextPiece.slug)
    : related;
  const kitOpen = isKitConfigured();

  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
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
      <h1 className="font-serif mt-3 text-[1.85rem] font-semibold leading-tight tracking-tight text-balance break-words sm:text-4xl">
        {article.title}
      </h1>
      {article.cover_image_path ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.cover_image_path}
          alt={article.title}
          className="mt-8 h-auto w-full rounded-md"
        />
      ) : null}
      <div className="mt-10">
        <MarkdownBody markdown={article.body_markdown} />
      </div>

      <ArticleActions
        slug={article.slug}
        title={article.title}
        text={articleShareDescription(article)}
      />

      <ArticleThoughts slug={article.slug} thoughts={thoughts} />

      {nextPiece ? (
        <section className="mt-12" aria-labelledby="continue-heading">
          <h2 id="continue-heading" className="font-serif text-xl font-semibold">
            {copy.continueWith}
          </h2>
          <div className="mt-4">
            <ArticleCard article={nextPiece} />
          </div>
        </section>
      ) : null}

      {moreInTheme.length > 0 ? (
        <section className="mt-10" aria-labelledby="related-heading">
          <h2 id="related-heading" className="font-serif text-xl font-semibold">
            More in {themeLabel(article.theme)}
          </h2>
          <ul className="mt-3 space-y-2">
            {moreInTheme.map((item) => (
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
