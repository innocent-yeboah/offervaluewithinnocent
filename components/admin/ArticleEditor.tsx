"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownBody from "@/components/MarkdownBody";
import WritingHelp from "@/components/admin/WritingHelp";
import { revalidateArticles } from "@/app/actions";
import { visibilityLabel } from "@/lib/dates";
import { copy, themes, type ThemeSlug } from "@/lib/site";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

type EditorArticle = {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  body_markdown: string;
  cover_image_path: string | null;
  theme: ThemeSlug;
  status: "draft" | "published";
  published_at: string | null;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function ArticleEditor({
  article,
  authorId,
}: {
  article?: EditorArticle;
  authorId: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article?.slug));
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body_markdown ?? "");
  const [theme, setTheme] = useState<ThemeSlug>(article?.theme ?? "value");
  const [coverPath, setCoverPath] = useState(article?.cover_image_path ?? "");
  const [scheduleAt, setScheduleAt] = useState(toDatetimeLocal(article?.published_at ?? null));
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const label = visibilityLabel(article?.status ?? "draft", article?.published_at ?? null);

  const preview = useMemo(() => body, [body]);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function uploadCover(file: File) {
    const supabase = createSupabaseBrowser();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${authorId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("covers").upload(path, file, { upsert: true });
    if (error) {
      setMessage(copy.tryAgain);
      return;
    }
    setCoverPath(path);
  }

  async function save(intent: "draft" | "now" | "schedule") {
    setPending(true);
    setMessage("");

    if (!title.trim() || !slug.trim() || !body.trim()) {
      setMessage("A title, slug, and some writing are needed.");
      setPending(false);
      return;
    }

    let status: "draft" | "published" = "draft";
    let publishedAt: string | null = null;

    if (intent === "now") {
      status = "published";
      publishedAt = new Date().toISOString();
    } else if (intent === "schedule") {
      if (!scheduleAt) {
        setMessage("Choose a date and time to schedule.");
        setPending(false);
        return;
      }
      status = "published";
      publishedAt = new Date(scheduleAt).toISOString();
    }

    const payload = {
      title: title.trim(),
      slug: slugify(slug),
      excerpt: excerpt.trim() || null,
      body_markdown: body,
      theme,
      cover_image_path: coverPath || null,
      status,
      published_at: publishedAt,
      author_id: authorId,
    };

    try {
      const supabase = createSupabaseBrowser();
      let savedId = article?.id;
      if (article?.id) {
        const { error } = await supabase.from("articles").update(payload).eq("id", article.id);
        if (error) {
          throw error;
        }
      } else {
        const { data, error } = await supabase.from("articles").insert(payload).select("id").single();
        if (error) {
          throw error;
        }
        savedId = data.id as number;
      }

      await revalidateArticles(payload.slug);
      if (!article?.id && savedId) {
        router.push(`/admin/articles/${savedId}`);
      }
      router.refresh();

      if (intent === "now") {
        setMessage(`Live. ${copy.kitAfterLive}`);
      } else if (intent === "schedule") {
        const url = `${window.location.origin}/articles/${payload.slug}`;
        setMessage(`Scheduled. Public URL: ${url}. ${copy.scheduledHint}`);
      } else {
        setMessage("Draft saved.");
      }
    } catch (error) {
      console.error(error);
      setMessage(copy.tryAgain);
    } finally {
      setPending(false);
    }
  }

  async function removePiece() {
    if (!article?.id) {
      return;
    }

    setPending(true);
    setMessage("");

    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.from("articles").delete().eq("id", article.id);
      if (error) {
        throw error;
      }

      if (coverPath) {
        await supabase.storage.from("covers").remove([coverPath]);
      }

      await revalidateArticles(article.slug);
      const currentSlug = slugify(slug);
      if (currentSlug && currentSlug !== article.slug) {
        await revalidateArticles(currentSlug);
      }
      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage(copy.tryAgain);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted">
        Status: <strong className="text-ink">{label}</strong>
      </p>
      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="rounded-md border border-line bg-paper px-3 py-2 font-serif text-xl"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Slug
        <input
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          className="rounded-md border border-line bg-paper px-3 py-2 font-mono text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Excerpt
        <textarea
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          rows={2}
          className="rounded-md border border-line bg-paper px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Theme
        <select
          value={theme}
          onChange={(event) => setTheme(event.target.value as ThemeSlug)}
          className="rounded-md border border-line bg-paper px-3 py-2"
        >
          {themes.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Cover image (optional)
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void uploadCover(file);
            }
          }}
        />
      </label>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Writing (markdown)
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={22}
            className="rounded-md border border-line bg-paper px-3 py-2 font-mono text-sm"
          />
        </label>
        <div>
          <p className="text-sm text-muted">Preview</p>
          <div className="mt-1 min-h-40 rounded-md border border-line px-4 py-3">
            <MarkdownBody markdown={preview || "_Nothing to preview yet._"} />
          </div>
        </div>
      </div>
      <WritingHelp
        title={title}
        theme={theme}
        body={body}
        onApply={setBody}
        disabled={pending}
      />
      <label className="flex flex-col gap-1 text-sm">
        Schedule (your local time)
        <input
          type="datetime-local"
          value={scheduleAt}
          onChange={(event) => setScheduleAt(event.target.value)}
          className="max-w-xs rounded-md border border-line bg-paper px-3 py-2"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => void save("draft")}
          className="rounded-md border border-line px-4 py-2 text-sm"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void save("now")}
          className="rounded-md bg-link px-4 py-2 text-sm font-medium text-paper"
        >
          Publish now
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void save("schedule")}
          className="rounded-md border border-gold px-4 py-2 text-sm"
        >
          Schedule
        </button>
      </div>
      {article?.id ? (
        <div className="border-t border-line pt-4">
          {confirmRemove ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted">
                This will take the piece off the site. The writing will be gone. You cannot undo
                this.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void removePiece()}
                  className="rounded-md border border-coral px-4 py-2 text-sm text-coral"
                >
                  Yes, remove it
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirmRemove(false)}
                  className="rounded-md border border-line px-4 py-2 text-sm"
                >
                  Keep it
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmRemove(true)}
              className="text-sm text-muted hover:text-ink"
            >
              Remove this piece
            </button>
          )}
        </div>
      ) : null}
      {message ? (
        <p className="text-sm" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
