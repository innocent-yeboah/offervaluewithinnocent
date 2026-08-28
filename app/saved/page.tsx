import type { Metadata } from "next";
import SavedList from "@/components/SavedList";
import { copy } from "@/lib/site";

export const metadata: Metadata = {
  title: "Saved",
  description: copy.savedOnDevice,
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return (
    <main id="main" className="site-pad mx-auto max-w-3xl py-10 sm:py-16">
      <h1 className="font-serif text-[1.85rem] font-semibold tracking-tight sm:text-4xl">Saved</h1>
      <SavedList />
    </main>
  );
}
