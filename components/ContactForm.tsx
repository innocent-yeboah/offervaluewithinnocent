"use client";

import { useActionState } from "react";
import { contactAction, type ContactFormState } from "@/app/actions";
import { site } from "@/lib/site";

const initial: ContactFormState = { status: "idle" };

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(contactAction, initial);

  return (
    <form action={formAction} className="mt-6 flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Your name
        <input
          name="name"
          required
          autoComplete="name"
          className="rounded-md border border-line bg-paper px-3 py-2 text-base text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-line bg-paper px-3 py-2 text-base text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Message
        <textarea
          name="message"
          required
          rows={6}
          className="rounded-md border border-line bg-paper px-3 py-2 text-base text-ink"
        />
      </label>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-link px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send"}
      </button>
      {state.status === "success" || state.status === "error" ? (
        <p className="text-sm" role="status">
          {state.message}
        </p>
      ) : (
        <p className="text-sm text-muted">You can also write {site.email} anytime.</p>
      )}
    </form>
  );
}
