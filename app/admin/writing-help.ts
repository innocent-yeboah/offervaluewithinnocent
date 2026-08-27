"use server";

import { requireAuthor } from "@/lib/auth";
import { isWritingHelpKind, suggestWriting, type WritingHelpResult } from "@/lib/claude";
import { copy, isThemeSlug } from "@/lib/site";

export async function helpWithWriting(input: {
  kind: string;
  title: string;
  theme: string;
  body: string;
  note?: string;
}): Promise<WritingHelpResult> {
  await requireAuthor();

  if (!isWritingHelpKind(input.kind) || !isThemeSlug(input.theme)) {
    return { status: "error", message: copy.tryAgain };
  }

  return suggestWriting({
    kind: input.kind,
    title: input.title,
    theme: input.theme,
    body: input.body,
    note: input.note,
  });
}
