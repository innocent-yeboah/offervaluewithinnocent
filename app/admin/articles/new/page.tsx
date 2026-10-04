import type { Metadata } from "next";
import ArticleEditor from "@/components/admin/ArticleEditor";
import { requireAuthor } from "@/lib/auth";
import { withOptionalColumns } from "@/lib/article-columns";

export const metadata: Metadata = {
  title: "New piece",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const { supabase, user } = await requireAuthor();
  const probe = await withOptionalColumns("id", (columns) =>
    supabase.from("articles").select(columns).limit(1),
  );
  const nextStepReady = !probe.dropped.includes("next_step");
  const thumbnailReady = !probe.dropped.includes("thumbnail_path");

  return (
    <main id="main" className="site-pad mx-auto max-w-5xl py-10 sm:py-16">
      <h1 className="font-serif text-3xl font-semibold">New piece</h1>
      <div className="mt-8">
        <ArticleEditor authorId={user.id} nextStepReady={nextStepReady} thumbnailReady={thumbnailReady} />
      </div>
    </main>
  );
}
