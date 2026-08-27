import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-free anon client for public article reads (Rule 3).
 * Never uses the author session. Never uses the service role key.
 * Returns null when env is missing so pages can still render.
 */
export function createAnonClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
