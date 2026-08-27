import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { copy, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Write ${site.author} at ${site.email}.`,
};

export default function ContactPage() {
  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <h1 className="font-serif text-[1.85rem] font-semibold tracking-tight sm:text-4xl">Contact</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
        {copy.writeMe} You can use the form, or email{" "}
        <a className="break-all text-link underline-offset-4 hover:underline" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        .
      </p>
      <ContactForm />
    </main>
  );
}
