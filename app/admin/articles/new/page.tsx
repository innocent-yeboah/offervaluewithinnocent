import type { Metadata } from "next";
import ArticleEditor from "@/components/admin/ArticleEditor";
import { requireAuthor } from "@/lib/auth";

export const metadata: Metadata = {
  title: "New piece",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const { user } = await requireAuthor();

  return (
    <main id="main" className="site-pad mx-auto max-w-5xl py-10 sm:py-16">
      <h1 className="font-serif text-3xl font-semibold">New piece</h1>
      <div className="mt-8">
        <ArticleEditor authorId={user.id} />
      </div>
    </main>
  );
}
