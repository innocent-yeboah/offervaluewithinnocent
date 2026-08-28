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
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold";

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <div className="mt-12 flex flex-col gap-3 border-t border-line pt-8">
      <button
        type="button"
        onClick={onShare}
        className={`${actionClass} bg-ink text-paper`}
      >
        {copy.shareArticle}
        <ShareIcon />
      </button>
      <button
        type="button"
        onClick={onRead}
        aria-pressed={read}
        className={`${actionClass} border border-line bg-paper text-ink ${read ? "border-ink" : ""}`}
      >
        {read ? copy.markedRead : copy.markRead}
        <CheckIcon />
      </button>
      <button
        type="button"
        onClick={onSave}
        aria-pressed={saved}
        className={`${actionClass} border border-line bg-paper text-ink ${saved ? "border-ink" : ""}`}
      >
        {saved ? copy.savedLater : copy.saveLater}
        <BookmarkIcon filled={saved} />
      </button>
      {status === "copied" ? (
        <p className="text-center text-sm text-muted" role="status">
          {copy.linkCopied}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-center text-sm text-muted" role="status">
          {copy.tryAgain}
        </p>
      ) : null}
    </div>
  );
}
