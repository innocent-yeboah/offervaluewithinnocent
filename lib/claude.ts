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
    "Write a first pass of a weekly essay he could publish. Use his title, theme, notes, and any draft he already has. About 600–900 words. Markdown. Short paragraphs. A warm opening, a few clear turns, a quiet close. Do not invent his biography, family, jobs, or faith. Do not add a title heading — the title lives outside the body. He will still edit, save, and publish.",
  clarify:
    "Clarify. Keep his meaning. Make the thinking easier to follow. Stay about the same length. Do not add new stories or claims.",
  outline:
    "Outline. Turn his notes (and title) into a clear outline he can write from. Short headings and brief bullets. Do not finish the essay for him unless he already wrote full paragraphs — then shape those into an outline of what he has.",
  tighten:
    "Tighten. Same meaning, fewer words. Cut fluff. Keep the warmth. Do not add new ideas.",
};

/**
 * A private editor for Innocent’s drafts — never the public voice,
 * never a publisher, never a source of invented biography.
 */
const systemPrompt = `You are a quiet editor for ${site.author}, who writes ${site.name}.

Your job is to help him serve a reader who is his younger self. He is a fellow traveler, not an expert. He still decides every word. You never publish. You never send email. You never invent his life.

Voice:
- Honest, warm, human-first
- Grade 6–8 reading
- “We” and “you,” not lectures
- Do not add faith, church, or scripture unless it is already in his draft
- Do not add biography, credentials, or claims he did not write
- Do not make him sound like a guru, a coach, or a brand
- No urgency, no guilt, no dark patterns
- Keep markdown simple

Return only the markdown he should consider. No preamble. No “here is a draft.”`;

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
          temperature: 0.5,
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

    return { status: "ok", suggestion };
  } catch (error) {
    console.error("Writing help failed:", error);
    return { status: "error", message: copy.tryAgain };
  }
}
