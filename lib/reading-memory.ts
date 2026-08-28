export type SavedItem = {
  slug: string;
  title: string;
};

const READ_KEY = "ovwi-read-slugs";
const SAVED_KEY = "ovwi-saved-items";

function parseStringList(raw: string | null): string[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function parseSavedList(raw: string | null): SavedItem[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is SavedItem => {
      if (!item || typeof item !== "object") {
        return false;
      }
      const row = item as { slug?: unknown; title?: unknown };
      return typeof row.slug === "string" && typeof row.title === "string";
    });
  } catch {
    return [];
  }
}

export function getReadSlugs(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  return parseStringList(localStorage.getItem(READ_KEY));
}

export function isRead(slug: string): boolean {
  return getReadSlugs().includes(slug);
}

export function setRead(slug: string, read: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  const next = new Set(getReadSlugs());
  if (read) {
    next.add(slug);
  } else {
    next.delete(slug);
  }
  localStorage.setItem(READ_KEY, JSON.stringify([...next]));
}

export function getSavedItems(): SavedItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  return parseSavedList(localStorage.getItem(SAVED_KEY));
}

export function isSaved(slug: string): boolean {
  return getSavedItems().some((item) => item.slug === slug);
}

export function setSaved(item: SavedItem, saved: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  const without = getSavedItems().filter((row) => row.slug !== item.slug);
  const next = saved ? [item, ...without] : without;
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
}
