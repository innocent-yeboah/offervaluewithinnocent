import { getLiveArticles } from "@/lib/articles";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await getLiveArticles();
  const items = articles
    .map((article) => {
      const link = `${site.url}/articles/${article.slug}`;
      const date = article.published_at ? new Date(article.published_at).toUTCString() : "";
      const description = escapeXml(article.excerpt ?? "");
      return `<item>
        <title>${escapeXml(article.title)}</title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${date}</pubDate>
        <description>${description}</description>
      </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${site.url}</link>
    <description>${escapeXml(site.headline)}</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
