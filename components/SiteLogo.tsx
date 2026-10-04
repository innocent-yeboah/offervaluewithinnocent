import { site } from "@/lib/site";

type SiteLogoProps = {
  /** Rendered square size in pixels. Matches the image width and height. */
  size: number;
  /** Load immediately. Used in the header, which is on screen at first paint. */
  priority?: boolean;
};

const lightSrc = "/brand/ov-mark-light.svg";
const darkSrc = "/brand/ov-mark-dark.svg";

/**
 * Square OV monogram.
 * The horizontal lockup is about 4:1. At a height that still fits beside the
 * nav, and on a phone, the wordmark shrinks below a readable size. The square
 * mark stays clear. Light artwork is for paper; dark artwork is for navy.
 * Which one shows is decided in the head CSS so the first paint is correct.
 */
export default function SiteLogo({ size, priority = false }: SiteLogoProps) {
  const frame = { width: size, height: size };

  return (
    <span className="relative inline-block shrink-0" style={frame}>
      {/* Brand SVGs are served as-is. The image optimizer does not handle SVG, and the head CSS swaps light and dark artwork before paint. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={lightSrc}
        alt={site.name}
        width={size}
        height={size}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className="logo-on-light"
        style={frame}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={darkSrc}
        alt={site.name}
        width={size}
        height={size}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className="logo-on-dark"
        style={frame}
      />
    </span>
  );
}
