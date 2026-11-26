import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { env } from "@/lib/validation/env";

/**
 * Privileged Supabase Admin Client (Service-Role).
 *
 * CRITICAL SECURITY CONSTRAINTS:
 * - Uses SUPABASE_SERVICE_ROLE_KEY to bypass Row Level Security (RLS).
 * - NEVER import or execute inside Client Components ("use client").
 * - Used exclusively for administrative workflows, secure webhooks, and background sync.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "[Security Violation]: createAdminClient cannot be executed in the browser."
    );
  }

  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || serviceRoleKey.includes("placeholder")) {
    console.warn(
      "[Supabase Admin Warning]: SUPABASE_SERVICE_ROLE_KEY is not configured. Admin client queries requiring bypass of RLS will fail."
    );
  }

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey || env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
