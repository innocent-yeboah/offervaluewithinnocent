import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicSupabaseAnonKey, publicSupabaseUrl } from "@/lib/env";

/**
 * Cookie-free anon client for public article reads (Rule 3).
 * Never uses the author session. Never uses the service role key.
 * Returns null when env is missing so pages can still render.
 */
export function createAnonClient(): SupabaseClient | null {
  const url = publicSupabaseUrl();
  const anonKey = publicSupabaseAnonKey();

  if (!url || !anonKey) {
    console.error(
      "Public articles need NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on this host.",
    );
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
