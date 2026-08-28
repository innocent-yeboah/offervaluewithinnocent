"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthor } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function signOutAction() {
  const supabase = await createSupabaseServer();
  if (supabase) {
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/admin/login");
}

export async function setThoughtStatusAction(formData: FormData) {
  const { supabase } = await requireAuthor();
  const id = Number(formData.get("id"));
  const slug = String(formData.get("slug") ?? "").trim();
  const status = String(formData.get("status") ?? "");

  if (!Number.isInteger(id) || id < 1) {
    redirect("/admin");
  }

  if (status !== "published" && status !== "hidden") {
    redirect("/admin");
  }

  const { error } = await supabase
    .from("article_thoughts")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Thought review failed:", error.message);
  }

  revalidatePath("/admin");
  if (slug) {
    revalidatePath(`/articles/${slug}`);
  }
  redirect("/admin");
}
