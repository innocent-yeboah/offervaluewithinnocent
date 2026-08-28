"use client";

import { useState } from "react";
import { linkedinShareHref } from "@/lib/share";
import { copy } from "@/lib/site";

type SharePieceProps = {
  title: string;
  text: string;
};

function pageUrl(): string {
  return window.location.href.split("#")[0];
}

/**
 * Lets a visitor share this piece: phone share sheet, copy the link, or LinkedIn with the page URL.
 */
export default function SharePiece({ title, text }: SharePieceProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function onShare() {
    const url = pageUrl();

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

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onShare}
          className="inline-flex min-h-11 items-center rounded-md border border-line px-3 text-sm text-ink hover:border-gold"
        >
          Share this piece
        </button>
        <a
          href="https://www.linkedin.com/sharing/share-offsite/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center text-sm text-link underline-offset-4 hover:underline"
          onClick={(event) => {
            event.preventDefault();
            window.open(linkedinShareHref(pageUrl()), "_blank", "noopener,noreferrer");
          }}
        >
          {copy.linkedinShare}
        </a>
      </div>
      {status === "copied" ? (
        <p className="mt-2 text-sm text-muted" role="status">
          {copy.linkCopied}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="mt-2 text-sm text-muted" role="status">
          {copy.tryAgain}
        </p>
      ) : null}
    </div>
  );
}
