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
  /** Digits only, for https://wa.me/. Display form is whatsappDisplay. */
  whatsapp: "233530710628",
  whatsappDisplay: "+233 530 710 628",
  linkedin: "https://www.linkedin.com/in/innocent-golden",
  locale: "en",
} as const;

export const themes = [
  { slug: "value", label: "Value" },
  { slug: "habits", label: "Habits" },
  { slug: "relationship", label: "Relationship" },
  { slug: "service", label: "Service" },
  { slug: "awareness", label: "Awareness" },
  { slug: "purpose", label: "Purpose" },
  { slug: "focus", label: "Focus" },
  { slug: "money", label: "Money" },
] as const;

export type ThemeSlug = (typeof themes)[number]["slug"];

export const themeSlugs = themes.map((theme) => theme.slug);

/**
 * The lead piece on the home page. One line to swap.
 * It states the idea the rest of the writing comes from.
 */
export const FLAGSHIP_SLUG =
  "you-don-t-need-to-prove-your-worth-you-need-to-offer-it" as const;

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
  { href: "/work-with-me", label: "Work with me" },
  { href: "/contact", label: "Contact" },
] as const;

export const copy = {
  weeklyPromise: "New writing each week.",
  newsletterWhat:
    "New writing each week. I’ll send a short note with a link to the new piece. The reading happens here.",
  whatsappNote: "Hello Innocent, I would like to talk about working together.",
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
  excerptHint:
    "A short line for sharing. If you leave this empty, the first sentence of the piece is used.",
  kitAfterLive: "Send this week’s note in Kit when you are ready.",
  adminCopyShareLink: "Copy this link for LinkedIn and Facebook.",
  adminShareLinkCopied: "Copied. You can paste it on LinkedIn or Facebook.",
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
  homeFor:
    "If you are trying to live with more honesty, deeper service, and lasting value, this writing is for you.",
  homePromise:
    "I think out loud here about value. Offering it, instead of proving it, changes how we work.",
  homeIntro:
    "I write each week as a fellow traveler, still learning. Not as an expert. The pieces are on value, habits, relationships, service, and money.",
  readLead: "Read the lead piece",
  joinWeekly: "Join the weekly list",
  startHere: "Start here",
  flagshipFrame:
    "This is the idea everything else on the site comes from. You don’t have to prove your worth. You can offer it.",
  flagshipStandIn:
    "The piece I usually ask people to start with is not up right now. This is the latest writing.",
  readThisPiece: "Read this piece",
  whereNext: "Where to next",
  nextStepHint:
    "One or two sentences after the piece. A question, or a pointer toward the lead idea. Leave this blank and the site will point readers to the lead piece.",
  nextStepSlugHint:
    "Optional. The slug of a published piece to link under those sentences. The article title is the link.",
  nextStepMigration:
    "Where to next can be saved here after the next-step migration is applied. Until then, each piece still closes with a line.",
  nextStepTooLong: "The next step needs to stay short. Two sentences is enough.",
  nextStepSavedWithoutColumn:
    "Saved. The closing line will keep until you apply the next-step migration. Then you can save it here.",
  coverHint: "Shown at the top of the piece. Optional.",
  thumbnailHint:
    "Shown on the articles list, and on the home lead when this piece is the lead. Leave it empty and the cover is used. With no cover, a simple mark is shown.",
  thumbnailUseCover: "Use the cover image",
  thumbnailClear: "Remove thumbnail",
  thumbnailNone: "No saved thumbnail. The list uses the cover, or a simple mark if there is no cover.",
  thumbnailMigration:
    "A saved thumbnail can be stored here after you apply the migration. Until then, the list uses the cover. With no cover, a simple mark is shown.",
  savedWithoutNewColumns:
    "Saved. The closing line or thumbnail needs the migration before it can be stored. The rest of the piece is saved.",
} as const;

/** WhatsApp chat with a short note already written. */
export function whatsappHref(): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(copy.whatsappNote)}`;
}
