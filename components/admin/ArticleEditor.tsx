"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownBody from "@/components/MarkdownBody";
import WritingHelp from "@/components/admin/WritingHelp";
import { revalidateArticles } from "@/app/actions";
import { visibilityLabel } from "@/lib/dates";
import { missingOptionalColumn } from "@/lib/article-columns";
import { copy, site, themes, type ThemeSlug } from "@/lib/site";
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
  next_step?: string | null;
  next_step_slug?: string | null;
  thumbnail_path?: string | null;
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

const NEXT_STEP_LIMIT = 600;

export default function ArticleEditor({
  article,
  authorId,
  nextStepReady = true,
  thumbnailReady = true,
}: {
  article?: EditorArticle;
  authorId: string;
  nextStepReady?: boolean;
  thumbnailReady?: boolean;
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
  const [nextStep, setNextStep] = useState(article?.next_step ?? "");
  const [nextStepSlug, setNextStepSlug] = useState(article?.next_step_slug ?? "");
  const [thumbnailPath, setThumbnailPath] = useState(article?.thumbnail_path ?? "");
  const [canStoreNextStep, setCanStoreNextStep] = useState(nextStepReady);
  const [canStoreThumbnail, setCanStoreThumbnail] = useState(thumbnailReady);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [justWentLive, setJustWentLive] = useState(false);
  const [shareLinkStatus, setShareLinkStatus] = useState<"idle" | "copied" | "error">("idle");

  const label = visibilityLabel(article?.status ?? "draft", article?.published_at ?? null);
  const showShareLink = label === "Live" || justWentLive;
  const liveUrl = `${site.url.replace(/\/$/, "")}/articles/${slugify(slug || article?.slug || "")}`;

  const preview = useMemo(() => body, [body]);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function uploadToCovers(file: File): Promise<string | null> {
    const supabase = createSupabaseBrowser();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${authorId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("covers").upload(path, file, { upsert: true });
    if (error) {
      setMessage(copy.tryAgain);
      return null;
    }
    return path;
  }

  async function uploadCover(file: File) {
    const path = await uploadToCovers(file);
    if (!path) {
      return;
    }
    setCoverPath(path);
    if (!article?.id && canStoreThumbnail && !thumbnailPath) {
      setThumbnailPath(path);
    }
  }

  async function uploadThumbnail(file: File) {
    const path = await uploadToCovers(file);
    if (!path) {
      return;
    }
    setThumbnailPath(path);
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
      setJustWentLive(true);
    } else if (intent === "schedule") {
      if (!scheduleAt) {
        setMessage("Choose a date and time to schedule.");
        setPending(false);
        return;
      }
      status = "published";
      publishedAt = new Date(scheduleAt).toISOString();
      setJustWentLive(false);
    }

    const nextStepText = nextStep.trim();
    if (canStoreNextStep && nextStepText.length > NEXT_STEP_LIMIT) {
      setMessage(copy.nextStepTooLong);
      setPending(false);
      return;
    }

    const payload: Record<string, unknown> = {
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

    if (canStoreNextStep) {
      payload.next_step = nextStepText || null;
      payload.next_step_slug = slugify(nextStepSlug) || null;
    }
    if (canStoreThumbnail) {
      payload.thumbnail_path = thumbnailPath.trim() || null;
    }

    try {
      const supabase = createSupabaseBrowser();
      let savedId = article?.id;
      const write = async (row: Record<string, unknown>) => {
        if (article?.id) {
          const { error } = await supabase.from("articles").update(row).eq("id", article.id);
          if (error) {
            throw error;
          }
          return article.id;
        }
        const { data, error } = await supabase.from("articles").insert(row).select("id").single();
        if (error) {
          throw error;
        }
        return data.id as number;
      };

      const row = { ...payload };
      let stripped = false;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          savedId = await write(row);
          break;
        } catch (error) {
          const missing = missingOptionalColumn(error as { code?: string; message?: string });
          if (!missing || !(missing in row)) {
            throw error;
          }
          delete row[missing];
          stripped = true;
          if (missing === "next_step" || missing === "next_step_slug") {
            setCanStoreNextStep(false);
          }
          if (missing === "thumbnail_path") {
            setCanStoreThumbnail(false);
          }
        }
      }
      if (stripped) {
        setMessage(copy.savedWithoutNewColumns);
        await revalidateArticles(String(row.slug));
        if (!article?.id && savedId) {
          router.push(`/admin/articles/${savedId}`);
        }
        router.refresh();
        return;
      }

      await revalidateArticles(String(payload.slug));
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
        setJustWentLive(false);
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
        <span className="text-muted">{copy.excerptHint}</span>
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
        <span className="text-muted">{copy.coverHint}</span>
      </label>
      {canStoreThumbnail ? (
        <div className="flex flex-col gap-2 text-sm">
          <label className="flex flex-col gap-1">
            Thumbnail (optional)
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadThumbnail(file);
                }
              }}
            />
            <span className="text-muted">{copy.thumbnailHint}</span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending || !coverPath}
              onClick={() => setThumbnailPath(coverPath)}
              className="inline-flex min-h-11 items-center text-sm text-link underline-offset-4 hover:underline disabled:opacity-50"
            >
              {copy.thumbnailUseCover}
            </button>
            {thumbnailPath ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => setThumbnailPath("")}
                className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink"
              >
                {copy.thumbnailClear}
              </button>
            ) : null}
          </div>
          <p className="text-muted">{thumbnailPath ? "Thumbnail set." : copy.thumbnailNone}</p>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-muted">{copy.thumbnailMigration}</p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Writing (markdown)
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={22}
            className="min-h-40 rounded-md border border-line bg-paper px-3 py-2 font-mono text-sm sm:min-h-80"
          />
        </label>
        <div>
          <p className="text-sm text-muted">Preview</p>
          <div className="mt-1 min-h-40 overflow-x-auto rounded-md border border-line px-4 py-3">
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
      {canStoreNextStep ? (
        <>
          <label className="flex flex-col gap-1 text-sm">
            Where to next
            <textarea
              value={nextStep}
              onChange={(event) => setNextStep(event.target.value)}
              rows={3}
              maxLength={NEXT_STEP_LIMIT}
              className="rounded-md border border-line bg-paper px-3 py-2"
            />
            <span className="text-muted">{copy.nextStepHint}</span>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Next piece slug
            <input
              value={nextStepSlug}
              onChange={(event) => setNextStepSlug(event.target.value)}
              className="rounded-md border border-line bg-paper px-3 py-2 font-mono text-sm"
              spellCheck={false}
            />
            <span className="text-muted">{copy.nextStepSlugHint}</span>
          </label>
        </>
      ) : (
        <p className="text-sm leading-relaxed text-muted">{copy.nextStepMigration}</p>
      )}
      <label className="flex flex-col gap-1 text-sm">
        Schedule (your local time)
        <input
          type="datetime-local"
          value={scheduleAt}
          onChange={(event) => setScheduleAt(event.target.value)}
          className="w-full max-w-full rounded-md border border-line bg-paper px-3 py-2 sm:max-w-xs"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => void save("draft")}
          className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void save("now")}
          className="inline-flex min-h-11 items-center rounded-md bg-button px-4 text-sm font-medium text-paper"
        >
          Publish now
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void save("schedule")}
          className="inline-flex min-h-11 items-center rounded-md border border-gold-ink px-4 text-sm"
        >
          Schedule
        </button>
      </div>
      {showShareLink && slugify(slug || article?.slug || "") ? (
        <div className="rounded-md border border-line px-4 py-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              void navigator.clipboard.writeText(liveUrl).then(
                () => setShareLinkStatus("copied"),
                () => setShareLinkStatus("error"),
              );
            }}
            className="text-left text-sm text-link underline-offset-4 hover:underline"
          >
            {copy.adminCopyShareLink}
          </button>
          {shareLinkStatus === "copied" ? (
            <p className="mt-2 text-sm text-muted" role="status">
              {copy.adminShareLinkCopied}
            </p>
          ) : null}
          {shareLinkStatus === "error" ? (
            <p className="mt-2 text-sm text-muted" role="status">
              {copy.tryAgain}
            </p>
          ) : null}
        </div>
      ) : null}
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
