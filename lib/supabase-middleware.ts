import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicSupabaseAnonKey, publicSupabaseUrl } from "@/lib/env";

/**
 * Refreshes the auth cookie on /admin routes only.
 * Public pages do not run this, so they never inherit the author session.
 */
export async function updateAdminSession(request: NextRequest) {
  const url = publicSupabaseUrl();
  const anonKey = publicSupabaseAnonKey();

  let response = NextResponse.next({ request });

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  if (!user && !isLogin) {
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (user && isLogin) {
    const adminHome = request.nextUrl.clone();
    adminHome.pathname = "/admin";
    adminHome.search = "";
    return NextResponse.redirect(adminHome);
  }

  return response;
}
