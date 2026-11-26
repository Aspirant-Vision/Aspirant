/**
 * In-Memory Sliding-Window Rate Limiter & Abuse Prevention Engine
 * Designed for Next.js App Router (Node.js & Edge runtimes).
 *
 * Protects against:
 * - Brute force authentication attacks
 * - Form spamming and bot enquiry flooding
 * - Export abuse & resource exhaustion
 */

import { headers } from "next/headers";

interface RateLimitRecord {
  timestamps: number[];
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

// Global in-memory storage for sliding windows
const storage = new Map<string, RateLimitRecord>();

// Periodic cleanup interval (runs at most once every 5 minutes to prevent memory leak)
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function cleanupStaleEntries(now: number, maxRetentionMs: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of storage.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < maxRetentionMs);
    if (record.timestamps.length === 0) {
      storage.delete(key);
    }
  }
}

/**
 * Standard Production Presets
 */
export const RATE_LIMIT_PRESETS: Record<string, RateLimitConfig> = {
  auth: { maxRequests: 10, windowMs: 15 * 60 * 1000 },       // 10 attempts per 15 min
  register: { maxRequests: 5, windowMs: 60 * 60 * 1000 },    // 5 attempts per 1 hour
  enquiry: { maxRequests: 5, windowMs: 10 * 60 * 1000 },     // 5 enquiries per 10 min
  export: { maxRequests: 20, windowMs: 10 * 60 * 1000 },     // 20 exports per 10 min
  api: { maxRequests: 100, windowMs: 60 * 1000 },            // 100 requests per 1 min
};

/**
 * Extracts client IP from Next.js headers safely.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = headerList.get("x-real-ip");
    if (realIp) return realIp.trim();
    const cfIp = headerList.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();
  } catch {
    // In standalone scripts or unit tests where headers() is unavailable
  }
  return "127.0.0.1";
}

/**
 * Checks and increments rate limit for a given key and configuration.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.api
): RateLimitResult {
  const now = Date.now();
  cleanupStaleEntries(now, Math.max(config.windowMs, 60 * 60 * 1000));

  let record = storage.get(key);
  if (!record) {
    record = { timestamps: [] };
    storage.set(key, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < config.windowMs);

  if (record.timestamps.length >= config.maxRequests) {
    const oldestTimestamp = record.timestamps[0] || now;
    const resetAt = oldestTimestamp + config.windowMs;
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetAt,
    };
  }

  // Record this request
  record.timestamps.push(now);
  const resetAt = record.timestamps[0] + config.windowMs;

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.timestamps.length,
    resetAt,
  };
}

/**
 * Convenience helper to enforce rate limiting inside Server Actions.
 * Returns null if allowed, or an error response if limit exceeded.
 */
export async function enforceRateLimit(
  actionName: string,
  presetKey: keyof typeof RATE_LIMIT_PRESETS = "api",
  customIdentifier?: string
): Promise<{ error: string; resetAt: number } | null> {
  // If in automated test environment without explicit rate limit testing, bypass to prevent flake
  if (process.env.NODE_ENV === "test" && !process.env.ENABLE_TEST_RATE_LIMIT) {
    return null;
  }

  const ip = customIdentifier || (await getClientIp());
  const key = `${actionName}:${ip}`;
  const config = RATE_LIMIT_PRESETS[presetKey] || RATE_LIMIT_PRESETS.api;

  const result = checkRateLimit(key, config);
  if (!result.success) {
    const retryAfterSec = Math.ceil((result.resetAt - Date.now()) / 1000);
    return {
      error: `Too many requests. Please slow down and try again in ${retryAfterSec} seconds.`,
      resetAt: result.resetAt,
    };
  }

  return null;
}

/**
 * Testing helper to reset storage
 */
export function resetRateLimitStorage(): void {
  storage.clear();
}
