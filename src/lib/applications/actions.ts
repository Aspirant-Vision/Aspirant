"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, getCurrentProfile } from "@/lib/auth/session";
import {
  applicationDraftSchema,
  ApplicationDraftInput,
  applicationSubmitSchema,
  ApplicationSubmitInput,
  documentUploadSchema,
  DocumentUploadInput,
  applicationReviewActionSchema,
  ApplicationReviewActionInput,
  documentVerificationSchema,
  DocumentVerificationInput,
  admissionConfirmSchema,
  AdmissionConfirmInput,
} from "@/lib/validation/application";
import { ApiResponse } from "@/types/api.types";
import { Database, ApplicationStatus, AdmissionOutcome } from "@/types/database.types";
import { NotificationService } from "@/lib/notifications/service";
import crypto from "crypto";

export type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];
export type ApplicationDocumentRow = Database["public"]["Tables"]["application_documents"]["Row"];
export type AdmissionRow = Database["public"]["Tables"]["admissions"]["Row"];

// ==============================================================================
// 1. COLLISION-SAFE IDENTIFIER GENERATORS
// ==============================================================================

export async function generateApplicationNumber(): Promise<string> {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  let candidate = "";
  let exists = true;

  while (exists) {
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    candidate = `AV-APP-${year}-${randomHex}`;

    const { data } = await supabase
      .from("applications")
      .select("id")
      .eq("application_number", candidate)
      .maybeSingle();

    if (!data) {
      exists = false;
    }
  }

  return candidate;
}

export async function generateAdmissionReference(): Promise<string> {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  let candidate = "";
  let exists = true;

  while (exists) {
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    candidate = `AV-ADM-${year}-${randomHex}`;

    const { data } = await supabase
      .from("admissions")
      .select("id")
      .eq("admission_reference", candidate)
      .maybeSingle();

    if (!data) {
      exists = false;
    }
  }

  return candidate;
}

// ==============================================================================
// 2. STUDENT APPLICATION WORKFLOW (Create, Save Draft, Submit)
// ==============================================================================

/**
 * Initializes or resumes an application draft for a college course.
 */
export async function startApplicationDraftAction(
  collegeId: string,
  collegeCourseId: string
): Promise<ApiResponse<{ applicationId: string; isNew: boolean }>> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    // Check if an existing draft exists for this student and college course
    const { data: existingDraft } = await supabase
      .from("applications")
      .select("id")
      .eq("student_id", user.id)
      .eq("college_id", collegeId)
      .eq("college_course_id", collegeCourseId)
      .eq("application_status", "draft")
      .maybeSingle();

    if (existingDraft) {
      return { success: true, data: { applicationId: existingDraft.id, isNew: false } };
    }

    // Pre-populate personal and academic details from student profile
    const [profileRes, academicsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("student_academics").select("*").eq("student_id", user.id).maybeSingle(),
    ]);

    const profile = profileRes.data;
    const academics = academicsRes.data;

    const initialPersonalDetails = {
      fullName: profile?.full_name || "",
      email: profile?.email || user.email || "",
      phone: profile?.phone || "",
      alternatePhone: (profile as any)?.alternate_phone || "",
      dateOfBirth: (profile as any)?.date_of_birth || "",
      gender: (profile as any)?.gender || "male",
      city: profile?.city || "",
      state: profile?.state || "",
      country: (profile as any)?.country || "India",
      pinCode: (profile as any)?.pin_code || "",
    };

    const initialAcademicDetails = academics
      ? {
          highestQualification: academics.highest_qualification || academics.education_level || "",
          institutionName: academics.institution_name || "",
          boardOrUniversity: academics.board_or_university || "",
          passingYear: academics.passing_year || new Date().getFullYear(),
          percentageOrCgpa: academics.percentage_or_cgpa ? Number(academics.percentage_or_cgpa) : 0,
          stream: academics.stream || "",
          entranceExamName: academics.entrance_exam_name || "",
          entranceExamScore: academics.entrance_exam_score || "",
        }
      : {};

    const appNumber = await generateApplicationNumber();

    const { data: newApp, error } = await supabase
      .from("applications")
      .insert({
        application_number: appNumber,
        student_id: user.id,
        college_id: collegeId,
        college_course_id: collegeCourseId,
        application_status: "draft",
        personal_details: initialPersonalDetails,
        academic_details: initialAcademicDetails,
        additional_info: {},
        academic_year: "2026-27",
      })
      .select("id")
      .single();

    if (error || !newApp) {
      return {
        success: false,
        error: { code: "DRAFT_CREATE_FAILED", message: error?.message || "Failed to create draft" },
      };
    }

    revalidatePath("/student/applications");
    return { success: true, data: { applicationId: newApp.id, isNew: true } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to start application";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

/**
 * Updates application draft information.
 */
export async function updateApplicationDraftAction(
  input: ApplicationDraftInput
): Promise<ApiResponse<{ applicationId: string }>> {
  try {
    const user = await requireAuth("/login");
    const parsed = applicationDraftSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid draft data" },
      };
    }

    const { applicationId, personalDetails, academicDetails, additionalInfo, collegeId, collegeCourseId } =
      parsed.data;
    const supabase = await createClient();

    // Verify ownership and draft status
    const { data: existingApp, error: fetchError } = await supabase
      .from("applications")
      .select("id, student_id, application_status, personal_details, academic_details, additional_info")
      .eq("id", applicationId)
      .single();

    if (fetchError || !existingApp) {
      return { success: false, error: { code: "NOT_FOUND", message: "Application not found" } };
    }

    if (existingApp.student_id !== user.id) {
      return { success: false, error: { code: "FORBIDDEN", message: "Unauthorized access" } };
    }

    if (existingApp.application_status !== "draft" && existingApp.application_status !== "documents_required") {
      return {
        success: false,
        error: { code: "INVALID_STATE", message: "Cannot edit an application already in review or submitted" },
      };
    }

    const updatePayload: Database["public"]["Tables"]["applications"]["Update"] = {
      updated_at: new Date().toISOString(),
    };

    if (collegeId) updatePayload.college_id = collegeId;
    if (collegeCourseId) updatePayload.college_course_id = collegeCourseId;
    if (personalDetails) {
      updatePayload.personal_details = {
        ...(existingApp.personal_details as any),
        ...personalDetails,
      };
    }
    if (academicDetails) {
      updatePayload.academic_details = {
        ...(existingApp.academic_details as any),
        ...academicDetails,
      };
    }
    if (additionalInfo) {
      updatePayload.additional_info = {
        ...(existingApp.additional_info as any),
        ...additionalInfo,
      };
    }

    const { error: updateError } = await supabase
      .from("applications")
      .update(updatePayload)
      .eq("id", applicationId);

    if (updateError) {
      return { success: false, error: { code: "UPDATE_FAILED", message: updateError.message } };
    }

    revalidatePath(`/student/applications/${applicationId}`);
    revalidatePath("/student/applications");
    return { success: true, data: { applicationId } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to update draft";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

/**
 * Validates complete application and transitions status from 'draft' to 'submitted'.
 */
export async function submitApplicationAction(
  input: ApplicationSubmitInput
): Promise<ApiResponse<{ applicationId: string; applicationNumber: string }>> {
  try {
    const user = await requireAuth("/login");
    const parsed = applicationSubmitSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Validation failed" },
      };
    }

    const { applicationId, personalDetails, academicDetails, additionalInfo } = parsed.data;
    const supabase = await createClient();

    // Verify ownership and draft status
    const { data: existingApp, error: fetchError } = await supabase
      .from("applications")
      .select("id, student_id, application_status, application_number, college_id")
      .eq("id", applicationId)
      .single();

    if (fetchError || !existingApp) {
      return { success: false, error: { code: "NOT_FOUND", message: "Application not found" } };
    }

    if (existingApp.student_id !== user.id) {
      return { success: false, error: { code: "FORBIDDEN", message: "Unauthorized access" } };
    }

    if (existingApp.application_status !== "draft") {
      return {
        success: false,
        error: { code: "ALREADY_SUBMITTED", message: "Application has already been submitted" },
      };
    }

    const now = new Date().toISOString();

    const { error: submitError } = await supabase
      .from("applications")
      .update({
        application_status: "submitted",
        personal_details: personalDetails,
        academic_details: academicDetails,
        additional_info: additionalInfo || {},
        submitted_at: now,
        updated_at: now,
      })
      .eq("id", applicationId);

    if (submitError) {
      return { success: false, error: { code: "SUBMIT_FAILED", message: submitError.message } };
    }

    // 1. Audit Log Entry
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "application_submitted",
      entity_type: "applications",
      entity_id: applicationId,
      new_values: {
        application_number: existingApp.application_number,
        submitted_at: now,
      },
    });

    // 2. Student Notification via Central Notification Service
    await NotificationService.sendNotification({
      recipientId: user.id,
      title: "Application Submitted Successfully",
      message: `Your application ${existingApp.application_number} has been submitted and entered the admission verification queue.`,
      category: "application",
      notificationType: "application_submitted",
      relatedEntityType: "applications",
      relatedEntityId: applicationId,
      destinationUrl: `/student/applications/${applicationId}`,
    });

    revalidatePath(`/student/applications/${applicationId}`);
    revalidatePath("/student/applications");
    revalidatePath("/admin/applications");
    return {
      success: true,
      data: { applicationId, applicationNumber: existingApp.application_number },
    };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to submit application";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 3. APPLICATION DOCUMENT MANAGEMENT
// ==============================================================================

/**
 * Registers an uploaded document record in application_documents.
 */
export async function uploadApplicationDocumentAction(
  input: DocumentUploadInput
): Promise<ApiResponse<{ documentId: string }>> {
  try {
    const user = await requireAuth("/login");
    const parsed = documentUploadSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid document data" },
      };
    }

    const { applicationId, documentType, storagePath, originalFilename, fileSizeBytes, mimeType } = parsed.data;
    const supabase = await createClient();

    // Verify application ownership
    const { data: app, error: appError } = await supabase
      .from("applications")
      .select("id, student_id, application_status")
      .eq("id", applicationId)
      .single();

    if (appError || !app) {
      return { success: false, error: { code: "NOT_FOUND", message: "Application not found" } };
    }

    if (app.student_id !== user.id) {
      return { success: false, error: { code: "FORBIDDEN", message: "Unauthorized access" } };
    }

    // Check if an existing document for this type already exists in this application
    const { data: existingDoc } = await supabase
      .from("application_documents")
      .select("id")
      .eq("application_id", applicationId)
      .eq("document_type", documentType)
      .maybeSingle();

    let docId = "";

    if (existingDoc) {
      // Update existing document (Replacement)
      const { data: updated, error: updateError } = await supabase
        .from("application_documents")
        .update({
          storage_path: storagePath,
          original_filename: originalFilename,
          file_size_bytes: fileSizeBytes,
          mime_type: mimeType,
          verification_status: "pending",
          rejection_reason: null,
          uploaded_at: new Date().toISOString(),
        })
        .eq("id", existingDoc.id)
        .select("id")
        .single();

      if (updateError || !updated) {
        return { success: false, error: { code: "UPDATE_FAILED", message: updateError?.message || "Failed to update document" } };
      }
      docId = updated.id;
    } else {
      // Insert new document
      const { data: newDoc, error: insertError } = await supabase
        .from("application_documents")
        .insert({
          application_id: applicationId,
          document_type: documentType,
          storage_path: storagePath,
          original_filename: originalFilename,
          file_size_bytes: fileSizeBytes,
          mime_type: mimeType,
          verification_status: "pending",
        })
        .select("id")
        .single();

      if (insertError || !newDoc) {
        return { success: false, error: { code: "INSERT_FAILED", message: insertError?.message || "Failed to record document" } };
      }
      docId = newDoc.id;
    }

    revalidatePath(`/student/applications/${applicationId}/documents`);
    revalidatePath(`/student/applications/${applicationId}`);
    return { success: true, data: { documentId: docId } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to upload document";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

/**
 * Removes a document record and deletes the underlying storage file.
 */
export async function deleteApplicationDocumentDraftAction(
  documentId: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    const { data: doc, error: docError } = await supabase
      .from("application_documents")
      .select("id, storage_path, application:applications(id, student_id, application_status)")
      .eq("id", documentId)
      .single();

    if (docError || !doc) {
      return { success: false, error: { code: "NOT_FOUND", message: "Document not found" } };
    }

    const app = doc.application as any;
    if (app.student_id !== user.id) {
      return { success: false, error: { code: "FORBIDDEN", message: "Unauthorized access" } };
    }

    // Delete from Supabase Storage
    await supabase.storage.from("application-documents").remove([doc.storage_path]);

    // Delete database record
    await supabase.from("application_documents").delete().eq("id", documentId);

    revalidatePath(`/student/applications/${app.id}/documents`);
    revalidatePath(`/student/applications/${app.id}`);
    return { success: true, data: { deleted: true } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to delete document";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

/**
 * Generates a short-lived signed URL (5 minutes) for safe private document viewing.
 */
export async function getSignedDocumentUrlAction(
  storagePath: string
): Promise<ApiResponse<{ signedUrl: string }>> {
  try {
    await requireAuth("/login");
    const supabase = await createClient();

    // 300 seconds = 5 minutes expiry
    const { data, error } = await supabase.storage
      .from("application-documents")
      .createSignedUrl(storagePath, 300);

    if (error || !data) {
      return {
        success: false,
        error: { code: "SIGNED_URL_FAILED", message: error?.message || "Failed to generate preview URL" },
      };
    }

    return { success: true, data: { signedUrl: data.signedUrl } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to access document";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 4. STUDENT APPLICATION RETRIEVAL
// ==============================================================================

export async function getStudentApplicationsAction(): Promise<ApiResponse<any[]>> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        id,
        application_number,
        application_status,
        submitted_at,
        reviewed_at,
        created_at,
        updated_at,
        decision_reason,
        college:colleges(id, name, slug, logo_url, city, state, college_type),
        college_course:college_courses(
          id,
          course_name_override,
          course:courses(id, name, slug, stream, degree_type, duration_years)
        ),
        documents:application_documents(id, document_type, verification_status)
      `
      )
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    return { success: true, data: data || [] };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch student applications";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function getStudentApplicationDetailAction(
  applicationId: string
): Promise<ApiResponse<any>> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        *,
        college:colleges(id, name, slug, logo_url, city, state, college_type, website),
        college_course:college_courses(
          id,
          course_name_override,
          course:courses(id, name, slug, stream, degree_type, duration_years, eligibility_criteria)
        ),
        counsellor:profiles!applications_assigned_counsellor_id_fkey(id, full_name, email, phone),
        documents:application_documents(
          id,
          document_type,
          original_filename,
          storage_path,
          verification_status,
          rejection_reason,
          file_size_bytes,
          mime_type,
          uploaded_at,
          verified_at
        )
      `
      )
      .eq("id", applicationId)
      .eq("student_id", user.id)
      .single();

    if (error || !data) {
      return { success: false, error: { code: "NOT_FOUND", message: "Application not found" } };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch application detail";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 5. ADMIN & COUNSELLOR APPLICATION MANAGEMENT
// ==============================================================================

export interface AdminApplicationsParams {
  status?: ApplicationStatus | "all";
  collegeId?: string;
  counsellorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getAdminApplicationsAction(
  params: AdminApplicationsParams = {}
): Promise<
  ApiResponse<{
    applications: any[];
    totalCount: number;
    statusCounts: Record<string, number>;
  }>
> {
  try {
    await requireAuth("/admin/login");
    const supabase = await createClient();

    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from("applications").select(
      `
        id,
        application_number,
        application_status,
        submitted_at,
        reviewed_at,
        created_at,
        updated_at,
        decision_reason,
        student:profiles!applications_student_id_fkey(id, full_name, email, phone),
        college:colleges(id, name, slug, logo_url, city, state),
        college_course:college_courses(
          id,
          course_name_override,
          course:courses(id, name, slug, stream, degree_type)
        ),
        counsellor:profiles!applications_assigned_counsellor_id_fkey(id, full_name, email),
        documents:application_documents(id, document_type, verification_status)
      `,
      { count: "exact" }
    );

    if (params.status && params.status !== "all") {
      query = query.eq("application_status", params.status);
    }
    if (params.collegeId) {
      query = query.eq("college_id", params.collegeId);
    }
    if (params.counsellorId) {
      query = query.eq("assigned_counsellor_id", params.counsellorId);
    }
    if (params.search && params.search.trim()) {
      const term = params.search.trim();
      query = query.or(`application_number.ilike.%${term}%`);
    }

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    // Fetch Status breakdown counts for metrics
    const { data: allStatuses } = await supabase
      .from("applications")
      .select("application_status");

    const statusCounts: Record<string, number> = {
      total: allStatuses?.length || 0,
      draft: 0,
      submitted: 0,
      under_review: 0,
      documents_required: 0,
      verified: 0,
      forwarded: 0,
      accepted: 0,
      rejected: 0,
      waitlisted: 0,
      withdrawn: 0,
    };

    allStatuses?.forEach((row) => {
      if (statusCounts[row.application_status] !== undefined) {
        statusCounts[row.application_status]++;
      }
    });

    return {
      success: true,
      data: {
        applications: data || [],
        totalCount: count || 0,
        statusCounts,
      },
    };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch applications";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function getAdminApplicationDetailAction(
  applicationId: string
): Promise<ApiResponse<any>> {
  try {
    await requireAuth("/admin/login");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        *,
        student:profiles!applications_student_id_fkey(
          id,
          full_name,
          email,
          phone,
          city,
          state,
          country,
          avatar_url
        ),
        college:colleges(id, name, slug, logo_url, city, state, college_type, website),
        college_course:college_courses(
          id,
          course_name_override,
          course:courses(id, name, slug, stream, degree_type, duration_years, eligibility_criteria)
        ),
        counsellor:profiles!applications_assigned_counsellor_id_fkey(id, full_name, email, phone),
        documents:application_documents(
          id,
          document_type,
          original_filename,
          storage_path,
          verification_status,
          rejection_reason,
          file_size_bytes,
          mime_type,
          uploaded_at,
          verified_at,
          verifier:profiles!application_documents_verified_by_fkey(full_name)
        ),
        admission:admissions(id, admission_reference, admission_status, admission_date, academic_year)
      `
      )
      .eq("id", applicationId)
      .single();

    if (error || !data) {
      return { success: false, error: { code: "NOT_FOUND", message: "Application not found" } };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch application detail";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

/**
 * Controlled Application Status Workflow Engine.
 */
export async function reviewApplicationAction(
  applicationId: string,
  input: ApplicationReviewActionInput
): Promise<ApiResponse<{ applicationId: string; newStatus: ApplicationStatus }>> {
  try {
    const user = await requireAuth("/admin/login");
    const parsed = applicationReviewActionSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid review action" },
      };
    }

    const { action, assignedCounsellorId, reviewNotes, decisionReason, forwardedTo } = parsed.data;
    const supabase = await createClient();

    // Fetch existing application
    const { data: app, error: appError } = await supabase
      .from("applications")
      .select("id, application_number, student_id, application_status, college_id")
      .eq("id", applicationId)
      .single();

    if (appError || !app) {
      return { success: false, error: { code: "NOT_FOUND", message: "Application not found" } };
    }

    let targetStatus: ApplicationStatus = app.application_status;
    const now = new Date().toISOString();
    const updatePayload: Database["public"]["Tables"]["applications"]["Update"] = {
      updated_at: now,
    };

    if (reviewNotes !== undefined && reviewNotes !== null) {
      updatePayload.review_notes = reviewNotes;
    }
    if (assignedCounsellorId !== undefined) {
      updatePayload.assigned_counsellor_id = assignedCounsellorId || null;
    }

    switch (action) {
      case "start_review":
        targetStatus = "under_review";
        updatePayload.reviewed_at = now;
        break;
      case "request_documents":
        targetStatus = "documents_required";
        updatePayload.decision_reason = decisionReason || "Additional verification documents required.";
        break;
      case "mark_verified":
        targetStatus = "verified";
        break;
      case "forward":
        targetStatus = "forwarded";
        updatePayload.forwarded_to = forwardedTo || "University Admission Department";
        updatePayload.forwarded_at = now;
        break;
      case "accept":
        targetStatus = "accepted";
        updatePayload.decision_at = now;
        break;
      case "reject":
        targetStatus = "rejected";
        updatePayload.decision_reason = decisionReason || "Application did not meet admission criteria.";
        updatePayload.decision_at = now;
        break;
      case "waitlist":
        targetStatus = "waitlisted";
        updatePayload.decision_reason = decisionReason || "Placed on counselling waiting list.";
        updatePayload.decision_at = now;
        break;
      case "withdraw":
        targetStatus = "withdrawn";
        updatePayload.decision_reason = decisionReason || "Application withdrawn.";
        break;
    }

    updatePayload.application_status = targetStatus;

    const { error: updateError } = await supabase
      .from("applications")
      .update(updatePayload)
      .eq("id", applicationId);

    if (updateError) {
      return { success: false, error: { code: "UPDATE_FAILED", message: updateError.message } };
    }

    // 1. Audit Log Entry
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: `application_status_${targetStatus}`,
      entity_type: "applications",
      entity_id: applicationId,
      old_values: { status: app.application_status },
      new_values: { status: targetStatus, action, notes: reviewNotes },
    });

    // 2. Student In-App Notification
    const notificationTitles: Record<ApplicationStatus, string> = {
      draft: "Application Draft Saved",
      submitted: "Application Submitted",
      under_review: "Application Under Review",
      documents_required: "Action Required: Documents Needed",
      verified: "Documents Verified Successfully",
      forwarded: "Application Forwarded to University",
      accepted: "Congratulations! Application Accepted",
      rejected: "Application Status Update",
      waitlisted: "Application Placed on Waiting List",
      withdrawn: "Application Withdrawn",
    };

    const notificationBodies: Record<ApplicationStatus, string> = {
      draft: "Your draft has been saved.",
      submitted: `Your application ${app.application_number} is submitted.`,
      under_review: `Our admissions team has started reviewing application ${app.application_number}.`,
      documents_required: `Please upload the requested replacement documents: ${decisionReason || "Check your portal."}`,
      verified: `All required documents for application ${app.application_number} have been verified.`,
      forwarded: `Your dossier has been forwarded to ${forwardedTo || "the institution"} for final seat allocation.`,
      accepted: `Great news! Your application ${app.application_number} has been officially approved for admission!`,
      rejected: `Your application ${app.application_number} has been reviewed: ${decisionReason || "Did not meet criteria."}`,
      waitlisted: `Application ${app.application_number} is on the waiting list. We will notify you of seat openings.`,
      withdrawn: `Application ${app.application_number} has been withdrawn.`,
    };

    await NotificationService.sendNotification({
      recipientId: app.student_id,
      title: notificationTitles[targetStatus],
      message: notificationBodies[targetStatus],
      category: "application",
      notificationType: `application_${targetStatus}`,
      relatedEntityType: "applications",
      relatedEntityId: applicationId,
      destinationUrl: `/student/applications/${applicationId}`,
    });

    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath(`/admin/applications/${applicationId}/review`);
    revalidatePath("/admin/applications");
    revalidatePath(`/student/applications/${applicationId}`);
    return { success: true, data: { applicationId, newStatus: targetStatus } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to review application";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

/**
 * Verifies or rejects an uploaded document with staff remarks.
 */
export async function verifyApplicationDocumentAction(
  input: DocumentVerificationInput
): Promise<ApiResponse<{ documentId: string }>> {
  try {
    const user = await requireAuth("/admin/login");
    const parsed = documentVerificationSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid input" },
      };
    }

    const { documentId, verificationStatus, rejectionReason } = parsed.data;
    const supabase = await createClient();

    const { data: doc, error: fetchError } = await supabase
      .from("application_documents")
      .select("id, application_id, document_type, application:applications(id, application_number, student_id)")
      .eq("id", documentId)
      .single();

    if (fetchError || !doc) {
      return { success: false, error: { code: "NOT_FOUND", message: "Document not found" } };
    }

    const { error: updateError } = await supabase
      .from("application_documents")
      .update({
        verification_status: verificationStatus,
        rejection_reason: verificationStatus === "rejected" ? rejectionReason : null,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    if (updateError) {
      return { success: false, error: { code: "UPDATE_FAILED", message: updateError.message } };
    }

    const app = doc.application as any;

    // Student notification via Central Notification Service
    await NotificationService.sendNotification({
      recipientId: app.student_id,
      title: verificationStatus === "verified" ? "Document Verified" : "Document Requires Replacement",
      message:
        verificationStatus === "verified"
          ? `Your ${doc.document_type.replace(/_/g, " ")} has been successfully verified.`
          : `Your ${doc.document_type.replace(/_/g, " ")} was rejected: ${rejectionReason || "Please re-upload a clear copy."}`,
      category: "application",
      notificationType: `document_${verificationStatus}`,
      relatedEntityType: "applications",
      relatedEntityId: app.id,
      destinationUrl: `/student/applications/${app.id}/documents`,
    });

    revalidatePath(`/admin/applications/${app.id}/review`);
    revalidatePath(`/student/applications/${app.id}/documents`);
    return { success: true, data: { documentId } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to verify document";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 6. ADMISSION RECORD CREATION & MANAGEMENT
// ==============================================================================

/**
 * Confirms admission for an accepted application and records it in admissions.
 */
export async function confirmAdmissionAction(
  input: AdmissionConfirmInput
): Promise<ApiResponse<{ admissionId: string; admissionReference: string }>> {
  try {
    const user = await requireAuth("/admin/login");
    const parsed = admissionConfirmSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid admission data" },
      };
    }

    const { applicationId, academicYear, admissionDate, remarks } = parsed.data;
    const supabase = await createClient();

    // Check application and ensure no duplicate admission exists
    const { data: app, error: appError } = await supabase
      .from("applications")
      .select("*, college_courses(course_id)")
      .eq("id", applicationId)
      .single();

    if (appError || !app) {
      return { success: false, error: { code: "NOT_FOUND", message: "Application not found" } };
    }

    const courseId = (app.college_courses as any)?.course_id;
    if (!courseId) {
      return { success: false, error: { code: "INVALID_COURSE", message: "Associated course not found" } };
    }

    // Check if admission already exists for this application
    const { data: existingAdmission } = await supabase
      .from("admissions")
      .select("id, admission_reference")
      .eq("application_id", applicationId)
      .maybeSingle();

    if (existingAdmission) {
      return {
        success: true,
        data: { admissionId: existingAdmission.id, admissionReference: existingAdmission.admission_reference },
      };
    }

    const admReference = await generateAdmissionReference();
    const admDate = admissionDate || new Date().toISOString().split("T")[0];

    // Insert Admission Record
    const { data: newAdmission, error: insertError } = await supabase
      .from("admissions")
      .insert({
        application_id: applicationId,
        student_id: app.student_id,
        college_id: app.college_id,
        course_id: courseId,
        admission_status: "admitted",
        admission_date: admDate,
        academic_year: academicYear,
        admission_reference: admReference,
        admitted_by: user.id,
        remarks: remarks || null,
      })
      .select("id")
      .single();

    if (insertError || !newAdmission) {
      return {
        success: false,
        error: { code: "INSERT_FAILED", message: insertError?.message || "Failed to create admission record" },
      };
    }

    // Update application status to accepted if not already
    await supabase
      .from("applications")
      .update({
        application_status: "accepted",
        decision_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    // Audit Log
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "admission_confirmed",
      entity_type: "admissions",
      entity_id: newAdmission.id,
      new_values: {
        admission_reference: admReference,
        application_id: applicationId,
        student_id: app.student_id,
        academic_year: academicYear,
      },
    });

    // High-Priority Student Notification (Essential Milestone)
    await NotificationService.sendNotification({
      recipientId: app.student_id,
      title: "Admission Confirmed! Official Seat Allotted",
      message: `Your admission has been confirmed under reference ${admReference} for academic session ${academicYear}. Welcome to your college!`,
      category: "application",
      notificationType: "admission_confirmed",
      relatedEntityType: "applications",
      relatedEntityId: applicationId,
      destinationUrl: `/student/applications/${applicationId}`,
      bypassPreferences: true, // Essential milestone notice
    });

    revalidatePath("/admin/admissions");
    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath("/student/applications");
    return {
      success: true,
      data: { admissionId: newAdmission.id, admissionReference: admReference },
    };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to confirm admission";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export interface AdminAdmissionsParams {
  collegeId?: string;
  academicYear?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getAdminAdmissionsAction(
  params: AdminAdmissionsParams = {}
): Promise<
  ApiResponse<{
    admissions: any[];
    totalCount: number;
    collegeCounts: Array<{ collegeName: string; count: number }>;
  }>
> {
  try {
    await requireAuth("/admin/login");
    const supabase = await createClient();

    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from("admissions").select(
      `
        id,
        admission_reference,
        admission_status,
        admission_date,
        academic_year,
        remarks,
        created_at,
        student:profiles!admissions_student_id_fkey(id, full_name, email, phone),
        college:colleges(id, name, slug, logo_url, city, state),
        course:courses(id, name, slug, degree_type, stream),
        application:applications(id, application_number),
        officer:profiles!admissions_admitted_by_fkey(id, full_name)
      `,
      { count: "exact" }
    );

    if (params.collegeId) {
      query = query.eq("college_id", params.collegeId);
    }
    if (params.academicYear) {
      query = query.eq("academic_year", params.academicYear);
    }
    if (params.search && params.search.trim()) {
      const term = params.search.trim();
      query = query.or(`admission_reference.ilike.%${term}%`);
    }

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    // Top admissions by college
    const { data: allAdmissions } = await supabase
      .from("admissions")
      .select("college:colleges(name)");

    const collegeMap: Record<string, number> = {};
    allAdmissions?.forEach((item: any) => {
      const name = item.college?.name || "Unknown Institution";
      collegeMap[name] = (collegeMap[name] || 0) + 1;
    });

    const collegeCounts = Object.entries(collegeMap)
      .map(([collegeName, count]) => ({ collegeName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      success: true,
      data: {
        admissions: data || [],
        totalCount: count || 0,
        collegeCounts,
      },
    };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch admissions";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

/**
 * Returns applications assigned to the authenticated counsellor.
 */
export async function getCounsellorApplicationsAction(
  params: AdminApplicationsParams = {}
): Promise<
  ApiResponse<{
    applications: any[];
    totalCount: number;
    statusCounts: Record<string, number>;
  }>
> {
  try {
    const user = await requireAuth("/admin/login");
    return getAdminApplicationsAction({
      ...params,
      counsellorId: user.id,
    });
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch counsellor applications";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}
