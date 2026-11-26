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
import { Building2, Bookmark, Inbox, FileCheck2, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function CollegeDemandAnalyticsPage({ searchParams }: PageProps) {
  const user = await requireAuth("/admin/login");
  const profile = await getCurrentProfile();

  if (!profile || !isStaff(profile.role)) {
    redirect("/admin/login?error=Staff+access+required");
  }

  const resolvedParams = await searchParams;
  const preset = (resolvedParams.preset as DateRangePreset) || "30d";

  const res = await AnalyticsService.getCollegeAnalytics(profile.role, user.id, {
    preset,
  });

  const data = res.success ? res.data : null;
  const isCounsellorOnly = profile.role === "counsellor";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: "Analytics", href: "/admin/analytics" },
          { label: "Institutional Demand" },
        ]}
        title="College & Course Demand Intelligence"
        description="Rankings based on student shortlist actions, admission queries, and completed application dossiers."
      >
        <DateRangeFilter currentPreset={preset} />
      </PageHeader>

      <AnalyticsNavTabs isCounsellorOnly={isCounsellorOnly} />

      {data ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Institutional Demand Leaderboard</h3>
            <span className="text-xs font-semibold text-gray-500">{data.dateLabel}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Institution</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3 text-center">Shortlists</th>
                  <th className="pb-3 text-center">Enquiries</th>
                  <th className="pb-3 text-center">Applications</th>
                  <th className="pb-3 text-right">Demand Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.collegeDemand.map((col, index) => (
                  <tr key={col.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <Link href={`/admin/colleges/${col.id}`} className="hover:text-primary">
                        {col.name}
                      </Link>
                    </td>
                    <td className="py-3.5 text-gray-500">{col.location || "Pan-India"}</td>
                    <td className="py-3.5 text-center font-semibold text-purple-700 bg-purple-50/40 rounded-lg">
                      {col.shortlistsCount}
                    </td>
                    <td className="py-3.5 text-center font-semibold text-amber-700 bg-amber-50/40 rounded-lg">
                      {col.leadsCount}
                    </td>
                    <td className="py-3.5 text-center font-semibold text-blue-700 bg-blue-50/40 rounded-lg">
                      {col.appsCount}
                    </td>
                    <td className="py-3.5 text-right font-extrabold text-gray-900">
                      {col.demandScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-gray-500">
          Failed to load college demand intelligence.
        </div>
      )}
    </div>
  );
}
