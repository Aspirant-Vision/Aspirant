import { createAdminClient } from "@/lib/supabase/admin";
import { NotificationService } from "./service";
import { ApiResponse } from "@/types/api.types";

export interface ReminderRunResult {
  totalPendingChecked: number;
  remindersCreated: number;
  remindersSkipped: number;
  errors: string[];
}

/**
 * Robust, idempotent follow-up reminder processor.
 * Evaluates pending follow-ups against upcoming, due-today, and overdue triggers.
 * Prevents duplicates via unique database-enforced idempotency keys in follow_up_reminders.
 */
export async function processFollowUpReminders(): Promise<ApiResponse<ReminderRunResult>> {
  try {
    const adminClient = createAdminClient();
    const now = new Date();

    // 1. Fetch pending follow-ups with lead and counsellor details
    const { data: pendingFollowUps, error: fetchError } = await adminClient
      .from("follow_ups")
      .select(`
        id,
        scheduled_at,
        follow_up_type,
        notes,
        status,
        counsellor_id,
        counsellor:profiles!follow_ups_counsellor_id_fkey(id, full_name, email),
        lead:leads!follow_ups_lead_id_fkey(id, full_name, phone, student_user_id)
      `)
      .eq("status", "pending")
      .order("scheduled_at", { ascending: true })
      .limit(200);

    if (fetchError) {
      return {
        success: false,
        error: { code: "FETCH_FAILED", message: fetchError.message },
      };
    }

    const followUps = pendingFollowUps || [];
    let remindersCreated = 0;
    let remindersSkipped = 0;
    const errors: string[] = [];

    for (const fup of followUps) {
      try {
        const scheduledDate = new Date(fup.scheduled_at);
        const scheduledDateStr = scheduledDate.toISOString().split("T")[0]; // YYYY-MM-DD
        const diffMs = scheduledDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        const leadInfo = fup.lead as {
          id: string;
          full_name: string;
          phone: string;
          student_user_id: string | null;
        } | null;

        const counsellorInfo = fup.counsellor as {
          id: string;
          full_name: string;
          email: string;
        } | null;

        const studentName = leadInfo?.full_name || "Applicant";
        const studentPhone = leadInfo?.phone || "";
        const counsellorName = counsellorInfo?.full_name || "Assigned Counsellor";
        const formattedTime = scheduledDate.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        // Determine applicable reminder trigger
        let reminderType: "upcoming_24h" | "due_today" | "overdue" | null = null;

        if (diffHours < 0 && Math.abs(diffHours) > 0.5) {
          // Scheduled time has passed by > 30 minutes and still pending
          reminderType = "overdue";
        } else if (diffHours >= 0 && diffHours <= 12) {
          // Scheduled today or within next 12 hours
          reminderType = "due_today";
        } else if (diffHours > 12 && diffHours <= 24) {
          // Scheduled tomorrow (within 24 hours)
          reminderType = "upcoming_24h";
        }

        if (!reminderType) {
          continue; // Outside current alert windows
        }

        const idempotencyKey = `fup_${fup.id}_${reminderType}_${scheduledDateStr}`;

        // 2. Check if already dispatched
        const { data: existingReminder } = await adminClient
          .from("follow_up_reminders")
          .select("id")
          .eq("idempotency_key", idempotencyKey)
          .maybeSingle();

        if (existingReminder) {
          remindersSkipped++;
          continue;
        }

        // 3. Prepare notifications
        let title = "";
        let message = "";

        if (reminderType === "overdue") {
          title = `⚠️ Overdue Follow-up: ${studentName}`;
          message = `Follow-up scheduled for ${formattedTime} was missed or remains pending. Lead contact: ${studentPhone}.`;
        } else if (reminderType === "due_today") {
          title = `⏰ Follow-up Due Today: ${studentName}`;
          message = `Scheduled at ${formattedTime} (${fup.follow_up_type}). Lead contact: ${studentPhone}.`;
        } else {
          title = `📅 Follow-up Tomorrow: ${studentName}`;
          message = `Upcoming admission enquiry call scheduled for ${formattedTime}.`;
        }

        // A. Send Counsellor Notification
        await NotificationService.sendNotification({
          recipientId: fup.counsellor_id,
          title,
          message,
          category: "follow_up",
          notificationType: `follow_up_${reminderType}`,
          relatedEntityType: "follow_ups",
          relatedEntityId: fup.id,
          destinationUrl: leadInfo?.id ? `/admin/leads/${leadInfo.id}` : "/admin/crm",
          metadata: {
            followUpId: fup.id,
            reminderType,
            scheduledAt: fup.scheduled_at,
          },
        });

        // B. Send Student Notification if linked to student user account (no internal notes exposed)
        if (leadInfo?.student_user_id && reminderType !== "overdue") {
          await NotificationService.sendNotification({
            recipientId: leadInfo.student_user_id,
            title: "Counselling Session Reminder",
            message: `Your admission counselling follow-up with ${counsellorName} is scheduled for ${formattedTime}.`,
            category: "student",
            notificationType: "student_followup_reminder",
            relatedEntityType: "follow_ups",
            relatedEntityId: fup.id,
            destinationUrl: "/student/counselling",
          });
        }

        // 4. Log in follow_up_reminders table for idempotency
        const { error: insertLogError } = await adminClient
          .from("follow_up_reminders")
          .insert({
            follow_up_id: fup.id,
            recipient_id: fup.counsellor_id,
            reminder_type: reminderType,
            idempotency_key: idempotencyKey,
            status: "sent",
            sent_at: now.toISOString(),
            metadata: {
              studentName,
              diffHours: Math.round(diffHours * 10) / 10,
            },
          });

        if (insertLogError) {
          errors.push(`Failed to log reminder for follow-up ${fup.id}: ${insertLogError.message}`);
        } else {
          remindersCreated++;
        }
      } catch (err: unknown) {
        errors.push(`Error processing follow-up ${fup.id}: ${(err as Error).message}`);
      }
    }

    return {
      success: true,
      data: {
        totalPendingChecked: followUps.length,
        remindersCreated,
        remindersSkipped,
        errors,
      },
    };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Scheduler failure";
    return { success: false, error: { code: "SCHEDULER_ERROR", message: msg } };
  }
}
