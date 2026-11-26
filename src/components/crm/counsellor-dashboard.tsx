import React from "react";
import Link from "next/link";
import { CounsellorDashboardData } from "@/lib/crm/dashboard-metrics";
import { MetricCard } from "./metric-card";
import { PageHeader } from "./page-header";
import { StatusBadge } from "./status-badge";
import { EmptyState } from "./empty-state";
import { Button } from "@/components/ui/button";
import {
  Inbox,
  UserCheck,
  Calendar,
  AlertTriangle,
  Star,
  FileCheck2,
  PhoneCall,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

interface CounsellorDashboardProps {
  data: CounsellorDashboardData;
  displayName: string;
}

export function CounsellorDashboard({ data, displayName }: CounsellorDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={`Counselling Desk — ${displayName}`}
        description="Personalized Counsellor Workspace. Triage student admission inquiries, schedule calls, verify entrance percentiles, and guide applicants to admission."
      >
        <Link href="/admin/leads">
          <Button variant="primary" size="sm" className="text-xs">
            <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
            <span>Open Leads Pipeline</span>
          </Button>
        </Link>
      </PageHeader>

      {/* Metric Cards (Counsellor Scoped) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="My Leads"
          value={data.myAssignedLeadsCount}
          icon={UserCheck}
          colorVariant="red"
          href="/admin/leads"
          subtitle="Assigned to me"
        />
        <MetricCard
          title="New Leads"
          value={data.newLeadsCount}
          icon={Inbox}
          colorVariant="blue"
          href="/admin/leads"
          subtitle="Available in pool"
        />
        <MetricCard
          title="Due Today"
          value={data.followUpsDueTodayCount}
          icon={Calendar}
          colorVariant="amber"
          subtitle="Scheduled calls"
        />
        <MetricCard
          title="Overdue"
          value={data.overdueFollowUpsCount}
          icon={AlertTriangle}
          colorVariant={data.overdueFollowUpsCount > 0 ? "red" : "slate"}
          subtitle="Action needed"
        />
        <MetricCard
          title="Interested"
          value={data.interestedStudentsCount}
          icon={Star}
          colorVariant="emerald"
          href="/admin/leads"
          subtitle="High intent"
        />
        <MetricCard
          title="Applications"
          value={data.applicationsInProgressCount}
          icon={FileCheck2}
          colorVariant="purple"
          href="/admin/applications"
          subtitle="In pipeline"
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: My Assigned Leads */}
        <div className="lg:col-span-8 bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                My Assigned Student Leads
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Students allocated to your counselling roster for admissions follow-up.
              </p>
            </div>
            <Link
              href="/admin/leads"
              className="text-xs font-semibold text-primary hover:text-red-700 flex items-center"
            >
              <span>View full pipeline</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {data.recentAssignedLeads.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={UserCheck}
                title="No Leads Currently Assigned"
                description="You do not have any active leads assigned right now. Check the unassigned leads pool to claim new student inquiries."
                action={
                  <Link href="/admin/leads">
                    <Button variant="secondary" size="sm" className="text-xs">
                      Claim New Inquiries
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="py-3 font-semibold">Student Name</th>
                    <th className="py-3 font-semibold">Contact Info</th>
                    <th className="py-3 font-semibold">Lead Status</th>
                    <th className="py-3 font-semibold text-right">Added On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentAssignedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 font-semibold text-gray-900">
                        {lead.fullName}
                      </td>
                      <td className="py-3 text-gray-500">
                        <div>{lead.email}</div>
                        <div className="text-[10px] text-gray-400">{lead.phone}</div>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={lead.status} type="lead" />
                      </td>
                      <td className="py-3 text-gray-400 text-right">
                        {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Daily Counselling Tasks */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-gray-900 text-sm">
                Today&apos;s Counselling Priorities
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Follow-up Calls Due</span>
                  <span className="font-bold text-amber-600">{data.followUpsDueTodayCount}</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Review student rank analysis and guide college options.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Overdue Follow-ups</span>
                  <span className="font-bold text-red-600">{data.overdueFollowUpsCount}</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Reach out immediately to maintain candidate engagement.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Available Inquiries</span>
                  <span className="font-bold text-blue-600">{data.newLeadsCount}</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Unassigned incoming inquiries ready for claiming.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/admin/leads" className="block w-full">
                <Button variant="primary" size="sm" className="w-full text-xs justify-center">
                  <span>Go to Leads Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
