/**
 * One palette for the site, the OV mark, and share images.
 * CSS variables in brandCss are applied from the root layout.
 * Flyer colors are kept where they clear WCAG AA. Where a flyer hex
 * fails as text or as a control, the note next to that value says so.
 */
export const palette = {
  navy: "#1A2A4A",
  gold: "#D4AF37",
  /**
   * Flyer dark gold #8A7A3F is 3.95:1 on warm paper, short of 4.5:1 for text.
   * #7A6436 is the same hue, darkened, at about 5.3:1 on #FAF6F0.
   */
  goldInk: "#7A6436",
  /** #8A7A3F passes as a non-text mark on paper (about 3.9:1) and is too faint as small type. */
  goldDeep: "#8A7A3F",
  ivory: "#E8ECF4",
  white: "#FFFFFF",
  paper: "#FAF6F0",
  slate: "#3B4C70",
  /** Ivory, dimmed so it stays secondary on navy. About 8:1 on #1A2A4A. */
  mist: "#B7C3D4",
  /**
   * #3B4C70 on #1A2A4A is only 1.7:1. #647EAA is the same slate, lifted, about 3.5:1.
   */
  lineOnNavy: "#647EAA",
  /**
   * Warm stone border. The old paper line was about 1.3:1 on #FAF6F0.
   * #9C8B72 clears 3:1 so fields and dividers stay visible.
   */
  lineOnPaper: "#9C8B72",
  /** Remove / error text. Not a flyer color. Darkened so it clears AA on paper. */
  coral: "#9C3B32",
  coralOnNavy: "#E8A090",
} as const;

export const brandCss = `
:root {
  --paper: ${palette.paper};
  --ink: ${palette.navy};
  --muted: ${palette.slate};
  --link: ${palette.goldInk};
  --gold: ${palette.gold};
  --gold-ink: ${palette.goldInk};
  --button: ${palette.navy};
  --coral: ${palette.coral};
  --line: ${palette.lineOnPaper};
  --focus: ${palette.navy};
}
html.dark {
  --paper: ${palette.navy};
  --ink: ${palette.ivory};
  --muted: ${palette.mist};
  --link: ${palette.gold};
  --gold: ${palette.gold};
  --gold-ink: ${palette.gold};
  --button: ${palette.gold};
  --coral: ${palette.coralOnNavy};
  --line: ${palette.lineOnNavy};
  --focus: ${palette.gold};
}
.theme-value { --theme-wash: #F6EDD0; --theme-line: #C4A85A; --theme-ink: #5C4A22; }
.theme-habits { --theme-wash: #F8E7DC; --theme-line: #D7B5A4; --theme-ink: #5C4034; }
.theme-relationship { --theme-wash: #F8E4EC; --theme-line: #E0B4C4; --theme-ink: #6A3E4C; }
.theme-awareness { --theme-wash: #E7EEF6; --theme-line: #B7C5DC; --theme-ink: #1A2A4A; }
.theme-money { --theme-wash: #E8EFE4; --theme-line: #B7C6AE; --theme-ink: #243044; }
.theme-purpose { --theme-wash: #E6EAF6; --theme-line: #B4C0E0; --theme-ink: #1A2A4A; }
.theme-focus { --theme-wash: #E4E8F2; --theme-line: #B3BDD4; --theme-ink: #243556; }
.theme-service { --theme-wash: #F3EBDF; --theme-line: #D4C4AE; --theme-ink: #4A3A28; }
html.dark .theme-value { --theme-wash: #3A3422; --theme-line: #8A7A3F; --theme-ink: #F3E0A0; }
html.dark .theme-habits { --theme-wash: #3A2A28; --theme-line: #8A655C; --theme-ink: #E8ECF4; }
html.dark .theme-relationship { --theme-wash: #3A2830; --theme-line: #8A6070; --theme-ink: #E8ECF4; }
html.dark .theme-awareness { --theme-wash: #243044; --theme-line: #647EAA; --theme-ink: #E8ECF4; }
html.dark .theme-money { --theme-wash: #243028; --theme-line: #5E7A62; --theme-ink: #E8ECF4; }
html.dark .theme-purpose { --theme-wash: #222A40; --theme-line: #647EAA; --theme-ink: #E8ECF4; }
html.dark .theme-focus { --theme-wash: #2A2840; --theme-line: #6E6A94; --theme-ink: #E8ECF4; }
html.dark .theme-service { --theme-wash: #332C24; --theme-line: #8A7A3F; --theme-ink: #E8ECF4; }
.logo-on-light { display: block; }
.logo-on-dark { display: none; }
html.dark .logo-on-light { display: none; }
html.dark .logo-on-dark { display: block; }
`;
