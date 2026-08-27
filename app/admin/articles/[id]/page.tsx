import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";
import { requireAuthor } from "@/lib/auth";
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
  const { data } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, body_markdown, cover_image_path, theme, status, published_at")
    .eq("id", articleId)
    .maybeSingle();

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
          }}
        />
      </div>
    </main>
  );
}
