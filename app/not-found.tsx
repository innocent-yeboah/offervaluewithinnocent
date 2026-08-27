import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-5 py-24">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">Let’s try that again together?</h1>
      <p className="mt-4 text-muted">That page isn’t here. The writing lives on Home and Articles.</p>
      <p className="mt-6">
        <Link href="/" className="text-link hover:underline">
          Back home
        </Link>
      </p>
    </main>
  );
}
