import type { Metadata } from "next";
import { site, whatsappHref } from "@/lib/site";

const description =
  "Digital business systems for African enterprises, with a focus on Ghana. Websites and lead engines, WhatsApp and AI assistants, and workflow systems. Start by WhatsApp or email.";

export const metadata: Metadata = {
  title: "Work with me",
  description,
  alternates: { canonical: "/work-with-me" },
  openGraph: {
    type: "website",
    locale: "en",
    url: "/work-with-me",
    siteName: site.name,
    title: "Work with me",
    description,
  },
};

const offers = [
  {
    title: "Websites and lead engines",
    body: "A clear place for people to find the business and take the next step.",
  },
  {
    title: "WhatsApp and AI assistants",
    body: "A way to answer and guide customers in the conversation they already use.",
  },
  {
    title: "Workflow and operations systems",
    body: "The everyday work of the business, set out so a team can follow it.",
  },
] as const;

const steps = [
  "Send a short note on WhatsApp or email. Say what the business does, and what you want to be clearer.",
  "We talk. I listen before I suggest a system.",
  "If it is a fit, we choose a first step. If it is not, I will say so.",
] as const;

export default function WorkWithMePage() {
  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <h1 className="font-serif text-[1.85rem] font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
        Work with me
      </h1>
      <div className="mt-4 max-w-xl space-y-4 text-base leading-relaxed text-pretty text-ink sm:text-lg">
        <p>
          I’m {site.author}. I write here about offering value. I also help businesses build the
          systems that let them offer it.
        </p>
        <p>
          That work is called Build With Innocent. It is digital business systems for African
          enterprises, with a focus on Ghana.
        </p>
      </div>

      <section className="mt-12 sm:mt-14" aria-labelledby="offer-heading">
        <h2 id="offer-heading" className="font-serif text-2xl font-semibold">
          What I offer
        </h2>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          The right shape depends on the business. In general, the work is one of these:
        </p>
        <ul className="mt-6 space-y-4">
          {offers.map((offer) => (
            <li key={offer.title} className="border-l-2 border-gold/60 pl-4">
              <p className="font-medium text-ink">{offer.title}</p>
              <p className="mt-1 leading-relaxed text-muted">{offer.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 sm:mt-14" aria-labelledby="who-heading">
        <h2 id="who-heading" className="font-serif text-2xl font-semibold">
          Who it is for
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-pretty text-ink">
          African business owners and teams, with a focus on Ghana, who want a clearer way to win
          and serve customers.
        </p>
      </section>

      <section className="mt-12 sm:mt-14" aria-labelledby="start-heading">
        <h2 id="start-heading" className="font-serif text-2xl font-semibold">
          How to start
        </h2>
        <ol className="mt-4 max-w-xl list-decimal space-y-3 pl-5 text-base leading-relaxed text-ink">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-12 sm:mt-14" aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="font-serif text-2xl font-semibold">
          Start a conversation
        </h2>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          Two ways. Either one is enough. We start by talking.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-button px-4 text-sm font-medium text-paper"
          >
            WhatsApp {site.whatsappDisplay}
          </a>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-4 text-sm font-medium text-ink"
          >
            {site.email}
          </a>
        </div>
      </section>
    </main>
  );
}
