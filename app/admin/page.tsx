import Link from "next/link";
import { requireAuthor } from "@/lib/auth";
import { formatArticleDate, visibilityLabel } from "@/lib/dates";
import { themeLabel } from "@/lib/site";
import { setThoughtStatusAction, signOutAction } from "@/app/admin/actions";
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

type ThoughtArticle = {
  title: string;
  slug: string;
};

type ThoughtRow = {
  id: number;
  name: string;
  email: string | null;
  body: string;
  status: "pending" | "published" | "hidden";
  created_at: string;
  articles: ThoughtArticle | ThoughtArticle[] | null;
};

function thoughtPiece(row: ThoughtRow): ThoughtArticle {
  const related = row.articles;
  if (Array.isArray(related)) {
    return related[0] ?? { title: "A piece", slug: "" };
  }
  return related ?? { title: "A piece", slug: "" };
}

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

  const { data: thoughtRows } = await supabase
    .from("article_thoughts")
    .select("id, name, email, body, status, created_at, articles(title, slug)")
    .order("created_at", { ascending: false })
    .limit(40);

  const list = (articles ?? []) as AdminArticle[];
  const notes = (messages ?? []) as ContactRow[];
  const thoughts = (thoughtRows ?? []) as ThoughtRow[];
  const pendingThoughts = thoughts.filter((row) => row.status === "pending");
  const otherThoughts = thoughts.filter((row) => row.status !== "pending");

  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-semibold">Writing</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/articles/new" className="inline-flex min-h-11 items-center rounded-md bg-link px-3 text-sm text-paper">
            New piece
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink">
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

      <section className="mt-16" aria-labelledby="thoughts-heading">
        <h2 id="thoughts-heading" className="font-serif text-2xl font-semibold">
          Thoughts
          {pendingThoughts.length > 0 ? (
            <span className="ml-2 text-base font-normal text-muted">
              {pendingThoughts.length} waiting
            </span>
          ) : null}
        </h2>
        {thoughts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            When someone leaves a thought on a piece, it will wait here until you read it.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {[...pendingThoughts, ...otherThoughts].map((row) => {
              const piece = thoughtPiece(row);
              return (
                <li key={row.id} className="rounded-md border border-line p-4 text-sm">
                  <p className="font-medium">
                    {row.name}
                    {row.email ? (
                      <>
                        {" "}
                        <a className="text-link" href={`mailto:${row.email}`}>
                          {row.email}
                        </a>
                      </>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {row.status === "pending"
                      ? "Waiting"
                      : row.status === "published"
                        ? "On the piece"
                        : "Kept private"}
                    {piece.slug ? (
                      <>
                        <span className="mx-2" aria-hidden="true">
                          ·
                        </span>
                        <Link href={`/articles/${piece.slug}`} className="hover:text-ink">
                          {piece.title}
                        </Link>
                      </>
                    ) : null}
                    {row.created_at ? (
                      <>
                        <span className="mx-2" aria-hidden="true">
                          ·
                        </span>
                        {formatArticleDate(row.created_at)}
                      </>
                    ) : null}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-muted">{row.body}</p>
                  {row.status === "pending" ? (
                    <div className="mt-3 flex flex-wrap gap-3">
                      <form action={setThoughtStatusAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="slug" value={piece.slug} />
                        <input type="hidden" name="status" value="published" />
                        <button
                          type="submit"
                          className="inline-flex min-h-11 items-center rounded-md bg-link px-3 text-sm text-paper"
                        >
                          Show on the piece
                        </button>
                      </form>
                      <form action={setThoughtStatusAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="slug" value={piece.slug} />
                        <input type="hidden" name="status" value="hidden" />
                        <button type="submit" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink">
                          Keep private
                        </button>
                      </form>
                    </div>
                  ) : row.status === "published" ? (
                    <form action={setThoughtStatusAction} className="mt-3">
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="slug" value={piece.slug} />
                      <input type="hidden" name="status" value="hidden" />
                      <button type="submit" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink">
                        Take off the piece
                      </button>
                    </form>
                  ) : (
                    <form action={setThoughtStatusAction} className="mt-3">
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="slug" value={piece.slug} />
                      <input type="hidden" name="status" value="published" />
                      <button type="submit" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink">
                        Show on the piece
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

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
