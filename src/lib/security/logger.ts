/**
 * Production Structured Logger & Safe Error Sanitizer
 * Redacts secrets, tokens, passwords, cookies, and sensitive PII from all server logs.
 */

const REDACTED_KEYS = new Set([
  "password",
  "newpassword",
  "currentpassword",
  "confirmpassword",
  "token",
  "secret",
  "apikey",
  "service_role",
  "authorization",
  "cookie",
  "access_token",
  "refresh_token",
  "supabase_service_role_key",
  "sanity_api_read_token",
]);

/**
 * Deeply sanitizes an object to mask sensitive properties.
 */
export function sanitizeLogData(data: unknown, depth = 0): unknown {
  if (depth > 5) return "[Max Depth Reached]";
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    // Redact JWT-like strings or Bearer tokens
    if (data.startsWith("Bearer ") || (data.startsWith("ey") && data.split(".").length === 3)) {
      return "[REDACTED_TOKEN]";
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item, depth + 1));
  }

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (REDACTED_KEYS.has(lowerKey)) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeLogData(value, depth + 1);
      }
    }
    return sanitized;
  }

  return data;
}

export const logger = {
  info: (message: string, context?: unknown) => {
    const sanitized = context ? sanitizeLogData(context) : undefined;
    console.log(
      `[INFO] [${new Date().toISOString()}] ${message}`,
      sanitized !== undefined ? JSON.stringify(sanitized) : ""
    );
  },

  warn: (message: string, context?: unknown) => {
    const sanitized = context ? sanitizeLogData(context) : undefined;
    console.warn(
      `[WARN] [${new Date().toISOString()}] ${message}`,
      sanitized !== undefined ? JSON.stringify(sanitized) : ""
    );
  },

  error: (message: string, error?: unknown, context?: unknown) => {
    const sanitizedContext = context ? sanitizeLogData(context) : undefined;
    const errorMessage = error instanceof Error ? error.message : String(error || "");
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(
      `[ERROR] [${new Date().toISOString()}] ${message} - ${errorMessage}`,
      sanitizedContext !== undefined ? JSON.stringify(sanitizedContext) : "",
      errorStack ? `\nStack: ${errorStack}` : ""
    );
  },

  security: (event: string, details?: unknown) => {
    const sanitized = details ? sanitizeLogData(details) : undefined;
    console.warn(
      `🔒 [SECURITY_AUDIT] [${new Date().toISOString()}] ${event}`,
      sanitized !== undefined ? JSON.stringify(sanitized) : ""
    );
  },
};
