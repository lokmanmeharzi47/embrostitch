import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `response` object is used to pass modified cookies back to the browser
  let response = NextResponse.next({
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

  // Paths requiring authentication
  const isProtectedRoute = 
    path.startsWith("/admin") || 
    path.startsWith("/client") || 
    path.startsWith("/couturiere") || 
    path.startsWith("/creator") || 
    path.startsWith("/profile") || 
    path.startsWith("/messages") || 
    path.startsWith("/order") || 
    path.startsWith("/checkout");

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
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
    if (path.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (path.startsWith("/client") && userRole !== "client") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (path.startsWith("/couturiere") && userRole !== "couturiere") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (path.startsWith("/creator") && userRole !== "creator") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Redirect logged-in users away from auth pages
    if (path === "/login" || path === "/register") {
      const dashboardMap: Record<string, string> = {
        admin: "/admin",
        client: "/client",
        couturiere: "/couturiere",
        creator: "/creator",
      };
      const dest = dashboardMap[userRole] || "/";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return response;
};
