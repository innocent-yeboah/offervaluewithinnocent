"use server";

import { revalidatePath } from "next/cache";
import { subscribeToKit, type SubscribeState } from "@/lib/kit";
import { withBackoff } from "@/lib/retry";
import { copy, site } from "@/lib/site";
import { createAnonClient } from "@/lib/supabase-anon";

export type SubscribeFormState = SubscribeState;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function subscribeAction(
  _prev: SubscribeFormState,
  formData: FormData,
): Promise<SubscribeFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 200);
  const firstName = String(formData.get("firstName") ?? "")
    .trim()
    .slice(0, 80);
  const honeypot = String(formData.get("company") ?? "");

  if (honeypot) {
    return { status: "error", message: copy.tryAgain };
  }

  if (!emailPattern.test(email)) {
    return { status: "error", message: "That email does not look right — mind checking it?" };
  }

  return subscribeToKit(email, firstName || undefined);
}

export type ContactFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function contactAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const message = String(formData.get("message") ?? "").trim().slice(0, 5000);
  const honeypot = String(formData.get("company") ?? "");

  if (honeypot) {
    return { status: "error", message: copy.tryAgain };
  }

  if (name.length < 2) {
    return { status: "error", message: "Please share your name so I know who I’m writing back to." };
  }

  if (!emailPattern.test(email)) {
    return { status: "error", message: "That email does not look right — mind checking it?" };
  }

  if (message.length < 10) {
    return { status: "error", message: "A few more words would help me meet you well." };
  }

  const supabase = createAnonClient();
  if (supabase) {
    try {
      await withBackoff(async () => {
        const { error } = await supabase.from("contact_messages").insert({
          name,
          email,
          message,
        });
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      console.error("Contact save failed:", error);
      return { status: "error", message: copy.tryAgain };
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const from = process.env.RESEND_FROM_EMAIL ?? `Offer Value With Innocent <${site.email}>`;
      await withBackoff(async () => {
        const { error } = await resend.emails.send({
          from,
          to: site.email,
          replyTo: email,
          subject: `A note from ${name}`,
          text: [`From: ${name} <${email}>`, "", message].join("\n"),
        });
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      console.error("Contact email failed:", error);
    }
  }

  return {
    status: "success",
    message: `Thank you. I’ll read this, and you can always write ${site.email} directly.`,
  };
}

export async function revalidateArticles(slug?: string) {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/feed.xml");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/articles/${slug}`);
  }
}
