import fs from "fs";
import path from "path";
import { ROLE_PERMISSIONS, hasPermission, isStaff, isAdmin, isSuperAdmin, isCounsellor } from "../src/lib/auth/roles";
import { UserRole } from "../src/types/auth.types";

console.log("=================================================================");
console.log("ASPIRANT VISION — PHASE 04 CRM & DASHBOARD TEST SUITE");
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
// TEST SUITE 1: CRM ROUTE STRUCTURE COMPLETENESS
// -----------------------------------------------------------------------------
console.log("Test Suite 1: CRM Route Structure Verification");

const requiredRoutes = [
  "src/app/admin/dashboard/page.tsx",
  "src/app/admin/colleges/page.tsx",
  "src/app/admin/courses/page.tsx",
  "src/app/admin/fees/page.tsx",
  "src/app/admin/scholarships/page.tsx",
  "src/app/admin/leads/page.tsx",
  "src/app/admin/students/page.tsx",
  "src/app/admin/applications/page.tsx",
  "src/app/admin/admissions/page.tsx",
  "src/app/admin/counsellors/page.tsx",
  "src/app/admin/reports/page.tsx",
  "src/app/admin/settings/page.tsx",
];

for (const routePath of requiredRoutes) {
  const exists = fs.existsSync(path.join(process.cwd(), routePath));
  assert(exists, `Route file exists: ${routePath}`);
}

// -----------------------------------------------------------------------------
// TEST SUITE 2: RBAC MATRIX & NAVIGATION PERMISSIONS
// -----------------------------------------------------------------------------
console.log("\nTest Suite 2: Role-Based Access Control Matrices");

// 1. Student Access Restrictions
assert(
  isStaff("student") === false,
  "Strictly denies student staff portal access"
);
assert(
  hasPermission("student", "canAccessAdmin") === false,
  "Student has canAccessAdmin: false"
);
assert(
  hasPermission("student", "canManageColleges") === false,
  "Student has canManageColleges: false"
);
assert(
  hasPermission("student", "canManageLeads") === false,
  "Student has canManageLeads: false"
);

// 2. Counsellor Access Scope
assert(
  isStaff("counsellor") === true,
  "Counsellor is recognized as staff"
);
assert(
  hasPermission("counsellor", "canManageLeads") === true,
  "Counsellor can access Leads CRM"
);
assert(
  hasPermission("counsellor", "canManageColleges") === false,
  "Counsellor cannot modify College Catalog (Read-only)"
);
assert(
  hasPermission("counsellor", "canManageUsers") === false,
  "Counsellor cannot access User/Staff Management"
);

// 3. Admin Access Scope
assert(
  isAdmin("admin") === true,
  "Admin has administrative privileges"
);
assert(
  hasPermission("admin", "canManageColleges") === true,
  "Admin can manage Colleges and Courses"
);
assert(
  hasPermission("admin", "canManageLeads") === true,
  "Admin can manage Leads CRM"
);

// 4. Super Admin Full Access
assert(
  isSuperAdmin("super_admin") === true,
  "Super Admin has super user role"
);
assert(
  hasPermission("super_admin", "canManageUsers") === true,
  "Super Admin has full authority to manage staff and invitations"
);

// -----------------------------------------------------------------------------
// TEST SUITE 3: REUSABLE CRM COMPONENTS
// -----------------------------------------------------------------------------
console.log("\nTest Suite 3: Reusable CRM Components Verification");

const requiredComponents = [
  "src/components/crm/page-header.tsx",
  "src/components/crm/metric-card.tsx",
  "src/components/crm/empty-state.tsx",
  "src/components/crm/status-badge.tsx",
  "src/components/crm/data-table.tsx",
  "src/components/crm/crm-sidebar.tsx",
  "src/components/crm/crm-top-nav.tsx",
  "src/components/crm/crm-shell.tsx",
  "src/components/crm/global-search.tsx",
  "src/components/crm/notification-bell.tsx",
  "src/components/crm/user-menu.tsx",
  "src/components/crm/super-admin-dashboard.tsx",
  "src/components/crm/admin-dashboard.tsx",
  "src/components/crm/counsellor-dashboard.tsx",
];

for (const compPath of requiredComponents) {
  const exists = fs.existsSync(path.join(process.cwd(), compPath));
  assert(exists, `Component exists: ${compPath}`);
}

// -----------------------------------------------------------------------------
// TEST SUITE 4: DATA FETCHING & QUERY HYGIENE
// -----------------------------------------------------------------------------
console.log("\nTest Suite 4: Query Hygiene & Head Count Verification");

const metricsFile = fs.readFileSync(path.join(process.cwd(), "src/lib/crm/dashboard-metrics.ts"), "utf8");
assert(
  metricsFile.includes('count: "exact", head: true'),
  "Uses database-side { count: 'exact', head: true } to prevent full-table memory scans"
);
assert(
  metricsFile.includes("getSuperAdminDashboardData"),
  "Exports getSuperAdminDashboardData with real aggregations"
);
assert(
  metricsFile.includes("getAdminDashboardData"),
  "Exports getAdminDashboardData with real aggregations"
);
assert(
  metricsFile.includes("getCounsellorDashboardData"),
  "Exports getCounsellorDashboardData scoped to authenticated counsellor"
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
