import Anthropic from "@anthropic-ai/sdk";
import { withBackoff } from "@/lib/retry";
import { copy, site } from "@/lib/site";

export const writingHelpKinds = ["draft", "clarify", "outline", "tighten"] as const;
export type WritingHelpKind = (typeof writingHelpKinds)[number];

export type WritingHelpResult =
  | { status: "closed"; message: string }
  | { status: "ok"; suggestion: string }
  | { status: "error"; message: string };

const MAX_BODY = 24_000;
const MAX_NOTE = 400;
const MAX_TITLE = 200;

const kindInstruction: Record<WritingHelpKind, string> = {
  draft:
    "Write a first pass of a weekly essay he could publish. Use his title, theme, notes, and any draft he already has. About 600 to 900 words. Markdown. Short paragraphs. A warm opening, a few clear turns, a quiet close. Do not invent his biography, family, jobs, or faith. Do not add a title heading. The title lives outside the body. He will still edit, save, and publish.",
  clarify:
    "Clarify. Keep his meaning. Make the thinking easier to follow. Stay about the same length. Do not add new stories or claims. Keep his voice: short sentences, plain words, no em dashes.",
  outline:
    "Outline. Turn his notes (and title) into a clear outline he can write from. Short headings and brief bullets. Do not finish the essay for him unless he already wrote full paragraphs. If he did, shape those into an outline of what he has.",
  tighten:
    "Tighten. Same meaning, fewer words. Cut fluff. Keep the warmth and the plain spoken voice. Do not add new ideas. Do not add em dashes.",
};

/**
 * A private editor for Innocent’s drafts. Never the public voice,
 * never a publisher, never a source of invented biography.
 */
const systemPrompt = `You are a quiet writing partner for ${site.author}, who writes ${site.name}.

Help him serve a reader who is his younger self. He is a fellow traveler, still learning. Not an expert. Not a guru. Not a coach. Not a brand. He still decides every word. You never publish. You never send email. You never invent his life.

Sound like a real person talking to a friend. Simple. Plain. Human.

How he sounds:
- Short sentences. Then another short sentence. Like speech.
- Everyday words. If a child in grade 6 could not say it, rewrite it.
- “I” and “we” and “you.” Warm. Honest. Never a lecture.
- Questions a real person would ask. Not slogans.
- He admits he is still in the middle. He does not pretend he has arrived.
- He talks about value, habits, relationship, awareness, money, purpose, focus, and service as a path, not as a product.

He writes like this:
“This is not a story of arrival. It is a story of becoming, and I am still in the middle of it.”
“I write as a fellow traveler, still learning. Not as an expert.”
“Value is just making something a little bit better for someone else.”
“You do not need to be an expert to help someone. You just need to be one step ahead of where they are right now.”

Do not write like this:
- Em dashes. Never use — or – as a pause. Use a period, a comma, or “and”.
- Fancy or academic words. No “leverage,” “unlock your potential,” “ecosystem,” “framework,” “high-value,” “game-changer.”
- Motivational-speaker lines, LinkedIn flex, or self-help lists that sound like a course.
- Faith, church, or scripture unless it is already in his draft.
- Biography, credentials, jobs, family, or claims he did not write.
- Urgency, guilt, hype, or dark patterns.
- Long winding sentences. A preamble. “Here is a draft.”

Keep markdown simple: paragraphs, and a rare heading only if the outline kind needs it.

Return only the markdown he should consider.`;

type GeminiPart = { text?: string; thought?: boolean };

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }>;
  error?: { message?: string };
};

export function isWritingHelpKind(value: string): value is WritingHelpKind {
  return (writingHelpKinds as readonly string[]).includes(value);
}

function anthropicKey(): string {
  return process.env.ANTHROPIC_API_KEY?.trim() ?? "";
}

function geminiKey(): string {
  return process.env.GEMINI_API_KEY?.trim() ?? "";
}

export function writingHelpConfigured(): boolean {
  return Boolean(anthropicKey() || geminiKey());
}

function textFromAnthropic(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .map((block) => (block.type === "text" ? block.text : ""))
    .filter((part) => part.length > 0)
    .join("\n\n")
    .trim();
}

function textFromGemini(payload: GeminiResponse): string {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .filter((part) => part.length > 0)
    .join("\n\n")
    .trim();
}

function inHisVoice(markdown: string): string {
  return markdown
    .replaceAll("—", ". ")
    .replaceAll(" – ", ". ")
    .replaceAll(/\s+\./g, ".")
    .replaceAll(/[ \t]{2,}/g, " ")
    .trim();
}

function buildUserMessage(input: {
  kind: WritingHelpKind;
  title: string;
  theme: string;
  body: string;
  note: string;
}): string {
  const parts = [
    kindInstruction[input.kind],
    `Title: ${input.title || "(none yet)"}`,
    `Theme: ${input.theme}`,
    "",
    "Current draft:",
    input.body.trim() ? input.body : "(empty)",
  ];

  if (input.note) {
    parts.push("", "Innocent’s extra note:", input.note);
  }

  return parts.join("\n");
}

async function suggestWithAnthropic(userMessage: string): Promise<string> {
  const client = new Anthropic({ apiKey: anthropicKey() });
  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5-20250929";
  const message = await withBackoff(
    async () =>
      client.messages.create({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    { retries: 2, baseDelayMs: 500 },
  );

  return textFromAnthropic(message.content);
}

async function suggestWithGemini(userMessage: string): Promise<string> {
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const payload = await withBackoff(async () => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiKey(),
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.6,
          thinkingConfig: {
            thinkingLevel: "low",
          },
        },
      }),
    });

    const data = (await response.json()) as GeminiResponse;
    if (!response.ok) {
      throw new Error(data.error?.message ?? `Gemini request failed (${response.status})`);
    }
    return data;
  }, { retries: 2, baseDelayMs: 500 });

  return textFromGemini(payload);
}

export async function suggestWriting(input: {
  kind: WritingHelpKind;
  title: string;
  theme: string;
  body: string;
  note?: string;
}): Promise<WritingHelpResult> {
  if (!writingHelpConfigured()) {
    return { status: "closed", message: copy.writingHelpClosed };
  }

  const title = input.title.trim().slice(0, MAX_TITLE);
  const body = input.body.slice(0, MAX_BODY);
  const note = input.note?.trim().slice(0, MAX_NOTE) ?? "";

  if (input.kind !== "outline" && input.kind !== "draft" && body.trim().length < 12) {
    return {
      status: "error",
      message: "Write a little first, then I can help.",
    };
  }

  if ((input.kind === "outline" || input.kind === "draft") && !title && body.trim().length < 12) {
    return {
      status: "error",
      message: "A title or a few notes will help me begin.",
    };
  }

  const userMessage = buildUserMessage({
    kind: input.kind,
    title,
    theme: input.theme,
    body,
    note,
  });

  try {
    const suggestion = anthropicKey()
      ? await suggestWithAnthropic(userMessage)
      : await suggestWithGemini(userMessage);

    if (!suggestion) {
      return { status: "error", message: copy.tryAgain };
    }

    return { status: "ok", suggestion: inHisVoice(suggestion) };
  } catch (error) {
    console.error("Writing help failed:", error);
    return { status: "error", message: copy.tryAgain };
  }
}
