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
import { FileCheck2, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ApplicationAnalyticsPage({ searchParams }: PageProps) {
  const user = await requireAuth("/admin/login");
  const profile = await getCurrentProfile();

  if (!profile || !isStaff(profile.role)) {
    redirect("/admin/login?error=Staff+access+required");
  }

  const resolvedParams = await searchParams;
  const preset = (resolvedParams.preset as DateRangePreset) || "30d";

  const res = await AnalyticsService.getApplicationAnalytics(profile.role, user.id, {
    preset,
  });

  const data = res.success ? res.data : null;
  const isCounsellorOnly = profile.role === "counsellor";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: "Analytics", href: "/admin/analytics" },
          { label: "Application Velocity" },
        ]}
        title="Application Velocity & Verification Analytics"
        description="Tracking dossier completion rates, verification backlogs, document requests, and admission decision turnaround."
      >
        <DateRangeFilter currentPreset={preset} />
      </PageHeader>

      <AnalyticsNavTabs isCounsellorOnly={isCounsellorOnly} />

      {data ? (
        <>
          {/* Status Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Drafts</span>
              <span className="text-xl font-extrabold text-gray-500 mt-0.5 block">{data.statusCounts.draft}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Submitted</span>
              <span className="text-xl font-extrabold text-blue-600 mt-0.5 block">{data.statusCounts.submitted}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Under Review</span>
              <span className="text-xl font-extrabold text-indigo-600 mt-0.5 block">{data.statusCounts.under_review}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Docs Required</span>
              <span className="text-xl font-extrabold text-amber-600 mt-0.5 block">{data.statusCounts.documents_required}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Accepted</span>
              <span className="text-xl font-extrabold text-emerald-600 mt-0.5 block">{data.statusCounts.accepted}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Rejected / Waitlist</span>
              <span className="text-xl font-extrabold text-rose-600 mt-0.5 block">
                {data.statusCounts.rejected + data.statusCounts.waitlisted}
              </span>
            </div>
          </div>

          {/* Recent Applications Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Recent Applications Submitted</h3>
              <Link
                href="/admin/applications"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>View Applications CRM</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Application #</th>
                    <th className="pb-2">College</th>
                    <th className="pb-2">Course</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Submission Date</th>
                    <th className="pb-2 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentApplications.map((a: any) => (
                    <tr key={a.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 font-bold text-gray-900">{a.application_number}</td>
                      <td className="py-2.5 text-gray-700">{a.college?.name || "N/A"}</td>
                      <td className="py-2.5 text-gray-500">{a.course?.name || "N/A"}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 uppercase border border-blue-100">
                          {a.application_status}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-400">
                        {a.submitted_at
                          ? new Date(a.submitted_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                          : "Draft"}
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          href={`/admin/applications/${a.id}/review`}
                          className="text-primary hover:underline font-bold text-[11px]"
                        >
                          Review
                        </Link>
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
          Failed to load application analytics.
        </div>
      )}
    </div>
  );
}
