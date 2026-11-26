import { NextRequest, NextResponse } from "next/server";
import { processFollowUpReminders } from "@/lib/notifications/follow-up-scheduler";
import { getCurrentProfile } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

/**
 * Secure scheduled endpoint for processing follow-up reminders.
 * Can be triggered via:
 * 1. Cron service passing `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret` header
 * 2. Authenticated Admin / Counsellor session
 */
export async function GET(req: NextRequest) {
  return handleReminderRequest(req);
}

export async function POST(req: NextRequest) {
  return handleReminderRequest(req);
}

async function handleReminderRequest(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretHeader = req.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET || "aspirant_cron_secret_key_2026";

    let isAuthorized = false;

    // 1. Check Bearer Token or Custom Header
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token === expectedSecret) {
        isAuthorized = true;
      }
    } else if (secretHeader && secretHeader === expectedSecret) {
      isAuthorized = true;
    }

    // 2. Check Session Role as alternative authorization
    if (!isAuthorized) {
      const profile = await getCurrentProfile();
      if (profile && isStaff(profile.role)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Valid Bearer CRON_SECRET or staff session required.",
        },
        { status: 401 }
      );
    }

    // 3. Process Reminders
    const result = await processFollowUpReminders();

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (err: unknown) {
    const message = (err as Error).message || "Internal server error during reminder processing";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
