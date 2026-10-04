import type { NextConfig } from "next";

const supabaseHosts = new Set<string>();
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  supabaseHosts.add(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname);
}
// Public cover host already used by the live articles. Lets next/image
// load those files even when the env var was empty at build time.
supabaseHosts.add("gxqqzujtvkbijmperiku.supabase.co");

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
  images: {
    remotePatterns: [...supabaseHosts].map((hostname) => ({
      protocol: "https" as const,
      hostname,
      pathname: "/storage/v1/object/public/covers/**",
    })),
  },
};

export default nextConfig;
