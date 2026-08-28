"use client";

import { useState } from "react";
import { copy } from "@/lib/site";

type SharePieceProps = {
  title: string;
  text: string;
};

/**
 * Lets a visitor share this piece: phone share sheet when available, otherwise copy the link.
 */
export default function SharePiece({ title, text }: SharePieceProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

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

  return (
    <div>
      <button
        type="button"
        onClick={onShare}
        className="inline-flex min-h-11 items-center rounded-md border border-line px-3 text-sm text-ink hover:border-gold"
      >
        Share this piece
      </button>
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
