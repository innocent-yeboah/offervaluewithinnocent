import type { Metadata } from "next";
import Link from "next/link";
import SubscribeInvite from "@/components/SubscribeInvite";
import { isKitConfigured } from "@/lib/kit";
import { copy } from "@/lib/site";

export const metadata: Metadata = {
  title: "Newsletter",
  description: copy.newsletterWhat,
};

export default function NewsletterPage() {
  const kitOpen = isKitConfigured();

  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <h1 className="font-serif text-[1.85rem] font-semibold tracking-tight sm:text-4xl">Newsletter</h1>
      <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{copy.weeklyPromise}</p>
      <p className="mt-3 max-w-xl text-muted">{copy.newsletterWhat}</p>
      <p className="mt-3 max-w-xl text-sm text-muted">{copy.bookQuiet}</p>
      <div className="mt-10">
        <SubscribeInvite kitOpen={kitOpen} />
      </div>
      <p className="mt-8 text-sm text-muted">
        You can also follow by{" "}
        <Link href="/feed.xml" className="text-link hover:underline">
          RSS
        </Link>
        .
      </p>
    </main>
  );
}
