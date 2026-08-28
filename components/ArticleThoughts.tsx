import ThoughtForm from "@/components/ThoughtForm";
import { formatArticleDate } from "@/lib/dates";
import { copy } from "@/lib/site";
import type { PublicThought } from "@/lib/thoughts";

type ArticleThoughtsProps = {
  slug: string;
  thoughts: PublicThought[];
};

export default function ArticleThoughts({ slug, thoughts }: ArticleThoughtsProps) {
  return (
    <section className="mt-12" aria-labelledby="thoughts-heading">
      <h2 id="thoughts-heading" className="font-serif text-xl font-semibold">
        {copy.thoughtsHeading}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{copy.thoughtsIntro}</p>
      {thoughts.length === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">{copy.thoughtsEmpty}</p>
      ) : (
        <ul className="mt-6 space-y-6">
          {thoughts.map((thought) => (
            <li key={thought.id} className="border-t border-line pt-4">
              <p className="text-sm">
                <span className="font-medium text-ink">{thought.name}</span>
                {thought.created_at ? (
                  <>
                    <span className="mx-2 text-muted" aria-hidden="true">
                      ·
                    </span>
                    <time className="text-muted" dateTime={thought.created_at}>
                      {formatArticleDate(thought.created_at)}
                    </time>
                  </>
                ) : null}
              </p>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink">{thought.body}</p>
            </li>
          ))}
        </ul>
      )}
      <ThoughtForm slug={slug} />
    </section>
  );
}
