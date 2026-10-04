import Link from "next/link";
import SiteLogo from "@/components/SiteLogo";

type BrandLockupProps = {
  /** Load the monogram immediately. The header is on screen at first paint. */
  priority?: boolean;
  /** Square monogram size in pixels. */
  mark?: number;
  /**
   * Keep the name on two lines at every width.
   * The footer uses this so the signature stays compact above the author lines.
   */
  stacked?: boolean;
};

/**
 * Monogram plus the live name “Offer Value With Innocent”.
 * Newsreader is the site serif (Cormorant Garamond is not loaded).
 * “Offer Value” uses the ink color: navy on paper, ivory on navy.
 * “With Innocent” uses gold-ink: #7A6436 on paper, #D4AF37 on navy.
 * Those variables flip with the theme class, so the colors do not flash.
 * Phones stack the name on two lines at 14px. From 640px it is one line,
 * and the header bar widens once the nav is on screen.
 */
export default function BrandLockup({
  priority = false,
  mark = 40,
  stacked = false,
}: BrandLockupProps) {
  return (
    <Link
      href="/"
      className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-sm sm:gap-2.5"
    >
      <SiteLogo size={mark} priority={priority} />
      <span
        className={`min-w-0 font-serif text-sm font-semibold leading-tight tracking-tight text-ink ${
          stacked ? "" : "sm:text-base sm:whitespace-nowrap"
        }`}
      >
        Offer Value{" "}
        <br className={stacked ? undefined : "sm:hidden"} />
        <span
          className={
            stacked
              ? "mt-1 inline-block border-t border-gold-ink pt-1 text-gold-ink"
              : "text-gold-ink max-sm:mt-1 max-sm:inline-block max-sm:border-t max-sm:border-gold-ink max-sm:pt-1"
          }
        >
          With Innocent
        </span>
      </span>
    </Link>
  );
}
