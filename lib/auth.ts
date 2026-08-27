import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function requireAuthor() {
  const supabase = await createSupabaseServer();
  if (!supabase) {
    redirect("/admin/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_author, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_author) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not-author");
  }

  return { supabase, user, profile };
}
