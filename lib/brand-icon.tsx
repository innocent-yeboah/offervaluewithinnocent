import { palette } from "@/lib/palette";

type BrandMarkProps = {
  size: number;
};

/**
 * Gold “O” mark for the tab and home screen. Not the Vercel triangle.
 */
export function BrandMark({ size }: BrandMarkProps) {
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.62);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: palette.gold,
        color: palette.navy,
        fontSize,
        fontWeight: 700,
        letterSpacing: "-0.04em",
        borderRadius: radius,
      }}
    >
      O
    </div>
  );
}
