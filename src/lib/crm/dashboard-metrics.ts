import { createClient } from "@/lib/supabase/server";

export interface SuperAdminDashboardData {
  totalColleges: number;
  totalCourses: number;
  totalLeads: number;
  totalStudents: number;
  totalApplications: number;
  totalCounsellors: number;
  recentLeads: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
    preferredLocation?: string | null;
    enquiryMessage?: string | null;
    source?: string | null;
  }>;
  recentAdmissions: Array<{
    id: string;
    admissionStatus: string;
    academicYear: string | null;
    createdAt: string;
  }>;
}

export interface AdminDashboardData {
  totalColleges: number;
  totalCourses: number;
  totalLeads: number;
  totalStudents: number;
  totalApplications: number;
  totalCounsellors: number;
  recentLeads: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
    preferredLocation?: string | null;
    enquiryMessage?: string | null;
    source?: string | null;
  }>;
  pendingReviewsCount: number;
}

export interface CounsellorDashboardData {
  myAssignedLeadsCount: number;
  newLeadsCount: number;
  followUpsDueTodayCount: number;
  overdueFollowUpsCount: number;
  interestedStudentsCount: number;
  applicationsInProgressCount: number;
  recentAssignedLeads: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
  }>;
}

/**
 * Super Admin Metric Aggregator.
 * Executes exact head queries across the operational schema.
 */
export async function getSuperAdminDashboardData(): Promise<SuperAdminDashboardData> {
  const supabase = await createClient();

  const [
    collegesRes,
    coursesRes,
    leadsRes,
    studentsRes,
    applicationsRes,
    counsellorsRes,
    recentLeadsRes,
    recentAdmissionsRes,
  ] = await Promise.all([
    supabase.from("colleges").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "counsellor"),
    supabase
      .from("leads")
      .select("id, full_name, email, phone, status, created_at, preferred_location, enquiry_message, source")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("admissions")
      .select("id, admission_status, academic_year, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    totalColleges: collegesRes.count ?? 0,
    totalCourses: coursesRes.count ?? 0,
    totalLeads: leadsRes.count ?? 0,
    totalStudents: studentsRes.count ?? 0,
    totalApplications: applicationsRes.count ?? 0,
    totalCounsellors: counsellorsRes.count ?? 0,
    recentLeads: (recentLeadsRes.data || []).map((l: any) => ({
      id: l.id,
      fullName: l.full_name,
      email: l.email,
      phone: l.phone,
      status: l.status,
      createdAt: l.created_at,
      preferredLocation: l.preferred_location,
      enquiryMessage: l.enquiry_message,
      source: l.source,
    })),
    recentAdmissions: (recentAdmissionsRes.data || []).map((a) => ({
      id: a.id,
      admissionStatus: a.admission_status,
      academicYear: a.academic_year,
      createdAt: a.created_at,
    })),
  };
}

/**
 * Admin Metric Aggregator.
 */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient();

  const [
    collegesRes,
    coursesRes,
    leadsRes,
    studentsRes,
    applicationsRes,
    counsellorsRes,
    recentLeadsRes,
    pendingReviewsRes,
  ] = await Promise.all([
    supabase.from("colleges").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "counsellor"),
    supabase
      .from("leads")
      .select("id, full_name, email, phone, status, created_at, preferred_location, enquiry_message, source")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "under_review"]),
  ]);

  return {
    totalColleges: collegesRes.count ?? 0,
    totalCourses: coursesRes.count ?? 0,
    totalLeads: leadsRes.count ?? 0,
    totalStudents: studentsRes.count ?? 0,
    totalApplications: applicationsRes.count ?? 0,
    totalCounsellors: counsellorsRes.count ?? 0,
    recentLeads: (recentLeadsRes.data || []).map((l: any) => ({
      id: l.id,
      fullName: l.full_name,
      email: l.email,
      phone: l.phone,
      status: l.status,
      createdAt: l.created_at,
      preferredLocation: l.preferred_location,
      enquiryMessage: l.enquiry_message,
      source: l.source,
    })),
    pendingReviewsCount: pendingReviewsRes.count ?? 0,
  };
}

/**
 * Counsellor Metric Aggregator.
 * Strictly scoped to the authenticated counsellor's assigned students and leads.
 */
export async function getCounsellorDashboardData(
  counsellorId: string
): Promise<CounsellorDashboardData> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  // End of today for follow-up calculations
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const endOfTodayIso = endOfToday.toISOString();

  const [
    myLeadsRes,
    newLeadsRes,
    followUpsDueRes,
    overdueFollowUpsRes,
    interestedRes,
    appsRes,
    recentAssignedRes,
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("assigned_counsellor_id", counsellorId),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .is("assigned_counsellor_id", null)
      .eq("status", "new"),
    supabase
      .from("follow_ups")
      .select("*", { count: "exact", head: true })
      .eq("counsellor_id", counsellorId)
      .eq("status", "pending")
      .lte("scheduled_at", endOfTodayIso)
      .gte("scheduled_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from("follow_ups")
      .select("*", { count: "exact", head: true })
      .eq("counsellor_id", counsellorId)
      .eq("status", "pending")
      .lt("scheduled_at", nowIso),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("assigned_counsellor_id", counsellorId)
      .eq("status", "interested"),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "under_review", "documents_required"]),
    supabase
      .from("leads")
      .select("id, full_name, email, phone, status, created_at")
      .eq("assigned_counsellor_id", counsellorId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    myAssignedLeadsCount: myLeadsRes.count ?? 0,
    newLeadsCount: newLeadsRes.count ?? 0,
    followUpsDueTodayCount: followUpsDueRes.count ?? 0,
    overdueFollowUpsCount: overdueFollowUpsRes.count ?? 0,
    interestedStudentsCount: interestedRes.count ?? 0,
    applicationsInProgressCount: appsRes.count ?? 0,
    recentAssignedLeads: (recentAssignedRes.data || []).map((l) => ({
      id: l.id,
      fullName: l.full_name,
      email: l.email,
      phone: l.phone,
      status: l.status,
      createdAt: l.created_at,
    })),
  };
}
