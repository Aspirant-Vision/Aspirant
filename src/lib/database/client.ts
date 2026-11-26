import { createClient } from "@/lib/supabase/server";
import { DatabaseError } from "./error";

/**
 * Executes a server-side Supabase database query with centralized error wrapping.
 */
export async function executeQuery<T>(
  queryFn: (client: Awaited<ReturnType<typeof createClient>>) => Promise<{ data: T | null; error: unknown }>
): Promise<T> {
  try {
    const supabase = await createClient();
    const { data, error } = await queryFn(supabase);

    if (error) {
      const err = error as { message?: string; code?: string };
      console.error("[Database Query Error]:", err);
      throw new DatabaseError(err.message || "Failed to execute database query.", err);
    }

    return data as T;
  } catch (err) {
    if (err instanceof DatabaseError) throw err;
    throw new DatabaseError("Unexpected error during database execution.", err);
  }
}
