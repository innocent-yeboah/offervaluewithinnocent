/**
 * Read env at runtime. Static `process.env.NEXT_PUBLIC_*` is baked in at
 * `next build`; a Vercel deploy made before those keys existed keeps empty
 * strings even after you add them in the dashboard.
 */
export function runtimeEnv(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export function publicSupabaseUrl(): string {
  return runtimeEnv("NEXT_PUBLIC_SUPABASE_URL") || runtimeEnv("SUPABASE_URL");
}

export function publicSupabaseAnonKey(): string {
  return runtimeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") || runtimeEnv("SUPABASE_ANON_KEY");
}
