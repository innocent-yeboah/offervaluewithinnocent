import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/lib/site";

const description = "Selected work built by Innocent. Each project links to the live site.";

export const metadata: Metadata = {
  title: "Portfolio",
  description,
  alternates: { canonical: "/portfolio" },
  openGraph: {
    type: "website",
    locale: "en",
    url: "/portfolio",
    siteName: site.name,
    title: "Portfolio",
    description,
  },
};

const projects = [
  {
    name: "School Ledger",
    description: "A school management system for private schools in Ghana.",
    live: "https://schoolledgergh.vercel.app",
    github: "https://github.com/innocent-yeboah/schoolledgergh",
    image: "/portfolio/school-ledger.webp",
    alt: "School Ledger sign-in page, headed Trusted by Ghana’s private schools.",
  },
  {
    name: "My Central Bank",
    description: "A personal financial management system for a private record of your money.",
    live: "https://mycentralbank-rosy.vercel.app",
    github: "https://github.com/innocent-yeboah/MyCentralBank",
    image: "/portfolio/my-central-bank.webp",
    alt: "My Central Bank sign-in page, with the line See your money clearly.",
  },
  {
    name: "De House of Ryker",
    description: "An Accra perfume house with oils, sprays, and ready stock to order online.",
    live: "https://dehouseofryker.vercel.app",
    github: "https://github.com/innocent-yeboah/dehouseofryker",
    image: "/portfolio/de-house-of-ryker.webp",
    alt: "De House of Ryker homepage, an Accra perfume house, with a bottle and atomiser on a warm background.",
  },
  {
    name: "i7 Therapeutics Herbal",
    description: "Herbal wisdom, therapeutic touch, and mindful coaching, online and in person.",
    live: "https://i7-therapeutics-herbal.vercel.app",
    github: "https://github.com/innocent-yeboah/i7-Therapeutics-Herbal",
    image: "/portfolio/i7-therapeutics-herbal.webp",
    alt: "i7 Therapeutics Herbal homepage, with the heading Traditional healing therapies for pain, stress, and recovery.",
  },
  {
    name: "Brite MJ Tech",
    description: "A professional security company for CCTV, fencing, and gates in Accra.",
    live: "https://brite-mj-tech.vercel.app",
    github: "https://github.com/innocent-yeboah/BriteMJTech",
    image: "/portfolio/brite-mj-tech.webp",
    alt: "Brite MJ Tech homepage, with the heading CCTV, fencing, and gate security in Accra, over a photo of a technician.",
  },
  {
    name: "AI WhatsApp",
    description: "A tool for communicating with clients over WhatsApp.",
    live: "https://ai-whats-app-delta.vercel.app",
    github: "https://github.com/innocent-yeboah/AI-WhatsApp",
    image: "/portfolio/ai-whatsapp.webp",
    alt: "WhatsApp AI Dashboard sign-in, asking for a password to continue.",
  },
  {
    name: "Sufloria Cleaners",
    description: "A cleaning service in Derby, with the line “A Higher Standard of Clean.”",
    live: "https://sufloriacleaners.vercel.app",
    github: "https://github.com/innocent-yeboah/Sufloria-Cleaners",
    image: "/portfolio/sufloria-cleaners.webp",
    alt: "Sufloria Cleaners homepage, with the line A Higher Standard of Clean over a bright kitchen.",
  },
  {
    name: "Rosca Cleaning",
    description: "A UK-based cleaning service for homes and businesses.",
    live: "https://rosca-cleaning.vercel.app",
    github: "https://github.com/innocent-yeboah/ROSCA_CLEANING",
    image: "/portfolio/rosca-cleaning.webp",
    alt: "Rosca Cleaning homepage, with the heading Professional cleaning services you can trust, beside a photo of a cleaner.",
  },
] as const;

export default function PortfolioPage() {
  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <h1 className="font-serif text-[1.85rem] font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
        Portfolio
      </h1>
      <div className="mt-4 max-w-xl space-y-4 text-base leading-relaxed text-pretty text-ink sm:text-lg">
        <p>Selected work built by Innocent. Each project links to the live site.</p>
      </div>

      <ul className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2">
        {projects.map((project, index) => (
          <li key={project.name} className="flex flex-col overflow-hidden rounded-lg border border-line">
            <Image
              src={project.image}
              alt={project.alt}
              width={1440}
              height={900}
              priority={index < 2}
              sizes="(min-width: 640px) 360px, calc(100vw - 2rem)"
              className="h-auto w-full"
            />
            <div className="flex flex-1 flex-col px-4 py-5">
              <h2 className="font-serif text-lg font-semibold text-balance text-ink">{project.name}</h2>
              <p className="mt-2 leading-relaxed text-pretty text-muted">{project.description}</p>
              <div className="mt-3 flex flex-col">
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm font-medium text-link underline-offset-4 hover:underline"
                >
                  Visit the live site
                  <span className="sr-only"> for {project.name} (opens in a new tab)</span>
                </a>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  GitHub repository
                  <span className="sr-only"> for {project.name} (opens in a new tab)</span>
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
