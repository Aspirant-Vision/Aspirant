import { z } from "zod";

/**
 * Environment Variables Schema Definition
 * Enforces strict type-safety for Supabase credentials across client and server.
 */
const envSchema = z.object({
  // Public Client Variables (Safe to expose to browser)
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL")
    .default("https://wecxloigacklnsyaygoq.supabase.co"),
  
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
    .default(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlY3hsb2lnYWNrbG5zeWF5Z29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MTM0NTAsImV4cCI6MjExMTA4OTQ1MH0.9Z0po8iqFHIRJ29eSBoKJGhnMBVMjdvuqZP44LZzbZ8"
    ),

  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .optional(),

  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .default("https://aspirant-vision.vercel.app"),

  // Server-Only Variables (NEVER exposed to the browser)
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .optional(),

  DATABASE_URL: z
    .string()
    .optional(),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

/**
 * Safe parser that extracts and validates environment variables.
 * In development, provides informative logging rather than hard crashes if keys are not yet configured.
 */
function getValidatedEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    console.warn(
      "⚠️ [Aspirant Vision Environment Warning]: Some environment variables did not pass strict validation:",
      parsed.error.format()
    );
    // Return partial/fallback to prevent hard crashes during build/static generation
    return {
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wecxloigacklnsyaygoq.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlY3hsb2lnYWNrbG5zeWF5Z29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MTM0NTAsImV4cCI6MjExMTA4OTQ1MH0.9Z0po8iqFHIRJ29eSBoKJGhnMBVMjdvuqZP44LZzbZ8",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlY3hsb2lnYWNrbG5zeWF5Z29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MTM0NTAsImV4cCI6MjExMTA4OTQ1MH0.9Z0po8iqFHIRJ29eSBoKJGhnMBVMjdvuqZP44LZzbZ8",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://aspirant-vision.vercel.app",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV || "development",
    };
  }

  return parsed.data;
}

export const env = getValidatedEnv();
