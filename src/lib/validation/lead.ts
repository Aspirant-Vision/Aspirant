import { z } from "zod";

export const leadStatusEnum = z.enum([
  "new",
  "contacted",
  "interested",
  "counselling_scheduled",
  "application_started",
  "application_submitted",
  "admitted",
  "not_interested",
  "lost",
]);

export const leadPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

export const assignmentStatusEnum = z.enum(["active", "reassigned", "completed"]);

export const followUpStatusEnum = z.enum(["pending", "completed", "cancelled", "rescheduled"]);

export const followUpTypeEnum = z.enum([
  "phone_call",
  "email",
  "whatsapp",
  "counselling_session",
  "video_meeting",
  "other",
]);

/**
 * Public website enquiry schema with anti-spam honeypot and contact normalization.
 */
export const publicEnquirySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("A valid email address is required"),
  phone: z
    .string()
    .min(10, "Phone number must have at least 10 digits")
    .max(20, "Phone number too long"),
  interestedCollegeId: z.string().uuid().optional().nullable().or(z.literal("")),
  interestedCourseId: z.string().uuid().optional().nullable().or(z.literal("")),
  preferredLocation: z.string().max(100).optional().nullable().or(z.literal("")),
  currentQualification: z.string().max(100).optional().nullable().or(z.literal("")),
  passingYear: z.number().int().min(1990).max(2035).optional().nullable(),
  enquiryMessage: z.string().max(1000).optional().nullable().or(z.literal("")),
  consentStatus: z
    .boolean()
    .refine((val) => val === true, "You must consent to be contacted for counselling"),
  source: z.string().default("website_modal"),
  landingPage: z.string().max(255).optional().nullable(),
  referringPage: z.string().max(255).optional().nullable(),
  utmSource: z.string().max(100).optional().nullable(),
  utmMedium: z.string().max(100).optional().nullable(),
  utmCampaign: z.string().max(100).optional().nullable(),
  honeypot: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type PublicEnquiryInput = z.infer<typeof publicEnquirySchema>;

/**
 * Internal CRM Lead creation and editing schema.
 */
export const leadFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("A valid email is required"),
  phone: z.string().min(10, "Valid phone number required").max(20),
  interestedCollegeId: z.string().uuid().optional().nullable().or(z.literal("")),
  interestedCourseId: z.string().uuid().optional().nullable().or(z.literal("")),
  preferredLocation: z.string().max(100).optional().nullable().or(z.literal("")),
  currentQualification: z.string().max(100).optional().nullable().or(z.literal("")),
  passingYear: z.number().int().min(1990).max(2035).optional().nullable(),
  source: z.string().min(1, "Lead source is required"),
  status: leadStatusEnum,
  priority: leadPriorityEnum,
  assignedCounsellorId: z.string().uuid().optional().nullable().or(z.literal("")),
  enquiryMessage: z.string().max(2000).optional().nullable().or(z.literal("")),
  statusReason: z.string().max(500).optional().nullable().or(z.literal("")),
  lostReason: z.string().max(500).optional().nullable().or(z.literal("")),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

/**
 * Lead status transition schema with reason enforcement for terminal/negative statuses.
 */
export const leadStatusUpdateSchema = z
  .object({
    leadId: z.string().uuid(),
    status: leadStatusEnum,
    reason: z.string().max(500).optional().nullable().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.status === "lost" || data.status === "not_interested") {
        return Boolean(data.reason && data.reason.trim().length > 3);
      }
      return true;
    },
    {
      message: "A detailed reason is required when marking a lead as Lost or Not Interested",
      path: ["reason"],
    }
  );

export type LeadStatusUpdateInput = z.infer<typeof leadStatusUpdateSchema>;

/**
 * Lead priority update schema.
 */
export const leadPriorityUpdateSchema = z.object({
  leadId: z.string().uuid(),
  priority: leadPriorityEnum,
});

export type LeadPriorityUpdateInput = z.infer<typeof leadPriorityUpdateSchema>;

/**
 * Lead assignment / reassignment schema.
 */
export const leadAssignmentSchema = z.object({
  leadId: z.string().uuid(),
  counsellorId: z.string().uuid().nullable().or(z.literal("")),
  notes: z.string().max(500).optional().nullable().or(z.literal("")),
});

export type LeadAssignmentInput = z.infer<typeof leadAssignmentSchema>;

/**
 * Internal note / activity logging schema.
 */
export const internalNoteSchema = z.object({
  leadId: z.string().uuid(),
  note: z.string().min(2, "Note content must be at least 2 characters").max(2000),
});

export type InternalNoteInput = z.infer<typeof internalNoteSchema>;

/**
 * Interaction recording schema (calls, WhatsApp, meetings, emails).
 */
export const interactionRecordSchema = z.object({
  leadId: z.string().uuid(),
  interactionType: z.enum(["phone_call", "whatsapp", "video_meeting", "email", "in_person"]),
  outcome: z.string().min(2, "Outcome or summary is required").max(1000),
  durationMinutes: z.number().int().min(0).max(480).optional().nullable(),
});

export type InteractionRecordInput = z.infer<typeof interactionRecordSchema>;

/**
 * Follow-up creation and editing schema.
 */
export const followUpSchema = z.object({
  leadId: z.string().uuid(),
  counsellorId: z.string().uuid().optional().nullable().or(z.literal("")),
  followUpType: followUpTypeEnum.default("phone_call"),
  title: z.string().max(150).optional().nullable().or(z.literal("")),
  scheduledAt: z.string().min(1, "Scheduled date and time is required"),
  notes: z.string().max(1000).optional().nullable().or(z.literal("")),
  priority: leadPriorityEnum.default("medium"),
});

export type FollowUpInput = z.infer<typeof followUpSchema>;

/**
 * Follow-up completion schema.
 */
export const followUpCompletionSchema = z.object({
  followUpId: z.string().uuid(),
  completionNotes: z.string().min(2, "Please provide completion remarks or notes").max(1000),
});

export type FollowUpCompletionInput = z.infer<typeof followUpCompletionSchema>;

/**
 * Follow-up reschedule schema.
 */
export const followUpRescheduleSchema = z.object({
  followUpId: z.string().uuid(),
  newScheduledAt: z.string().min(1, "New scheduled date and time is required"),
  reason: z.string().max(500).optional().nullable().or(z.literal("")),
});

export type FollowUpRescheduleInput = z.infer<typeof followUpRescheduleSchema>;
