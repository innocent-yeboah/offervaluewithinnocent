/**
 * Display timestamps in the visitor’s local timezone.
 * Values are stored as timestamptz in the database.
 */
export function formatArticleDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function isLive(status: string, publishedAt: string | null): boolean {
  if (status !== "published" || !publishedAt) {
    return false;
  }
  return new Date(publishedAt).getTime() <= Date.now();
}

export function isScheduled(status: string, publishedAt: string | null): boolean {
  if (status !== "published" || !publishedAt) {
    return false;
  }
  return new Date(publishedAt).getTime() > Date.now();
}

export type VisibilityLabel = "Draft" | "Scheduled" | "Live";

export function visibilityLabel(
  status: string,
  publishedAt: string | null,
): VisibilityLabel {
  if (status !== "published") {
    return "Draft";
  }
  if (isScheduled(status, publishedAt)) {
    return "Scheduled";
  }
  return "Live";
}
