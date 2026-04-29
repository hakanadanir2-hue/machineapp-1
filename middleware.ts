import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute     = pathname.startsWith("/admin");
  const isAdminLogin     = pathname === "/admin";
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isUyeRoute       = pathname.startsWith("/uye");

  if (!isAdminRoute && !isDashboardRoute && !isUyeRoute) return NextResponse.next();

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

  const { data: { user } } = await supabase.auth.getUser();

  // --- Giriş yapılmamış ---
  if (!user) {
    if (isAdminLogin) return response;
    if (isDashboardRoute || isUyeRoute) {
      return NextResponse.redirect(new URL("/giris", request.url));
    }
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // --- Giriş yapılmış: rol kontrolü ---
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "member";

  // /dashboard → eski üye panel (geriye uyumluluk): role'e bakılmaksızın geçir
  if (isDashboardRoute) return response;

  // /uye/* → sadece member ve trainer erişebilir
  if (isUyeRoute) {
    if (role === "admin") {
      // Admin /uye'ye gelirse admin paneline yönlendir
      return NextResponse.redirect(new URL("/admin/(panel)/dashboard", request.url));
    }
    return response;
  }

  // /admin/* → sadece admin erişebilir
  if (!isAdminLogin) {
    if (role !== "admin") {
      // Üyeyi kendi paneline yönlendir
      return NextResponse.redirect(new URL("/uye", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/uye",
    "/uye/:path*",
  ],
};
