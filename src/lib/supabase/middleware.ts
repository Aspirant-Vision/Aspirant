import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/database.types";
import { env } from "@/lib/validation/env";

/**
 * Middleware session refresher.
 * Refreshes auth tokens so server components always receive valid authentication.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not insert logic between createServerClient and getUser to ensure stable token refresh
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return { supabaseResponse, user };
  } catch (error) {
    // If Supabase is unconfigured or network is unreachable during build, pass through safely
    return { supabaseResponse, user: null };
  }
}
