import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicSupabaseAnonKey, publicSupabaseUrl } from "@/lib/env";

/**
 * Cookie session client for /admin only.
 * Do not use this to load public article lists (Rule 3).
 */
export async function createSupabaseServer() {
  const url = publicSupabaseUrl();
  const anonKey = publicSupabaseAnonKey();

  if (!url || !anonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component; middleware refreshes the session.
        }
      },
    },
  });
}
