import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/crm/page-header";
import { MetricCard } from "@/components/crm/metric-card";
import { EmptyState } from "@/components/crm/empty-state";
import {
  TrendingUp,
  Users,
  Award,
  AlertTriangle,
  CheckCircle2,
  Inbox,
  ArrowRight,
} from "lucide-react";
import { getCounsellorPerformanceAction } from "@/lib/crm/actions";
import { cn } from "@/lib/utils";

export default async function CounsellorPerformancePage() {
  await requireAdmin("/admin/login");

  const res = await getCounsellorPerformanceAction();
  const counsellors = res.success && res.data ? res.data : [];

  const totalCounsellors = counsellors.length;
  const totalAssigned = counsellors.reduce((sum, c) => sum + c.totalAssignedLeads, 0);
  const totalConverted = counsellors.reduce((sum, c) => sum + c.convertedLeads, 0);
  const totalOverdue = counsellors.reduce((sum, c) => sum + c.overdueFollowUps, 0);
  const avgConversion = totalAssigned > 0 ? Math.round((totalConverted / totalAssigned) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Leads CRM", href: "/admin/leads" },
          { label: "Counsellor Performance" },
        ]}
        title="Counsellor Workload & Conversion Analytics"
        description="Monitor staff workload distribution, lead conversion efficiency, follow-up SLA adherence, and team performance metrics."
      />

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Active Counsellors"
          value={totalCounsellors}
          icon={Users}
          colorVariant="blue"
          subtitle="Team members"
        />
        <MetricCard
          title="Total Assigned Leads"
          value={totalAssigned}
          icon={Inbox}
          colorVariant="purple"
          subtitle="Across active pipeline"
        />
        <MetricCard
          title="Team Conversion Rate"
          value={`${avgConversion}%`}
          icon={TrendingUp}
          colorVariant="emerald"
          subtitle={`${totalConverted} students admitted`}
        />
        <MetricCard
          title="Total Overdue Tasks"
          value={totalOverdue}
          icon={AlertTriangle}
          colorVariant="red"
          subtitle="Follow-ups requiring action"
        />
      </div>

      {/* PERFORMANCE TABLE */}
      {counsellors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Counsellors Registered"
          description="There are currently no staff members with the Counsellor role in the platform database."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 bg-gray-50/70 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Counsellor Name</th>
                  <th className="py-3.5 px-4 text-center">Active Leads</th>
                  <th className="py-3.5 px-4 text-center">Contacted</th>
                  <th className="py-3.5 px-4 text-center">Interested</th>
                  <th className="py-3.5 px-4 text-center">Admitted</th>
                  <th className="py-3.5 px-4">Conversion Rate</th>
                  <th className="py-3.5 px-4 text-center">Follow-ups Done</th>
                  <th className="py-3.5 px-4 text-center">Overdue Tasks</th>
                  <th className="py-3.5 px-4 text-right">Workload Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {counsellors.map((c) => {
                  let loadBadge = { label: "Optimal", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
                  if (c.activeLeads > 40) {
                    loadBadge = { label: "Overloaded", color: "bg-rose-50 text-rose-700 border-rose-200" };
                  } else if (c.activeLeads > 20) {
                    loadBadge = { label: "Heavy", color: "bg-amber-50 text-amber-700 border-amber-200" };
                  } else if (c.activeLeads < 5) {
                    loadBadge = { label: "Light", color: "bg-blue-50 text-blue-700 border-blue-200" };
                  }

                  return (
                    <tr key={c.counsellorId} className="hover:bg-gray-50/70 transition-colors">
                      {/* Counsellor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            {c.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-xs">{c.fullName}</div>
                            <div className="text-[10px] text-gray-400">{c.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Active Leads */}
                      <td className="py-3.5 px-4 text-center font-bold text-gray-800">
                        {c.activeLeads}
                      </td>

                      {/* Contacted */}
                      <td className="py-3.5 px-4 text-center text-gray-600">
                        {c.contactedLeads}
                      </td>

                      {/* Interested */}
                      <td className="py-3.5 px-4 text-center text-amber-700 font-semibold">
                        {c.interestedLeads}
                      </td>

                      {/* Admitted */}
                      <td className="py-3.5 px-4 text-center text-emerald-700 font-bold">
                        {c.convertedLeads}
                      </td>

                      {/* Conversion Rate */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, c.conversionRate)}%` }}
                            />
                          </div>
                          <span className="font-bold text-xs text-gray-900">
                            {c.conversionRate}%
                          </span>
                        </div>
                      </td>

                      {/* Follow-ups Done */}
                      <td className="py-3.5 px-4 text-center text-emerald-600 font-medium">
                        {c.completedFollowUps}
                      </td>

                      {/* Overdue Tasks */}
                      <td className="py-3.5 px-4 text-center">
                        {c.overdueFollowUps > 0 ? (
                          <span className="text-rose-600 font-bold">
                            {c.overdueFollowUps}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>

                      {/* Workload Status */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                            loadBadge.color
                          )}
                        >
                          {loadBadge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
