import { ImageResponse } from "next/og";
import { articleShareDescription, getLiveArticleBySlug } from "@/lib/articles";
import { palette } from "@/lib/palette";
import { site, themeLabel } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
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
 * Share card for a live article: cover, title, and who wrote it.
 */
export default async function ArticleOpenGraphImage({ params }: ImageProps) {
  const { slug } = await params;
  const article = await getLiveArticleBySlug(slug);
  const title = article?.title ?? site.name;
  const line = article ? articleShareDescription(article) : site.tagline;
  const theme = article ? themeLabel(article.theme) : "";
  const cover = article?.cover_image_path
    ? await coverDataUri(article.cover_image_path)
    : null;
  const titleSize = title.length > 56 ? 40 : title.length > 40 ? 48 : 56;
  const onPhoto = Boolean(cover);
  const ink = palette.ivory;
  const muted = palette.mist;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: palette.navy,
          color: ink,
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              objectFit: "cover",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 1200,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: onPhoto ? "96px 56px 48px" : "72px",
            backgroundImage: onPhoto
              ? "linear-gradient(to top, rgba(26,42,74,0.94) 0%, rgba(26,42,74,0.72) 58%, rgba(26,42,74,0) 100%)"
              : undefined,
          }}
        >
          <div
            style={{
              display: "flex",
              color: palette.gold,
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
              marginTop: 18,
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
              marginTop: 18,
              color: muted,
              fontSize: 26,
              lineHeight: 1.35,
            }}
          >
            {line}
          </div>
          <div style={{ display: "flex", marginTop: 28, color: muted, fontSize: 22 }}>
            {site.author}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
