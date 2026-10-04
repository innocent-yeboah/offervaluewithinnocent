import Link from "next/link";
import type { NextStep } from "@/lib/next-step";
import { copy } from "@/lib/site";

export default function WhereToNext({ step }: { step: NextStep }) {
  return (
    <section className="mt-10 border-t border-line pt-6" aria-labelledby="where-next-heading">
      <h2 id="where-next-heading" className="text-sm uppercase tracking-[0.14em] text-gold-ink">
        {copy.whereNext}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-pretty text-ink">{step.text}</p>
      {step.href && step.linkLabel ? (
        <p className="mt-3">
          <Link href={step.href} className="text-link underline-offset-4 hover:underline">
            {step.linkLabel}
          </Link>
        </p>
      ) : null}
    </section>
  );
}
