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

  const serviceRoleKey =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlY3hsb2lnYWNrbG5zeWF5Z29xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTUxMzQ1MCwiZXhwIjoyMTExMDg5NDUwfQ.cJ1IS7kI3uK-QQKO3hi7gGSk_n12QpSTWRWlncCPEr8";

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
