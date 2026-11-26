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
import { ExternalLink, Inbox, UserCheck, Clock, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function LeadAnalyticsPage({ searchParams }: PageProps) {
  const user = await requireAuth("/admin/login");
  const profile = await getCurrentProfile();

  if (!profile || !isStaff(profile.role)) {
    redirect("/admin/login?error=Staff+access+required");
  }

  const resolvedParams = await searchParams;
  const preset = (resolvedParams.preset as DateRangePreset) || "30d";

  const res = await AnalyticsService.getLeadAnalytics(profile.role, user.id, {
    preset,
  });

  const data = res.success ? res.data : null;
  const isCounsellorOnly = profile.role === "counsellor";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: "Analytics", href: "/admin/analytics" },
          { label: "Lead Performance" },
        ]}
        title="Lead Performance & Discovery Analytics"
        description="Granular metrics on student acquisition channels, qualification ratios, and counselling conversion status."
      >
        <DateRangeFilter currentPreset={preset} />
      </PageHeader>

      <AnalyticsNavTabs isCounsellorOnly={isCounsellorOnly} />

      {data ? (
        <>
          {/* Status Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">New</span>
              <span className="text-xl font-extrabold text-blue-600 mt-0.5 block">{data.statusCounts.new}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Contacted</span>
              <span className="text-xl font-extrabold text-indigo-600 mt-0.5 block">{data.statusCounts.contacted}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Scheduled</span>
              <span className="text-xl font-extrabold text-purple-600 mt-0.5 block">{data.statusCounts.counselling_scheduled}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Interested</span>
              <span className="text-xl font-extrabold text-amber-600 mt-0.5 block">{data.statusCounts.interested}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">App Started</span>
              <span className="text-xl font-extrabold text-orange-600 mt-0.5 block">{data.statusCounts.application_started}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Submitted</span>
              <span className="text-xl font-extrabold text-cyan-600 mt-0.5 block">{data.statusCounts.application_submitted}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Admitted</span>
              <span className="text-xl font-extrabold text-emerald-600 mt-0.5 block">{data.statusCounts.admitted}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Lost / Closed</span>
              <span className="text-xl font-extrabold text-gray-400 mt-0.5 block">{data.statusCounts.lost}</span>
            </div>
          </div>

          {/* Sources and Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Leads by Channel</h3>
              <div className="divide-y divide-gray-100">
                {data.sources.map((s) => (
                  <div key={s.source} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700 capitalize">{s.source}</span>
                    <span className="font-extrabold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Recent Candidate Enquiries</h3>
                <Link
                  href="/admin/leads"
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>View All Leads</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-2">Candidate</th>
                      <th className="pb-2">Source</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Assigned Staff</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.recentLeads.map((l: any) => (
                      <tr key={l.id} className="hover:bg-gray-50/50">
                        <td className="py-2.5 font-bold text-gray-900">
                          <Link href={`/admin/leads/${l.id}`} className="hover:text-primary">
                            {l.full_name}
                          </Link>
                        </td>
                        <td className="py-2.5 text-gray-500 capitalize">{l.source?.replace(/_/g, " ") || "Organic"}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">
                            {l.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-600">{l.counsellor?.full_name || "Unassigned"}</td>
                        <td className="py-2.5 text-gray-400">
                          {new Date(l.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-gray-500">
          Failed to load lead analytics.
        </div>
      )}
    </div>
  );
}
