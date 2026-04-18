import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest, existingResponse?: NextResponse) => {
  // This `response` object is used to pass modified cookies back to the browser
  let response = existingResponse || NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { data: { user } } = await supabase.auth.getUser();

  // AUTH PROTECTION LOGIC
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Extract locale if present
  const locales = ["fr", "ar", "en"];
  const pathParts = path.split("/").filter(Boolean);
  const locale = locales.includes(pathParts[0]) ? pathParts[0] : null;
  const pathWithoutLocale = locale ? "/" + pathParts.slice(1).join("/") : path;

  // Paths requiring authentication (check against pathWithoutLocale)
  const isProtectedRoute = 
    pathWithoutLocale.startsWith("/admin") || 
    pathWithoutLocale.startsWith("/client") || 
    pathWithoutLocale.startsWith("/couturiere") || 
    pathWithoutLocale.startsWith("/creator") || 
    pathWithoutLocale.startsWith("/profile") || 
    pathWithoutLocale.startsWith("/messages") || 
    pathWithoutLocale.startsWith("/order") || 
    pathWithoutLocale.startsWith("/checkout");

  if (!user && isProtectedRoute) {
    const loginPath = locale ? `/${locale}/login` : "/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  // ROLE-BASED PROTECTION (RBAC)
  if (user) {
    // Fetch profile to get role reliably
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = profile?.role || user.app_metadata?.role || user.user_metadata?.role;
    
    // Prevent cross-role access to dashboard routes
    const dashboardRoutes = ["admin", "client", "couturiere", "creator"];
    const currentDashboard = dashboardRoutes.find(role => pathWithoutLocale.startsWith(`/${role}`));

    if (currentDashboard && userRole !== currentDashboard) {
      return NextResponse.redirect(new URL(locale ? `/${locale}` : "/", request.url));
    }

    // Redirect logged-in users away from auth pages
    if (pathWithoutLocale === "/login" || pathWithoutLocale === "/register") {
      const dashboardMap: Record<string, string> = {
        admin: "/admin",
        client: "/client",
        couturiere: "/couturiere",
        creator: "/creator",
      };
      const dest = dashboardMap[userRole] || "/";
      const redirectUrl = locale ? `/${locale}${dest}` : dest;
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return response;
};
