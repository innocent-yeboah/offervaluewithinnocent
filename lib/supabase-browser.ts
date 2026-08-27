import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client for admin forms (session cookies).
 * Never import this from public article loaders.
 */
export function createSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase is not configured.");
  }

  return createBrowserClient(url, anonKey);
}
