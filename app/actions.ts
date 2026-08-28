"use server";

import { revalidatePath } from "next/cache";
import { subscribeToKit, type SubscribeState } from "@/lib/kit";
import { allowRequest, markSubmitted, recentlySubmitted } from "@/lib/rate-limit";
import { withBackoff } from "@/lib/retry";
import { copy, site } from "@/lib/site";
import { getLiveArticleBySlug } from "@/lib/articles";
import { createServiceClient } from "@/lib/supabase-service";

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

  if (await recentlySubmitted("subscribe")) {
    return { status: "error", message: copy.slowDown };
  }

  if (!(await allowRequest("subscribe"))) {
    return { status: "error", message: copy.slowDown };
  }

  const result = await subscribeToKit(email, firstName || undefined);
  if (result.status === "confirm" || result.status === "active") {
    await markSubmitted("subscribe");
  }
  return result;
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

  if (await recentlySubmitted("contact")) {
    return { status: "error", message: copy.slowDown };
  }

  if (!(await allowRequest("contact"))) {
    return { status: "error", message: copy.slowDown };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    console.error("Contact save skipped: SUPABASE_SERVICE_ROLE_KEY is not set.");
    return { status: "error", message: copy.tryAgain };
  }

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

  await markSubmitted("contact");

  return {
    status: "success",
    message: `Thank you. I’ll read this, and you can always write ${site.email} directly.`,
  };
}

export type CommentFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function commentAction(
  _prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .slice(0, 160);
  const name = String(formData.get("name") ?? "")
    .trim()
    .slice(0, 80);
  const emailRaw = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 200);
  const body = String(formData.get("body") ?? "")
    .trim()
    .slice(0, 2000);
  const honeypot = String(formData.get("company") ?? "");

  if (honeypot) {
    return { status: "error", message: copy.tryAgain };
  }

  if (name.length < 2) {
    return { status: "error", message: "Please share your name so readers know who wrote this." };
  }

  if (emailRaw && !emailPattern.test(emailRaw)) {
    return { status: "error", message: "That email does not look right — mind checking it?" };
  }

  if (body.length < 10) {
    return { status: "error", message: "A few more words would help this thought land." };
  }

  const article = await getLiveArticleBySlug(slug);
  if (!article) {
    return { status: "error", message: copy.tryAgain };
  }

  if (await recentlySubmitted("comment")) {
    return { status: "error", message: copy.slowDown };
  }

  if (!(await allowRequest("comment"))) {
    return { status: "error", message: copy.slowDown };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    console.error("Thought save skipped: SUPABASE_SERVICE_ROLE_KEY is not set.");
    return { status: "error", message: copy.tryAgain };
  }

  try {
    await withBackoff(async () => {
      const { error } = await supabase.from("article_thoughts").insert({
        article_id: article.id,
        name,
        email: emailRaw || null,
        body,
        status: "pending",
      });
      if (error) {
        throw new Error(error.message);
      }
    });
  } catch (error) {
    console.error("Thought save failed:", error);
    return { status: "error", message: copy.tryAgain };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const from = process.env.RESEND_FROM_EMAIL ?? `Offer Value With Innocent <${site.email}>`;
      const replyTo = emailRaw || undefined;
      await withBackoff(async () => {
        const { error } = await resend.emails.send({
          from,
          to: site.email,
          replyTo,
          subject: `A thought on ${article.title}`,
          text: [
            `From: ${name}${emailRaw ? ` <${emailRaw}>` : ""}`,
            `Piece: ${site.url}/articles/${article.slug}`,
            "",
            body,
            "",
            "This waits in /admin until you show it on the piece.",
          ].join("\n"),
        });
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      console.error("Thought email failed:", error);
    }
  }

  await markSubmitted("comment");

  return {
    status: "success",
    message: copy.thoughtsThanks,
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
