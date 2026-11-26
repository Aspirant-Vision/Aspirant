import {
  passwordSchema,
  phoneSchema,
  studentRegisterSchema,
  studentLoginSchema,
  staffLoginSchema,
  staffInviteSchema,
  acceptStaffInviteSchema,
  getSafeRedirectUrl,
} from "../src/lib/validation/auth";
import {
  ROLE_PERMISSIONS,
  hasPermission,
  isStaff,
  isAdmin,
  isSuperAdmin,
  isCounsellor,
  isStudent,
} from "../src/lib/auth/roles";
import crypto from "crypto";

console.log("=================================================================");
console.log("ASPIRANT VISION — PHASE 03 AUTHENTICATION & RBAC TEST SUITE");
console.log("=================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// TEST 1: PASSWORD POLICY
// -----------------------------------------------------------------------------
console.log("Test Suite 1: Password Strength Policy");
assert(
  passwordSchema.safeParse("Pass@123").success === true,
  "Accepts valid complex password (Pass@123)"
);
assert(
  passwordSchema.safeParse("Short1!").success === false,
  "Rejects password shorter than 8 characters"
);
assert(
  passwordSchema.safeParse("alllowercase1!").success === false,
  "Rejects password missing uppercase letter"
);
assert(
  passwordSchema.safeParse("ALLUPPERCASE1!").success === false,
  "Rejects password missing lowercase letter"
);
assert(
  passwordSchema.safeParse("NoNumbersHere!").success === false,
  "Rejects password missing numeric digit"
);
assert(
  passwordSchema.safeParse("NoSpecialChar123").success === false,
  "Rejects password missing special character"
);

// -----------------------------------------------------------------------------
// TEST 2: MOBILE PHONE POLICY
// -----------------------------------------------------------------------------
console.log("\nTest Suite 2: Mobile Phone Validation");
assert(
  phoneSchema.safeParse("9876543210").success === true,
  "Accepts standard 10-digit Indian phone (9876543210)"
);
assert(
  phoneSchema.safeParse("+919876543210").success === true,
  "Accepts phone with +91 country prefix"
);
assert(
  phoneSchema.safeParse("12345").success === false,
  "Rejects phone with fewer than 10 digits"
);
assert(
  phoneSchema.safeParse("0123456789").success === false,
  "Rejects phone starting with invalid prefix digit (0-5)"
);

// -----------------------------------------------------------------------------
// TEST 3: STUDENT REGISTRATION SCHEMA
// -----------------------------------------------------------------------------
console.log("\nTest Suite 3: Student Registration Schema");
const validReg = studentRegisterSchema.safeParse({
  fullName: "Aarav Sharma",
  email: "aarav.sharma@example.com",
  phone: "9876543210",
  password: "SecurePassword@2026",
  confirmPassword: "SecurePassword@2026",
  termsConsent: true,
});
assert(validReg.success === true, "Validates compliant student registration");

const mismatchedPass = studentRegisterSchema.safeParse({
  fullName: "Aarav Sharma",
  email: "aarav.sharma@example.com",
  phone: "9876543210",
  password: "SecurePassword@2026",
  confirmPassword: "DifferentPassword@2026",
  termsConsent: true,
});
assert(
  mismatchedPass.success === false,
  "Rejects registration when password and confirmPassword do not match"
);

const missingTerms = studentRegisterSchema.safeParse({
  fullName: "Aarav Sharma",
  email: "aarav.sharma@example.com",
  phone: "9876543210",
  password: "SecurePassword@2026",
  confirmPassword: "SecurePassword@2026",
  termsConsent: false,
});
assert(
  missingTerms.success === false,
  "Rejects registration when terms and privacy consent is not checked"
);

// -----------------------------------------------------------------------------
// TEST 4: OPEN REDIRECT DEFENSE (getSafeRedirectUrl)
// -----------------------------------------------------------------------------
console.log("\nTest Suite 4: Open Redirect Vulnerability Defenses");
assert(
  getSafeRedirectUrl("/student/dashboard") === "/student/dashboard",
  "Permits safe internal relative path (/student/dashboard)"
);
assert(
  getSafeRedirectUrl("/admin/colleges?filter=engineering") === "/admin/colleges?filter=engineering",
  "Permits safe internal path with query parameters"
);
assert(
  getSafeRedirectUrl("https://malicious-attacker.com") === "/student/dashboard",
  "Neutralizes external absolute HTTPS injection"
);
assert(
  getSafeRedirectUrl("http://evil.com/phishing") === "/student/dashboard",
  "Neutralizes external absolute HTTP injection"
);
assert(
  getSafeRedirectUrl("//evil.com") === "/student/dashboard",
  "Neutralizes protocol-relative double-slash bypass (//evil.com)"
);
assert(
  getSafeRedirectUrl("javascript:alert(1)") === "/student/dashboard",
  "Neutralizes JavaScript URI injection"
);

// -----------------------------------------------------------------------------
// TEST 5: STAFF INVITATION TOKEN INTEGRITY & HASHING
// -----------------------------------------------------------------------------
console.log("\nTest Suite 5: Staff Invitation Cryptographic Integrity");
const rawToken = crypto.randomBytes(32).toString("hex");
const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
const reHashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

assert(rawToken.length === 64, "Generates 256-bit cryptographically secure hex token");
assert(
  hashedToken === reHashedToken,
  "Produces deterministic SHA-256 hash for database lookups"
);
assert(
  acceptStaffInviteSchema.safeParse({
    token: rawToken,
    fullName: "Priya Nair",
    phone: "9876543210",
    password: "StrongPassword@2026",
    confirmPassword: "StrongPassword@2026",
  }).success === true,
  "Validates staff invite acceptance payload with strong credentials"
);

// -----------------------------------------------------------------------------
// TEST 6: ROLE-BASED ACCESS CONTROL (RBAC) MATRIX
// -----------------------------------------------------------------------------
console.log("\nTest Suite 6: Role-Based Access Control Matrices");
assert(isStaff("super_admin") === true, "Identifies 'super_admin' as staff member");
assert(isStaff("admin") === true, "Identifies 'admin' as staff member");
assert(isStaff("counsellor") === true, "Identifies 'counsellor' as staff member");
assert(isStaff("student") === false, "Strictly denies 'student' staff status");

assert(isAdmin("super_admin") === true, "Super admin has administrative authority");
assert(isAdmin("admin") === true, "Admin has administrative authority");
assert(isAdmin("counsellor") === false, "Counsellor does not have global administrative authority");
assert(isAdmin("student") === false, "Student does not have administrative authority");

assert(
  hasPermission("super_admin", "canManageUsers") === true,
  "Super admin can manage users and staff"
);
assert(
  hasPermission("admin", "canManageUsers") === false,
  "Admin cannot delete/manage super admins"
);
assert(
  hasPermission("counsellor", "canManageLeads") === true,
  "Counsellor has permission to manage CRM leads"
);
assert(
  hasPermission("counsellor", "canManageColleges") === false,
  "Counsellor cannot edit or delete institutional college catalog"
);
assert(
  hasPermission("student", "canAccessAdmin") === false,
  "Student is strictly prohibited from administrative operations"
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n=================================================================");
console.log(`TEST RUN COMPLETE: ${passed} Passed, ${failed} Failed`);
console.log("=================================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
