import type { MetadataRoute } from "next";
import { getLiveSlugs } from "@/lib/articles";
import { site } from "@/lib/site";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getLiveSlugs();
  const staticRoutes = ["", "/articles", "/about", "/newsletter", "/contact", "/privacy"].map(
    (path) => ({
      url: `${site.url}${path}`,
      lastModified: new Date(),
    }),
  );

  const articleRoutes = slugs.map((slug) => ({
    url: `${site.url}/articles/${slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...articleRoutes];
}
