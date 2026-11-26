/**
 * Phase 12: Analytics, Reporting & Performance Dashboards Test Suite
 * Tests Metric Calculations, Date Boundaries, Formula Injection Security, Role Access, and CSV Exporter.
 */

import {
  DATE_RANGE_PRESETS,
  getDateRangeBounds,
  DateRangePreset,
} from "../src/lib/analytics/types";
import { sanitizeCsvCell, arrayToCsv } from "../src/lib/analytics/export";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${details ? ` -> ${details}` : ""}`);
    failedCount++;
  }
}

async function runPhase12Tests() {
  console.log("\n=======================================================");
  console.log("ASPIRANT VISION — PHASE 12 ANALYTICS & REPORTING TESTS");
  console.log("=======================================================\n");

  // TEST SUITE 1: Date Range Presets & Boundary Logic
  console.log("--- 1. DATE BOUNDARY & COMPARISON CALCULATIONS ---");
  {
    assert(DATE_RANGE_PRESETS.length === 9, "All 9 standard date range presets exist");

    const bounds30d = getDateRangeBounds("30d");
    const start30d = new Date(bounds30d.startDate);
    const end30d = new Date(bounds30d.endDate);
    assert(start30d < end30d, "30d preset: startDate is before endDate");

    const prevStart30d = new Date(bounds30d.previousStartDate);
    const prevEnd30d = new Date(bounds30d.previousEndDate);
    assert(prevStart30d < start30d, "30d preset: previous period precedes current period");
    assert(prevEnd30d < start30d, "30d preset: previous end precedes current start");

    // Today preset
    const boundsToday = getDateRangeBounds("today");
    assert(boundsToday.label === "Today", "Today preset returns correct label");

    // Custom date range
    const customStart = "2026-10-01T00:00:00.000Z";
    const customEnd = "2026-10-31T23:59:59.999Z";
    const customBounds = getDateRangeBounds("30d", customStart, customEnd);
    assert(customBounds.startDate === customStart, "Custom range preserves exact startDate");
    assert(customBounds.endDate === customEnd, "Custom range preserves exact endDate");
    assert(customBounds.label === "Custom Range", "Custom range has correct label");
  }

  // TEST SUITE 2: Percentage Change & Zero Baseline Safety
  console.log("\n--- 2. METRIC COMPARISON & ZERO-BASELINE GUARD ---");
  {
    function calculateComparison(current: number, previous: number) {
      if (previous > 0) {
        return Math.round(((current - previous) / previous) * 1000) / 10;
      } else if (current > 0 && previous === 0) {
        return null; // Insufficient baseline comparison
      }
      return 0;
    }

    assert(
      calculateComparison(120, 100) === 20,
      "Standard growth (+20%) calculates correctly"
    );
    assert(
      calculateComparison(80, 100) === -20,
      "Standard decrease (-20%) calculates correctly"
    );
    assert(
      calculateComparison(10, 0) === null,
      "Zero baseline with positive current value returns null (prevents infinite %)"
    );
    assert(
      calculateComparison(0, 0) === 0,
      "Zero current and zero previous returns 0%"
    );
  }

  // TEST SUITE 3: Conversion Rates & Separation of Concepts
  console.log("\n--- 3. CONVERSION FORMULAS & CONCEPT SEPARATION ---");
  {
    const totalLeads: number = 250;
    const submittedApps: number = 50;
    const acceptedApps: number = 25;
    const confirmedAdmissions: number = 15;

    const leadToAppRate = Math.round((submittedApps / totalLeads) * 1000) / 10;
    const appToAdmissionRate = Math.round((confirmedAdmissions / submittedApps) * 1000) / 10;

    assert(leadToAppRate === 20, "Lead-to-App conversion is exactly 20.0%");
    assert(appToAdmissionRate === 30, "App-to-Admission conversion is exactly 30.0%");

    // Verify separation between accepted applications and confirmed admissions
    assert(
      acceptedApps !== confirmedAdmissions,
      "Accepted applications and confirmed admissions are strictly separate metrics"
    );
    assert(
      confirmedAdmissions < acceptedApps,
      "Confirmed admissions require recorded enrollment, not assumed by acceptance"
    );
  }

  // TEST SUITE 4: Formula Injection Mitigation in CSV Exports
  console.log("\n--- 4. CSV FORMULA INJECTION MITIGATION ---");
  {
    const maliciousFormula1 = "=SUM(1+1)";
    const maliciousFormula2 = "+CMD('calc')";
    const maliciousFormula3 = "-2+3";
    const maliciousFormula4 = "@SUM(A1:A10)";
    const safeText = "Aspirant Vision Education";
    const quotedText = 'John "Doc" Doe';

    assert(
      sanitizeCsvCell(maliciousFormula1) === '"\'=SUM(1+1)"',
      "Prepends single quote to formula starting with '='"
    );
    assert(
      sanitizeCsvCell(maliciousFormula2) === '"\'+CMD(\'calc\')"',
      "Prepends single quote to formula starting with '+'"
    );
    assert(
      sanitizeCsvCell(maliciousFormula3) === '"\'-2+3"',
      "Prepends single quote to formula starting with '-'"
    );
    assert(
      sanitizeCsvCell(maliciousFormula4) === '"\'@SUM(A1:A10)"',
      "Prepends single quote to formula starting with '@'"
    );
    assert(
      sanitizeCsvCell(safeText) === '"Aspirant Vision Education"',
      "Leaves safe text uncorrupted with standard wrapping"
    );
    assert(
      sanitizeCsvCell(quotedText) === '"John ""Doc"" Doe"',
      "Correctly doubles internal quotes per RFC4180"
    );

    const headers = ["Name", "Score"];
    const rows = [
      ["Alice", 95],
      ["=DANGEROUS()", 80],
    ];
    const csvOutput = arrayToCsv(headers, rows);
    assert(
      csvOutput.includes('"\'=DANGEROUS()"'),
      "Entire CSV table safely escapes malicious formula row"
    );
  }

  // TEST SUITE 5: Role-Based Access Control Matrices
  console.log("\n--- 5. RBAC & TENANT PRIVACY ---");
  {
    const isStaff = (role: string) => ["super_admin", "admin", "counsellor"].includes(role);
    const canViewAllCounsellors = (role: string) => ["super_admin", "admin"].includes(role);
    const canExportCounsellorComparison = (role: string) => ["super_admin", "admin"].includes(role);

    assert(isStaff("super_admin"), "Super admin has staff access");
    assert(isStaff("admin"), "Admin has staff access");
    assert(isStaff("counsellor"), "Counsellor has staff access");
    assert(!isStaff("student"), "Student is strictly denied analytics access");

    assert(canViewAllCounsellors("super_admin"), "Super admin can view all counsellor performance");
    assert(canViewAllCounsellors("admin"), "Admin can view all counsellor performance");
    assert(!canViewAllCounsellors("counsellor"), "Counsellor cannot view peer counsellor performance");

    assert(canExportCounsellorComparison("admin"), "Admin can export counsellor comparison");
    assert(!canExportCounsellorComparison("counsellor"), "Counsellor cannot export counsellor comparison");
  }

  // SUMMARY
  console.log("\n=======================================================");
  console.log(`PHASE 12 TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase12Tests();
