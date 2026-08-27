import { withBackoff } from "@/lib/retry";
import { copy, site } from "@/lib/site";

export type SubscribeState =
  | { status: "idle" }
  | { status: "closed"; message: string }
  | { status: "confirm"; message: string }
  | { status: "active"; message: string }
  | { status: "error"; message: string };

type KitForm = {
  id?: number;
  uid?: string;
  embed_js?: string;
  embed_url?: string;
};

type KitSubscriber = {
  id?: number;
  state?: string;
  email_address?: string;
};

type KitJson = {
  forms?: KitForm[];
  subscriber?: KitSubscriber;
  subscription?: { state?: string };
  errors?: string[];
  error?: string;
  message?: string;
};

function kitKey(): string {
  return (
    process.env.KIT_API_KEY?.trim() ||
    process.env.KIT_API_SECRET?.trim() ||
    process.env.CONVERTKIT_API_SECRET?.trim() ||
    ""
  );
}

function kitFormRef(): string {
  return (process.env.KIT_FORM_ID ?? process.env.CONVERTKIT_FORM_ID ?? "").trim();
}

function kitConfigured(): boolean {
  return Boolean(kitKey() && kitFormRef());
}

function formMatches(form: KitForm, formRef: string): boolean {
  if (String(form.id ?? "") === formRef) {
    return true;
  }
  if (form.uid === formRef) {
    return true;
  }
  if (form.embed_url?.includes(formRef) || form.embed_js?.includes(formRef)) {
    return true;
  }
  return false;
}

function errorText(body: KitJson, fallback: string): string {
  if (body.errors?.length) {
    return body.errors.join(" ");
  }
  return body.error ?? body.message ?? fallback;
}

async function parseJson(response: Response): Promise<KitJson> {
  try {
    return (await response.json()) as KitJson;
  } catch {
    return {};
  }
}

let resolvedFormId: string | null = null;

async function resolveNumericFormId(apiKey: string, formRef: string): Promise<string> {
  if (/^\d+$/.test(formRef)) {
    return formRef;
  }
  if (resolvedFormId) {
    return resolvedFormId;
  }

  const v4 = await fetch("https://api.kit.com/v4/forms?per_page=500", {
    headers: { "X-Kit-Api-Key": apiKey },
  });
  if (v4.ok) {
    const body = await parseJson(v4);
    const match = body.forms?.find((form) => formMatches(form, formRef));
    if (match?.id) {
      resolvedFormId = String(match.id);
      return resolvedFormId;
    }
  }

  const v3 = await fetch(
    `https://api.convertkit.com/v3/forms?api_secret=${encodeURIComponent(apiKey)}`,
  );
  if (v3.ok) {
    const body = await parseJson(v3);
    const match = body.forms?.find((form) => formMatches(form, formRef));
    if (match?.id) {
      resolvedFormId = String(match.id);
      return resolvedFormId;
    }
  }

  throw new Error("Kit form was not found. Check KIT_FORM_ID.");
}

async function subscribeV4(
  apiKey: string,
  formId: string,
  email: string,
  firstName?: string,
): Promise<KitSubscriber> {
  const createPayload: Record<string, string> = { email_address: email };
  if (firstName) {
    createPayload.first_name = firstName;
  }

  const created = await fetch("https://api.kit.com/v4/subscribers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": apiKey,
    },
    body: JSON.stringify(createPayload),
  });
  const createdBody = await parseJson(created);
  if (!created.ok) {
    throw new Error(errorText(createdBody, "Kit could not save this email."));
  }

  const added = await fetch(`https://api.kit.com/v4/forms/${formId}/subscribers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": apiKey,
    },
    body: JSON.stringify({
      email_address: email,
      referrer: `${site.url}/newsletter`,
    }),
  });
  const addedBody = await parseJson(added);
  if (!added.ok) {
    throw new Error(errorText(addedBody, "Kit could not add this email to the form."));
  }

  return addedBody.subscriber ?? createdBody.subscriber ?? {};
}

async function subscribeV3(
  apiKey: string,
  formId: string,
  email: string,
  firstName?: string,
): Promise<string> {
  const payload: Record<string, string> = {
    api_secret: apiKey,
    email,
  };
  if (firstName) {
    payload.first_name = firstName;
  }

  const response = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const body = await parseJson(response);
  if (!response.ok) {
    throw new Error(errorText(body, "Kit request failed"));
  }
  return body.subscription?.state ?? body.subscriber?.state ?? "";
}

function toSubscribeState(state: string): SubscribeState {
  if (state === "active") {
    return { status: "active", message: copy.subscribeActive };
  }
  return { status: "confirm", message: copy.subscribeConfirm };
}

/**
 * Subscribe via Kit. Rule 2: inactive is not “on the list.”
 */
export async function subscribeToKit(
  email: string,
  firstName?: string,
): Promise<SubscribeState> {
  const apiKey = kitKey();
  const formRef = kitFormRef();

  if (!apiKey || !formRef) {
    return { status: "closed", message: copy.subscribeClosed };
  }

  try {
    const formId = await resolveNumericFormId(apiKey, formRef);

    const result = await withBackoff(
      async () => {
        try {
          const subscriber = await subscribeV4(apiKey, formId, email, firstName);
          return subscriber.state ?? "inactive";
        } catch (v4Error) {
          console.error("Kit v4 subscribe failed, trying v3:", v4Error);
          return subscribeV3(apiKey, formId, email, firstName);
        }
      },
      { retries: 1, baseDelayMs: 400 },
    );

    return toSubscribeState(result);
  } catch (error) {
    console.error("Kit subscribe failed:", error);
    return { status: "error", message: copy.tryAgain };
  }
}

export function isKitConfigured(): boolean {
  return kitConfigured();
}
