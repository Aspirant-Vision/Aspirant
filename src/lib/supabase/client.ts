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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (typeof window === "undefined") {
    // Fallback when called in SSR environment
    return createBrowserClient<Database>(url, key);
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient<Database>(url, key);
  }

  return clientInstance;
}
