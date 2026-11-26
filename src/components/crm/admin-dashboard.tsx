import React from "react";
import Link from "next/link";
import { AdminDashboardData } from "@/lib/crm/dashboard-metrics";
import { MetricCard } from "./metric-card";
import { PageHeader } from "./page-header";
import { StatusBadge } from "./status-badge";
import { EmptyState } from "./empty-state";
import { Button } from "@/components/ui/button";
import {
  Building2,
  BookOpen,
  Inbox,
  Users,
  FileCheck2,
  UserCheck,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface AdminDashboardProps {
  data: AdminDashboardData;
  displayName: string;
}

export function AdminDashboard({ data, displayName }: AdminDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={`Operations Dashboard — ${displayName}`}
        description="Admin Operations Console. Oversee regional counselling performance, verify student documents, and synchronize college admissions."
      >
        <Link href="/admin/colleges">
          <Button variant="primary" size="sm" className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>New College</span>
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Colleges"
          value={data.totalColleges}
          icon={Building2}
          colorVariant="purple"
          href="/admin/colleges"
          subtitle="Institutions"
        />
        <MetricCard
          title="Courses"
          value={data.totalCourses}
          icon={BookOpen}
          colorVariant="blue"
          href="/admin/courses"
          subtitle="Programs"
        />
        <MetricCard
          title="Leads"
          value={data.totalLeads}
          icon={Inbox}
          colorVariant="red"
          href="/admin/leads"
          subtitle="Inquiries"
        />
        <MetricCard
          title="Students"
          value={data.totalStudents}
          icon={Users}
          colorVariant="emerald"
          href="/admin/students"
          subtitle="Enrolled"
        />
        <MetricCard
          title="Applications"
          value={data.totalApplications}
          icon={FileCheck2}
          colorVariant="amber"
          href="/admin/applications"
          subtitle="Packets"
        />
        <MetricCard
          title="Pending Reviews"
          value={data.pendingReviewsCount}
          icon={Clock}
          colorVariant="slate"
          href="/admin/applications"
          subtitle="Need action"
        />
      </div>

      {/* Two Column Grid: Leads + Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Leads */}
        <div className="lg:col-span-7 bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                Recent Lead Intake
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Prospective students awaiting contact or counselling triage.
              </p>
            </div>
            <Link
              href="/admin/leads"
              className="text-xs font-semibold text-primary hover:text-red-700 flex items-center"
            >
              <span>Manage leads</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {data.recentLeads.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={Inbox}
                title="No Inquiries Pending"
                description="All student admission inquiries have been addressed. New inquiries will appear here."
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="py-3 font-semibold">Student Name</th>
                    <th className="py-3 font-semibold">Contact</th>
                    <th className="py-3 font-semibold">Status</th>
                    <th className="py-3 font-semibold text-right">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentLeads.map((lead) => (
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

        {/* Right: Operational Tasks & Counsellor Overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base border-b border-gray-100 pb-3">
              Operational Priority Tasks
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 block">
                    Verify Pending Application Files ({data.pendingReviewsCount})
                  </span>
                  <span className="text-gray-500 text-[11px]">
                    Review candidate 12th marks sheets and entrance test scorecards.
                  </span>
                </div>
                <Link href="/admin/applications" className="text-primary font-semibold hover:underline">
                  Review
                </Link>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 mt-0.5">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 block">
                    Counsellor Caseloads ({data.totalCounsellors})
                  </span>
                  <span className="text-gray-500 text-[11px]">
                    Monitor active lead response velocities across academic counsellors.
                  </span>
                </div>
                <Link href="/admin/counsellors" className="text-primary font-semibold hover:underline">
                  View
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
