"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { copy } from "@/lib/site";

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12S6.2 5.75 12 5.75 21.5 12 21.5 12 17.8 18.25 12 18.25 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12S6.2 5.75 12 5.75 21.5 12 21.5 12 17.8 18.25 12 18.25 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4 20 20 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="flex flex-col gap-1 text-sm">
        <label htmlFor="admin-password">Password</label>
        <div className="relative">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="min-h-11 w-full rounded-md border border-line bg-paper py-2 pl-3 pr-12 text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 inline-flex min-w-11 items-center justify-center text-muted hover:text-ink"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>
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
