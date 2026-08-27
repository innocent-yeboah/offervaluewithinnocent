import { NextResponse } from "next/server";
import { publicSupabaseAnonKey, publicSupabaseUrl } from "@/lib/env";
import { isKitConfigured } from "@/lib/kit";

export const dynamic = "force-dynamic";

/**
 * Presence only. Never returns key values.
 */
export async function GET() {
  return NextResponse.json({
    supabase: Boolean(publicSupabaseUrl() && publicSupabaseAnonKey()),
    kit: isKitConfigured(),
  });
}
