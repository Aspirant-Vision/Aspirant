import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";
import { env } from "@/lib/validation/env";

/**
 * Creates and returns a singleton-friendly typed Supabase browser client.
 * Safe for use in all Client Components ("use client").
 * Authentication cookies are managed automatically via document.cookie.
 */
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (typeof window === "undefined") {
    // Fallback when called in SSR environment
    return createBrowserClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  return clientInstance;
}
