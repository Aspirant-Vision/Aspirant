import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getSafeRedirectUrl } from "@/lib/validation/auth";

/**
 * Root Next.js Middleware for Aspirant Vision.
 * Handles Supabase session refresh, authenticated routing guards, and RBAC redirects.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Refresh Supabase session tokens
  const { supabaseResponse, user } = await updateSession(request);

  // Set current pathname header for server layouts
  supabaseResponse.headers.set("x-pathname", pathname);

  // 2. Student Route Protection (/student/*)
  if (pathname.startsWith("/student")) {
    if (!user) {
      const returnUrl = encodeURIComponent(getSafeRedirectUrl(`${pathname}${search}`, "/student/dashboard"));
      return NextResponse.redirect(new URL(`/login?next=${returnUrl}`, request.url));
    }
  }

  // 3. Admin / Staff Route Protection (/admin/*)
  if (pathname.startsWith("/admin")) {
    // Exclude /admin/login from authentication gate
    if (pathname !== "/admin/login") {
      if (!user) {
        const returnUrl = encodeURIComponent(getSafeRedirectUrl(`${pathname}${search}`, "/admin/dashboard"));
        return NextResponse.redirect(new URL(`/admin/login?next=${returnUrl}`, request.url));
      }
    }
  }

  // 4. Authenticated redirect for public auth pages
  // If already logged in, prevent accessing login/register repeatedly
  if (user) {
    const userRole = (user.user_metadata?.role as string) || "student";
    const isStaffUser = userRole === "admin" || userRole === "super_admin" || userRole === "counsellor";

    if (pathname === "/login" || pathname === "/register") {
      const redirectTarget = isStaffUser ? "/admin/dashboard" : "/student/dashboard";
      return NextResponse.redirect(new URL(redirectTarget, request.url));
    }

    if (pathname === "/admin/login" && isStaffUser) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (.svg, .png, .jpg, .jpeg, .webp, .gif, .mp4)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4)$).*)",
  ],
};
