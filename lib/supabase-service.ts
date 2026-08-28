import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicSupabaseUrl } from "@/lib/env";

/**
 * Service-role client. Never use this to load public articles (Rule 3).
 * Only for rate limits and storing contact notes after a check.
 */
export function createServiceClient(): SupabaseClient | null {
  const url = publicSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
