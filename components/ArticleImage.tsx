import Image from "next/image";
import { readImageSize } from "@/lib/image-size";

type ArticleImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  variant: "hero" | "lead" | "card";
};

/**
 * Cover and thumbnail photos. Portrait pieces keep their top in frame.
 */
export default async function ArticleImage({ src, alt, priority = false, variant }: ArticleImageProps) {
  if (variant === "hero") {
    const size = await readImageSize(src);
    return (
      <Image
        src={src}
        alt={alt}
        width={size.width}
        height={size.height}
        priority={priority}
        sizes="(min-width: 768px) 720px, 100vw"
        className="mt-8 h-auto w-full rounded-md"
      />
    );
  }

  if (variant === "card") {
    return (
      <span className="relative mt-1 block h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-md sm:h-28 sm:w-24">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="96px"
          className="object-cover object-top"
        />
      </span>
    );
  }

  return (
    <span className="relative mx-auto block aspect-[4/5] w-full max-w-[17rem] overflow-hidden rounded-md sm:mx-0 sm:w-64 sm:max-w-none sm:shrink-0">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 640px) 256px, 70vw"
        className="object-cover object-top"
      />
    </span>
  );
}
