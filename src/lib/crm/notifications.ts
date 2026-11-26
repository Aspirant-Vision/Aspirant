"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { NotificationService } from "@/lib/notifications/service";
import { NotificationCategory } from "@/lib/notifications/types";
import { ApiResponse } from "@/types/api.types";
import { Database } from "@/types/database.types";

export type NotificationRecord = Database["public"]["Tables"]["notifications"]["Row"];

export async function getStaffNotifications(): Promise<ApiResponse<NotificationRecord[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } };
    }

    const res = await NotificationService.getNotifications(user.id, { pageSize: 10 });
    if (!res.success) {
      return { success: false, error: res.error };
    }

    return { success: true, data: res.data.notifications as unknown as NotificationRecord[] };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch notifications";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<ApiResponse<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } };
    }

    return await NotificationService.markAsRead(notificationId, user.id);
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to update notification";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function markAllNotificationsAsRead(): Promise<ApiResponse<{ count: number }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: { code: "UNAUTHORIZED", message: "User not authenticated" } };
    }

    const res = await NotificationService.markAllAsRead(user.id);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    return { success: true, data: { count: res.data.updatedCount } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to mark notifications";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function createCrmNotification(params: {
  recipientId: string;
  title: string;
  message: string;
  notificationType: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  destinationUrl?: string;
  category?: NotificationCategory;
}): Promise<ApiResponse<{ id: string }>> {
  try {
    // 1. Infer Category & Destination if not explicitly provided
    let category: NotificationCategory = params.category || "system";
    let destinationUrl = params.destinationUrl || null;

    if (!params.category) {
      if (params.notificationType.startsWith("lead")) {
        category = "lead";
        destinationUrl = params.relatedEntityId ? `/admin/leads/${params.relatedEntityId}` : "/admin/leads";
      } else if (params.notificationType.startsWith("follow_up")) {
        category = "follow_up";
        destinationUrl = params.relatedEntityId ? `/admin/leads/${params.relatedEntityId}` : "/admin/follow-ups";
      } else if (params.notificationType.startsWith("application")) {
        category = "application";
        destinationUrl = params.relatedEntityId ? `/admin/applications/${params.relatedEntityId}` : "/admin/applications";
      } else if (params.notificationType.startsWith("admission")) {
        category = "application";
        destinationUrl = "/admin/admissions";
      } else if (params.notificationType.startsWith("student")) {
        category = "student";
        destinationUrl = "/student/dashboard";
      }
    }

    // 2. Delegate to central notification service
    const res = await NotificationService.sendNotification({
      recipientId: params.recipientId,
      title: params.title,
      message: params.message,
      category,
      notificationType: params.notificationType,
      relatedEntityType: params.relatedEntityType || null,
      relatedEntityId: params.relatedEntityId || null,
      destinationUrl,
    });

    if (!res.success) {
      return { success: false, error: res.error };
    }

    return { success: true, data: { id: res.data.id } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to create notification";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}
