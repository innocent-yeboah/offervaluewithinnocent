import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { copy, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Write ${site.author} at ${site.email}.`,
};

export default function ContactPage() {
  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <h1 className="font-serif text-[1.85rem] font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
        Contact
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
        {copy.writeMe} You can use the form, or email{" "}
        <a className="break-all text-link underline-offset-4 hover:underline" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        . I am also on{" "}
        <a
          className="text-link underline-offset-4 hover:underline"
          href={site.linkedin}
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        .
      </p>
      <ContactForm />
      <p className="mt-10 max-w-xl text-sm leading-relaxed text-muted">
        <Link href="/work-with-me" className="text-link underline-offset-4 hover:underline">
          Work with me
        </Link>{" "}
        if you would rather talk about building a system for the business.
      </p>
    </main>
  );
}
