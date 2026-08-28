import { createAnonClient } from "@/lib/supabase-anon";

export type PublicThought = {
  id: number;
  name: string;
  body: string;
  created_at: string;
};

/**
 * Live thoughts only. Cookie-free anon client. Never loads email.
 */
export async function getPublishedThoughts(articleId: number): Promise<PublicThought[]> {
  const supabase = createAnonClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("article_thoughts")
    .select("id, name, body, created_at")
    .eq("article_id", articleId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    if (error) {
      console.error("Failed to load thoughts:", error.message);
    }
    return [];
  }

  return data as PublicThought[];
}
