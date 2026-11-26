"use server";

import { getCurrentProfile } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";
import { AnalyticsService } from "./service";
import { AnalyticsExporter, ReportType } from "./export";
import { DateRangePreset, DateRangeFilterInput } from "./types";
import { ApiResponse } from "@/types/api.types";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function getExecutiveAnalyticsAction(
  filters?: Partial<DateRangeFilterInput>
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !isStaff(profile.role)) {
      return { success: false, error: { code: "FORBIDDEN", message: "Staff access required" } };
    }

    return await AnalyticsService.getExecutiveAnalytics(profile.role, profile.id, filters);
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to load executive analytics";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function getLeadAnalyticsAction(
  filters?: Partial<DateRangeFilterInput>
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !isStaff(profile.role)) {
      return { success: false, error: { code: "FORBIDDEN", message: "Staff access required" } };
    }

    return await AnalyticsService.getLeadAnalytics(profile.role, profile.id, filters);
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to load lead analytics";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function getCounsellorAnalyticsAction(
  filters?: Partial<DateRangeFilterInput>,
  targetCounsellorId?: string
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !isStaff(profile.role)) {
      return { success: false, error: { code: "FORBIDDEN", message: "Staff access required" } };
    }

    return await AnalyticsService.getCounsellorAnalytics(
      profile.role,
      profile.id,
      filters,
      targetCounsellorId
    );
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to load counsellor analytics";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function getApplicationAnalyticsAction(
  filters?: Partial<DateRangeFilterInput>
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !isStaff(profile.role)) {
      return { success: false, error: { code: "FORBIDDEN", message: "Staff access required" } };
    }

    return await AnalyticsService.getApplicationAnalytics(profile.role, profile.id, filters);
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to load application analytics";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function getAdmissionAnalyticsAction(
  filters?: Partial<DateRangeFilterInput>
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !isStaff(profile.role)) {
      return { success: false, error: { code: "FORBIDDEN", message: "Staff access required" } };
    }

    return await AnalyticsService.getAdmissionAnalytics(profile.role, profile.id, filters);
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to load admission analytics";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function getCollegeAnalyticsAction(
  filters?: Partial<DateRangeFilterInput>
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !isStaff(profile.role)) {
      return { success: false, error: { code: "FORBIDDEN", message: "Staff access required" } };
    }

    return await AnalyticsService.getCollegeAnalytics(profile.role, profile.id, filters);
  } catch (err: unknown) {
    const msg = (err as Error).message || "Failed to load college analytics";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}

export async function exportReportAction(
  reportType: ReportType,
  preset: DateRangePreset = "30d"
): Promise<ApiResponse<{ filename: string; csvContent: string }>> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !isStaff(profile.role)) {
      return { success: false, error: { code: "FORBIDDEN", message: "Staff access required" } };
    }

    const rateLimitError = await enforceRateLimit("exportReportAction", "export", profile.id);
    if (rateLimitError) {
      return { success: false, error: { code: "RATE_LIMIT_EXCEEDED", message: rateLimitError.error } };
    }

    return await AnalyticsExporter.exportReport(reportType, profile.role, profile.id, preset);
  } catch (err: unknown) {
    const msg = (err as Error).message || "Export action failed";
    return { success: false, error: { code: "INTERNAL_ERROR", message: msg } };
  }
}
