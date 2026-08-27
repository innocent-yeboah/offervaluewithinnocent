import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-16 sm:py-24">
      <h1 className="font-serif text-[1.85rem] font-semibold tracking-tight text-balance sm:text-4xl">Let’s try that again together?</h1>
      <p className="mt-4 text-muted">That page isn’t here. The writing lives on Home and Articles.</p>
      <p className="mt-6">
        <Link href="/" className="text-link hover:underline">
          Back home
        </Link>
      </p>
    </main>
  );
}
