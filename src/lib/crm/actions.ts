"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireCounsellor, getCurrentProfile } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  publicEnquirySchema,
  PublicEnquiryInput,
  leadFormSchema,
  LeadFormInput,
  leadStatusUpdateSchema,
  LeadStatusUpdateInput,
  leadPriorityUpdateSchema,
  LeadPriorityUpdateInput,
  leadAssignmentSchema,
  LeadAssignmentInput,
  internalNoteSchema,
  InternalNoteInput,
  interactionRecordSchema,
  InteractionRecordInput,
  followUpSchema,
  FollowUpInput,
  followUpCompletionSchema,
  FollowUpCompletionInput,
  followUpRescheduleSchema,
  FollowUpRescheduleInput,
} from "@/lib/validation/lead";
import { createCrmNotification } from "@/lib/crm/notifications";
import { ApiResponse } from "@/types/api.types";
import { Database, LeadPriority, LeadStatus } from "@/types/database.types";

export type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
export type LeadActivityRow = Database["public"]["Tables"]["lead_activities"]["Row"];
export type FollowUpRow = Database["public"]["Tables"]["follow_ups"]["Row"];
export type LeadAssignmentRow = Database["public"]["Tables"]["lead_assignments"]["Row"];

// ==============================================================================
// 1. PUBLIC WEBSITE ENQUIRY INGESTION
// ==============================================================================

/**
 * Public website enquiry capture.
 * Sanitizes input, prevents spam, performs safe duplicate detection,
 * triggers auto-assignment to eligible counsellors, and logs CRM activity.
 */
export async function submitPublicEnquiryAction(
  rawInput: PublicEnquiryInput
): Promise<ApiResponse<{ leadId: string; duplicateMerged: boolean }>> {
  try {
    const parsed = publicEnquirySchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Invalid enquiry submission",
        },
      };
    }

    const data = parsed.data;

    // Rate Limiting Guard
    const rateLimitError = await enforceRateLimit("submitPublicEnquiryAction", "enquiry");
    if (rateLimitError) {
      return {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: rateLimitError.error,
        },
      };
    }

    // 1. Honeypot Anti-Spam Check: silently succeed if honeypot was populated
    if (data.honeypot && data.honeypot.trim().length > 0) {
      return {
        success: true,
        data: { leadId: "00000000-0000-0000-0000-000000000000", duplicateMerged: false },
      };
    }

    // 2. Normalization
    const normalizedPhone = data.phone.replace(/[^\d+]/g, "").trim();
    const normalizedEmail = data.email.toLowerCase().trim();
    const supabase = createAdminClient();

    // 3. Safe Duplicate Detection within 24-Hour Window
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existingLeads } = await supabase
      .from("leads")
      .select("id, full_name, email, phone, status, assigned_counsellor_id")
      .or(`email.eq.${normalizedEmail},phone.eq.${normalizedPhone}`)
      .gte("created_at", oneDayAgo)
      .limit(1);

    const existingLead = existingLeads?.[0];

    if (existingLead) {
      // Append an activity to the existing lead instead of creating a spam duplicate
      const extraMsg = data.enquiryMessage ? ` | Notes: "${data.enquiryMessage}"` : "";
      const locMsg = data.preferredLocation ? ` | Location: ${data.preferredLocation}` : "";
      await supabase.from("lead_activities").insert({
        lead_id: existingLead.id,
        activity_type: "subsequent_enquiry",
        description: `Subsequent enquiry received from website (${data.source})${locMsg}${extraMsg}`,
        is_internal: true,
      });

      // Notify counsellor if assigned
      if (existingLead.assigned_counsellor_id) {
        await createCrmNotification({
          recipientId: existingLead.assigned_counsellor_id,
          title: "Follow-up Enquiry Received",
          message: `Student ${existingLead.full_name} submitted another enquiry on the website.`,
          notificationType: "lead_followup",
          relatedEntityType: "leads",
          relatedEntityId: existingLead.id,
        });
      }

      return {
        success: true,
        data: { leadId: existingLead.id, duplicateMerged: true },
      };
    }

    // 4. Automatic Counsellor Assignment (Workload-based Round-Robin)
    let assignedCounsellorId: string | null = null;
    try {
      const { data: activeCounsellors } = await supabase
        .from("user_roles")
        .select("user_id, profiles:user_id(id, full_name, account_status)")
        .eq("role", "counsellor");

      const eligible = (activeCounsellors || [])
        .filter((c) => (c.profiles as any)?.account_status === "active")
        .map((c) => c.user_id);

      if (eligible.length > 0) {
        // Query current active leads per eligible counsellor
        const { data: leadCounts } = await supabase
          .from("leads")
          .select("assigned_counsellor_id")
          .in("assigned_counsellor_id", eligible)
          .in("status", ["new", "contacted", "interested", "counselling_scheduled"]);

        const loadMap: Record<string, number> = {};
        for (const id of eligible) loadMap[id] = 0;
        for (const row of leadCounts || []) {
          if (row.assigned_counsellor_id) {
            loadMap[row.assigned_counsellor_id] = (loadMap[row.assigned_counsellor_id] || 0) + 1;
          }
        }

        // Pick counsellor with lowest load
        let minLoad = Infinity;
        let bestCounsellor = eligible[0];
        for (const id of eligible) {
          if ((loadMap[id] ?? 0) < minLoad) {
            minLoad = loadMap[id] ?? 0;
            bestCounsellor = id;
          }
        }
        assignedCounsellorId = bestCounsellor;
      }
    } catch {
      // In case of any error in auto-assignment, fallback gracefully to unassigned
      assignedCounsellorId = null;
    }

    // 5. Insert New Lead Record
    const { data: newLead, error: insertError } = await supabase
      .from("leads")
      .insert({
        full_name: data.fullName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        interested_college_id: data.interestedCollegeId || null,
        interested_course_id: data.interestedCourseId || null,
        preferred_location: data.preferredLocation || null,
        current_qualification: data.currentQualification || null,
        passing_year: data.passingYear || null,
        enquiry_message: data.enquiryMessage || null,
        consent_status: data.consentStatus,
        source: data.source || "website_modal",
        status: "new",
        priority: "medium",
        assigned_counsellor_id: assignedCounsellorId,
        landing_page: data.landingPage || null,
        referring_page: data.referringPage || null,
        utm_source: data.utmSource || null,
        utm_medium: data.utmMedium || null,
        utm_campaign: data.utmCampaign || null,
      })
      .select("id")
      .single();

    if (insertError || !newLead) {
      console.error("[submitPublicEnquiryAction] Insert failed:", insertError);
      return {
        success: false,
        error: {
          code: "INSERT_FAILED",
          message:
            insertError?.message && !insertError.message.toLowerCase().includes("row-level security")
              ? insertError.message
              : "Unable to register enquiry right now. Please reach out directly on WhatsApp or call our admission desk.",
        },
      };
    }

    // 6. Record Historical Lead Assignment
    if (assignedCounsellorId) {
      await supabase.from("lead_assignments").insert({
        lead_id: newLead.id,
        counsellor_id: assignedCounsellorId,
        assignment_status: "active",
      });

      // Send counsellor alert notification
      await createCrmNotification({
        recipientId: assignedCounsellorId,
        title: "New Lead Assigned",
        message: `New student enquiry from ${data.fullName.trim()} has been assigned to you.`,
        notificationType: "lead_assigned",
        relatedEntityType: "leads",
        relatedEntityId: newLead.id,
      });
    }

    // 7. Record Ingestion Activity
    await supabase.from("lead_activities").insert({
      lead_id: newLead.id,
      activity_type: "lead_created",
      description: `Lead ingested from public website source: ${data.source || "website_modal"}${
        assignedCounsellorId ? " (Auto-assigned to counsellor)" : " (Unassigned)"
      }`,
      is_internal: true,
    });

    revalidatePath("/admin/leads");
    revalidatePath("/admin/my-leads");

    return {
      success: true,
      data: { leadId: newLead.id, duplicateMerged: false },
    };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Internal error processing enquiry";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 2. LEAD LISTING & FILTERING
// ==============================================================================

export interface GetLeadsParams {
  search?: string;
  status?: string;
  priority?: string;
  source?: string;
  counsellorId?: string;
  collegeId?: string;
  courseId?: string;
  onlyMine?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: "newest" | "oldest" | "priority";
}

export async function getLeadsListingAction(params: GetLeadsParams = {}): Promise<
  ApiResponse<{
    leads: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>
> {
  try {
    const profile = await requireCounsellor();
    const supabase = await createClient();

    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize || 15));
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("leads")
      .select(
        `
        id,
        full_name,
        email,
        phone,
        status,
        priority,
        source,
        preferred_location,
        current_qualification,
        passing_year,
        created_at,
        updated_at,
        assigned_counsellor_id,
        interested_college_id,
        interested_course_id,
        colleges (id, name, city, state, logo_url),
        courses (id, name),
        counsellor:profiles!leads_assigned_counsellor_id_fkey (id, full_name, email, avatar_url)
      `,
        { count: "exact" }
      )
      .is("deleted_at", null);

    // Counsellor Scope Restriction
    if (params.onlyMine || (profile.role === "counsellor" && !params.counsellorId)) {
      query = query.eq("assigned_counsellor_id", profile.id);
    } else if (params.counsellorId) {
      if (params.counsellorId === "unassigned") {
        query = query.is("assigned_counsellor_id", null);
      } else {
        query = query.eq("assigned_counsellor_id", params.counsellorId);
      }
    }

    // Status Filter
    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status as LeadStatus);
    }

    // Priority Filter
    if (params.priority && params.priority !== "all") {
      query = query.eq("priority", params.priority as LeadPriority);
    }

    // Source Filter
    if (params.source && params.source !== "all") {
      query = query.eq("source", params.source);
    }

    // College Filter
    if (params.collegeId && params.collegeId !== "all") {
      query = query.eq("interested_college_id", params.collegeId);
    }

    // Course Filter
    if (params.courseId && params.courseId !== "all") {
      query = query.eq("interested_course_id", params.courseId);
    }

    // Search Query (name, email, phone)
    if (params.search && params.search.trim()) {
      const term = `%${params.search.trim()}%`;
      query = query.or(`full_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`);
    }

    // Sorting
    if (params.sortBy === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else if (params.sortBy === "priority") {
      query = query.order("priority", { ascending: false }).order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data, count, error } = await query;

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      data: {
        leads: data || [],
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch leads";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 3. OVERVIEW METRICS (100% Real PostgreSQL Aggregations)
// ==============================================================================

export interface LeadMetrics {
  totalLeads: number;
  newLeads: number;
  unassignedLeads: number;
  assignedLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  followUpsDueToday: number;
  overdueFollowUps: number;
  applicationsStarted: number;
  convertedLeads: number;
  lostLeads: number;
}

export async function getLeadMetricsAction(counsellorId?: string): Promise<ApiResponse<LeadMetrics>> {
  try {
    const profile = await requireCounsellor();
    const supabase = await createClient();

    const isTargeted = Boolean(counsellorId || profile.role === "counsellor");
    const targetId = counsellorId || (profile.role === "counsellor" ? profile.id : null);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let totalQuery = supabase.from("leads").select("*", { count: "exact", head: true }).is("deleted_at", null);
    let newQuery = supabase.from("leads").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("status", "new");
    let unassignedQuery = supabase.from("leads").select("*", { count: "exact", head: true }).is("deleted_at", null).is("assigned_counsellor_id", null);
    let assignedQuery = supabase.from("leads").select("*", { count: "exact", head: true }).is("deleted_at", null).not("assigned_counsellor_id", "is", null);
    let contactedQuery = supabase.from("leads").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("status", "contacted");
    let interestedQuery = supabase.from("leads").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("status", "interested");
    let appStartedQuery = supabase.from("leads").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("status", "application_started");
    let convertedQuery = supabase.from("leads").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("status", "admitted");
    let lostQuery = supabase.from("leads").select("*", { count: "exact", head: true }).is("deleted_at", null).in("status", ["not_interested", "lost"]);

    let followUpTodayQuery = supabase
      .from("follow_ups")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .gte("scheduled_at", todayStart.toISOString())
      .lte("scheduled_at", todayEnd.toISOString());

    let followUpOverdueQuery = supabase
      .from("follow_ups")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .lt("scheduled_at", new Date().toISOString());

    if (isTargeted && targetId) {
      totalQuery = totalQuery.eq("assigned_counsellor_id", targetId);
      newQuery = newQuery.eq("assigned_counsellor_id", targetId);
      contactedQuery = contactedQuery.eq("assigned_counsellor_id", targetId);
      interestedQuery = interestedQuery.eq("assigned_counsellor_id", targetId);
      appStartedQuery = appStartedQuery.eq("assigned_counsellor_id", targetId);
      convertedQuery = convertedQuery.eq("assigned_counsellor_id", targetId);
      lostQuery = lostQuery.eq("assigned_counsellor_id", targetId);
      followUpTodayQuery = followUpTodayQuery.eq("counsellor_id", targetId);
      followUpOverdueQuery = followUpOverdueQuery.eq("counsellor_id", targetId);
    }

    const [
      totalRes,
      newRes,
      unassignedRes,
      assignedRes,
      contactedRes,
      interestedRes,
      appStartedRes,
      convertedRes,
      lostRes,
      fuTodayRes,
      fuOverdueRes,
    ] = await Promise.all([
      totalQuery,
      newQuery,
      unassignedQuery,
      assignedQuery,
      contactedQuery,
      interestedQuery,
      appStartedQuery,
      convertedQuery,
      lostQuery,
      followUpTodayQuery,
      followUpOverdueQuery,
    ]);

    return {
      success: true,
      data: {
        totalLeads: totalRes.count ?? 0,
        newLeads: newRes.count ?? 0,
        unassignedLeads: unassignedRes.count ?? 0,
        assignedLeads: assignedRes.count ?? 0,
        contactedLeads: contactedRes.count ?? 0,
        interestedLeads: interestedRes.count ?? 0,
        followUpsDueToday: fuTodayRes.count ?? 0,
        overdueFollowUps: fuOverdueRes.count ?? 0,
        applicationsStarted: appStartedRes.count ?? 0,
        convertedLeads: convertedRes.count ?? 0,
        lostLeads: lostRes.count ?? 0,
      },
    };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch lead metrics";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 4. LEAD 360 DETAIL VIEW
// ==============================================================================

export async function getLeadByIdAction(leadId: string): Promise<
  ApiResponse<{
    lead: any;
    activities: LeadActivityRow[];
    followUps: any[];
    assignments: any[];
    counsellors: any[];
    studentApplications: any[];
  }>
> {
  try {
    const profile = await requireCounsellor();
    const supabase = await createClient();

    // 1. Fetch Lead Details
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select(
        `
        *,
        colleges (id, name, slug, city, state, logo_url),
        courses (id, name, slug, stream, degree_type),
        assigned_counsellor:profiles!leads_assigned_counsellor_id_fkey (id, full_name, email, phone, avatar_url),
        student_profile:profiles!leads_student_user_id_fkey (id, full_name, email, phone, city, state)
      `
      )
      .eq("id", leadId)
      .is("deleted_at", null)
      .maybeSingle();

    if (leadError || !lead) {
      return { success: false, error: { code: "NOT_FOUND", message: "Lead not found" } };
    }

    // Role Security: Counsellors can only access leads assigned to them unless Admin
    if (
      profile.role === "counsellor" &&
      lead.assigned_counsellor_id !== profile.id
    ) {
      return {
        success: false,
        error: { code: "FORBIDDEN", message: "You are not authorized to access this lead" },
      };
    }

    // 2. Fetch Activities, Follow-ups, Assignments, Counsellors, and Applications in parallel
    const [actRes, fuRes, assignRes, counsellorsRes, appsRes] = await Promise.all([
      supabase
        .from("lead_activities")
        .select("*, actor:profiles(id, full_name, avatar_url)")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false }),
      supabase
        .from("follow_ups")
        .select("*, counsellor:profiles(id, full_name, email)")
        .eq("lead_id", leadId)
        .order("scheduled_at", { ascending: false }),
      supabase
        .from("lead_assignments")
        .select("*, counsellor:profiles!lead_assignments_counsellor_id_fkey(id, full_name, email)")
        .eq("lead_id", leadId)
        .order("assigned_at", { ascending: false }),
      supabase
        .from("user_roles")
        .select("user_id, profiles:user_id(id, full_name, email, account_status)")
        .eq("role", "counsellor"),
      lead.student_user_id
        ? supabase
            .from("applications")
            .select("id, application_number, application_status, created_at, college:colleges(name)")
            .eq("student_id", lead.student_user_id)
        : Promise.resolve({ data: [] }),
    ]);

    const activeCounsellors = (counsellorsRes.data || [])
      .filter((c) => (c.profiles as any)?.account_status === "active")
      .map((c) => c.profiles);

    return {
      success: true,
      data: {
        lead,
        activities: (actRes.data as any) || [],
        followUps: fuRes.data || [],
        assignments: assignRes.data || [],
        counsellors: activeCounsellors,
        studentApplications: appsRes.data || [],
      },
    };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch lead details";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 5. LEAD CREATION & EDITING
// ==============================================================================

export async function createLeadAction(
  rawInput: LeadFormInput
): Promise<ApiResponse<{ id: string }>> {
  try {
    const profile = await requireCounsellor();
    const parsed = leadFormSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Invalid lead data",
        },
      };
    }

    const data = parsed.data;
    const supabase = await createClient();

    const normalizedPhone = data.phone.replace(/[^\d+]/g, "").trim();
    const normalizedEmail = data.email.toLowerCase().trim();

    // Default counsellor assignment: if counsellor creates it and didn't pick, assign to self
    let assignedId = data.assignedCounsellorId || null;
    if (!assignedId && profile.role === "counsellor") {
      assignedId = profile.id;
    }

    const { data: newLead, error: insertError } = await supabase
      .from("leads")
      .insert({
        full_name: data.fullName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        interested_college_id: data.interestedCollegeId || null,
        interested_course_id: data.interestedCourseId || null,
        preferred_location: data.preferredLocation || null,
        current_qualification: data.currentQualification || null,
        passing_year: data.passingYear || null,
        enquiry_message: data.enquiryMessage || null,
        source: data.source || "manual",
        status: data.status,
        priority: data.priority,
        assigned_counsellor_id: assignedId,
        status_reason: data.statusReason || null,
        lost_reason: data.lostReason || null,
      })
      .select("id")
      .single();

    if (insertError || !newLead) {
      return { success: false, error: { code: "INSERT_FAILED", message: insertError?.message || "Failed to create lead" } };
    }

    // Historical Assignment Record
    if (assignedId) {
      await supabase.from("lead_assignments").insert({
        lead_id: newLead.id,
        counsellor_id: assignedId,
        assigned_by: profile.id,
        assignment_status: "active",
      });
    }

    // Activity Log
    await supabase.from("lead_activities").insert({
      lead_id: newLead.id,
      actor_id: profile.id,
      activity_type: "lead_created",
      description: `Lead created manually by ${profile.fullName || profile.email}`,
      is_internal: true,
    });

    revalidatePath("/admin/leads");
    revalidatePath("/admin/my-leads");

    return { success: true, data: { id: newLead.id } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to create lead";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function updateLeadAction(
  leadId: string,
  rawInput: LeadFormInput
): Promise<ApiResponse<{ id: string }>> {
  try {
    const profile = await requireCounsellor();
    const parsed = leadFormSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Invalid update data",
        },
      };
    }

    const data = parsed.data;
    const supabase = await createClient();

    const normalizedPhone = data.phone.replace(/[^\d+]/g, "").trim();
    const normalizedEmail = data.email.toLowerCase().trim();

    const { error: updateError } = await supabase
      .from("leads")
      .update({
        full_name: data.fullName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        interested_college_id: data.interestedCollegeId || null,
        interested_course_id: data.interestedCourseId || null,
        preferred_location: data.preferredLocation || null,
        current_qualification: data.currentQualification || null,
        passing_year: data.passingYear || null,
        enquiry_message: data.enquiryMessage || null,
        source: data.source,
        status: data.status,
        priority: data.priority,
        status_reason: data.statusReason || null,
        lost_reason: data.lostReason || null,
      })
      .eq("id", leadId);

    if (updateError) {
      return { success: false, error: { code: "UPDATE_FAILED", message: updateError.message } };
    }

    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      actor_id: profile.id,
      activity_type: "lead_updated",
      description: `Lead core profile updated by ${profile.fullName || profile.email}`,
      is_internal: true,
    });

    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/leads");
    revalidatePath("/admin/my-leads");

    return { success: true, data: { id: leadId } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to update lead";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 6. STATUS, PRIORITY & ASSIGNMENT WORKFLOWS
// ==============================================================================

export async function updateLeadStatusAction(
  rawInput: LeadStatusUpdateInput
): Promise<ApiResponse<{ id: string; status: LeadStatus }>> {
  try {
    const profile = await requireCounsellor();
    const parsed = leadStatusUpdateSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Invalid status transition",
        },
      };
    }

    const { leadId, status, reason } = parsed.data;
    const supabase = await createClient();

    // Fetch existing status
    const { data: currentLead } = await supabase
      .from("leads")
      .select("status, full_name, assigned_counsellor_id")
      .eq("id", leadId)
      .single();

    if (!currentLead) {
      return { success: false, error: { code: "NOT_FOUND", message: "Lead not found" } };
    }

    const oldStatus = currentLead.status;
    const isClosed = status === "admitted" || status === "not_interested" || status === "lost";

    const { error: updateError } = await supabase
      .from("leads")
      .update({
        status,
        status_reason: reason || null,
        lost_reason: status === "lost" || status === "not_interested" ? reason : null,
        closed_at: isClosed ? new Date().toISOString() : null,
      })
      .eq("id", leadId);

    if (updateError) {
      return { success: false, error: { code: "UPDATE_FAILED", message: updateError.message } };
    }

    // Record Status Change Activity
    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      actor_id: profile.id,
      activity_type: "status_changed",
      old_status: oldStatus,
      new_status: status,
      description: `Status changed from ${oldStatus} to ${status}${reason ? `. Reason: "${reason}"` : ""}`,
      is_internal: true,
    });

    // Notify Counsellor/Admins on conversion
    if (status === "admitted") {
      if (currentLead.assigned_counsellor_id) {
        await createCrmNotification({
          recipientId: currentLead.assigned_counsellor_id,
          title: "🎉 Lead Admitted!",
          message: `Great news! Student ${currentLead.full_name} has officially been marked as Admitted.`,
          notificationType: "lead_converted",
          relatedEntityType: "leads",
          relatedEntityId: leadId,
        });
      }
    }

    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/leads");
    revalidatePath("/admin/my-leads");

    return { success: true, data: { id: leadId, status } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to update lead status";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function updateLeadPriorityAction(
  rawInput: LeadPriorityUpdateInput
): Promise<ApiResponse<{ id: string; priority: LeadPriority }>> {
  try {
    const profile = await requireCounsellor();
    const parsed = leadPriorityUpdateSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid priority level" },
      };
    }

    const { leadId, priority } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("leads")
      .update({ priority })
      .eq("id", leadId);

    if (error) {
      return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
    }

    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      actor_id: profile.id,
      activity_type: "priority_changed",
      description: `Lead priority set to ${priority.toUpperCase()}`,
      is_internal: true,
    });

    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/leads");

    return { success: true, data: { id: leadId, priority } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to update priority";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function assignLeadAction(
  rawInput: LeadAssignmentInput
): Promise<ApiResponse<{ id: string; counsellorId: string | null }>> {
  try {
    const admin = await requireAdmin();
    const parsed = leadAssignmentSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid assignment request" },
      };
    }

    const { leadId, counsellorId, notes } = parsed.data;
    const supabase = await createClient();

    // 1. Mark existing active assignments as reassigned
    await supabase
      .from("lead_assignments")
      .update({
        assignment_status: "reassigned",
        unassigned_at: new Date().toISOString(),
      })
      .eq("lead_id", leadId)
      .eq("assignment_status", "active");

    // 2. If new counsellor is chosen, create active assignment
    if (counsellorId) {
      await supabase.from("lead_assignments").insert({
        lead_id: leadId,
        counsellor_id: counsellorId,
        assigned_by: admin.id,
        assignment_status: "active",
      });
    }

    // 3. Update Lead Record
    const { error: leadUpdateError } = await supabase
      .from("leads")
      .update({ assigned_counsellor_id: counsellorId || null })
      .eq("id", leadId);

    if (leadUpdateError) {
      return { success: false, error: { code: "UPDATE_FAILED", message: leadUpdateError.message } };
    }

    // 4. Fetch Counsellor Name for Activity Log
    let counsellorName = "Unassigned";
    if (counsellorId) {
      const { data: cProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", counsellorId)
        .single();
      if (cProfile?.full_name) counsellorName = cProfile.full_name;
    }

    // 5. Activity Log
    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      actor_id: admin.id,
      activity_type: counsellorId ? "lead_assigned" : "lead_unassigned",
      description: counsellorId
        ? `Lead assigned to ${counsellorName} by ${admin.fullName || admin.email}${notes ? `. Notes: "${notes}"` : ""}`
        : `Lead marked unassigned by ${admin.fullName || admin.email}`,
      is_internal: true,
    });

    // 6. Notify Counsellor
    if (counsellorId) {
      await createCrmNotification({
        recipientId: counsellorId,
        title: "Lead Assigned to You",
        message: `Admin assigned a student lead to your portfolio.${notes ? ` Note: "${notes}"` : ""}`,
        notificationType: "lead_assigned",
        relatedEntityType: "leads",
        relatedEntityId: leadId,
      });
    }

    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/leads");
    revalidatePath("/admin/my-leads");

    return { success: true, data: { id: leadId, counsellorId: counsellorId || null } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to assign lead";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 7. INTERNAL NOTES & INTERACTIONS
// ==============================================================================

export async function addLeadNoteAction(
  rawInput: InternalNoteInput
): Promise<ApiResponse<{ id: string }>> {
  try {
    const profile = await requireCounsellor();
    const parsed = internalNoteSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid note" },
      };
    }

    const { leadId, note } = parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("lead_activities")
      .insert({
        lead_id: leadId,
        actor_id: profile.id,
        activity_type: "internal_note",
        description: note.trim(),
        is_internal: true,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: { code: "INSERT_FAILED", message: error?.message || "Failed to add note" } };
    }

    revalidatePath(`/admin/leads/${leadId}`);
    return { success: true, data: { id: data.id } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to add note";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function recordLeadInteractionAction(
  rawInput: InteractionRecordInput
): Promise<ApiResponse<{ id: string }>> {
  try {
    const profile = await requireCounsellor();
    const parsed = interactionRecordSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid interaction" },
      };
    }

    const { leadId, interactionType, outcome, durationMinutes } = parsed.data;
    const supabase = await createClient();

    const formattedType = interactionType.replace("_", " ").toUpperCase();
    const durationMsg = durationMinutes ? ` (${durationMinutes} min)` : "";

    const { data, error } = await supabase
      .from("lead_activities")
      .insert({
        lead_id: leadId,
        actor_id: profile.id,
        activity_type: interactionType,
        description: `[${formattedType}${durationMsg}] ${outcome.trim()}`,
        metadata: { durationMinutes: durationMinutes || null, loggedBy: profile.fullName || profile.email },
        is_internal: true,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: { code: "INSERT_FAILED", message: error?.message || "Failed to log interaction" } };
    }

    revalidatePath(`/admin/leads/${leadId}`);
    return { success: true, data: { id: data.id } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to record interaction";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 8. FOLLOW-UP MANAGEMENT
// ==============================================================================

export async function createFollowUpAction(
  rawInput: FollowUpInput
): Promise<ApiResponse<{ id: string }>> {
  try {
    const profile = await requireCounsellor();
    const parsed = followUpSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid follow-up details" },
      };
    }

    const data = parsed.data;
    const supabase = await createClient();

    const counsellorId = data.counsellorId || profile.id;

    const { data: newFollowUp, error: insertError } = await supabase
      .from("follow_ups")
      .insert({
        lead_id: data.leadId,
        counsellor_id: counsellorId,
        scheduled_at: data.scheduledAt,
        follow_up_type: data.followUpType,
        title: data.title || null,
        notes: data.notes || null,
        priority: data.priority,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !newFollowUp) {
      return { success: false, error: { code: "INSERT_FAILED", message: insertError?.message || "Failed to schedule follow-up" } };
    }

    // Activity Log
    const formattedType = data.followUpType.replace("_", " ");
    const formattedDate = new Date(data.scheduledAt).toLocaleString();
    await supabase.from("lead_activities").insert({
      lead_id: data.leadId,
      actor_id: profile.id,
      activity_type: "follow_up_scheduled",
      description: `Follow-up scheduled (${formattedType}) for ${formattedDate}${data.notes ? `: "${data.notes}"` : ""}`,
      is_internal: true,
    });

    // Notify counsellor if assigned by another staff member
    if (counsellorId !== profile.id) {
      await createCrmNotification({
        recipientId: counsellorId,
        title: "Follow-up Scheduled",
        message: `${profile.fullName || "Staff"} scheduled a follow-up for you on ${formattedDate}.`,
        notificationType: "follow_up_assigned",
        relatedEntityType: "follow_ups",
        relatedEntityId: newFollowUp.id,
      });
    }

    revalidatePath(`/admin/leads/${data.leadId}`);
    revalidatePath("/admin/follow-ups");
    revalidatePath("/admin/my-leads");

    return { success: true, data: { id: newFollowUp.id } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to create follow-up";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function completeFollowUpAction(
  rawInput: FollowUpCompletionInput
): Promise<ApiResponse<{ id: string }>> {
  try {
    const profile = await requireCounsellor();
    const parsed = followUpCompletionSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid completion notes" },
      };
    }

    const { followUpId, completionNotes } = parsed.data;
    const supabase = await createClient();

    const { data: followUp, error: fetchError } = await supabase
      .from("follow_ups")
      .select("lead_id, follow_up_type")
      .eq("id", followUpId)
      .single();

    if (fetchError || !followUp) {
      return { success: false, error: { code: "NOT_FOUND", message: "Follow-up not found" } };
    }

    const { error: updateError } = await supabase
      .from("follow_ups")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        completion_notes: completionNotes.trim(),
      })
      .eq("id", followUpId);

    if (updateError) {
      return { success: false, error: { code: "UPDATE_FAILED", message: updateError.message } };
    }

    await supabase.from("lead_activities").insert({
      lead_id: followUp.lead_id,
      actor_id: profile.id,
      activity_type: "follow_up_completed",
      description: `Follow-up completed: "${completionNotes.trim()}"`,
      is_internal: true,
    });

    revalidatePath(`/admin/leads/${followUp.lead_id}`);
    revalidatePath("/admin/follow-ups");
    revalidatePath("/admin/my-leads");

    return { success: true, data: { id: followUpId } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to complete follow-up";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function rescheduleFollowUpAction(
  rawInput: FollowUpRescheduleInput
): Promise<ApiResponse<{ id: string }>> {
  try {
    const profile = await requireCounsellor();
    const parsed = followUpRescheduleSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid reschedule data" },
      };
    }

    const { followUpId, newScheduledAt, reason } = parsed.data;
    const supabase = await createClient();

    const { data: followUp } = await supabase
      .from("follow_ups")
      .select("lead_id, scheduled_at, notes")
      .eq("id", followUpId)
      .single();

    if (!followUp) {
      return { success: false, error: { code: "NOT_FOUND", message: "Follow-up not found" } };
    }

    const formattedOld = new Date(followUp.scheduled_at).toLocaleString();
    const formattedNew = new Date(newScheduledAt).toLocaleString();

    const { error: updateError } = await supabase
      .from("follow_ups")
      .update({
        scheduled_at: newScheduledAt,
        status: "pending",
        notes: `${followUp.notes || ""} | [Rescheduled from ${formattedOld}${reason ? `: ${reason}` : ""}]`.trim(),
      })
      .eq("id", followUpId);

    if (updateError) {
      return { success: false, error: { code: "UPDATE_FAILED", message: updateError.message } };
    }

    await supabase.from("lead_activities").insert({
      lead_id: followUp.lead_id,
      actor_id: profile.id,
      activity_type: "follow_up_rescheduled",
      description: `Follow-up rescheduled to ${formattedNew}${reason ? `. Reason: "${reason}"` : ""}`,
      is_internal: true,
    });

    revalidatePath(`/admin/leads/${followUp.lead_id}`);
    revalidatePath("/admin/follow-ups");
    revalidatePath("/admin/my-leads");

    return { success: true, data: { id: followUpId } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to reschedule follow-up";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function cancelFollowUpAction(
  followUpId: string,
  reason: string
): Promise<ApiResponse<{ id: string }>> {
  try {
    const profile = await requireCounsellor();
    const supabase = await createClient();

    const { data: followUp } = await supabase
      .from("follow_ups")
      .select("lead_id")
      .eq("id", followUpId)
      .single();

    if (!followUp) {
      return { success: false, error: { code: "NOT_FOUND", message: "Follow-up not found" } };
    }

    const { error } = await supabase
      .from("follow_ups")
      .update({
        status: "cancelled",
        completion_notes: reason || "Cancelled by counsellor",
      })
      .eq("id", followUpId);

    if (error) {
      return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
    }

    await supabase.from("lead_activities").insert({
      lead_id: followUp.lead_id,
      actor_id: profile.id,
      activity_type: "follow_up_cancelled",
      description: `Follow-up cancelled. Reason: "${reason || "No reason given"}"`,
      is_internal: true,
    });

    revalidatePath(`/admin/leads/${followUp.lead_id}`);
    revalidatePath("/admin/follow-ups");
    revalidatePath("/admin/my-leads");

    return { success: true, data: { id: followUpId } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to cancel follow-up";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export interface GetFollowUpsParams {
  tab?: "today" | "upcoming" | "overdue" | "completed" | "all";
  counsellorId?: string;
  leadId?: string;
}

export async function getFollowUpsListingAction(params: GetFollowUpsParams = {}): Promise<
  ApiResponse<any[]>
> {
  try {
    const profile = await requireCounsellor();
    const supabase = await createClient();

    let query = supabase
      .from("follow_ups")
      .select(
        `
        *,
        lead:leads(id, full_name, phone, email, status, priority),
        counsellor:profiles!follow_ups_counsellor_id_fkey(id, full_name, email)
      `
      );

    // Counsellor Scope
    if (profile.role === "counsellor" && !params.counsellorId) {
      query = query.eq("counsellor_id", profile.id);
    } else if (params.counsellorId) {
      query = query.eq("counsellor_id", params.counsellorId);
    }

    if (params.leadId) {
      query = query.eq("lead_id", params.leadId);
    }

    const nowIso = new Date().toISOString();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (params.tab === "today") {
      query = query
        .eq("status", "pending")
        .gte("scheduled_at", todayStart.toISOString())
        .lte("scheduled_at", todayEnd.toISOString())
        .order("scheduled_at", { ascending: true });
    } else if (params.tab === "upcoming") {
      query = query
        .eq("status", "pending")
        .gt("scheduled_at", todayEnd.toISOString())
        .order("scheduled_at", { ascending: true });
    } else if (params.tab === "overdue") {
      query = query
        .eq("status", "pending")
        .lt("scheduled_at", nowIso)
        .order("scheduled_at", { ascending: true });
    } else if (params.tab === "completed") {
      query = query.eq("status", "completed").order("completed_at", { ascending: false });
    } else {
      query = query.order("scheduled_at", { ascending: false });
    }

    const { data, error } = await query.limit(100);

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    return { success: true, data: data || [] };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch follow-ups";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 9. COUNSELLOR WORKLOAD & PERFORMANCE
// ==============================================================================

export interface CounsellorPerformanceItem {
  counsellorId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  accountStatus: string;
  totalAssignedLeads: number;
  activeLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  completedFollowUps: number;
  overdueFollowUps: number;
}

export async function getCounsellorPerformanceAction(): Promise<
  ApiResponse<CounsellorPerformanceItem[]>
> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    // 1. Fetch all Counsellors
    const { data: counsellors, error: cError } = await supabase
      .from("user_roles")
      .select("user_id, profiles:user_id(id, full_name, email, avatar_url, account_status)")
      .eq("role", "counsellor");

    if (cError) {
      return { success: false, error: { code: "QUERY_FAILED", message: cError.message } };
    }

    const eligible = (counsellors || []).map((c) => (c.profiles as any)).filter(Boolean);

    // 2. Aggregate statistics across operational tables
    const performanceList: CounsellorPerformanceItem[] = [];
    const nowIso = new Date().toISOString();

    for (const c of eligible) {
      const [leadsRes, fuCompletedRes, fuOverdueRes] = await Promise.all([
        supabase
          .from("leads")
          .select("status")
          .eq("assigned_counsellor_id", c.id)
          .is("deleted_at", null),
        supabase
          .from("follow_ups")
          .select("*", { count: "exact", head: true })
          .eq("counsellor_id", c.id)
          .eq("status", "completed"),
        supabase
          .from("follow_ups")
          .select("*", { count: "exact", head: true })
          .eq("counsellor_id", c.id)
          .eq("status", "pending")
          .lt("scheduled_at", nowIso),
      ]);

      const leads = leadsRes.data || [];
      const total = leads.length;
      const active = leads.filter((l) =>
        ["new", "contacted", "interested", "counselling_scheduled", "application_started"].includes(l.status)
      ).length;
      const contacted = leads.filter((l) => l.status === "contacted").length;
      const interested = leads.filter((l) => l.status === "interested").length;
      const converted = leads.filter((l) => l.status === "admitted").length;
      const lost = leads.filter((l) => ["not_interested", "lost"].includes(l.status)).length;
      const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

      performanceList.push({
        counsellorId: c.id,
        fullName: c.full_name || "Staff Counsellor",
        email: c.email,
        avatarUrl: c.avatar_url,
        accountStatus: c.account_status,
        totalAssignedLeads: total,
        activeLeads: active,
        contactedLeads: contacted,
        interestedLeads: interested,
        convertedLeads: converted,
        lostLeads: lost,
        conversionRate,
        completedFollowUps: fuCompletedRes.count ?? 0,
        overdueFollowUps: fuOverdueRes.count ?? 0,
      });
    }

    // Sort by highest conversion rate / workload
    performanceList.sort((a, b) => b.convertedLeads - a.convertedLeads || b.totalAssignedLeads - a.totalAssignedLeads);

    return { success: true, data: performanceList };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to aggregate counsellor metrics";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 10. STUDENT PROFILE LINKAGE
// ==============================================================================

export async function linkLeadToStudentAction(
  leadId: string,
  studentProfileId: string
): Promise<ApiResponse<{ id: string }>> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("leads")
      .update({ student_user_id: studentProfileId })
      .eq("id", leadId);

    if (error) {
      return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
    }

    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      actor_id: admin.id,
      activity_type: "student_linked",
      description: `Lead linked to registered student account ID: ${studentProfileId}`,
      is_internal: true,
    });

    revalidatePath(`/admin/leads/${leadId}`);
    return { success: true, data: { id: leadId } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to link student";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 11. AUDITED SERVER-SIDE CSV EXPORT
// ==============================================================================

export async function exportLeadsCsvAction(): Promise<
  ApiResponse<{ csvContent: string; filename: string }>
> {
  try {
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { data: leads, error } = await supabase
      .from("leads")
      .select(
        `
        full_name,
        email,
        phone,
        status,
        priority,
        source,
        preferred_location,
        current_qualification,
        passing_year,
        created_at,
        counsellor:profiles!leads_assigned_counsellor_id_fkey(full_name),
        college:colleges(name)
      `
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    const headers = [
      "Student Name",
      "Email",
      "Phone",
      "Status",
      "Priority",
      "Source",
      "Location",
      "Qualification",
      "Passing Year",
      "Assigned Counsellor",
      "Interested College",
      "Received Date",
    ];

    const rows = (leads || []).map((l: any) => [
      `"${(l.full_name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${l.status || ""}"`,
      `"${l.priority || ""}"`,
      `"${l.source || ""}"`,
      `"${(l.preferred_location || "").replace(/"/g, '""')}"`,
      `"${(l.current_qualification || "").replace(/"/g, '""')}"`,
      `"${l.passing_year || ""}"`,
      `"${(l.counsellor?.full_name || "Unassigned").replace(/"/g, '""')}"`,
      `"${(l.college?.name || "").replace(/"/g, '""')}"`,
      `"${new Date(l.created_at).toLocaleDateString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const filename = `aspirant_leads_${new Date().toISOString().split("T")[0]}.csv`;

    // Audit log record
    await supabase.from("audit_logs").insert({
      actor_id: admin.id,
      action: "LEADS_EXPORTED_CSV",
      entity_type: "leads",
      entity_id: admin.id,
      new_values: { count: rows.length, filename },
    });

    return { success: true, data: { csvContent, filename } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to export CSV";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}
