import { withOptionalColumns } from "@/lib/article-columns";
import { createAnonClient } from "@/lib/supabase-anon";
import { publicSupabaseUrl } from "@/lib/env";
import { readingMinutes } from "@/lib/read-time";
import { FLAGSHIP_SLUG, isThemeSlug, site, type ThemeSlug } from "@/lib/site";

export type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body_markdown: string;
  cover_image_path: string | null;
  theme: ThemeSlug;
  status: "draft" | "published";
  published_at: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
  next_step: string | null;
  next_step_slug: string | null;
  thumbnail_path: string | null;
};

export type PublicArticle = Article & {
  reading_minutes: number;
};

const articleColumns =
  "id, slug, title, excerpt, body_markdown, cover_image_path, theme, status, published_at, author_id, created_at, updated_at";

type DbError = { code?: string; message: string };

type ArticleRow = Omit<Article, "next_step" | "next_step_slug" | "thumbnail_path"> & {
  next_step?: string | null;
  next_step_slug?: string | null;
  thumbnail_path?: string | null;
};

let warnedMissingColumns = false;

function noteMissingColumns(dropped: string[]): void {
  if (warnedMissingColumns || dropped.length === 0) {
    return;
  }
  warnedMissingColumns = true;
  console.warn(
    `Article columns not in the database yet (${dropped.join(", ")}). The site is using its fallbacks.`,
  );
}

function asArticle(row: ArticleRow): Article {
  const nextStep = row.next_step?.trim() ?? "";
  const nextSlug = row.next_step_slug?.trim() ?? "";
  const thumbnail = row.thumbnail_path?.trim() ?? "";
  return {
    ...row,
    next_step: nextStep || null,
    next_step_slug: nextSlug || null,
    thumbnail_path: thumbnail || null,
  };
}

async function readRows(
  run: (columns: string) => PromiseLike<{ data: unknown; error: DbError | null }>,
): Promise<{ rows: Article[]; error: DbError | null }> {
  const { data, error, dropped } = await withOptionalColumns(articleColumns, run);
  noteMissingColumns(dropped);
  if (error || !Array.isArray(data)) {
    return { rows: [], error: error ? { code: error.code, message: error.message ?? "" } : null };
  }
  return { rows: (data as ArticleRow[]).map(asArticle), error: null };
}

async function readRow(
  run: (columns: string) => PromiseLike<{ data: unknown; error: DbError | null }>,
): Promise<{ row: Article | null; error: DbError | null }> {
  const { data, error, dropped } = await withOptionalColumns(articleColumns, run);
  noteMissingColumns(dropped);
  if (error || !data || Array.isArray(data)) {
    return { row: null, error: error ? { code: error.code, message: error.message ?? "" } : null };
  }
  return { row: asArticle(data as ArticleRow), error: null };
}

function nowIso(): string {
  return new Date().toISOString();
}

function coverUrl(path: string | null): string | null {
  if (!path) {
    return null;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = publicSupabaseUrl();
  if (!base) {
    return null;
  }
  return `${base}/storage/v1/object/public/covers/${path}`;
}

function withReading(article: Article): PublicArticle {
  return {
    ...article,
    cover_image_path: coverUrl(article.cover_image_path),
    thumbnail_path: coverUrl(article.thumbnail_path),
    reading_minutes: readingMinutes(article.body_markdown),
  };
}

/**
 * Image for the articles list and the home lead.
 * A saved thumbnail wins. The lead piece can also use its cover.
 * Every other piece stays text in the list until a thumbnail is set.
 */
export function articleThumbnail(article: PublicArticle): string | null {
  if (article.thumbnail_path) {
    return article.thumbnail_path;
  }
  if (article.slug === FLAGSHIP_SLUG) {
    return article.cover_image_path;
  }
  return null;
}

const SHARE_DESCRIPTION_LIMIT = 110;

function plainFromMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>]+/g, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstSentence(text: string): string {
  const match = text.match(/^(.+?[.!?])(\s|$)/);
  return match?.[1]?.trim() ?? text.trim();
}

function clipShareText(text: string, limit: number): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "";
  }
  if (cleaned.length <= limit) {
    return cleaned;
  }
  const slice = cleaned.slice(0, limit - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const clipped = (lastSpace > 40 ? slice.slice(0, lastSpace) : slice).replace(
    /[,:;.-]+$/u,
    "",
  );
  return `${clipped}.`;
}

/**
 * Short line for WhatsApp, LinkedIn, and Facebook. Never the home headline.
 */
export function articleShareDescription(article: PublicArticle): string {
  const excerpt = article.excerpt?.trim();
  if (excerpt) {
    return clipShareText(excerpt, SHARE_DESCRIPTION_LIMIT);
  }
  const fromBody = firstSentence(plainFromMarkdown(article.body_markdown));
  if (fromBody) {
    return clipShareText(fromBody, SHARE_DESCRIPTION_LIMIT);
  }
  return site.tagline;
}

/**
 * Public article loaders. Cookie-free anon client + live filter (Rules 1 and 3).
 */
export async function getLiveArticles(): Promise<PublicArticle[]> {
  const supabase = createAnonClient();
  if (!supabase) {
    return [];
  }

  const { rows, error } = await readRows((columns) =>
    supabase
      .from("articles")
      .select(columns)
      .eq("status", "published")
      .lte("published_at", nowIso())
      .order("published_at", { ascending: false }),
  );

  if (error) {
    console.error("Failed to load articles:", error.message);
    return [];
  }

  return rows.map(withReading);
}

/** The lead piece, or the latest published piece when that slug is not live. */
export function pickLeadArticle(articles: PublicArticle[]): PublicArticle | null {
  return articles.find((article) => article.slug === FLAGSHIP_SLUG) ?? articles[0] ?? null;
}

export async function getLiveArticleBySlug(
  slug: string,
): Promise<PublicArticle | null> {
  const supabase = createAnonClient();
  if (!supabase) {
    return null;
  }

  const { row, error } = await readRow((columns) =>
    supabase
      .from("articles")
      .select(columns)
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", nowIso())
      .maybeSingle(),
  );

  if (error) {
    console.error("Failed to load article:", error.message);
    return null;
  }

  return row ? withReading(row) : null;
}

export async function searchLiveArticles(
  query: string,
  theme?: string,
): Promise<PublicArticle[]> {
  const supabase = createAnonClient();
  if (!supabase) {
    return [];
  }

  const cleaned = query
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .slice(0, 120);

  const filters = (columns: string) => {
    let request = supabase
      .from("articles")
      .select(columns)
      .eq("status", "published")
      .lte("published_at", nowIso());

    if (theme && isThemeSlug(theme)) {
      request = request.eq("theme", theme);
    }

    if (cleaned) {
      request = request.textSearch("search_vector", cleaned, {
        type: "plain",
        config: "english",
      });
    }

    return request.order("published_at", { ascending: false });
  };

  const { rows, error } = await readRows(filters);

  if (error) {
    console.error("Search failed:", error.message);
    return [];
  }

  return rows.map(withReading);
}

export async function getContinueArticle(excludeSlug: string): Promise<PublicArticle | null> {
  const supabase = createAnonClient();
  if (!supabase) {
    return null;
  }

  const { row, error } = await readRow((columns) =>
    supabase
      .from("articles")
      .select(columns)
      .eq("status", "published")
      .lte("published_at", nowIso())
      .neq("slug", excludeSlug)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  );

  if (error) {
    console.error("Failed to load next article:", error.message);
    return null;
  }

  return row ? withReading(row) : null;
}

export async function getRelatedArticles(
  theme: ThemeSlug,
  excludeSlug: string,
): Promise<PublicArticle[]> {
  const supabase = createAnonClient();
  if (!supabase) {
    return [];
  }

  const { rows, error } = await readRows((columns) =>
    supabase
      .from("articles")
      .select(columns)
      .eq("theme", theme)
      .neq("slug", excludeSlug)
      .eq("status", "published")
      .lte("published_at", nowIso())
      .order("published_at", { ascending: false })
      .limit(3),
  );

  if (error) {
    return [];
  }

  return rows.map(withReading);
}

export async function getLiveSlugs(): Promise<string[]> {
  const supabase = createAnonClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "published")
    .lte("published_at", nowIso());

  if (error || !data) {
    return [];
  }

  return data.map((row: { slug: string }) => row.slug);
}
