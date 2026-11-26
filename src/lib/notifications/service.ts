import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  SendNotificationInput,
  sendNotificationSchema,
  NotificationFilterInput,
  notificationFilterSchema,
  UpdatePreferenceInput,
  updatePreferenceSchema,
  PREFERENCE_CATEGORIES,
  NotificationItem,
} from "./types";
import { ApiResponse } from "@/types/api.types";
import { Database } from "@/types/database.types";

export class NotificationService {
  /**
   * Send a single notification to a recipient, validating against recipient preferences.
   */
  static async sendNotification(
    input: SendNotificationInput
  ): Promise<ApiResponse<{ id: string; skipped?: boolean }>> {
    try {
      const parsed = sendNotificationSchema.safeParse(input);
      if (!parsed.success) {
        return {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: parsed.error.issues[0]?.message || "Invalid notification payload",
          },
        };
      }

      const {
        recipientId,
        title,
        message,
        category,
        notificationType,
        relatedEntityType,
        relatedEntityId,
        destinationUrl,
        expiresAt,
        metadata,
        bypassPreferences,
      } = parsed.data;

      const adminClient = createAdminClient();

      // 1. Check Recipient Preferences (unless bypassed for critical/essential notices)
      if (!bypassPreferences) {
        const { data: pref } = await adminClient
          .from("notification_preferences")
          .select("in_app_enabled")
          .eq("user_id", recipientId)
          .eq("category", category)
          .maybeSingle();

        if (pref && pref.in_app_enabled === false) {
          // Verify if this is an essential category that cannot be disabled
          const isEssential = PREFERENCE_CATEGORIES.some(
            (c) => c.id === category && c.essential
          );
          if (!isEssential) {
            return {
              success: true,
              data: {
                id: "skipped",
                skipped: true,
              },
            };
          }
        }
      }

      // 2. Insert notification into database
      const { data, error } = await adminClient
        .from("notifications")
        .insert({
          recipient_id: recipientId,
          title,
          message,
          category,
          notification_type: notificationType,
          related_entity_type: relatedEntityType || null,
          related_entity_id: relatedEntityId || null,
          destination_url: destinationUrl || null,
          expires_at: expiresAt || null,
          metadata: (metadata || {}) as any,
          is_read: false,
        })
        .select("id")
        .single();

      if (error) {
        return {
          success: false,
          error: { code: "INSERT_FAILED", message: error.message },
        };
      }

      return {
        success: true,
        data: { id: data.id, skipped: false },
      };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to send notification";
      return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
    }
  }

  /**
   * Send batch notifications efficiently to multiple recipients.
   */
  static async sendBatchNotifications(
    inputs: SendNotificationInput[]
  ): Promise<ApiResponse<{ sentCount: number; skippedCount: number }>> {
    try {
      const adminClient = createAdminClient();
      let sentCount = 0;
      let skippedCount = 0;

      const itemsToInsert: Database["public"]["Tables"]["notifications"]["Insert"][] = [];

      for (const input of inputs) {
        const parsed = sendNotificationSchema.safeParse(input);
        if (!parsed.success) continue;

        const {
          recipientId,
          title,
          message,
          category,
          notificationType,
          relatedEntityType,
          relatedEntityId,
          destinationUrl,
          expiresAt,
          metadata,
          bypassPreferences,
        } = parsed.data;

        let shouldSend = true;
        if (!bypassPreferences) {
          const { data: pref } = await adminClient
            .from("notification_preferences")
            .select("in_app_enabled")
            .eq("user_id", recipientId)
            .eq("category", category)
            .maybeSingle();

          if (pref && pref.in_app_enabled === false) {
            const isEssential = PREFERENCE_CATEGORIES.some(
              (c) => c.id === category && c.essential
            );
            if (!isEssential) {
              shouldSend = false;
              skippedCount++;
            }
          }
        }

        if (shouldSend) {
          itemsToInsert.push({
            recipient_id: recipientId,
            title,
            message,
            category,
            notification_type: notificationType,
            related_entity_type: relatedEntityType || null,
            related_entity_id: relatedEntityId || null,
            destination_url: destinationUrl || null,
            expires_at: expiresAt || null,
            metadata: (metadata || {}) as any,
            is_read: false,
          });
        }
      }

      if (itemsToInsert.length > 0) {
        const { error } = await adminClient
          .from("notifications")
          .insert(itemsToInsert);

        if (error) {
          return {
            success: false,
            error: { code: "BATCH_INSERT_FAILED", message: error.message },
          };
        }
        sentCount = itemsToInsert.length;
      }

      return {
        success: true,
        data: { sentCount, skippedCount },
      };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to send batch notifications";
      return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
    }
  }

  /**
   * Get paginated notifications for the authorized recipient.
   */
  static async getNotifications(
    userId: string,
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
      const parsedFilters = notificationFilterSchema.safeParse(filters || {});
      const { category, unreadOnly, page, pageSize } = parsedFilters.success
        ? parsedFilters.data
        : { page: 1, pageSize: 20, unreadOnly: false, category: undefined };

      let supabase;
      try {
        supabase = await createClient();
      } catch {
        supabase = createAdminClient();
      }
      const offset = (page - 1) * pageSize;

      // Base query for notifications
      let query = supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("recipient_id", userId);

      if (category) {
        query = query.eq("category", category);
      }
      if (unreadOnly) {
        query = query.eq("is_read", false);
      }

      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      let [listRes, unreadRes] = await Promise.all([
        query,
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", userId)
          .eq("is_read", false),
      ]);

      if (listRes.error) {
        // Fallback to adminClient if user client has RLS/session cookie issue
        const adminClient = createAdminClient();
        let fallbackQuery = adminClient
          .from("notifications")
          .select("*", { count: "exact" })
          .eq("recipient_id", userId);

        if (category) fallbackQuery = fallbackQuery.eq("category", category);
        if (unreadOnly) fallbackQuery = fallbackQuery.eq("is_read", false);

        fallbackQuery = fallbackQuery
          .order("created_at", { ascending: false })
          .range(offset, offset + pageSize - 1);

        const [adminListRes, adminUnreadRes] = await Promise.all([
          fallbackQuery,
          adminClient
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", userId)
            .eq("is_read", false),
        ]);

        if (!adminListRes.error) {
          listRes = adminListRes;
          unreadRes = adminUnreadRes;
        } else {
          return {
            success: false,
            error: { code: "QUERY_FAILED", message: listRes.error.message },
          };
        }
      }

      const total = listRes.count || 0;
      const unreadCount = unreadRes.count || 0;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return {
        success: true,
        data: {
          notifications: (listRes.data || []) as NotificationItem[],
          total,
          unreadCount,
          page,
          pageSize,
          totalPages,
        },
      };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to load notifications";
      return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
    }
  }

  /**
   * Get total unread count for a user.
   */
  static async getUnreadCount(userId: string): Promise<ApiResponse<number>> {
    try {
      let supabase;
      try {
        supabase = await createClient();
      } catch {
        supabase = createAdminClient();
      }
      let { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", userId)
        .eq("is_read", false);

      if (error) {
        const adminClient = createAdminClient();
        const fallbackRes = await adminClient
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", userId)
          .eq("is_read", false);
        if (!fallbackRes.error) {
          count = fallbackRes.count;
        } else {
          return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
        }
      }

      return { success: true, data: count || 0 };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to count unread notifications";
      return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
    }
  }

  /**
   * Mark a specific notification as read.
   */
  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<ApiResponse<{ id: string }>> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId)
        .eq("recipient_id", userId);

      if (error) {
        return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
      }

      return { success: true, data: { id: notificationId } };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to mark notification as read";
      return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
    }
  }

  /**
   * Mark all unread notifications as read for a user.
   */
  static async markAllAsRead(
    userId: string,
    category?: string
  ): Promise<ApiResponse<{ updatedCount: number }>> {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("recipient_id", userId)
        .eq("is_read", false);

      if (category) {
        query = query.eq("category", category);
      }

      const { error, count } = await query;
      if (error) {
        return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
      }

      return { success: true, data: { updatedCount: count || 0 } };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to mark all as read";
      return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
    }
  }

  /**
   * Retrieve notification preferences for a user with category fallback defaults.
   */
  static async getPreferences(userId: string): Promise<
    ApiResponse<
      Array<{
        category: string;
        label: string;
        description: string;
        essential: boolean;
        inAppEnabled: boolean;
        emailEnabled: boolean;
        reminderEnabled: boolean;
      }>
    >
  > {
    try {
      const supabase = await createClient();
      const { data: storedPrefs, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
      }

      const prefMap = new Map((storedPrefs || []).map((p) => [p.category, p]));

      const fullPreferences = PREFERENCE_CATEGORIES.map((cat) => {
        const stored = prefMap.get(cat.id);
        return {
          category: cat.id,
          label: cat.label,
          description: cat.description,
          essential: cat.essential,
          inAppEnabled: stored ? stored.in_app_enabled : true,
          emailEnabled: stored ? stored.email_enabled : true,
          reminderEnabled: stored ? stored.reminder_enabled : true,
        };
      });

      return { success: true, data: fullPreferences };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to load notification preferences";
      return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
    }
  }

  /**
   * Update notification preference for a specific category.
   */
  static async updatePreference(
    userId: string,
    input: UpdatePreferenceInput
  ): Promise<ApiResponse<{ category: string; inAppEnabled: boolean }>> {
    try {
      const parsed = updatePreferenceSchema.safeParse(input);
      if (!parsed.success) {
        return {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: parsed.error.issues[0]?.message || "Invalid preference data",
          },
        };
      }

      const { category, inAppEnabled, emailEnabled, reminderEnabled } = parsed.data;

      // Essential categories cannot disable in-app notifications
      const isEssential = PREFERENCE_CATEGORIES.some(
        (c) => c.id === category && c.essential
      );
      const effectiveInApp = isEssential ? true : inAppEnabled ?? true;

      const supabase = await createClient();
      const { error } = await supabase
        .from("notification_preferences")
        .upsert(
          {
            user_id: userId,
            category,
            in_app_enabled: effectiveInApp,
            email_enabled: emailEnabled ?? true,
            reminder_enabled: reminderEnabled ?? true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id, category" }
        );

      if (error) {
        return { success: false, error: { code: "UPSERT_FAILED", message: error.message } };
      }

      return {
        success: true,
        data: { category, inAppEnabled: effectiveInApp },
      };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to update notification preference";
      return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
    }
  }

  /**
   * Resolve administrative recipient user IDs.
   */
  static async getAdminRecipients(): Promise<string[]> {
    try {
      const adminClient = createAdminClient();
      const { data } = await adminClient
        .from("profiles")
        .select("id")
        .in("role", ["admin", "super_admin"])
        .eq("account_status", "active");

      return (data || []).map((p) => p.id);
    } catch (err) {
      console.error("[NotificationService.getAdminRecipients] error:", err);
      return [];
    }
  }
}
