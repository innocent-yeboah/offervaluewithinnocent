/**
 * Read env at request time. Next inlines `process.env.NEXT_PUBLIC_*` at
 * `next build`. If those keys were empty on Vercel then, article pages stay
 * empty even after you add them in the dashboard.
 */
export function runtimeEnv(name: string): string {
  const bag = process.env as Record<string, string | undefined>;
  const value = bag[name];
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().replace(/^["']|["']$/g, "");
}

export function publicSupabaseUrl(): string {
  return runtimeEnv("NEXT_PUBLIC_" + "SUPABASE_URL") || runtimeEnv("SUPABASE_URL");
}

export function publicSupabaseAnonKey(): string {
  return (
    runtimeEnv("NEXT_PUBLIC_" + "SUPABASE_ANON_KEY") || runtimeEnv("SUPABASE_ANON_KEY")
  );
}
