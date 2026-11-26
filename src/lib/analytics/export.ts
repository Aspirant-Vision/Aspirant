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
   * Secure CSV Report Generator with Role-Based Access Control and Audit Logging.
   */
  static async exportReport(
    reportType: ReportType,
    userRole: UserRole,
    userId: string,
    preset: DateRangePreset = "30d"
  ): Promise<ApiResponse<{ filename: string; csvContent: string }>> {
    try {
      if (!isStaff(userRole)) {
        return {
          success: false,
          error: { code: "FORBIDDEN", message: "Only staff members can export reports" },
        };
      }

      const supabase = await createClient();
      const bounds = getDateRangeBounds(preset);
      const isCounsellorOnly = userRole === "counsellor";

      let headers: string[] = [];
      let rows: (string | number | null | undefined)[][] = [];
      let filename = `aspirant_report_${reportType}_${new Date().toISOString().split("T")[0]}.csv`;

      switch (reportType) {
        case "leads": {
          let query = supabase
            .from("leads")
            .select(`
              full_name,
              email,
              phone,
              source,
              status,
              priority,
              created_at,
              counsellor:profiles!leads_assigned_counsellor_id_fkey(full_name),
              college:colleges!leads_interested_college_id_fkey(name)
            `)
            .gte("created_at", bounds.startDate)
            .lte("created_at", bounds.endDate)
            .order("created_at", { ascending: false });

          if (isCounsellorOnly) {
            query = query.eq("assigned_counsellor_id", userId);
          }

          const { data: leads } = await query;
          headers = ["Full Name", "Email", "Phone", "Source", "Status", "Priority", "Assigned Counsellor", "Interested College", "Created Date"];
          rows = (leads || []).map((l: any) => [
            l.full_name,
            l.email,
            l.phone,
            l.source || "organic_website",
            l.status,
            l.priority,
            l.counsellor?.full_name || "Unassigned",
            l.college?.name || "None",
            new Date(l.created_at).toLocaleString("en-IN"),
          ]);
          break;
        }

        case "applications": {
          const { data: apps } = await supabase
            .from("applications")
            .select(`
              application_number,
              application_status,
              academic_year,
              submitted_at,
              created_at,
              college:colleges(name),
              course:courses(name)
            `)
            .gte("created_at", bounds.startDate)
            .lte("created_at", bounds.endDate)
            .order("created_at", { ascending: false });

          headers = ["Application Number", "Status", "Academic Year", "College", "Course", "Submitted Date", "Created Date"];
          rows = (apps || []).map((a: any) => [
            a.application_number,
            a.application_status,
            a.academic_year || "2026-2027",
            a.college?.name || "N/A",
            a.course?.name || "N/A",
            a.submitted_at ? new Date(a.submitted_at).toLocaleString("en-IN") : "Not Submitted",
            new Date(a.created_at).toLocaleString("en-IN"),
          ]);
          break;
        }

        case "admissions": {
          const { data: admissions } = await supabase
            .from("admissions")
            .select(`
              admission_reference,
              admission_status,
              academic_year,
              admission_date,
              college:colleges(name, city),
              course:courses(name)
            `)
            .gte("created_at", bounds.startDate)
            .lte("created_at", bounds.endDate)
            .order("created_at", { ascending: false });

          headers = ["Admission Reference", "Status", "Academic Year", "Admission Date", "College", "Course"];
          rows = (admissions || []).map((adm: any) => [
            adm.admission_reference,
            adm.admission_status,
            adm.academic_year || "2026-2027",
            new Date(adm.admission_date).toLocaleDateString("en-IN"),
            adm.college?.name || "N/A",
            adm.course?.name || "N/A",
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

          const { data: counsellors } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .eq("role", "counsellor");

          const { data: leads } = await supabase.from("leads").select("assigned_counsellor_id, status");

          headers = ["Counsellor Name", "Email", "Assigned Leads", "Contacted Leads", "Admissions"];
          rows = (counsellors || []).map((c) => {
            const assigned = (leads || []).filter((l) => l.assigned_counsellor_id === c.id);
            const contacted = assigned.filter((l) => l.status !== "new");
            const admitted = assigned.filter((l) => l.status === "admitted");
            return [c.full_name || "Counsellor", c.email, assigned.length, contacted.length, admitted.length];
          });
          break;
        }

        case "colleges": {
          const { data: colleges } = await supabase.from("colleges").select("id, name, city, state, college_type");
          const { data: leads } = await supabase.from("leads").select("interested_college_id");
          const { data: apps } = await supabase.from("applications").select("college_id");

          headers = ["College Name", "City", "State", "Type", "Enquiries", "Applications"];
          rows = (colleges || []).map((col) => {
            const eCount = (leads || []).filter((l) => l.interested_college_id === col.id).length;
            const aCount = (apps || []).filter((a) => a.college_id === col.id).length;
            return [col.name, col.city || "N/A", col.state || "N/A", col.college_type, eCount, aCount];
          });
          break;
        }
      }

      const csvContent = arrayToCsv(headers, rows);

      // Audit Logging: Record export action
      const adminClient = createAdminClient();
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
        data: { filename, csvContent },
      };
    } catch (err: unknown) {
      const msg = (err as Error).message || "Report export failed";
      return { success: false, error: { code: "EXPORT_ERROR", message: msg } };
    }
  }
}
