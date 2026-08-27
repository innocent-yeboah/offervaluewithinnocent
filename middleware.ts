import { updateAdminSession } from "@/lib/supabase-middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return updateAdminSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
