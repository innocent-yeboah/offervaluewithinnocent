import Link from "next/link";
import { requireAuthor } from "@/lib/auth";
import { visibilityLabel } from "@/lib/dates";
import { themeLabel } from "@/lib/site";
import { signOutAction } from "@/app/admin/actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type AdminArticle = {
  id: number;
  title: string;
  slug: string;
  theme: string;
  status: "draft" | "published";
  published_at: string | null;
};

type ContactRow = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export default async function AdminHomePage() {
  const { supabase } = await requireAuthor();

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, theme, status, published_at")
    .order("updated_at", { ascending: false });

  const { data: messages } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  const list = (articles ?? []) as AdminArticle[];
  const notes = (messages ?? []) as ContactRow[];

  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-semibold">Writing</h1>
        <div className="flex gap-3">
          <Link href="/admin/articles/new" className="rounded-md bg-link px-3 py-2 text-sm text-paper">
            New piece
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="text-sm text-muted hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="mt-8 text-muted">No drafts yet. The first piece can begin here.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line">
          {list.map((article) => (
            <li key={article.id} className="flex items-baseline justify-between gap-4 py-4">
              <div>
                <Link href={`/admin/articles/${article.id}`} className="font-serif text-lg text-ink hover:text-link">
                  {article.title || "Untitled"}
                </Link>
                <p className="text-xs text-muted">
                  {visibilityLabel(article.status, article.published_at)}
                  <span className="mx-2" aria-hidden="true">
                    ·
                  </span>
                  {themeLabel(article.theme)}
                </p>
              </div>
              {visibilityLabel(article.status, article.published_at) === "Live" ? (
                <Link href={`/articles/${article.slug}`} className="text-xs text-muted hover:text-ink">
                  View live
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <section className="mt-16" aria-labelledby="messages-heading">
        <h2 id="messages-heading" className="font-serif text-2xl font-semibold">
          Messages
        </h2>
        {notes.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No contact notes yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {notes.map((note) => (
              <li key={note.id} className="rounded-md border border-line p-4 text-sm">
                <p className="font-medium">
                  {note.name}{" "}
                  <a className="text-link" href={`mailto:${note.email}`}>
                    {note.email}
                  </a>
                </p>
                <p className="mt-2 whitespace-pre-wrap text-muted">{note.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
