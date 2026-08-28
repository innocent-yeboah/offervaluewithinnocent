import Image from "next/image";
import { site } from "@/lib/site";

type AuthorPortraitProps = {
  size: "home" | "about";
};

const sizes = {
  home: {
    className: "h-24 w-24 sm:h-28 sm:w-28",
    width: 224,
    height: 224,
  },
  about: {
    className: "h-40 w-40 sm:h-44 sm:w-44",
    width: 352,
    height: 352,
  },
} as const;

/**
 * A quiet portrait of Innocent so readers can put a face with the writing.
 */
export default function AuthorPortrait({ size }: AuthorPortraitProps) {
  const frame = sizes[size];

  return (
    <Image
      src="/innocent.jpg"
      alt={site.author}
      width={frame.width}
      height={frame.height}
      priority={size === "home"}
      className={`${frame.className} shrink-0 rounded-full object-cover object-[center_16%] shadow-[0_8px_24px_rgba(28,25,23,0.12)] ring-2 ring-gold/45 ring-offset-[3px] ring-offset-paper`}
    />
  );
}
