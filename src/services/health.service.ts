import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/validation/env";

export interface SystemHealthStatus {
  status: "healthy" | "degraded";
  version: string;
  timestamp: string;
  supabase: {
    configured: boolean;
    url: string;
    connected: boolean;
    latencyMs?: number;
  };
}

/**
 * Health Check Service
 * Verifies backend configuration and database responsiveness safely.
 */
export async function getSystemHealth(): Promise<SystemHealthStatus> {
  const isConfigured = Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
    !env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );

  let connected = false;
  let latencyMs: number | undefined;

  if (isConfigured) {
    try {
      const startTime = Date.now();
      const supabase = await createClient();
      // Lightweight probe query
      const { error } = await supabase.from("profiles").select("count", { count: "exact", head: true });
      latencyMs = Date.now() - startTime;
      connected = !error;
    } catch {
      connected = false;
    }
  }

  return {
    status: isConfigured && connected ? "healthy" : "degraded",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    supabase: {
      configured: isConfigured,
      url: env.NEXT_PUBLIC_SUPABASE_URL.replace(/https?:\/\//, "").split(".")[0] + "...",
      connected,
      latencyMs,
    },
  };
}
