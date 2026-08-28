import { createHash } from "crypto";
import { cookies, headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase-service";

type RateAction = "contact" | "subscribe" | "comment";

const limits: Record<RateAction, { max: number; windowMs: number }> = {
  contact: { max: 3, windowMs: 60 * 60 * 1000 },
  subscribe: { max: 8, windowMs: 60 * 60 * 1000 },
  comment: { max: 5, windowMs: 60 * 60 * 1000 },
};

const memoryHits = new Map<string, { count: number; resetAt: number }>();

function salt(): string {
  return (
    process.env.RATE_LIMIT_SALT?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().slice(0, 24) ||
    "ovwi-rate"
  );
}

async function visitorKey(action: RateAction): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("cf-connecting-ip")?.trim() ||
    "unknown";
  return createHash("sha256").update(`${salt()}:${action}:${ip}`).digest("hex");
}

function windowStart(windowMs: number): string {
  const start = Math.floor(Date.now() / windowMs) * windowMs;
  return new Date(start).toISOString();
}

function allowInMemory(bucket: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const row = memoryHits.get(bucket);
  if (!row || now >= row.resetAt) {
    memoryHits.set(bucket, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (row.count >= max) {
    return false;
  }
  row.count += 1;
  return true;
}

async function allowInDatabase(bucket: string, max: number, windowMs: number): Promise<boolean | null> {
  const supabase = createServiceClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.rpc("bump_rate_limit", {
    p_bucket: bucket,
    p_window_start: windowStart(windowMs),
    p_max: max,
  });

  if (error) {
    console.error("Rate limit write failed:", error.message);
    return null;
  }

  return data === true;
}

/**
 * Limits Join, Contact, and thoughts. Uses the database when the service role is set,
 * otherwise a short in-memory check (weaker on Vercel).
 */
export async function allowRequest(action: RateAction): Promise<boolean> {
  const bucket = await visitorKey(action);
  const { max, windowMs } = limits[action];
  const fromDb = await allowInDatabase(bucket, max, windowMs);
  if (fromDb !== null) {
    return fromDb;
  }
  return allowInMemory(bucket, max, windowMs);
}

export async function recentlySubmitted(action: RateAction): Promise<boolean> {
  const jar = await cookies();
  return Boolean(jar.get(`ovwi_cd_${action}`)?.value);
}

export async function markSubmitted(action: RateAction): Promise<void> {
  const jar = await cookies();
  jar.set(`ovwi_cd_${action}`, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 20,
    path: "/",
  });
}
