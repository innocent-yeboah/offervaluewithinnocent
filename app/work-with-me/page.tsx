import type { Metadata } from "next";
import Link from "next/link";
import AuthorPortrait from "@/components/AuthorPortrait";
import { consultationMailto, site } from "@/lib/site";

const description =
  "Software that helps African businesses win and serve customers. Custom software, AI solutions, cloud migration, and ongoing support. Start with a free consultation by email.";

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

const services = [
  {
    title: "Custom software",
    body: "I build it around how your business actually runs.",
  },
  {
    title: "AI solutions",
    body: "I build assistants and automation that save your team time.",
  },
  {
    title: "Cloud migration",
    body: "I move your systems to the cloud safely, with little disruption.",
  },
  {
    title: "Ongoing support",
    body: "I stay after launch and keep it working.",
  },
] as const;

const steps = [
  "Email me.",
  "Tell me briefly what you’re trying to solve.",
  "I reply within a day.",
  "We agree the next step together.",
] as const;

const skills = [
  "web development",
  "AI engineering",
  "cloud and DevOps",
  "mobile development",
  "cybersecurity",
  "data engineering",
] as const;

function ConsultationButton() {
  return (
    <a
      href={consultationMailto()}
      className="inline-flex min-h-11 items-center justify-center rounded-md bg-button px-4 text-sm font-medium text-paper"
    >
      Get a free consultation
    </a>
  );
}

export default function WorkWithMePage() {
  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <h1 className="font-serif text-[1.85rem] font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
        Software that helps African businesses win and serve customers
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-pretty text-ink sm:text-lg">
        I’m Innocent. I build it myself, and I work with you directly.
      </p>
      <div className="mt-8">
        <ConsultationButton />
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Or email me at{" "}
          <a
            className="break-all text-link underline-offset-4 hover:underline"
            href={`mailto:${site.email}`}
          >
            {site.email}
          </a>
        </p>
      </div>

      <section className="mt-12 sm:mt-14" aria-labelledby="who-heading">
        <h2 id="who-heading" className="font-serif text-2xl font-semibold">
          Who this is for
        </h2>
        <div className="mt-3 max-w-xl space-y-3 text-base leading-relaxed text-pretty text-ink">
          <p>
            This is for African business owners and teams who need a system built, moved, or kept
            running.
          </p>
          <p>You want one accountable person, rather than an agency chain.</p>
        </div>
      </section>

      <section className="mt-12 sm:mt-14" aria-labelledby="services-heading">
        <h2 id="services-heading" className="font-serif text-2xl font-semibold">
          What I do
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <li key={service.title} className="rounded-lg border border-line px-4 py-5">
              <h3 className="font-serif text-lg font-semibold text-ink">{service.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{service.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 sm:mt-14" aria-labelledby="skills-heading">
        <h2 id="skills-heading" className="font-serif text-2xl font-semibold">
          Skills
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg">
          <span className="font-serif text-xl font-semibold text-ink sm:text-2xl">Software engineering</span>
          <span className="text-muted"> · {skills.join(" · ")}</span>
        </p>
      </section>

      <section className="mt-12 sm:mt-14" aria-labelledby="how-heading">
        <h2 id="how-heading" className="font-serif text-2xl font-semibold">
          How I work
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-pretty text-ink">
          You talk to the person doing the work. There is no middleman.
        </p>
        <ol className="mt-4 max-w-xl list-decimal space-y-3 pl-5 text-base leading-relaxed text-ink">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-12 sm:mt-14" aria-labelledby="about-heading">
        <h2 id="about-heading" className="font-serif text-2xl font-semibold">
          About
        </h2>
        <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
          <AuthorPortrait size="about" />
          <p className="max-w-sm text-base leading-relaxed text-ink">
            <Link href="/about" className="text-link underline-offset-4 hover:underline">
              Read the full About page
            </Link>
          </p>
        </div>
        <div className="mt-8 max-w-xl space-y-5 text-base leading-relaxed text-pretty text-ink sm:text-lg">
          <p>
            I’m {site.author}. {site.name} is where I write about what I am learning. It comes from
            one idea. You don’t have to prove your worth. You can offer it. I am a fellow traveler,
            still learning. Not an expert.
          </p>
          <p>
            I build software for businesses through Build With Innocent. The work is digital business
            systems for African enterprises, with a focus on Ghana.
          </p>
          <p>
            I work with you directly. You talk to the person doing the work. There is no middleman
            between us.
          </p>
        </div>
      </section>

      <section className="mt-12 sm:mt-16" aria-label="Write to me">
        <p className="max-w-xl font-serif text-xl leading-snug text-pretty text-ink sm:text-2xl">
          Write to me, and tell me what you are trying to solve.
        </p>
        <p className="mt-6">
          <ConsultationButton />
        </p>
      </section>
    </main>
  );
}
