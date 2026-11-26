import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/database.types";
import { env } from "@/lib/validation/env";

/**
 * Creates and returns a typed Supabase server client for Server Components,
 * Server Actions, and Route Handlers in Next.js 15 App Router.
 *
 * Fully compliant with Next.js 15 async cookies API.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be safely ignored when middleware handles session refresh.
          }
        },
      },
    }
  );
}
