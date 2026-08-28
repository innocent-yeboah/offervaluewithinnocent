import { ImageResponse } from "next/og";
import { getLiveArticleBySlug } from "@/lib/articles";
import { site, themeLabel } from "@/lib/site";

export const runtime = "nodejs";
export const alt = "Offer Value With Innocent";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type ImageProps = {
  params: Promise<{ slug: string }>;
};

async function coverDataUri(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    const type = response.headers.get("content-type") ?? "image/jpeg";
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Share card for a live article: title, excerpt, and cover when one exists.
 */
export default async function ArticleOpenGraphImage({ params }: ImageProps) {
  const { slug } = await params;
  const article = await getLiveArticleBySlug(slug);
  const title = article?.title ?? site.name;
  const excerpt = (article?.excerpt?.trim() || site.tagline).slice(0, 180);
  const theme = article ? themeLabel(article.theme) : "";
  const cover = article?.cover_image_path
    ? await coverDataUri(article.cover_image_path)
    : null;
  const titleSize = title.length > 52 ? 44 : 56;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#FAF6F0",
          color: "#1C1917",
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt=""
            width={460}
            height={630}
            style={{ objectFit: "cover" }}
          />
        ) : null}
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: cover ? 56 : 72,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                color: "#C9A227",
                fontSize: 22,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {theme || site.name}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: titleSize,
                fontWeight: 600,
                lineHeight: 1.15,
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 24,
                color: "#57534E",
                fontSize: 26,
                lineHeight: 1.35,
              }}
            >
              {excerpt}
            </div>
          </div>
          <div style={{ display: "flex", color: "#57534E", fontSize: 22 }}>
            {site.author}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
