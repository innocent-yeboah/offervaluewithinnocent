import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";
import { requireAuthor } from "@/lib/auth";
import { withOptionalColumns } from "@/lib/article-columns";
import { isThemeSlug } from "@/lib/site";

export const metadata: Metadata = {
  title: "Edit piece",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditArticlePage({ params }: EditPageProps) {
  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isFinite(articleId)) {
    notFound();
  }

  const { supabase, user } = await requireAuthor();
  const baseColumns =
    "id, slug, title, excerpt, body_markdown, cover_image_path, theme, status, published_at";
  const loaded = await withOptionalColumns(baseColumns, (columns) =>
    supabase.from("articles").select(columns).eq("id", articleId).maybeSingle(),
  );
  const data = loaded.data as {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    body_markdown: string;
    cover_image_path: string | null;
    theme: string;
    status: string;
    published_at: string | null;
    next_step?: string | null;
    next_step_slug?: string | null;
    thumbnail_path?: string | null;
  } | null;
  const nextStepReady = !loaded.dropped.includes("next_step");
  const thumbnailReady = !loaded.dropped.includes("thumbnail_path");

  if (!data || !isThemeSlug(data.theme)) {
    notFound();
  }

  return (
    <main id="main" className="site-pad mx-auto max-w-5xl py-10 sm:py-16">
      <h1 className="font-serif text-3xl font-semibold">Edit piece</h1>
      <div className="mt-8">
        <ArticleEditor
          authorId={user.id}
          article={{
            id: data.id as number,
            slug: data.slug as string,
            title: data.title as string,
            excerpt: (data.excerpt as string | null) ?? "",
            body_markdown: data.body_markdown as string,
            cover_image_path: data.cover_image_path as string | null,
            theme: data.theme,
            status: data.status as "draft" | "published",
            published_at: data.published_at as string | null,
            next_step: (data.next_step as string | null) ?? "",
            next_step_slug: (data.next_step_slug as string | null) ?? "",
            thumbnail_path: (data.thumbnail_path as string | null) ?? "",
          }}
          nextStepReady={nextStepReady}
          thumbnailReady={thumbnailReady}
        />
      </div>
    </main>
  );
}
