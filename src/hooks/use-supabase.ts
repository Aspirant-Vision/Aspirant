"use client";

import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * React hook to retrieve the typed Supabase browser client.
 * Caches the client instance across component renders.
 */
export function useSupabase() {
  const supabase = useMemo(() => createClient(), []);
  return supabase;
}
