"use client";

import { useState } from "react";
import { helpWithWriting } from "@/app/admin/writing-help";
import MarkdownBody from "@/components/MarkdownBody";
import { copy, type ThemeSlug } from "@/lib/site";

type WritingHelpKind = "draft" | "clarify" | "outline" | "tighten";

const actions: { kind: WritingHelpKind; label: string }[] = [
  { kind: "draft", label: "First draft" },
  { kind: "clarify", label: "Clarify" },
  { kind: "outline", label: "Outline" },
  { kind: "tighten", label: "Tighten" },
];

export default function WritingHelp({
  title,
  theme,
  body,
  onApply,
  disabled,
}: {
  title: string;
  theme: ThemeSlug;
  body: string;
  onApply: (markdown: string) => void;
  disabled?: boolean;
}) {
  const [note, setNote] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [previous, setPrevious] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function run(kind: WritingHelpKind) {
    setPending(true);
    setMessage("");

    try {
      const result = await helpWithWriting({
        kind,
        title,
        theme,
        body,
        note,
      });

      if (result.status === "ok") {
        setSuggestion(result.suggestion);
        setMessage("A suggestion only. Click “Use this in the draft,” then save.");
        return;
      }

      setMessage(result.message);
    } catch (error) {
      console.error(error);
      setMessage(copy.tryAgain);
    } finally {
      setPending(false);
    }
  }

  function applySuggestion() {
    if (!suggestion) {
      return;
    }
    setPrevious(body);
    onApply(suggestion);
    setMessage("This is now in your draft. It is not live until you publish.");
  }

  function restorePrevious() {
    if (!previous) {
      return;
    }
    onApply(previous);
    setPrevious("");
    setMessage("Your earlier words are back in the draft.");
  }

  const busy = pending || Boolean(disabled);

  return (
    <section
      aria-labelledby="writing-help-heading"
      className="rounded-md border border-line px-4 py-4"
    >
      <h2 id="writing-help-heading" className="text-sm font-medium">
        Writing help
      </h2>
      <p className="mt-1 text-sm text-muted">{copy.writingHelpHint}</p>
      <label className="mt-3 flex flex-col gap-1 text-sm">
        Extra note (optional)
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          maxLength={400}
          disabled={busy}
          placeholder="e.g. keep the opening, or this still feels like a lecture"
          className="rounded-md border border-line bg-paper px-3 py-2"
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.kind}
            type="button"
            disabled={busy}
            onClick={() => void run(action.kind)}
            className="rounded-md border border-line px-3 py-1.5 text-sm"
          >
            {action.label}
          </button>
        ))}
      </div>
      {suggestion ? (
        <div className="mt-4">
          <p className="text-sm text-muted">Suggestion</p>
          <div className="mt-1 max-h-80 overflow-y-auto rounded-md border border-line px-4 py-3">
            <MarkdownBody markdown={suggestion} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={applySuggestion}
              className="inline-flex min-h-11 items-center rounded-md bg-link px-3 text-sm font-medium text-paper"
            >
              Use this in the draft
            </button>
            {previous ? (
              <button
                type="button"
                disabled={busy}
                onClick={restorePrevious}
                className="rounded-md border border-line px-3 py-1.5 text-sm"
              >
                Put my words back
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      {message ? (
        <p className="mt-3 text-sm" role="status">
          {message}
        </p>
      ) : pending ? (
        <p className="mt-3 text-sm text-muted" role="status">
          Writing with you…
        </p>
      ) : null}
    </section>
  );
}
