"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, getCurrentProfile } from "@/lib/auth/session";
import {
  studentProfileSchema,
  StudentProfileInput,
  studentAcademicSchema,
  StudentAcademicInput,
  studentPreferencesSchema,
  StudentPreferencesInput,
  studentEnquirySchema,
  StudentEnquiryInput,
} from "@/lib/validation/student";
import { ApiResponse } from "@/types/api.types";
import { Database } from "@/types/database.types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type StudentAcademicsRow = Database["public"]["Tables"]["student_academics"]["Row"];
export type StudentPreferencesRow = Database["public"]["Tables"]["student_preferences"]["Row"];
export type StudentShortlistRow = Database["public"]["Tables"]["student_shortlists"]["Row"];

// ==============================================================================
// 1. STUDENT DASHBOARD METRICS & REAL-TIME AGGREGATION
// ==============================================================================

export interface StudentDashboardData {
  profile: ProfileRow;
  profileCompletionPercentage: number;
  missingProfileFields: string[];
  recommendedSteps: Array<{ title: string; description: string; href: string }>;
  shortlistedCollegesCount: number;
  shortlistedCoursesCount: number;
  activeEnquiriesCount: number;
  applicationsInProgressCount: number;
  unreadNotificationsCount: number;
  recentShortlists: any[];
  recentEnquiries: any[];
  recentApplications: any[];
  recentNotifications: any[];
}

export async function getStudentDashboardDataAction(): Promise<
  ApiResponse<StudentDashboardData>
> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    // Parallel fetch of all student-specific records
    const [
      profileRes,
      academicsRes,
      preferencesRes,
      shortlistedCollegesRes,
      shortlistedCoursesRes,
      enquiriesRes,
      applicationsRes,
      notificationsRes,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("student_academics").select("*").eq("student_id", user.id).maybeSingle(),
      supabase.from("student_preferences").select("*").eq("student_id", user.id).maybeSingle(),
      supabase
        .from("student_shortlists")
        .select("*, college:colleges(id, name, slug, logo_url, city, state, college_type)")
        .eq("student_id", user.id)
        .not("college_id", "is", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("student_shortlists")
        .select("*, course:courses(id, name, slug, duration_years, stream, degree_type)")
        .eq("student_id", user.id)
        .not("course_id", "is", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("leads")
        .select("*, college:colleges(name, slug), course:courses(name, slug)")
        .eq("student_user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("applications")
        .select("*, college:colleges(name, slug), college_course:college_courses(course_name_override)")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (!profileRes.data) {
      return { success: false, error: { code: "NOT_FOUND", message: "Student profile not found" } };
    }

    const profile = profileRes.data;
    const academics = academicsRes.data;
    const preferences = preferencesRes.data;

    // Profile Completion Logic (100% Deterministic)
    let score = 0;
    const missing: string[] = [];

    if (profile.full_name && profile.full_name.trim().length > 2) score += 10;
    else missing.push("Full Name");

    if (profile.phone && profile.phone.trim().length >= 10) score += 10;
    else missing.push("Mobile Phone");

    if (profile.date_of_birth) score += 10;
    else missing.push("Date of Birth");

    if (profile.gender) score += 10;
    else missing.push("Gender");

    if (profile.city && profile.state) score += 10;
    else missing.push("City & State Location");

    if (profile.avatar_url) score += 10;
    else missing.push("Profile Photo");

    if (academics && academics.institution_name && academics.percentage_or_cgpa) score += 20;
    else missing.push("Academic History & Percentage");

    if (preferences && (preferences.preferred_stream || preferences.preferred_course_id)) score += 20;
    else missing.push("Admission Preferences");

    const profileCompletionPercentage = Math.min(100, score);

    // Contextual Recommended Steps
    const recommendedSteps: Array<{ title: string; description: string; href: string }> = [];

    if (missing.includes("Academic History & Percentage")) {
      recommendedSteps.push({
        title: "Add Academic History",
        description: "Submit 10th/12th scores and entrance ranks for tailored college cutoffs.",
        href: "/student/academic-details",
      });
    }

    if (missing.includes("Admission Preferences")) {
      recommendedSteps.push({
        title: "Set Admission Preferences",
        description: "Select your preferred degree stream, state, and tuition budget.",
        href: "/student/preferences",
      });
    }

    if ((shortlistedCollegesRes.data || []).length === 0) {
      recommendedSteps.push({
        title: "Explore & Shortlist Colleges",
        description: "Browse 2,500+ verified partner campuses to build your shortlist.",
        href: "/student/shortlist/colleges",
      });
    }

    if ((enquiriesRes.data || []).length === 0) {
      recommendedSteps.push({
        title: "Request Expert Counselling",
        description: "Connect directly with experienced counsellors for personalized guidance.",
        href: "/student/enquiries",
      });
    }

    // Unread notifications count
    const unreadCount = (notificationsRes.data || []).filter((n) => !n.is_read).length;

    return {
      success: true,
      data: {
        profile,
        profileCompletionPercentage,
        missingProfileFields: missing,
        recommendedSteps,
        shortlistedCollegesCount: (shortlistedCollegesRes.data || []).length,
        shortlistedCoursesCount: (shortlistedCoursesRes.data || []).length,
        activeEnquiriesCount: (enquiriesRes.data || []).length,
        applicationsInProgressCount: (applicationsRes.data || []).length,
        unreadNotificationsCount: unreadCount,
        recentShortlists: (shortlistedCollegesRes.data || []).slice(0, 4),
        recentEnquiries: (enquiriesRes.data || []).slice(0, 4),
        recentApplications: (applicationsRes.data || []).slice(0, 4),
        recentNotifications: notificationsRes.data || [],
      },
    };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to load student dashboard";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 2. PROFILE MANAGEMENT
// ==============================================================================

export async function updateStudentProfileAction(
  input: StudentProfileInput
): Promise<ApiResponse<{ id: string }>> {
  try {
    const user = await requireAuth("/login");
    const parsed = studentProfileSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid profile data" },
      };
    }

    const data = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.fullName.trim(),
        phone: data.phone || null,
        alternate_phone: data.alternatePhone || null,
        date_of_birth: data.dateOfBirth || null,
        gender: data.gender || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || "India",
        pin_code: data.pinCode || null,
        avatar_url: data.avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
    }

    revalidatePath("/student/profile");
    revalidatePath("/student/dashboard");

    return { success: true, data: { id: user.id } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to update profile";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 3. ACADEMIC DETAILS
// ==============================================================================

export async function getStudentAcademicsAction(): Promise<
  ApiResponse<StudentAcademicsRow | null>
> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_academics")
      .select("*")
      .eq("student_id", user.id)
      .maybeSingle();

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch academics";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function updateStudentAcademicsAction(
  input: StudentAcademicInput
): Promise<ApiResponse<{ id: string }>> {
  try {
    const user = await requireAuth("/login");
    const parsed = studentAcademicSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid academic record" },
      };
    }

    const data = parsed.data;
    const supabase = await createClient();

    const { data: saved, error } = await supabase
      .from("student_academics")
      .upsert(
        {
          student_id: user.id,
          education_level: data.educationLevel,
          highest_qualification: data.highestQualification || null,
          institution_name: data.institutionName || null,
          board_or_university: data.boardOrUniversity || null,
          passing_year: data.passingYear || null,
          percentage_or_cgpa: data.percentageOrCgpa || null,
          stream: data.stream || null,
          entrance_exam_name: data.entranceExamName || null,
          entrance_exam_score: data.entranceExamScore || null,
          additional_details: data.additionalDetails || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "student_id" }
      )
      .select("id")
      .single();

    if (error || !saved) {
      return { success: false, error: { code: "UPSERT_FAILED", message: error?.message || "Failed to save academics" } };
    }

    revalidatePath("/student/academic-details");
    revalidatePath("/student/dashboard");

    return { success: true, data: { id: saved.id } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to update academics";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 4. ADMISSION PREFERENCES
// ==============================================================================

export async function getStudentPreferencesAction(): Promise<
  ApiResponse<StudentPreferencesRow | null>
> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("student_preferences")
      .select("*")
      .eq("student_id", user.id)
      .maybeSingle();

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch preferences";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function updateStudentPreferencesAction(
  input: StudentPreferencesInput
): Promise<ApiResponse<{ id: string }>> {
  try {
    const user = await requireAuth("/login");
    const parsed = studentPreferencesSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid preferences" },
      };
    }

    const data = parsed.data;
    const supabase = await createClient();

    const { data: saved, error } = await supabase
      .from("student_preferences")
      .upsert(
        {
          student_id: user.id,
          preferred_study_level: data.preferredStudyLevel || null,
          preferred_stream: data.preferredStream || null,
          preferred_course_id: data.preferredCourseId || null,
          preferred_specialization: data.preferredSpecialization || null,
          preferred_college_type: data.preferredCollegeType || null,
          preferred_study_mode: data.preferredStudyMode || null,
          preferred_state: data.preferredState || null,
          preferred_city: data.preferredCity || null,
          budget_min: data.budgetMin ?? null,
          budget_max: data.budgetMax ?? null,
          preferred_admission_year: data.preferredAdmissionYear || null,
          entrance_exam_preference: data.entranceExamPreference || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "student_id" }
      )
      .select("id")
      .single();

    if (error || !saved) {
      return { success: false, error: { code: "UPSERT_FAILED", message: error?.message || "Failed to save preferences" } };
    }

    revalidatePath("/student/preferences");
    revalidatePath("/student/dashboard");

    return { success: true, data: { id: saved.id } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to update preferences";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 5. SHORTLIST SYSTEM (Colleges & Courses)
// ==============================================================================

export async function toggleCollegeShortlistAction(
  collegeId: string
): Promise<ApiResponse<{ shortlisted: boolean }>> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    // Check if already shortlisted
    const { data: existing } = await supabase
      .from("student_shortlists")
      .select("id")
      .eq("student_id", user.id)
      .eq("college_id", collegeId)
      .maybeSingle();

    if (existing) {
      // Remove from shortlist
      await supabase.from("student_shortlists").delete().eq("id", existing.id);
      revalidatePath("/student/shortlist/colleges");
      revalidatePath("/student/dashboard");
      return { success: true, data: { shortlisted: false } };
    } else {
      // Add to shortlist
      await supabase.from("student_shortlists").insert({
        student_id: user.id,
        college_id: collegeId,
      });
      revalidatePath("/student/shortlist/colleges");
      revalidatePath("/student/dashboard");
      return { success: true, data: { shortlisted: true } };
    }
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to update shortlist";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function toggleCourseShortlistAction(
  courseId: string
): Promise<ApiResponse<{ shortlisted: boolean }>> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    // Check if already shortlisted
    const { data: existing } = await supabase
      .from("student_shortlists")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existing) {
      // Remove from shortlist
      await supabase.from("student_shortlists").delete().eq("id", existing.id);
      revalidatePath("/student/shortlist/courses");
      revalidatePath("/student/dashboard");
      return { success: true, data: { shortlisted: false } };
    } else {
      // Add to shortlist
      await supabase.from("student_shortlists").insert({
        student_id: user.id,
        course_id: courseId,
      });
      revalidatePath("/student/shortlist/courses");
      revalidatePath("/student/dashboard");
      return { success: true, data: { shortlisted: true } };
    }
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to update shortlist";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function getStudentShortlistsAction(
  type: "colleges" | "courses"
): Promise<ApiResponse<any[]>> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    if (type === "colleges") {
      const { data, error } = await supabase
        .from("student_shortlists")
        .select(
          `
          id,
          created_at,
          college:colleges(
            id,
            name,
            slug,
            logo_url,
            cover_image_url,
            city,
            state,
            college_type,
            average_placement,
            highest_placement
          )
        `
        )
        .eq("student_id", user.id)
        .not("college_id", "is", null)
        .order("created_at", { ascending: false });

      if (error) {
        return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
      }
      return { success: true, data: data || [] };
    } else {
      const { data, error } = await supabase
        .from("student_shortlists")
        .select(
          `
          id,
          created_at,
          course:courses(
            id,
            name,
            slug,
            stream,
            degree_type,
            duration_years,
            duration_unit,
            eligibility
          )
        `
        )
        .eq("student_id", user.id)
        .not("course_id", "is", null)
        .order("created_at", { ascending: false });

      if (error) {
        return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
      }
      return { success: true, data: data || [] };
    }
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch shortlist";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 6. STUDENT ENQUIRIES (Connecting to Lead Management CRM)
// ==============================================================================

export async function submitStudentPortalEnquiryAction(
  input: StudentEnquiryInput
): Promise<ApiResponse<{ leadId: string }>> {
  try {
    const user = await requireAuth("/login");
    const profile = await getCurrentProfile();
    const parsed = studentEnquirySchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid enquiry" },
      };
    }

    const data = parsed.data;
    const supabase = await createClient();

    // Insert new lead linked directly to authenticated student profile
    const { data: newLead, error } = await supabase
      .from("leads")
      .insert({
        student_user_id: user.id,
        full_name: profile?.fullName || user.email?.split("@")[0] || "Student",
        email: user.email || "",
        phone: profile?.phone || "Not provided",
        interested_college_id: data.collegeId || null,
        interested_course_id: data.courseId || null,
        enquiry_message: data.message,
        source: "student_portal",
        status: "new",
        priority: "high", // Logged-in students have higher intent
        preferred_location: profile?.city ? `${profile.city}, ${profile.state || ""}` : null,
      })
      .select("id")
      .single();

    if (error || !newLead) {
      return { success: false, error: { code: "INSERT_FAILED", message: error?.message || "Failed to submit enquiry" } };
    }

    // Record activity log
    await supabase.from("lead_activities").insert({
      lead_id: newLead.id,
      actor_id: user.id,
      activity_type: "student_enquiry_submitted",
      description: "Direct enquiry submitted from authenticated student portal.",
      is_internal: false, // Student-visible
    });

    revalidatePath("/student/enquiries");
    revalidatePath("/student/dashboard");

    return { success: true, data: { leadId: newLead.id } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to submit enquiry";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function getStudentEnquiriesAction(): Promise<ApiResponse<any[]>> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("leads")
      .select(
        `
        id,
        status,
        priority,
        enquiry_message,
        created_at,
        updated_at,
        colleges (id, name, slug, logo_url, city, state),
        courses (id, name, slug),
        assigned_counsellor:profiles!leads_assigned_counsellor_id_fkey (id, full_name, email, phone)
      `
      )
      .eq("student_user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    return { success: true, data: data || [] };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch enquiries";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function getStudentEnquiryDetailAction(
  enquiryId: string
): Promise<
  ApiResponse<{
    enquiry: any;
    visibleActivities: any[];
    studentFollowUps: any[];
  }>
> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    // 1. Fetch Lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select(
        `
        *,
        colleges (id, name, slug, logo_url, city, state),
        courses (id, name, slug),
        assigned_counsellor:profiles!leads_assigned_counsellor_id_fkey (id, full_name, email, phone)
      `
      )
      .eq("id", enquiryId)
      .eq("student_user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (leadError || !lead) {
      return { success: false, error: { code: "NOT_FOUND", message: "Enquiry not found" } };
    }

    // 2. Fetch student-visible activities (STRICT PRIVACY: is_internal = false only!)
    const { data: activities } = await supabase
      .from("lead_activities")
      .select("id, activity_type, description, old_status, new_status, created_at")
      .eq("lead_id", enquiryId)
      .eq("is_internal", false)
      .order("created_at", { ascending: false });

    // 3. Fetch student-visible scheduled follow-ups (NO internal notes or cancellation remarks)
    const { data: followUps } = await supabase
      .from("follow_ups")
      .select("id, follow_up_type, title, scheduled_at, status")
      .eq("lead_id", enquiryId)
      .order("scheduled_at", { ascending: true });

    return {
      success: true,
      data: {
        enquiry: lead,
        visibleActivities: activities || [],
        studentFollowUps: followUps || [],
      },
    };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch enquiry detail";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 7. STUDENT APPLICATIONS TRACKING
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
        colleges (id, name, slug, logo_url, city, state),
        college_courses (
          id,
          course_name_override,
          courses (id, name, slug, stream, degree_type)
        )
      `
      )
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    return { success: true, data: data || [] };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch applications";
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
        colleges (id, name, slug, logo_url, city, state),
        college_courses (
          id,
          course_name_override,
          courses (id, name, slug, stream, degree_type, duration_years)
        ),
        counsellor:profiles!applications_assigned_counsellor_id_fkey (id, full_name, email)
      `
      )
      .eq("id", applicationId)
      .eq("student_id", user.id)
      .single();

    if (error || !data) {
      return { success: false, error: { code: "NOT_FOUND", message: "Application record not found" } };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch application detail";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

// ==============================================================================
// 8. NOTIFICATIONS FOR STUDENTS
// ==============================================================================

export async function getStudentNotificationsAction(): Promise<ApiResponse<any[]>> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    return { success: true, data: data || [] };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to fetch notifications";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function markStudentNotificationReadAction(
  notificationId: string
): Promise<ApiResponse<{ id: string }>> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("recipient_id", user.id);

    if (error) {
      return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
    }

    revalidatePath("/student/notifications");
    revalidatePath("/student/dashboard");

    return { success: true, data: { id: notificationId } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to mark notification";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function markAllStudentNotificationsReadAction(): Promise<
  ApiResponse<{ count: number }>
> {
  try {
    const user = await requireAuth("/login");
    const supabase = await createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    if (error) {
      return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
    }

    revalidatePath("/student/notifications");
    revalidatePath("/student/dashboard");

    return { success: true, data: { count: 0 } };
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to mark all notifications";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}
