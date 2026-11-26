import { z } from "zod";

export const NOTIFICATION_CATEGORIES = [
  "lead",
  "student",
  "application",
  "admin",
  "follow_up",
  "system",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const PREFERENCE_CATEGORIES = [
  { id: "application", label: "Application & Admission Updates", description: "Receive real-time alerts when your application status, documents, or admission is updated.", essential: true },
  { id: "student", label: "Counselling & Academic Guidance", description: "Get informed about counselling responses, interview schedules, and academic advice.", essential: false },
  { id: "follow_up", label: "Follow-up & Meeting Reminders", description: "Automated alerts for upcoming calls, document verification sessions, and scheduled deadlines.", essential: false },
  { id: "lead", label: "Enquiry & Lead Activity", description: "Alerts when student leads submit new requests, request calls, or update their requirements.", essential: false },
  { id: "system", label: "Platform & Security Notices", description: "Critical account security, session alerts, and major system announcements.", essential: true },
] as const;

export const sendNotificationSchema = z.object({
  recipientId: z.string().uuid("Invalid recipient ID"),
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().min(1, "Message is required").max(2000),
  category: z.enum(NOTIFICATION_CATEGORIES).optional().default("system"),
  notificationType: z.string().min(1).max(100),
  relatedEntityType: z.string().nullable().optional(),
  relatedEntityId: z.string().uuid().nullable().optional(),
  destinationUrl: z.string().max(500).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  bypassPreferences: z.boolean().optional().default(false), // for critical / essential notices
});

export type SendNotificationInput = z.input<typeof sendNotificationSchema>;

export const notificationFilterSchema = z.object({
  category: z.enum(NOTIFICATION_CATEGORIES).optional(),
  unreadOnly: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type NotificationFilterInput = z.infer<typeof notificationFilterSchema>;

export const updatePreferenceSchema = z.object({
  category: z.string().min(1),
  inAppEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  reminderEnabled: z.boolean().optional(),
});

export type UpdatePreferenceInput = z.infer<typeof updatePreferenceSchema>;

export interface NotificationItem {
  id: string;
  recipient_id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  notification_type: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  destination_url: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  expires_at: string | null;
  metadata: Record<string, any> | null;
}
