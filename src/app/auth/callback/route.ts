import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectUrl } from "@/lib/validation/auth";
import { NextResponse, type NextRequest } from "next/server";
import { isStaff } from "@/lib/auth/roles";
import { UserRole } from "@/types/auth.types";

/**
 * Supabase Auth Callback Route Handler.
 * Exchanges PKCE authorization code for session cookies.
 * Handles OAuth, magic link, and email verification redirects safely.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next");
  const errorParam = requestUrl.searchParams.get("error_description") || requestUrl.searchParams.get("error");

  const origin = requestUrl.origin;

  if (errorParam) {
    console.error("[Auth Callback Error]:", errorParam);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorParam)}`, origin)
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[Auth Callback Code Exchange Failed]:", error.message);
      return NextResponse.redirect(
        new URL(`/login?error=Failed+to+verify+session`, origin)
      );
    }

    // Determine user role to route to appropriate dashboard if no explicit next is specified
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let targetUrl = nextParam ? getSafeRedirectUrl(nextParam) : null;

    if (!targetUrl && user) {
      // Query primary role
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const role = (roleRow?.role || user.user_metadata?.role || "student") as UserRole;

      if (isStaff(role)) {
        targetUrl = "/admin/dashboard";
      } else {
        targetUrl = "/student/dashboard";
      }
    }

    return NextResponse.redirect(new URL(targetUrl || "/student/dashboard", origin));
  }

  // Fallback if no code present
  return NextResponse.redirect(new URL("/login", origin));
}
