"use client";

import { useActionState } from "react";
import { subscribeAction, type SubscribeFormState } from "@/app/actions";
import { copy } from "@/lib/site";

const initial: SubscribeFormState = { status: "idle" };

type SubscribeInviteProps = {
  source?: string;
  kitOpen: boolean;
};

export default function SubscribeInvite({ kitOpen }: SubscribeInviteProps) {
  const [state, formAction, pending] = useActionState(subscribeAction, initial);

  if (!kitOpen) {
    return (
      <div className="rounded-lg border border-line bg-paper p-5">
        <p className="font-serif text-xl text-ink">Join the weekly list</p>
        <p className="mt-2 text-sm text-muted">{copy.newsletterWhat}</p>
        <p className="mt-4 text-sm text-muted">{copy.subscribeClosed}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line p-5">
      <p className="font-serif text-xl text-ink">Join the weekly list</p>
      <p className="mt-2 text-sm text-muted">{copy.newsletterWhat}</p>
      <p className="mt-2 text-sm text-muted">
        You will get a confirmation email. You are not on the list until you click that link.
      </p>
      <form action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <label className="sr-only" htmlFor="firstName">
          First name
        </label>
        <input
          id="firstName"
          name="firstName"
          autoComplete="given-name"
          placeholder="First name (optional)"
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink sm:w-40"
        />
        <label className="sr-only" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="w-full flex-1 rounded-md border border-line bg-paper px-3 py-2 text-ink"
        />
        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-link px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
        >
          {pending ? "Sending…" : "Join"}
        </button>
      </form>
      {state.status === "confirm" || state.status === "active" || state.status === "error" || state.status === "closed" ? (
        <p className="mt-3 text-sm" role="status">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
