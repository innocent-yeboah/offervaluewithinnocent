import { FLAGSHIP_SLUG } from "@/lib/site";

export type NextStepArticle = {
  slug: string;
  title: string;
  next_step?: string | null;
  next_step_slug?: string | null;
};

export type NextStep = {
  text: string;
  href: string | null;
  linkLabel: string | null;
};

function clean(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function linkFor(article: NextStepArticle | null, selfSlug: string): NextStepArticle | null {
  if (!article || article.slug === selfSlug) {
    return null;
  }
  return article;
}

/**
 * Every piece ends somewhere. A saved line wins. Otherwise the reader is
 * pointed at the lead piece. The lead piece itself asks a question, and
 * keeps a link onward when another piece is available.
 */
export function resolveNextStep(input: {
  article: NextStepArticle;
  flagship: NextStepArticle | null;
  linked: NextStepArticle | null;
  continueArticle: NextStepArticle | null;
}): NextStep {
  const custom = clean(input.article.next_step);
  const linked = linkFor(input.linked, input.article.slug);

  if (custom) {
    return {
      text: custom,
      href: linked ? `/articles/${linked.slug}` : null,
      linkLabel: linked?.title ?? null,
    };
  }

  if (linked) {
    return {
      text: "If you want to stay with this, the next piece is here.",
      href: `/articles/${linked.slug}`,
      linkLabel: linked.title,
    };
  }

  const flagship = linkFor(input.flagship, input.article.slug);
  if (flagship && flagship.slug === FLAGSHIP_SLUG) {
    return {
      text: "You do not have to prove your worth. You can offer it, and that is the idea I would read next.",
      href: `/articles/${flagship.slug}`,
      linkLabel: flagship.title,
    };
  }

  const onward = flagship ?? linkFor(input.continueArticle, input.article.slug);
  return {
    text: onward
      ? "Where are you still trying to prove yourself, when you could offer what you already have? If you want to stay with that, keep reading."
      : "Where are you still trying to prove yourself, when you could offer what you already have?",
    href: onward ? `/articles/${onward.slug}` : null,
    linkLabel: onward?.title ?? null,
  };
}
