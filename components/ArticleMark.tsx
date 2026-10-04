import { palette } from "@/lib/palette";
import { themeLabel } from "@/lib/site";

type ArticleMarkProps = {
  title: string;
  theme: string;
  variant: "lead" | "card";
};

function wrapLines(value: string, maxChars: number): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

/**
 * Navy and gold stand-in when a piece has no cover and no saved thumbnail.
 * Colors come from lib/palette.ts. The frame matches ArticleImage.
 */
export default function ArticleMark({ title, theme, variant }: ArticleMarkProps) {
  const all = wrapLines(title, 16);
  const lines = all.slice(0, 5);
  if (all.length > lines.length && lines.length > 0) {
    const last = lines[lines.length - 1] ?? "";
    lines[lines.length - 1] = `${last.replace(/[.,;:!?]+$/u, "").slice(0, 14)}…`;
  }

  const frame =
    variant === "card"
      ? "relative mt-1 block h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-md sm:h-28 sm:w-24"
      : "relative mx-auto block aspect-[4/5] w-full max-w-[17rem] overflow-hidden rounded-md sm:mx-0 sm:w-64 sm:max-w-none sm:shrink-0";

  return (
    <span className={frame}>
      <svg
        viewBox="0 0 240 300"
        preserveAspectRatio="xMidYMin slice"
        role="img"
        aria-label={title}
        className="absolute inset-0 h-full w-full"
      >
        <rect width="240" height="300" fill={palette.navy} />
        <rect
          x="8"
          y="8"
          width="224"
          height="284"
          fill="none"
          stroke={palette.gold}
          strokeWidth="3"
        />
        <rect x="82" y="28" width="76" height="76" rx="17" fill={palette.gold} />
        <text
          x="120"
          y="66"
          textAnchor="middle"
          dominantBaseline="central"
          fill={palette.navy}
          fontSize="48"
          fontWeight="700"
          fontFamily="Georgia, 'Times New Roman', serif"
        >
          O
        </text>
        <text
          x="120"
          y="132"
          textAnchor="middle"
          fill={palette.gold}
          fontSize="13"
          fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
          letterSpacing="1.6"
        >
          {themeLabel(theme).toUpperCase()}
        </text>
        {lines.map((line, index) => (
          <text
            key={`${line}-${index}`}
            x="120"
            y={162 + index * 24}
            textAnchor="middle"
            fill={palette.ivory}
            fontSize="18"
            fontFamily="Georgia, 'Times New Roman', serif"
          >
            {line}
          </text>
        ))}
      </svg>
    </span>
  );
}
