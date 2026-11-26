import React from "react";
import Link from "next/link";
import { requireAuth, getCurrentProfile } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { AnalyticsService } from "@/lib/analytics/service";
import { DateRangePreset } from "@/lib/analytics/types";
import { PageHeader } from "@/components/crm/page-header";
import { AnalyticsNavTabs } from "@/components/analytics/analytics-nav-tabs";
import { DateRangeFilter } from "@/components/analytics/date-range-filter";
import { Award, ExternalLink, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdmissionAnalyticsPage({ searchParams }: PageProps) {
  const user = await requireAuth("/admin/login");
  const profile = await getCurrentProfile();

  if (!profile || !isStaff(profile.role)) {
    redirect("/admin/login?error=Staff+access+required");
  }

  const resolvedParams = await searchParams;
  const preset = (resolvedParams.preset as DateRangePreset) || "30d";

  const res = await AnalyticsService.getAdmissionAnalytics(profile.role, user.id, {
    preset,
  });

  const data = res.success ? res.data : null;
  const isCounsellorOnly = profile.role === "counsellor";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: "Analytics", href: "/admin/analytics" },
          { label: "Confirmed Admissions" },
        ]}
        title="Confirmed Admissions & Enrollment Analytics"
        description="Official enrollment yields, quota allotments, and seat confirmations. Strictly audited against distinct admission reference records."
      >
        <DateRangeFilter currentPreset={preset} />
      </PageHeader>

      <AnalyticsNavTabs isCounsellorOnly={isCounsellorOnly} />

      {data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                Total Confirmed Admissions
              </span>
              <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">
                {data.totalConfirmedAdmissions}
              </span>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Official seats confirmed in {data.dateLabel}
              </span>
            </div>

            <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Admissions by Status
              </span>
              <div className="flex flex-wrap gap-2">
                {data.admissionStatuses.map((s) => (
                  <span
                    key={s.status}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200/80 text-xs font-bold text-gray-800"
                  >
                    <span className="capitalize">{s.status}:</span>
                    <span className="text-emerald-600 font-extrabold">{s.count}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Admissions Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Recent Official Admissions</h3>
              <Link
                href="/admin/admissions"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Admissions Registry</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Admission Ref</th>
                    <th className="pb-2">College</th>
                    <th className="pb-2">Course</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Academic Year</th>
                    <th className="pb-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentAdmissions.map((adm: any) => (
                    <tr key={adm.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 font-bold text-gray-900">{adm.admission_reference}</td>
                      <td className="py-2.5 text-gray-700">{adm.college?.name || "N/A"}</td>
                      <td className="py-2.5 text-gray-500">{adm.course?.name || "N/A"}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase border border-emerald-100">
                          {adm.admission_status || "Confirmed"}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-600">
                        {adm.academic_year || "2026-2027"}
                      </td>
                      <td className="py-2.5 text-right text-gray-400">
                        {new Date(adm.admission_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-gray-500">
          Failed to load admission analytics.
        </div>
      )}
    </div>
  );
}
