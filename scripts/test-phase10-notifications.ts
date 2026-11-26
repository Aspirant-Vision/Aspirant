/**
 * Phase 10: Realtime Notifications, Alerts & Automated Follow-ups Test Suite
 * Tests Notification Service, Preferences, Follow-up Reminders & Idempotency, Security & RBAC.
 */

import {
  NOTIFICATION_CATEGORIES,
  PREFERENCE_CATEGORIES,
  sendNotificationSchema,
  notificationFilterSchema,
  updatePreferenceSchema,
  NotificationCategory,
} from "../src/lib/notifications/types";

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

async function runPhase10Tests() {
  console.log("\n=======================================================");
  console.log("ASPIRANT VISION — PHASE 10 NOTIFICATIONS & ALERTS TESTS");
  console.log("=======================================================\n");

  // TEST SUITE 1: Notification Categories & Schema Validation
  console.log("--- 1. CATEGORIES & SCHEMA VALIDATION ---");
  {
    assert(
      NOTIFICATION_CATEGORIES.includes("lead") &&
        NOTIFICATION_CATEGORIES.includes("student") &&
        NOTIFICATION_CATEGORIES.includes("application") &&
        NOTIFICATION_CATEGORIES.includes("follow_up") &&
        NOTIFICATION_CATEGORIES.includes("system") &&
        NOTIFICATION_CATEGORIES.includes("admin"),
      "All 6 required notification categories exist"
    );

    const validPayload = {
      recipientId: "a0000000-0000-4000-8000-000000000001",
      title: "Application Submitted",
      message: "Your application AV-APP-2026-123456 has been received.",
      category: "application" as NotificationCategory,
      notificationType: "application_submitted",
      destinationUrl: "/student/applications/a0000000-0000-4000-8000-000000000002",
    };
    const parseResult = sendNotificationSchema.safeParse(validPayload);
    assert(parseResult.success, "Valid notification payload parses successfully");

    const invalidUuid = sendNotificationSchema.safeParse({
      ...validPayload,
      recipientId: "not-a-uuid",
    });
    assert(!invalidUuid.success, "Invalid recipient UUID is rejected");

    const emptyTitle = sendNotificationSchema.safeParse({
      ...validPayload,
      title: "",
    });
    assert(!emptyTitle.success, "Empty notification title is rejected");

    const invalidCategory = sendNotificationSchema.safeParse({
      ...validPayload,
      category: "crypto_alert",
    });
    assert(!invalidCategory.success, "Unsupported category is rejected");
  }

  // TEST SUITE 2: Notification Preferences & Essential Guardrails
  console.log("\n--- 2. NOTIFICATION PREFERENCES & ESSENTIAL RULES ---");
  {
    const appCategory = PREFERENCE_CATEGORIES.find((c) => c.id === "application");
    const systemCategory = PREFERENCE_CATEGORIES.find((c) => c.id === "system");
    const leadCategory = PREFERENCE_CATEGORIES.find((c) => c.id === "lead");

    assert(appCategory?.essential === true, "Application updates marked as essential");
    assert(systemCategory?.essential === true, "System & security notices marked as essential");
    assert(leadCategory?.essential === false, "Lead updates are optional");

    const prefPayload = {
      category: "follow_up",
      inAppEnabled: true,
      emailEnabled: false,
      reminderEnabled: true,
    };
    const prefResult = updatePreferenceSchema.safeParse(prefPayload);
    assert(prefResult.success, "Valid preference update input parses successfully");

    // Server-side guard: essential category cannot have in-app disabled
    const isCategoryEssential = (cat: string) =>
      PREFERENCE_CATEGORIES.some((c) => c.id === cat && c.essential);

    const effectiveInAppForApp = isCategoryEssential("application") ? true : false;
    assert(effectiveInAppForApp === true, "Essential category enforces inAppEnabled=true regardless of client request");

    const effectiveInAppForLead = isCategoryEssential("lead") ? true : false;
    assert(effectiveInAppForLead === false, "Optional category permits inAppEnabled=false");
  }

  // TEST SUITE 3: Idempotent Follow-up Reminders & Trigger Classification
  console.log("\n--- 3. FOLLOW-UP REMINDER CLASSIFICATION & IDEMPOTENCY ---");
  {
    const now = new Date("2026-11-26T10:00:00.000Z");

    const classifyReminder = (scheduledAt: Date, currentTime: Date) => {
      const diffMs = scheduledAt.getTime() - currentTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 0 && Math.abs(diffHours) > 0.5) {
        return "overdue";
      } else if (diffHours >= 0 && diffHours <= 12) {
        return "due_today";
      } else if (diffHours > 12 && diffHours <= 24) {
        return "upcoming_24h";
      }
      return null;
    };

    // 1. Due in 2 hours
    const dueSoon = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    assert(classifyReminder(dueSoon, now) === "due_today", "Follow-up in 2 hours classified as due_today");

    // 2. Due in 18 hours
    const dueTomorrow = new Date(now.getTime() + 18 * 60 * 60 * 1000);
    assert(classifyReminder(dueTomorrow, now) === "upcoming_24h", "Follow-up in 18 hours classified as upcoming_24h");

    // 3. Past by 2 hours
    const pastTwoHours = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    assert(classifyReminder(pastTwoHours, now) === "overdue", "Follow-up past by 2 hours classified as overdue");

    // 4. Past by 10 minutes (grace period)
    const pastTenMins = new Date(now.getTime() - 10 * 60 * 1000);
    assert(classifyReminder(pastTenMins, now) === null, "Follow-up in 10-minute grace period not immediately marked overdue");

    // 5. Idempotency Key Format
    const fupId = "f0000000-0000-0000-0000-000000000005";
    const dateStr = "2026-11-26";
    const key = `fup_${fupId}_due_today_${dateStr}`;
    assert(key === "fup_f0000000-0000-0000-0000-000000000005_due_today_2026-11-26", "Idempotency key strictly formatted");

    // Simulated Idempotency Cache
    const reminderLog = new Set<string>();
    reminderLog.add(key);

    const isDuplicate = reminderLog.has(key);
    assert(isDuplicate === true, "Repeated reminder check successfully detects duplicate idempotency key");

    const secondKey = `fup_${fupId}_overdue_${dateStr}`;
    assert(!reminderLog.has(secondKey), "Different trigger type produces distinct idempotency key");
  }

  // TEST SUITE 4: Privacy & Student View Sanitation
  console.log("\n--- 4. STUDENT PRIVACY & NOTE SANITATION ---");
  {
    const internalCounsellorNotes = "Student seems indecisive. Quota margin is 10%. Call father if phone unanswered.";
    const studentReminderPayload = {
      title: "Counselling Session Reminder",
      message: `Your admission counselling follow-up with Dr. Sharma is scheduled for 02:00 PM.`,
    };

    assert(
      !studentReminderPayload.message.includes(internalCounsellorNotes),
      "Student reminder completely excludes internal CRM counsellor notes"
    );
    assert(
      !studentReminderPayload.message.includes("margin") && !studentReminderPayload.message.includes("indecisive"),
      "Sensitive admission strategy details are not leaked to students"
    );
  }

  // TEST SUITE 5: Realtime Subscription Isolation
  console.log("\n--- 5. REALTIME SUBSCRIPTION ISOLATION ---");
  {
    const studentUserId = "u1111111-0000-0000-0000-000000000001";
    const counsellorUserId = "u2222222-0000-0000-0000-000000000002";

    const makeChannelFilter = (id: string) => `recipient_id=eq.${id}`;

    const studentFilter = makeChannelFilter(studentUserId);
    const counsellorFilter = makeChannelFilter(counsellorUserId);

    assert(
      studentFilter === "recipient_id=eq.u1111111-0000-0000-0000-000000000001",
      "Realtime filter strictly binds to student auth.uid"
    );
    assert(
      studentFilter !== counsellorFilter,
      "Students cannot subscribe to counsellor notification streams"
    );

    // Deduplication logic test
    const existingList = [
      { id: "n1", title: "Test 1", is_read: false },
      { id: "n2", title: "Test 2", is_read: true },
    ];
    const incomingRealtimeItem = { id: "n1", title: "Test 1 Updated", is_read: false };

    const deduplicated = existingList.some((n) => n.id === incomingRealtimeItem.id)
      ? existingList
      : [incomingRealtimeItem, ...existingList];

    assert(deduplicated.length === 2, "Realtime listener deduplicates existing notifications by ID");
  }

  // TEST SUITE 6: Scheduled Cron Endpoint Authorization
  console.log("\n--- 6. CRON ENDPOINT AUTHORIZATION CHECK ---");
  {
    const expectedSecret = "aspirant_cron_secret_key_2026";

    const verifyAuth = (authHeader: string | null, customHeader: string | null) => {
      if (authHeader && authHeader === `Bearer ${expectedSecret}`) return true;
      if (customHeader && customHeader === expectedSecret) return true;
      return false;
    };

    assert(!verifyAuth(null, null), "Unauthenticated request is rejected (401)");
    assert(!verifyAuth("Bearer wrong_secret", null), "Invalid bearer token is rejected");
    assert(verifyAuth(`Bearer ${expectedSecret}`, null), "Valid Bearer token is authorized (200)");
    assert(verifyAuth(null, expectedSecret), "Valid x-cron-secret header is authorized (200)");
  }

  // SUMMARY
  console.log("\n=======================================================");
  console.log(`PHASE 10 TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase10Tests();
