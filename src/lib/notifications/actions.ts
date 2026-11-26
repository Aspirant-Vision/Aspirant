"use server";

import { getCurrentUser, getCurrentProfile } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";
import { NotificationService } from "./service";
import { processFollowUpReminders, ReminderRunResult } from "./follow-up-scheduler";
import { NotificationFilterInput, UpdatePreferenceInput, NotificationItem } from "./types";
import { ApiResponse } from "@/types/api.types";
import { revalidatePath } from "next/cache";

export async function getNotificationsAction(
  filters?: Partial<NotificationFilterInput>
): Promise<
  ApiResponse<{
    notifications: NotificationItem[];
    total: number;
    unreadCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } };
    }

    return await NotificationService.getNotifications(user.id, filters);
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch notifications";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function getUnreadNotificationsCountAction(): Promise<ApiResponse<number>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } };
    }

    return await NotificationService.getUnreadCount(user.id);
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch unread count";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function markNotificationReadAction(
  notificationId: string
): Promise<ApiResponse<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } };
    }

    const res = await NotificationService.markAsRead(notificationId, user.id);
    if (res.success) {
      revalidatePath("/notifications");
      revalidatePath("/student/notifications");
      revalidatePath("/admin/notifications");
    }
    return res;
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to mark notification";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function markAllNotificationsReadAction(
  category?: string
): Promise<ApiResponse<{ updatedCount: number }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } };
    }

    const res = await NotificationService.markAllAsRead(user.id, category);
    if (res.success) {
      revalidatePath("/notifications");
      revalidatePath("/student/notifications");
      revalidatePath("/admin/notifications");
    }
    return res;
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to mark all notifications";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function getNotificationPreferencesAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } };
    }

    return await NotificationService.getPreferences(user.id);
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to load preferences";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function updateNotificationPreferenceAction(
  input: UpdatePreferenceInput
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } };
    }

    const res = await NotificationService.updatePreference(user.id, input);
    if (res.success) {
      revalidatePath("/student/settings/notifications");
      revalidatePath("/admin/settings/notifications");
    }
    return res;
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to update preference";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function runFollowUpRemindersCheckAction(): Promise<
  ApiResponse<ReminderRunResult>
> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !isStaff(profile.role)) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "Only staff members can run reminder checks" },
      };
    }

    const res = await processFollowUpReminders();
    if (res.success) {
      revalidatePath("/admin/crm");
      revalidatePath("/admin/leads");
      revalidatePath("/admin/notifications");
    }
    return res;
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to run reminder check";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

