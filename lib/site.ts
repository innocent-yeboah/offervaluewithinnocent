/**
 * Single source of truth for Offer Value With Innocent.
 * A personal writing home: serve first, write weekly, grow trust.
 */
export const site = {
  name: "Offer Value With Innocent",
  author: "Innocent Golden",
  headline:
    "You don’t have to hustle to prove your worth. Let’s learn how to offer value from the inside out.",
  tagline: "Weekly writing on value, habits, relationships, and service.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://offervaluewithinnocent.com",
  email: "hello@offervaluewithinnocent.com",
  linkedin: "https://www.linkedin.com/in/innocent-golden",
  locale: "en",
} as const;

export const themes = [
  { slug: "value", label: "Value" },
  { slug: "habits", label: "Habits" },
  { slug: "relationship", label: "Relationship" },
  { slug: "awareness", label: "Awareness" },
  { slug: "money", label: "Money" },
  { slug: "purpose", label: "Purpose" },
  { slug: "focus", label: "Focus" },
  { slug: "service", label: "Service" },
] as const;

export type ThemeSlug = (typeof themes)[number]["slug"];

export const themeSlugs = themes.map((theme) => theme.slug);

export function isThemeSlug(value: string): value is ThemeSlug {
  return (themeSlugs as readonly string[]).includes(value);
}

export function themeLabel(slug: string): string {
  return themes.find((theme) => theme.slug === slug)?.label ?? slug;
}

export function themeToneClass(slug: string): string {
  return isThemeSlug(slug) ? `theme-${slug}` : "theme-value";
}

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/about", label: "About" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/contact", label: "Contact" },
] as const;

export const copy = {
  weeklyPromise: "New writing each week.",
  newsletterWhat:
    "Each week I’ll send a short note with a link to the new piece. The reading happens here.",
  subscribeQuiet: "No spam. No hype. Just one thoughtful note each week.",
  emptyArticles:
    "There are no pieces here yet. I have promised new writing each week. The first one will live on this page.",
  subscribeClosed: "Subscriptions aren’t open just yet.",
  subscribeConfirm:
    "Check your email to confirm. You are not on the list until you click that link. If it is not there, look in spam.",
  subscribeActive:
    "You’re on the list. Each week I’ll send a short note with a link to the new piece.",
  tryAgain: "Let’s try that again together?",
  slowDown:
    "That’s a few tries in a short time. Pause, then come back — I’ll still be here.",
  writeMe: "If this met you, write me.",
  continueWith: "Continue with",
  shareArticle: "Share this article",
  markRead: "Mark as read",
  markedRead: "Marked as read",
  saveLater: "Save for later",
  savedLater: "Saved for later",
  linkCopied: "Link copied. You can paste it anywhere.",
  savedEmpty: "Nothing saved on this device yet. Open a piece and tap Save for later.",
  savedOnDevice: "Saved on this device only. Not tied to an email or account.",
  kitAfterLive: "Send this week’s note in Kit when you are ready.",
  scheduledHint:
    "Readers will see this only after that time. Check in a private window.",
  bookQuiet:
    "A book may grow from this writing. It is only an idea today — no date, no waitlist.",
  writingHelpClosed:
    "Writing help isn’t open yet. A free Gemini key will open it until you’re ready for Claude.",
  writingHelpHint:
    "Ask for a first draft, or for help shaping what you wrote. You still save and publish. Nothing is sent to readers.",
  thoughtsHeading: "Thoughts on this piece",
  thoughtsIntro:
    "If something here met you, you can leave a few words. I read each one before it appears.",
  thoughtsEmpty: "No thoughts here yet. Yours can be the first.",
  thoughtsShare: "Share a thought",
  thoughtsThanks:
    "Thank you. I’ll read this, and if it belongs with the piece, it will appear here.",
} as const;
