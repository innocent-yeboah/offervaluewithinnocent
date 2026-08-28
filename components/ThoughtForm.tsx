"use client";

import { useActionState } from "react";
import { commentAction, type CommentFormState } from "@/app/actions";
import { copy } from "@/lib/site";

const initial: CommentFormState = { status: "idle" };

type ThoughtFormProps = {
  slug: string;
};

export default function ThoughtForm({ slug }: ThoughtFormProps) {
  const [state, formAction, pending] = useActionState(commentAction, initial);

  return (
    <form action={formAction} className="mt-8 flex max-w-lg flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <label className="flex flex-col gap-1 text-sm">
        Your name
        <input
          name="name"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          className="min-h-11 rounded-md border border-line bg-paper px-3 py-2 text-base text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Email <span className="font-normal text-muted">(optional, not shown)</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          className="min-h-11 rounded-md border border-line bg-paper px-3 py-2 text-base text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Your thought
        <textarea
          name="body"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          className="rounded-md border border-line bg-paper px-3 py-2 text-base text-ink"
        />
      </label>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 self-stretch items-center justify-center rounded-md bg-link px-4 text-sm font-medium text-paper disabled:opacity-60 sm:self-start"
      >
        {pending ? "Sending…" : copy.thoughtsShare}
      </button>
      {state.status === "success" || state.status === "error" ? (
        <p className="text-sm" role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
