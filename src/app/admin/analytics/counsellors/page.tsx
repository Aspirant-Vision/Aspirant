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
import { ExternalLink, Award, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function CounsellorAnalyticsPage({ searchParams }: PageProps) {
  const user = await requireAuth("/admin/login");
  const profile = await getCurrentProfile();

  if (!profile || !isStaff(profile.role)) {
    redirect("/admin/login?error=Staff+access+required");
  }

  const resolvedParams = await searchParams;
  const preset = (resolvedParams.preset as DateRangePreset) || "30d";

  const res = await AnalyticsService.getCounsellorAnalytics(profile.role, user.id, {
    preset,
  });

  const data = res.success ? res.data : null;
  const isCounsellorOnly = profile.role === "counsellor";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: "Analytics", href: "/admin/analytics" },
          { label: "Counsellor Performance" },
        ]}
        title={isCounsellorOnly ? "My Performance Dossier" : "Counsellor Performance & Efficiency Matrix"}
        description={
          isCounsellorOnly
            ? "Your workload allocation, follow-up velocity, and candidate admission conversion rates."
            : "Authorized comparative evaluation of admission counselling workload, task completion, and conversion yield."
        }
      >
        <DateRangeFilter currentPreset={preset} />
      </PageHeader>

      <AnalyticsNavTabs isCounsellorOnly={isCounsellorOnly} />

      {data ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              {isCounsellorOnly ? "Personal Workload & Outcomes" : "Counsellor Leaderboard"}
            </h3>
            <span className="text-xs font-semibold text-gray-500">{data.dateLabel}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Counsellor</th>
                  <th className="pb-3 text-center">Assigned Leads</th>
                  <th className="pb-3 text-center">Contacted</th>
                  <th className="pb-3 text-center">Follow-ups Done</th>
                  <th className="pb-3 text-center">Overdue</th>
                  <th className="pb-3 text-center">Admitted</th>
                  <th className="pb-3 text-right">Conversion Rate</th>
                  <th className="pb-3 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.counsellors.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5">
                      <div className="font-bold text-gray-900">{c.name}</div>
                      <div className="text-[11px] text-gray-400">{c.email}</div>
                    </td>
                    <td className="py-3.5 text-center font-extrabold text-gray-900">{c.assignedLeads}</td>
                    <td className="py-3.5 text-center text-gray-700">{c.contactedLeads}</td>
                    <td className="py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle className="w-3 h-3" />
                        <span>{c.completedFollowUps}</span>
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      {c.overdueFollowUps > 0 ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{c.overdueFollowUps}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="py-3.5 text-center font-extrabold text-emerald-600">
                      {c.admittedLeads}
                    </td>
                    <td className="py-3.5 text-right font-extrabold text-gray-900">
                      {c.conversionRate}%
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/admin/analytics/counsellors/${c.id}`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors inline-flex items-center"
                        title="View Individual Dossier"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-gray-500">
          Failed to load counsellor performance metrics.
        </div>
      )}
    </div>
  );
}
