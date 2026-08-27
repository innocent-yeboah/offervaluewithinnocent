"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { copy } from "@/lib/site";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const presetError = searchParams.get("error");
  const [error, setError] = useState(
    presetError === "not-author"
      ? "This account is not set as an author yet."
      : "",
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const supabase = createSupabaseBrowser();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signError) {
        setError(copy.tryAgain);
        setPending(false);
        return;
      }
      router.push(next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setError(
        message.includes("not configured")
          ? "This admin is not configured yet. Restart the app after saving .env.local."
          : copy.tryAgain,
      );
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="min-h-11 rounded-md border border-line bg-paper px-3 py-2 text-base"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="min-h-11 rounded-md border border-line bg-paper px-3 py-2 text-base"
        />
      </label>
      {error ? (
        <p className="text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-link px-4 text-sm font-medium text-paper disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
