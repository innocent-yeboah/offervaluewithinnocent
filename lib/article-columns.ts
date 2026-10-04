/**
 * Columns added after the first schema. Reads and saves still work
 * when a migration has not been applied yet.
 */
export const OPTIONAL_ARTICLE_COLUMNS = [
  "next_step",
  "next_step_slug",
  "thumbnail_path",
] as const;

export type ColumnError = {
  code?: string;
  message?: string;
};

const optionalByLength = [...OPTIONAL_ARTICLE_COLUMNS].sort((a, b) => b.length - a.length);

/** The optional column named in a Postgres or PostgREST error, if that is what failed. */
export function missingOptionalColumn(error: ColumnError | null | undefined): string | null {
  if (!error) {
    return null;
  }
  const message = (error.message ?? "").toLowerCase();
  const code = error.code ?? "";
  const looksMissing =
    code === "42703" ||
    code === "PGRST204" ||
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("could not find");
  if (!looksMissing) {
    return null;
  }
  return optionalByLength.find((name) => message.includes(name)) ?? null;
}

export async function withOptionalColumns<T>(
  baseColumns: string,
  run: (columns: string) => PromiseLike<{ data: T; error: ColumnError | null }>,
): Promise<{ data: T | null; error: ColumnError | null; dropped: string[] }> {
  const dropped: string[] = [];
  const selectList = () =>
    [baseColumns, ...OPTIONAL_ARTICLE_COLUMNS.filter((name) => !dropped.includes(name))]
      .filter(Boolean)
      .join(", ");

  for (let attempt = 0; attempt <= OPTIONAL_ARTICLE_COLUMNS.length; attempt += 1) {
    const result = await run(selectList());
    if (!result.error) {
      return { data: result.data, error: null, dropped };
    }
    const missing = missingOptionalColumn(result.error);
    if (!missing || dropped.includes(missing)) {
      return { data: null, error: result.error, dropped };
    }
    dropped.push(missing);
  }

  return { data: null, error: { message: "Could not read articles." }, dropped };
}
