import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { copy, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Write ${site.author} at ${site.email}.`,
};

export default function ContactPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        {copy.writeMe} You can use the form, or email{" "}
        <a className="text-link underline-offset-4 hover:underline" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        .
      </p>
      <ContactForm />
    </main>
  );
}
