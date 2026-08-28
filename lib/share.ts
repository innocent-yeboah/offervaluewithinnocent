import { site } from "@/lib/site";

export function articlePublicUrl(slug: string, origin?: string): string {
  const fromOrigin =
    origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")
      ? origin
      : site.url;
  return `${fromOrigin.replace(/\/$/, "")}/articles/${slug}`;
}

export function linkedinShareHref(articleUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
}
