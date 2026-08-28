import { createAnonClient } from "@/lib/supabase-anon";
import { publicSupabaseUrl } from "@/lib/env";
import { isThemeSlug, site, type ThemeSlug } from "@/lib/site";
import { readingMinutes } from "@/lib/read-time";

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
};

export type PublicArticle = Article & {
  reading_minutes: number;
};

const publicSelect =
  "id, slug, title, excerpt, body_markdown, cover_image_path, theme, status, published_at, author_id, created_at, updated_at";

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
    reading_minutes: readingMinutes(article.body_markdown),
  };
}

export function articleShareDescription(article: PublicArticle): string {
  const excerpt = article.excerpt?.trim();
  return excerpt || site.headline;
}

/**
 * Public article loaders. Cookie-free anon client + live filter (Rules 1 and 3).
 */
export async function getLiveArticles(): Promise<PublicArticle[]> {
  const supabase = createAnonClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("articles")
    .select(publicSelect)
    .eq("status", "published")
    .lte("published_at", nowIso())
    .order("published_at", { ascending: false });

  if (error || !data) {
    if (error) {
      console.error("Failed to load articles:", error.message);
    }
    return [];
  }

  return (data as Article[]).map(withReading);
}

export async function getLiveArticleBySlug(
  slug: string,
): Promise<PublicArticle | null> {
  const supabase = createAnonClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("articles")
    .select(publicSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", nowIso())
    .maybeSingle();

  if (error) {
    console.error("Failed to load article:", error.message);
    return null;
  }

  return data ? withReading(data as Article) : null;
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

  let request = supabase
    .from("articles")
    .select(publicSelect)
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

  const { data, error } = await request.order("published_at", { ascending: false });

  if (error || !data) {
    if (error) {
      console.error("Search failed:", error.message);
    }
    return [];
  }

  return (data as Article[]).map(withReading);
}

export async function getContinueArticle(excludeSlug: string): Promise<PublicArticle | null> {
  const supabase = createAnonClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("articles")
    .select(publicSelect)
    .eq("status", "published")
    .lte("published_at", nowIso())
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load next article:", error.message);
    return null;
  }

  return data ? withReading(data as Article) : null;
}

export async function getRelatedArticles(
  theme: ThemeSlug,
  excludeSlug: string,
): Promise<PublicArticle[]> {
  const supabase = createAnonClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("articles")
    .select(publicSelect)
    .eq("theme", theme)
    .neq("slug", excludeSlug)
    .eq("status", "published")
    .lte("published_at", nowIso())
    .order("published_at", { ascending: false })
    .limit(3);

  if (error || !data) {
    return [];
  }

  return (data as Article[]).map(withReading);
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
