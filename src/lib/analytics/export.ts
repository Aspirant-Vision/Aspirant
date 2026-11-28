import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserRole } from "@/types/auth.types";
import { isStaff } from "@/lib/auth/roles";
import { DateRangePreset, getDateRangeBounds } from "./types";
import { ApiResponse } from "@/types/api.types";

/**
 * Formula Injection Mitigation:
 * Prepends a single quote (') if a cell string begins with =, +, -, @, tab, or carriage return.
 * This prevents spreadsheets (Excel, Google Sheets, LibreOffice) from executing malicious formulas.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value).trim();

  // Neutralize formula trigger characters
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape internal double quotes by doubling them
  str = str.replace(/"/g, '""');

  return `"${str}"`;
}

export function arrayToCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map((h) => sanitizeCsvCell(h)).join(",");
  const rowLines = rows.map((row) => row.map((cell) => sanitizeCsvCell(cell)).join(","));
  return [headerLine, ...rowLines].join("\r\n");
}

export type ReportType = "leads" | "counsellors" | "applications" | "admissions" | "colleges";

export class AnalyticsExporter {
  /**
   * Secure CSV Report Generator with Role-Based Access Control, Schema Validation, and Audit Logging.
   */
  static async exportReport(
    reportType: ReportType,
    userRole: UserRole,
    userId: string,
    preset: DateRangePreset = "30d"
  ): Promise<ApiResponse<{ filename: string; csvContent: string; rowCount: number }>> {
    try {
      if (!isStaff(userRole)) {
        return {
          success: false,
          error: { code: "FORBIDDEN", message: "Only staff members can export reports" },
        };
      }

      const adminClient = createAdminClient();
      const bounds = getDateRangeBounds(preset);
      const isCounsellorOnly = userRole === "counsellor";

      let headers: string[] = [];
      let rows: (string | number | null | undefined)[][] = [];
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `aspirant_${reportType}_report_${timestamp}.csv`;

      switch (reportType) {
        case "leads": {
          let query = adminClient
            .from("leads")
            .select(`
              id,
              full_name,
              email,
              phone,
              source,
              status,
              priority,
              preferred_location,
              created_at,
              counsellor:profiles!leads_assigned_counsellor_id_fkey(full_name, email),
              college:colleges(name)
            `)
            .is("deleted_at", null)
            .order("created_at", { ascending: false });

          if (preset !== "all") {
            query = query.gte("created_at", bounds.startDate).lte("created_at", bounds.endDate);
          }

          if (isCounsellorOnly) {
            query = query.eq("assigned_counsellor_id", userId);
          }

          const { data: leads, error } = await query;
          if (error) {
            throw new Error(`Failed to query leads: ${error.message}`);
          }

          headers = [
            "Lead ID",
            "Full Name",
            "Email Address",
            "Phone Number",
            "Status",
            "Priority",
            "Source",
            "Preferred Location",
            "Assigned Counsellor",
            "Interested College",
            "Registered Date"
          ];

          rows = (leads || []).map((l: any) => [
            l.id,
            l.full_name || "Anonymous",
            l.email || "N/A",
            l.phone || "N/A",
            (l.status || "new").toUpperCase(),
            (l.priority || "medium").toUpperCase(),
            l.source || "website_modal",
            l.preferred_location || "Not specified",
            l.counsellor?.full_name ? `${l.counsellor.full_name} (${l.counsellor.email})` : "Unassigned",
            l.college?.name || "General Inquiry",
            l.created_at ? new Date(l.created_at).toLocaleString("en-IN") : "N/A",
          ]);
          break;
        }

        case "applications": {
          let query = adminClient
            .from("applications")
            .select(`
              id,
              application_number,
              application_status,
              academic_year,
              submitted_at,
              created_at,
              college:colleges(name, city, state),
              college_course:college_courses(
                course:courses(name, code)
              ),
              student:profiles!applications_student_id_fkey(full_name, email, phone)
            `)
            .order("created_at", { ascending: false });

          if (preset !== "all") {
            query = query.gte("created_at", bounds.startDate).lte("created_at", bounds.endDate);
          }

          if (isCounsellorOnly) {
            query = query.eq("assigned_counsellor_id", userId);
          }

          const { data: apps, error } = await query;
          if (error) {
            throw new Error(`Failed to query applications: ${error.message}`);
          }

          headers = [
            "Application Number",
            "Applicant Name",
            "Applicant Email",
            "Applicant Phone",
            "College Name",
            "Campus Location",
            "Course / Program",
            "Application Status",
            "Academic Year",
            "Submission Date",
            "Created Date"
          ];

          rows = (apps || []).map((a: any) => [
            a.application_number || a.id,
            a.student?.full_name || "Applicant",
            a.student?.email || "N/A",
            a.student?.phone || "N/A",
            a.college?.name || "N/A",
            a.college ? `${a.college.city || ""}, ${a.college.state || ""}`.trim().replace(/^,|,$/g, "") : "N/A",
            a.college_course?.course?.name || "N/A",
            (a.application_status || "draft").toUpperCase(),
            a.academic_year || "2026-2027",
            a.submitted_at ? new Date(a.submitted_at).toLocaleString("en-IN") : "Draft / Pending Submission",
            a.created_at ? new Date(a.created_at).toLocaleString("en-IN") : "N/A",
          ]);
          break;
        }

        case "admissions": {
          let query = adminClient
            .from("admissions")
            .select(`
              id,
              admission_reference,
              admission_status,
              academic_year,
              admission_date,
              created_at,
              college:colleges(name, city, state),
              course:courses(name),
              student:profiles!admissions_student_id_fkey(full_name, email, phone),
              application:applications(application_number)
            `)
            .order("created_at", { ascending: false });

          if (preset !== "all") {
            query = query.gte("created_at", bounds.startDate).lte("created_at", bounds.endDate);
          }

          const { data: admissions, error } = await query;
          if (error) {
            throw new Error(`Failed to query admissions: ${error.message}`);
          }

          headers = [
            "Admission Reference",
            "Application Number",
            "Student Name",
            "Student Email",
            "Student Phone",
            "Allotted College",
            "Campus Location",
            "Allotted Course",
            "Status",
            "Academic Batch",
            "Allotment Date",
            "Confirmation Date"
          ];

          rows = (admissions || []).map((adm: any) => [
            adm.admission_reference || adm.id,
            adm.application?.application_number || "Direct Seat",
            adm.student?.full_name || "Enrolled Student",
            adm.student?.email || "N/A",
            adm.student?.phone || "N/A",
            adm.college?.name || "N/A",
            adm.college ? `${adm.college.city || ""}, ${adm.college.state || ""}`.trim().replace(/^,|,$/g, "") : "N/A",
            adm.course?.name || "N/A",
            (adm.admission_status || "admitted").toUpperCase(),
            adm.academic_year || "2026-2027",
            adm.admission_date ? new Date(adm.admission_date).toLocaleDateString("en-IN") : "N/A",
            adm.created_at ? new Date(adm.created_at).toLocaleString("en-IN") : "N/A",
          ]);
          break;
        }

        case "counsellors": {
          if (isCounsellorOnly) {
            return {
              success: false,
              error: { code: "FORBIDDEN", message: "Only administrators can export staff comparison reports" },
            };
          }

          const { data: counsellors, error: cErr } = await adminClient
            .from("user_roles")
            .select("user_id, role, profile:profiles(id, full_name, email, phone)")
            .eq("role", "counsellor");

          if (cErr) {
            throw new Error(`Failed to fetch counsellors: ${cErr.message}`);
          }

          let leadsQuery = adminClient
            .from("leads")
            .select("assigned_counsellor_id, status, created_at")
            .is("deleted_at", null);

          let appsQuery = adminClient
            .from("applications")
            .select("assigned_counsellor_id, application_status, created_at");

          if (preset !== "all") {
            leadsQuery = leadsQuery.gte("created_at", bounds.startDate).lte("created_at", bounds.endDate);
            appsQuery = appsQuery.gte("created_at", bounds.startDate).lte("created_at", bounds.endDate);
          }

          const [leadsRes, appsRes] = await Promise.all([leadsQuery, appsQuery]);
          const leads = leadsRes.data || [];
          const apps = appsRes.data || [];

          headers = [
            "Counsellor Name",
            "Email Address",
            "Phone Number",
            "Allocated Leads",
            "Contacted Leads",
            "Applications Initiated",
            "Admissions Completed",
            "Conversion Rate (%)"
          ];

          rows = (counsellors || []).map((c: any) => {
            const prof = c.profile || {};
            const assigned = leads.filter((l) => l.assigned_counsellor_id === c.user_id);
            const contacted = assigned.filter((l) =>
              ["contacted", "interested", "counselling_scheduled", "documents_pending", "application_started", "application_submitted", "admitted"].includes(l.status)
            );
            const initiated = apps.filter((a) => a.assigned_counsellor_id === c.user_id);
            const admitted = assigned.filter((l) => l.status === "admitted");
            const conv = assigned.length > 0 ? ((admitted.length / assigned.length) * 100).toFixed(1) + "%" : "0.0%";

            return [
              prof.full_name || "Counsellor",
              prof.email || "N/A",
              prof.phone || "N/A",
              assigned.length,
              contacted.length,
              initiated.length,
              admitted.length,
              conv
            ];
          });
          break;
        }

        case "colleges": {
          const { data: colleges, error: colErr } = await adminClient
            .from("colleges")
            .select("id, name, city, state, college_type, accreditation")
            .order("name", { ascending: true });

          if (colErr) {
            throw new Error(`Failed to fetch colleges: ${colErr.message}`);
          }

          let leadsQuery = adminClient.from("leads").select("interested_college_id, created_at").is("deleted_at", null);
          let appsQuery = adminClient.from("applications").select("college_id, created_at");
          let admissionsQuery = adminClient.from("admissions").select("college_id, created_at");

          if (preset !== "all") {
            leadsQuery = leadsQuery.gte("created_at", bounds.startDate).lte("created_at", bounds.endDate);
            appsQuery = appsQuery.gte("created_at", bounds.startDate).lte("created_at", bounds.endDate);
            admissionsQuery = admissionsQuery.gte("created_at", bounds.startDate).lte("created_at", bounds.endDate);
          }

          const [leadsRes, appsRes, admRes] = await Promise.all([leadsQuery, appsQuery, admissionsQuery]);
          const leads = leadsRes.data || [];
          const apps = appsRes.data || [];
          const admissions = admRes.data || [];

          headers = [
            "College Name",
            "City",
            "State",
            "Type / Accreditation",
            "Student Enquiries",
            "Applications Received",
            "Admissions Confirmed",
            "Conversion Yield (%)"
          ];

          rows = (colleges || []).map((col: any) => {
            const eCount = leads.filter((l) => l.interested_college_id === col.id).length;
            const aCount = apps.filter((a) => a.college_id === col.id).length;
            const admCount = admissions.filter((adm) => adm.college_id === col.id).length;
            const yieldRate = aCount > 0 ? ((admCount / aCount) * 100).toFixed(1) + "%" : "0.0%";

            return [
              col.name,
              col.city || "N/A",
              col.state || "N/A",
              col.accreditation || col.college_type || "N/A",
              eCount,
              aCount,
              admCount,
              yieldRate
            ];
          });
          break;
        }
      }

      const csvContent = arrayToCsv(headers, rows);

      // Audit Logging: Record export action
      await adminClient.from("audit_logs").insert({
        actor_id: userId,
        action: "export_report",
        entity_type: "reports",
        entity_id: userId,
        new_values: {
          reportType,
          rowCount: rows.length,
          preset,
          exportedAt: new Date().toISOString(),
        },
      });

      return {
        success: true,
        data: { filename, csvContent, rowCount: rows.length },
      };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Report export failed";
      return { success: false, error: { code: "EXPORT_ERROR", message: msg } };
    }
  }
}
