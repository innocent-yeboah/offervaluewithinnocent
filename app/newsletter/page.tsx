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
    <main id="main" className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">Newsletter</h1>
      <p className="mt-4 text-lg text-muted">{copy.weeklyPromise}</p>
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
