"use client";

import { useEffect, useState } from "react";
import { isRead, isSaved, setRead, setSaved } from "@/lib/reading-memory";
import { copy } from "@/lib/site";

type ArticleActionsProps = {
  slug: string;
  title: string;
  text: string;
};

const actionClass =
  "article-action inline-flex w-full items-center justify-between rounded-full px-6 text-base font-medium tracking-tight sm:px-8";

function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 16V4m0 0 4.5 4.5M12 4 7.5 8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m8.5 12.2 2.4 2.4 4.6-5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 4.75h10A1.25 1.25 0 0 1 18.25 6v14.2L12 16.4 5.75 20.2V6A1.25 1.25 0 0 1 7 4.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

/**
 * Share, mark as read, and save for later. Read/saved stay on this device only.
 */
export default function ArticleActions({ slug, title, text }: ArticleActionsProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [read, setReadState] = useState(false);
  const [saved, setSavedState] = useState(false);

  useEffect(() => {
    setReadState(isRead(slug));
    setSavedState(isSaved(slug));
  }, [slug]);

  async function onShare() {
    const url = window.location.href.split("#")[0];

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text, url });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  function onRead() {
    const next = !read;
    setRead(slug, next);
    setReadState(next);
  }

  function onSave() {
    const next = !saved;
    setSaved({ slug, title }, next);
    setSavedState(next);
  }

  return (
    <div className="article-actions mt-14 rounded-2xl px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-3.5 sm:gap-4">
        <button
          type="button"
          onClick={onShare}
          className={`${actionClass} bg-ink text-paper shadow-[0_8px_20px_rgba(28,25,23,0.16)]`}
        >
          {copy.shareArticle}
          <ShareIcon />
        </button>
        <button
          type="button"
          onClick={onRead}
          aria-pressed={read}
          className={`${actionClass} border bg-paper text-ink ${
            read ? "border-ink" : "border-ink/20"
          }`}
        >
          {read ? copy.markedRead : copy.markRead}
          <CheckIcon />
        </button>
        <button
          type="button"
          onClick={onSave}
          aria-pressed={saved}
          className={`${actionClass} border bg-paper text-ink ${
            saved ? "border-ink" : "border-ink/20"
          }`}
        >
          {saved ? copy.savedLater : copy.saveLater}
          <BookmarkIcon filled={saved} />
        </button>
      </div>
      {status === "copied" ? (
        <p className="mt-4 text-center text-sm text-muted" role="status">
          {copy.linkCopied}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="mt-4 text-center text-sm text-muted" role="status">
          {copy.tryAgain}
        </p>
      ) : null}
    </div>
  );
}
