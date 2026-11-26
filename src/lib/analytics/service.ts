import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/types/auth.types";
import {
  DateRangePreset,
  DateRangeFilterInput,
  getDateRangeBounds,
  ExecutiveAnalyticsData,
  MetricComparison,
  FunnelStep,
  TimeSeriesPoint,
  DistributionPoint,
} from "./types";
import { ApiResponse } from "@/types/api.types";

function calculateComparison(current: number, previous: number): MetricComparison {
  const diff = current - previous;
  let percentageChange: number | null = null;

  if (previous > 0) {
    percentageChange = Math.round(((current - previous) / previous) * 1000) / 10;
  } else if (current > 0 && previous === 0) {
    percentageChange = null; // Insufficient baseline comparison
  } else {
    percentageChange = 0;
  }

  return {
    value: current,
    previousValue: previous,
    diff,
    percentageChange,
    hasComparison: previous > 0,
  };
}

export class AnalyticsService {
  /**
   * Executive Management Dashboard Aggregator.
   * Compiles high-level platform KPIs, funnel progression, and time-series trends.
   */
  static async getExecutiveAnalytics(
    role: UserRole,
    userId: string,
    filters?: Partial<DateRangeFilterInput>
  ): Promise<ApiResponse<ExecutiveAnalyticsData>> {
    try {
      const supabase = await createClient();
      const bounds = getDateRangeBounds(
        (filters?.preset as DateRangePreset) || "30d",
        filters?.startDate,
        filters?.endDate
      );

      // Role isolation: Counsellors are strictly constrained to their own portfolio
      const isCounsellorOnly = role === "counsellor";
      const effectiveCounsellorId = isCounsellorOnly ? userId : filters?.counsellorId;

      // 1. Current Period Queries
      let curLeadsQuery = supabase
        .from("leads")
        .select("id, status, source, created_at")
        .gte("created_at", bounds.startDate)
        .lte("created_at", bounds.endDate);

      let prevLeadsQuery = supabase
        .from("leads")
        .select("id, status, source, created_at")
        .gte("created_at", bounds.previousStartDate)
        .lte("created_at", bounds.previousEndDate);

      if (effectiveCounsellorId) {
        curLeadsQuery = curLeadsQuery.eq("assigned_counsellor_id", effectiveCounsellorId);
        prevLeadsQuery = prevLeadsQuery.eq("assigned_counsellor_id", effectiveCounsellorId);
      }

      // 2. Application Queries
      let curAppsQuery = supabase
        .from("applications")
        .select("id, application_status, created_at, submitted_at")
        .gte("created_at", bounds.startDate)
        .lte("created_at", bounds.endDate);

      let prevAppsQuery = supabase
        .from("applications")
        .select("id, application_status, created_at, submitted_at")
        .gte("created_at", bounds.previousStartDate)
        .lte("created_at", bounds.previousEndDate);

      // 3. Admission Queries
      let curAdmissionsQuery = supabase
        .from("admissions")
        .select("id, admission_date, created_at")
        .gte("created_at", bounds.startDate)
        .lte("created_at", bounds.endDate);

      let prevAdmissionsQuery = supabase
        .from("admissions")
        .select("id, admission_date, created_at")
        .gte("created_at", bounds.previousStartDate)
        .lte("created_at", bounds.previousEndDate);

      const [
        curLeadsRes,
        prevLeadsRes,
        curAppsRes,
        prevAppsRes,
        curAdmissionsRes,
        prevAdmissionsRes,
      ] = await Promise.all([
        curLeadsQuery,
        prevLeadsQuery,
        curAppsQuery,
        prevAppsQuery,
        curAdmissionsQuery,
        prevAdmissionsQuery,
      ]);

      const curLeads = curLeadsRes.data || [];
      const prevLeads = prevLeadsRes.data || [];
      const curApps = curAppsRes.data || [];
      const prevApps = prevAppsRes.data || [];
      const curAdmissions = curAdmissionsRes.data || [];
      const prevAdmissions = prevAdmissionsRes.data || [];

      // Metric calculations
      const totalLeadsComp = calculateComparison(curLeads.length, prevLeads.length);
      const newLeadsComp = calculateComparison(
        curLeads.filter((l) => l.status === "new").length,
        prevLeads.filter((l) => l.status === "new").length
      );
      const contactedLeadsComp = calculateComparison(
        curLeads.filter((l) => l.status === "contacted").length,
        prevLeads.filter((l) => l.status === "contacted").length
      );
      const interestedLeadsComp = calculateComparison(
        curLeads.filter((l) => l.status === "interested").length,
        prevLeads.filter((l) => l.status === "interested").length
      );

      const appsStartedComp = calculateComparison(curApps.length, prevApps.length);
      const appsSubmittedComp = calculateComparison(
        curApps.filter((a) => a.submitted_at !== null).length,
        prevApps.filter((a) => a.submitted_at !== null).length
      );
      const appsAcceptedComp = calculateComparison(
        curApps.filter((a) => a.application_status === "accepted").length,
        prevApps.filter((a) => a.application_status === "accepted").length
      );

      const confirmedAdmissionsComp = calculateComparison(
        curAdmissions.length,
        prevAdmissions.length
      );

      // Conversion rates
      const leadToAppRate =
        curLeads.length > 0
          ? Math.round((appsSubmittedComp.value / curLeads.length) * 1000) / 10
          : 0;

      const appToAdmissionRate =
        appsSubmittedComp.value > 0
          ? Math.round((confirmedAdmissionsComp.value / appsSubmittedComp.value) * 1000) / 10
          : 0;

      // Funnel Steps
      const baseLeads = Math.max(1, curLeads.length);
      const funnelSteps: FunnelStep[] = [
        {
          name: "Total Enquiries",
          count: curLeads.length,
          conversionFromStart: 100,
        },
        {
          name: "Contacted Leads",
          count: curLeads.filter((l) =>
            ["contacted", "counselling_scheduled", "interested", "application_started", "application_submitted", "admitted"].includes(l.status)
          ).length,
          conversionFromStart: Math.round(
            (curLeads.filter((l) =>
              ["contacted", "counselling_scheduled", "interested", "application_started", "application_submitted", "admitted"].includes(l.status)
            ).length / baseLeads) * 100
          ),
        },
        {
          name: "Interested / Qualified",
          count: curLeads.filter((l) =>
            ["interested", "application_started", "application_submitted", "admitted"].includes(l.status)
          ).length,
          conversionFromStart: Math.round(
            (curLeads.filter((l) =>
              ["interested", "application_started", "application_submitted", "admitted"].includes(l.status)
            ).length / baseLeads) * 100
          ),
        },
        {
          name: "Applications Submitted",
          count: appsSubmittedComp.value,
          conversionFromStart: Math.round((appsSubmittedComp.value / baseLeads) * 100),
        },
        {
          name: "Confirmed Admissions",
          count: confirmedAdmissionsComp.value,
          conversionFromStart: Math.round((confirmedAdmissionsComp.value / baseLeads) * 100),
        },
      ];

      // Time series grouping (by day)
      const dayMap = new Map<string, TimeSeriesPoint>();
      const startDateObj = new Date(bounds.startDate);
      const endDateObj = new Date(bounds.endDate);
      const numDays = Math.min(
        60,
        Math.max(1, Math.round((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)))
      );

      for (let i = 0; i <= numDays; i++) {
        const d = new Date(startDateObj.getTime() + i * 24 * 60 * 60 * 1000);
        const dayKey = d.toISOString().split("T")[0];
        dayMap.set(dayKey, { date: dayKey, leads: 0, applications: 0, admissions: 0 });
      }

      curLeads.forEach((l) => {
        const dayKey = l.created_at.split("T")[0];
        const pt = dayMap.get(dayKey);
        if (pt) pt.leads = (pt.leads || 0) + 1;
      });

      curApps.forEach((a) => {
        const dayKey = a.created_at.split("T")[0];
        const pt = dayMap.get(dayKey);
        if (pt) pt.applications = (pt.applications || 0) + 1;
      });

      curAdmissions.forEach((adm) => {
        const dayKey = adm.created_at.split("T")[0];
        const pt = dayMap.get(dayKey);
        if (pt) pt.admissions = (pt.admissions || 0) + 1;
      });

      const timeSeries = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));

      // Source distribution
      const sourceMap = new Map<string, number>();
      curLeads.forEach((l) => {
        const src = l.source || "organic_website";
        sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
      });
      const sourceDistribution: DistributionPoint[] = Array.from(sourceMap.entries()).map(
        ([name, value]) => ({ name: name.replace(/_/g, " "), value })
      );

      // Status distribution
      const statusMap = new Map<string, number>();
      curLeads.forEach((l) => {
        statusMap.set(l.status, (statusMap.get(l.status) || 0) + 1);
      });
      const statusDistribution: DistributionPoint[] = Array.from(statusMap.entries()).map(
        ([name, value]) => ({ name: name.replace(/_/g, " "), value })
      );

      return {
        success: true,
        data: {
          totalLeads: totalLeadsComp,
          newLeads: newLeadsComp,
          contactedLeads: contactedLeadsComp,
          interestedLeads: interestedLeadsComp,
          appsStarted: appsStartedComp,
          appsSubmitted: appsSubmittedComp,
          appsAccepted: appsAcceptedComp,
          confirmedAdmissions: confirmedAdmissionsComp,
          leadToAppRate,
          appToAdmissionRate,
          funnelSteps,
          timeSeries,
          sourceDistribution,
          statusDistribution,
          dateLabel: bounds.label,
        },
      };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to load executive analytics";
      return { success: false, error: { code: "ANALYTICS_FAILED", message: msg } };
    }
  }

  /**
   * Lead Analytics Aggregator.
   */
  static async getLeadAnalytics(
    role: UserRole,
    userId: string,
    filters?: Partial<DateRangeFilterInput>
  ) {
    try {
      const supabase = await createClient();
      const bounds = getDateRangeBounds(
        (filters?.preset as DateRangePreset) || "30d",
        filters?.startDate,
        filters?.endDate
      );

      const isCounsellorOnly = role === "counsellor";
      const effectiveCounsellorId = isCounsellorOnly ? userId : filters?.counsellorId;

      let query = supabase
        .from("leads")
        .select(`
          id,
          full_name,
          email,
          phone,
          source,
          status,
          priority,
          assigned_counsellor_id,
          created_at,
          counsellor:profiles!leads_assigned_counsellor_id_fkey(id, full_name, email),
          college:colleges!leads_interested_college_id_fkey(id, name, city)
        `)
        .gte("created_at", bounds.startDate)
        .lte("created_at", bounds.endDate)
        .order("created_at", { ascending: false });

      if (effectiveCounsellorId) {
        query = query.eq("assigned_counsellor_id", effectiveCounsellorId);
      }
      if (filters?.source) {
        query = query.eq("source", filters.source);
      }

      const { data: leads, error } = await query;
      if (error) {
        return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
      }

      const allLeads = leads || [];

      // Status breakdown
      const statusCounts = {
        new: allLeads.filter((l) => l.status === "new").length,
        contacted: allLeads.filter((l) => l.status === "contacted").length,
        counselling_scheduled: allLeads.filter((l) => l.status === "counselling_scheduled").length,
        interested: allLeads.filter((l) => l.status === "interested").length,
        application_started: allLeads.filter((l) => l.status === "application_started").length,
        application_submitted: allLeads.filter((l) => l.status === "application_submitted").length,
        admitted: allLeads.filter((l) => l.status === "admitted").length,
        lost: allLeads.filter((l) => ["not_interested", "lost"].includes(l.status)).length,
      };

      // Source breakdown
      const sourceMap = new Map<string, number>();
      allLeads.forEach((l) => {
        const s = l.source || "organic_website";
        sourceMap.set(s, (sourceMap.get(s) || 0) + 1);
      });
      const sources = Array.from(sourceMap.entries()).map(([source, count]) => ({
        source: source.replace(/_/g, " "),
        count,
      }));

      return {
        success: true,
        data: {
          totalLeads: allLeads.length,
          statusCounts,
          sources,
          recentLeads: allLeads.slice(0, 15),
          dateLabel: bounds.label,
        },
      };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to load lead analytics";
      return { success: false, error: { code: "ANALYTICS_FAILED", message: msg } };
    }
  }

  /**
   * Counsellor Performance Analytics.
   */
  static async getCounsellorAnalytics(
    role: UserRole,
    userId: string,
    filters?: Partial<DateRangeFilterInput>,
    targetCounsellorId?: string
  ) {
    try {
      const supabase = await createClient();
      const bounds = getDateRangeBounds(
        (filters?.preset as DateRangePreset) || "30d",
        filters?.startDate,
        filters?.endDate
      );

      // Security: If counsellor, can only view self
      const isCounsellorOnly = role === "counsellor";
      const counsellorFilterId = isCounsellorOnly ? userId : targetCounsellorId;

      // 1. Fetch counsellors
      let profilesQuery = supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("role", "counsellor");

      if (counsellorFilterId) {
        profilesQuery = profilesQuery.eq("id", counsellorFilterId);
      }

      const { data: counsellors } = await profilesQuery;
      const counsellorProfiles = counsellors || [];

      // 2. Fetch leads in date range
      const { data: leads } = await supabase
        .from("leads")
        .select("id, assigned_counsellor_id, status, created_at")
        .gte("created_at", bounds.startDate)
        .lte("created_at", bounds.endDate);

      // 3. Fetch follow ups
      const { data: followUps } = await supabase
        .from("follow_ups")
        .select("id, counsellor_id, status, scheduled_at, updated_at")
        .gte("created_at", bounds.startDate)
        .lte("created_at", bounds.endDate);

      const allLeads = leads || [];
      const allFollowUps = followUps || [];

      const performanceRows = counsellorProfiles.map((c) => {
        const assigned = allLeads.filter((l) => l.assigned_counsellor_id === c.id);
        const contacted = assigned.filter((l) =>
          ["contacted", "interested", "application_started", "application_submitted", "admitted"].includes(l.status)
        );
        const interested = assigned.filter((l) => l.status === "interested");
        const admitted = assigned.filter((l) => l.status === "admitted");

        const cFollowUps = allFollowUps.filter((f) => f.counsellor_id === c.id);
        const completedFollowUps = cFollowUps.filter((f) => f.status === "completed");
        const overdueFollowUps = cFollowUps.filter(
          (f) => f.status === "pending" && new Date(f.scheduled_at) < new Date()
        );

        const conversionRate =
          assigned.length > 0 ? Math.round((admitted.length / assigned.length) * 1000) / 10 : 0;

        return {
          id: c.id,
          name: c.full_name || "Counsellor",
          email: c.email,
          assignedLeads: assigned.length,
          contactedLeads: contacted.length,
          interestedLeads: interested.length,
          admittedLeads: admitted.length,
          completedFollowUps: completedFollowUps.length,
          overdueFollowUps: overdueFollowUps.length,
          conversionRate,
        };
      });

      return {
        success: true,
        data: {
          counsellors: performanceRows,
          dateLabel: bounds.label,
        },
      };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to load counsellor analytics";
      return { success: false, error: { code: "ANALYTICS_FAILED", message: msg } };
    }
  }

  /**
   * Application Analytics.
   */
  static async getApplicationAnalytics(
    role: UserRole,
    userId: string,
    filters?: Partial<DateRangeFilterInput>
  ) {
    try {
      const supabase = await createClient();
      const bounds = getDateRangeBounds(
        (filters?.preset as DateRangePreset) || "30d",
        filters?.startDate,
        filters?.endDate
      );

      const { data: apps, error } = await supabase
        .from("applications")
        .select(`
          id,
          application_number,
          application_status,
          academic_year,
          submitted_at,
          created_at,
          college:colleges(id, name),
          course:courses(id, name)
        `)
        .gte("created_at", bounds.startDate)
        .lte("created_at", bounds.endDate)
        .order("created_at", { ascending: false });

      if (error) {
        return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
      }

      const allApps = apps || [];

      // Status breakdown
      const statusCounts = {
        draft: allApps.filter((a) => a.application_status === "draft").length,
        submitted: allApps.filter((a) => a.application_status === "submitted").length,
        under_review: allApps.filter((a) => a.application_status === "under_review").length,
        documents_required: allApps.filter((a) => a.application_status === "documents_required").length,
        verified: allApps.filter((a) => a.application_status === "verified").length,
        forwarded: allApps.filter((a) => a.application_status === "forwarded").length,
        accepted: allApps.filter((a) => a.application_status === "accepted").length,
        rejected: allApps.filter((a) => a.application_status === "rejected").length,
        waitlisted: allApps.filter((a) => a.application_status === "waitlisted").length,
      };

      const submittedTotal = allApps.filter((a) => a.submitted_at !== null).length;

      return {
        success: true,
        data: {
          totalApplications: allApps.length,
          submittedTotal,
          statusCounts,
          recentApplications: allApps.slice(0, 15),
          dateLabel: bounds.label,
        },
      };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to load application analytics";
      return { success: false, error: { code: "ANALYTICS_FAILED", message: msg } };
    }
  }

  /**
   * Admission Analytics.
   */
  static async getAdmissionAnalytics(
    role: UserRole,
    userId: string,
    filters?: Partial<DateRangeFilterInput>
  ) {
    try {
      const supabase = await createClient();
      const bounds = getDateRangeBounds(
        (filters?.preset as DateRangePreset) || "30d",
        filters?.startDate,
        filters?.endDate
      );

      const { data: admissions, error } = await supabase
        .from("admissions")
        .select(`
          id,
          admission_reference,
          admission_status,
          academic_year,
          admission_date,
          created_at,
          college:colleges(id, name, city),
          course:courses(id, name)
        `)
        .gte("created_at", bounds.startDate)
        .lte("created_at", bounds.endDate)
        .order("created_at", { ascending: false });

      if (error) {
        return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
      }

      const allAdmissions = admissions || [];

      // Status breakdown
      const statusMap = new Map<string, number>();
      allAdmissions.forEach((a) => {
        const st = a.admission_status || "confirmed";
        statusMap.set(st, (statusMap.get(st) || 0) + 1);
      });
      const admissionStatuses = Array.from(statusMap.entries()).map(([status, count]) => ({
        status,
        count,
      }));

      return {
        success: true,
        data: {
          totalConfirmedAdmissions: allAdmissions.length,
          admissionStatuses,
          recentAdmissions: allAdmissions.slice(0, 15),
          dateLabel: bounds.label,
        },
      };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to load admission analytics";
      return { success: false, error: { code: "ANALYTICS_FAILED", message: msg } };
    }
  }

  /**
   * College & Course Demand Analytics.
   */
  static async getCollegeAnalytics(
    role: UserRole,
    userId: string,
    filters?: Partial<DateRangeFilterInput>
  ) {
    try {
      const supabase = await createClient();
      const bounds = getDateRangeBounds(
        (filters?.preset as DateRangePreset) || "30d",
        filters?.startDate,
        filters?.endDate
      );

      const [collegesRes, leadsRes, appsRes, shortlistsRes] = await Promise.all([
        supabase.from("colleges").select("id, name, city, state").limit(30),
        supabase.from("leads").select("interested_college_id").gte("created_at", bounds.startDate),
        supabase.from("applications").select("college_id").gte("created_at", bounds.startDate),
        supabase.from("student_shortlists").select("college_id").gte("created_at", bounds.startDate),
      ]);

      const colleges = collegesRes.data || [];
      const leads = leadsRes.data || [];
      const apps = appsRes.data || [];
      const shortlists = shortlistsRes.data || [];

      const demandRows = colleges.map((c) => {
        const leadsCount = leads.filter((l) => l.interested_college_id === c.id).length;
        const appsCount = apps.filter((a) => a.college_id === c.id).length;
        const shortlistsCount = shortlists.filter((s) => s.college_id === c.id).length;
        const demandScore = leadsCount + appsCount * 2 + shortlistsCount;

        return {
          id: c.id,
          name: c.name,
          location: `${c.city || ""}, ${c.state || ""}`.trim().replace(/^,|,$/g, ""),
          leadsCount,
          appsCount,
          shortlistsCount,
          demandScore,
        };
      }).sort((a, b) => b.demandScore - a.demandScore);

      return {
        success: true,
        data: {
          collegeDemand: demandRows,
          dateLabel: bounds.label,
        },
      };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to load college analytics";
      return { success: false, error: { code: "ANALYTICS_FAILED", message: msg } };
    }
  }
}
