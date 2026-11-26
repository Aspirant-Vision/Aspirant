/**
 * ASPIRANT VISION — PHASE 13 PRODUCTION VERIFICATION TEST SUITE
 *
 * Verifies:
 * 1. Rate limiter sliding window, burst prevention, and key isolation
 * 2. Production safe logger redaction (passwords, tokens, cookies, PII)
 * 3. SEO robots.txt rules and private route disallows
 * 4. Sitemap route definitions, priorities, and change frequencies
 * 5. Production hardening migration:
 *    - All SECURITY DEFINER functions enforce SET search_path = public
 *    - Privilege escalation defense in handle_new_user()
 *    - High-performance composite indexes
 * 6. Environment configuration and secret leak checks
 */

import fs from "fs";
import path from "path";
import { checkRateLimit, resetRateLimitStorage, RATE_LIMIT_PRESETS } from "../src/lib/security/rate-limit";
import { sanitizeLogData } from "../src/lib/security/logger";
import robots from "../src/app/robots";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, errMsg?: string) {
  if (condition) {
    results.push({ name, passed: true });
    console.log(`  ✓ ${name}`);
  } else {
    results.push({ name, passed: false, error: errMsg || "Assertion failed" });
    console.error(`  ✗ ${name}: ${errMsg || "Assertion failed"}`);
  }
}

async function runProductionTests() {
  console.log("================================================================================");
  console.log("ASPIRANT VISION — PHASE 13: PRODUCTION READINESS & SECURITY AUDIT TESTS");
  console.log("================================================================================\n");

  // ----------------------------------------------------------------------------
  // SECTION 1: RATE LIMITER & SLIDING WINDOW TESTS
  // ----------------------------------------------------------------------------
  console.log("--- Section 1: Sliding-Window Rate Limiter & Abuse Prevention ---");
  resetRateLimitStorage();

  const customConfig = { maxRequests: 3, windowMs: 1000 };
  const testIp1 = "192.168.1.100";
  const testIp2 = "192.168.1.200";

  // IP 1: First 3 requests should succeed
  const r1 = checkRateLimit(`login:${testIp1}`, customConfig);
  assert(r1.success && r1.remaining === 2, "Rate limiter allows 1st request within window");

  const r2 = checkRateLimit(`login:${testIp1}`, customConfig);
  assert(r2.success && r2.remaining === 1, "Rate limiter allows 2nd request within window");

  const r3 = checkRateLimit(`login:${testIp1}`, customConfig);
  assert(r3.success && r3.remaining === 0, "Rate limiter allows 3rd request (max capacity reached)");

  // 4th request from IP 1 must be blocked
  const r4 = checkRateLimit(`login:${testIp1}`, customConfig);
  assert(!r4.success && r4.remaining === 0, "Rate limiter blocks 4th request exceeding window threshold");

  // Request from distinct IP 2 must succeed (IP isolation)
  const rOtherIp = checkRateLimit(`login:${testIp2}`, customConfig);
  assert(rOtherIp.success && rOtherIp.remaining === 2, "Rate limiter provides strict IP / key isolation");

  // Presets exist and have sane values
  assert(RATE_LIMIT_PRESETS.auth.maxRequests === 10, "Auth preset configured for 10 requests / 15m");
  assert(RATE_LIMIT_PRESETS.register.maxRequests === 5, "Register preset configured for 5 requests / 1h");
  assert(RATE_LIMIT_PRESETS.enquiry.maxRequests === 5, "Enquiry preset configured for 5 requests / 10m");
  assert(RATE_LIMIT_PRESETS.export.maxRequests === 20, "Export preset configured for 20 requests / 10m");

  // ----------------------------------------------------------------------------
  // SECTION 2: PRODUCTION SAFE LOGGER & SECRET REDACTION
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 2: Safe Logger & Credential Redaction ---");

  const payloadWithSecrets = {
    user: "test@example.com",
    password: "SuperSecretPassword123!",
    nested: {
      apiKey: "sb_anon_test_key_12345",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMC6Y5",
      safeNote: "All systems normal",
    },
    authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy",
    tags: ["prod", "auth"],
  };

  const sanitized = sanitizeLogData(payloadWithSecrets) as any;
  assert(sanitized.password === "[REDACTED]", "Logger redacts top-level password fields");
  assert(sanitized.nested.apiKey === "[REDACTED]", "Logger redacts nested apiKey fields");
  assert(sanitized.nested.token === "[REDACTED]", "Logger redacts nested token fields");
  assert(sanitized.authorization === "[REDACTED]", "Logger redacts authorization headers");
  assert(sanitized.nested.safeNote === "All systems normal", "Logger preserves non-sensitive payload values");
  assert(sanitized.user === "test@example.com", "Logger preserves standard identifiers");

  // Test standalone token redaction
  const standaloneJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature";
  assert(sanitizeLogData(standaloneJwt) === "[REDACTED_TOKEN]", "Logger automatically masks raw JWT strings");

  // ----------------------------------------------------------------------------
  // SECTION 3: SEO ROBOTS & SITEMAP VERIFICATION
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 3: SEO Robots & Sitemap Rules ---");

  const robotsConfig = robots();
  assert(Array.isArray(robotsConfig.rules), "Robots configuration returns rule array");

  const generalRule = (robotsConfig.rules as any[])[0];
  assert(generalRule.userAgent === "*", "Robots rule applies to all user agents (*)");
  assert(generalRule.allow === "/", "Robots rule allows public root (/)");

  const disallows = generalRule.disallow as string[];
  assert(disallows.some((d) => d.includes("/admin")), "Robots disallows /admin route tree");
  assert(disallows.some((d) => d.includes("/student")), "Robots disallows /student route tree");
  assert(disallows.some((d) => d.includes("/api")), "Robots disallows /api route tree");
  assert(disallows.some((d) => d.includes("/auth")), "Robots disallows /auth route tree");
  const sitemapValue = Array.isArray(robotsConfig.sitemap) ? robotsConfig.sitemap[0] : robotsConfig.sitemap;
  assert(Boolean(sitemapValue && sitemapValue.endsWith("/sitemap.xml")), "Robots points to valid /sitemap.xml");

  // ----------------------------------------------------------------------------
  // SECTION 4: DATABASE SECURITY HARDENING MIGRATION
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 4: Database Hardening & search_path Audit ---");

  const migrationPath = path.join(__dirname, "../supabase/migrations/20261126000007_phase13_production_hardening.sql");
  assert(fs.existsSync(migrationPath), "Phase 13 hardening migration file exists");

  const migrationSql = fs.readFileSync(migrationPath, "utf-8");

  // Check search_path = public on all security definer functions
  assert(migrationSql.includes("FUNCTION public.has_role"), "Migration hardens has_role function");
  assert(migrationSql.includes("FUNCTION public.is_admin"), "Migration hardens is_admin function");
  assert(migrationSql.includes("FUNCTION public.is_counsellor"), "Migration hardens is_counsellor function");
  assert(migrationSql.includes("FUNCTION public.is_staff"), "Migration hardens is_staff function");
  assert(migrationSql.includes("FUNCTION public.is_super_admin"), "Migration hardens is_super_admin function");
  assert(migrationSql.includes("FUNCTION public.generate_application_number"), "Migration hardens generate_application_number");
  assert(migrationSql.includes("FUNCTION public.generate_admission_reference"), "Migration hardens generate_admission_reference");

  const searchPathOccurrences = (migrationSql.match(/SET search_path = public/g) || []).length;
  assert(searchPathOccurrences >= 8, `Enforces explicit search_path = public (${searchPathOccurrences} instances found)`);

  // Check privilege escalation defense
  assert(migrationSql.includes("staff_invitations"), "handle_new_user verifies staff_invitations table");
  assert(migrationSql.includes("expires_at > NOW()"), "handle_new_user rejects expired staff invitations");
  assert(migrationSql.includes("assigned_role := 'student'::user_role"), "handle_new_user defaults securely to student role");

  // Check composite indexes
  assert(migrationSql.includes("idx_colleges_published_featured"), "Defines idx_colleges_published_featured composite index");
  assert(migrationSql.includes("idx_courses_published_category"), "Defines idx_courses_published_category composite index");
  assert(migrationSql.includes("idx_leads_status_created"), "Defines idx_leads_status_created composite index");
  assert(migrationSql.includes("idx_notifications_recipient_unread_badge"), "Defines idx_notifications_recipient_unread_badge composite index");

  // ----------------------------------------------------------------------------
  // SECTION 5: ENVIRONMENT FILE & SECRET LEAK AUDIT
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 5: Environment & Secrets Audit ---");

  const envExamplePath = path.join(__dirname, "../.env.example");
  assert(fs.existsSync(envExamplePath), ".env.example exists in root directory");

  const envExampleContent = fs.readFileSync(envExamplePath, "utf-8");
  assert(!envExampleContent.includes("sk_live_"), ".env.example contains no live secret keys");
  assert(!envExampleContent.includes("eyJh"), ".env.example contains no real JWT tokens");
  assert(envExampleContent.includes("NEXT_PUBLIC_SUPABASE_URL"), ".env.example documents NEXT_PUBLIC_SUPABASE_URL");
  assert(envExampleContent.includes("SUPABASE_SERVICE_ROLE_KEY"), ".env.example documents SUPABASE_SERVICE_ROLE_KEY");
  assert(envExampleContent.includes("DATABASE_URL"), ".env.example documents DATABASE_URL");

  // Summary
  console.log("\n================================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runProductionTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
