import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What this site collects, and how to leave the list.",
};

export default function PrivacyPage() {
  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <h1 className="font-serif text-[1.85rem] font-semibold tracking-tight sm:text-4xl">Privacy</h1>
      <div className="mt-8 space-y-4 leading-relaxed text-ink">
        <p>
          This is a small writing site. I collect as little as I need to keep a conversation going.
        </p>
        <p>
          If you join the list, your email (and first name, if you share it) is stored by ConvertKit
          (Kit), so I can send a short weekly note with a link to new writing. You are not on the
          list until you confirm. You can leave anytime through the unsubscribe link in those emails.
        </p>
        <p>
          If you use the contact form, I store your name, email, and message so I can write back. I
          may also receive a copy by email.
        </p>
        <p>
          The site uses Vercel Analytics to see which pages are read — not to follow you around the
          web, and not to sell anything. There is no cookie banner because this is kept light on
          purpose.
        </p>
        <p>
          Questions: <span className="break-all">{site.email}</span>.
        </p>
      </div>
    </main>
  );
}
