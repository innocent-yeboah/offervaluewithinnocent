"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSavedItems, type SavedItem } from "@/lib/reading-memory";
import { copy } from "@/lib/site";

export default function SavedList() {
  const [items, setItems] = useState<SavedItem[] | null>(null);

  useEffect(() => {
    setItems(getSavedItems());
  }, []);

  if (items === null) {
    return <p className="mt-8 text-muted">{copy.savedOnDevice}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 space-y-3">
        <p className="text-muted">{copy.savedEmpty}</p>
        <p className="text-sm text-muted">{copy.savedOnDevice}</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="text-sm text-muted">{copy.savedOnDevice}</p>
      <ul className="mt-6 divide-y divide-line">
        {items.map((item) => (
          <li key={item.slug} className="py-4 first:pt-0">
            <Link href={`/articles/${item.slug}`} className="font-serif text-xl text-ink hover:text-link">
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
