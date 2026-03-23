import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute     = pathname.startsWith("/admin");
  const isAdminLogin     = pathname === "/admin";
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!isAdminRoute && !isDashboardRoute) return NextResponse.next();

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    if (isAdminLogin) return response;
    if (isDashboardRoute) return NextResponse.redirect(new URL("/giris", request.url));
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Dashboard: any logged-in user can access
  if (isDashboardRoute) return response;

  if (!isAdminLogin) {
    // Check profiles table first
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    // If profiles table has no entry, auto-create it for the user
    if (profileError && profileError.code === "PGRST116") {
      // No row found - insert with default 'user' role
      await supabase.from("profiles").upsert({ id: session.user.id, role: "user" }, { onConflict: "id" });
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/dashboard", "/dashboard/:path*"],
};
