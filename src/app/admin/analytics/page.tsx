import React from "react";
import { requireAuth, getCurrentProfile } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { AnalyticsService } from "@/lib/analytics/service";
import { DateRangePreset } from "@/lib/analytics/types";
import { PageHeader } from "@/components/crm/page-header";
import { AnalyticsNavTabs } from "@/components/analytics/analytics-nav-tabs";
import { DateRangeFilter } from "@/components/analytics/date-range-filter";
import { KpiMetricCard } from "@/components/analytics/kpi-metric-card";
import { TrendLineChart } from "@/components/analytics/trend-line-chart";
import { FunnelBarChart } from "@/components/analytics/funnel-bar-chart";
import { DistributionDonutChart } from "@/components/analytics/distribution-donut-chart";
import {
  Inbox,
  UserCheck,
  FileCheck2,
  Award,
  TrendingUp,
  Percent,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminAnalyticsDashboardPage({ searchParams }: PageProps) {
  const user = await requireAuth("/admin/login");
  const profile = await getCurrentProfile();

  if (!profile || !isStaff(profile.role)) {
    redirect("/admin/login?error=Staff+access+required");
  }

  const resolvedParams = await searchParams;
  const preset = (resolvedParams.preset as DateRangePreset) || "30d";

  const res = await AnalyticsService.getExecutiveAnalytics(profile.role, user.id, {
    preset,
  });

  const data = res.success ? res.data : null;
  const isCounsellorOnly = profile.role === "counsellor";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: "Analytics", href: "/admin/analytics" }, { label: "Executive Overview" }]}
        title={isCounsellorOnly ? "My Performance Analytics" : "Platform Executive Analytics"}
        description={
          isCounsellorOnly
            ? "Track your lead progress, follow-up effectiveness, and conversion milestones in real-time."
            : "Centralized intelligence across student enquiries, counsellor velocity, application submissions, and confirmed seat allotments."
        }
      >
        <DateRangeFilter currentPreset={preset} />
      </PageHeader>

      {/* Analytics Section Navigation Tabs */}
      <AnalyticsNavTabs isCounsellorOnly={isCounsellorOnly} />

      {data ? (
        <>
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiMetricCard
              title="Total Enquiries"
              metric={data.totalLeads}
              icon={Inbox}
              color="rose"
              definition="Total student leads captured across all website modals and forms."
            />
            <KpiMetricCard
              title="Qualified Interest"
              metric={data.interestedLeads}
              icon={UserCheck}
              color="amber"
              definition="Leads marked as interested following initial counsellor engagement."
            />
            <KpiMetricCard
              title="Applications Submitted"
              metric={data.appsSubmitted}
              icon={FileCheck2}
              color="blue"
              definition="Formal admission applications submitted with student declarations."
            />
            <KpiMetricCard
              title="Confirmed Admissions"
              metric={data.confirmedAdmissions}
              icon={Award}
              color="emerald"
              definition="Official seat allotments with validated admission reference numbers."
            />
          </div>

          {/* Secondary Conversion Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  Lead-to-Application Conversion
                </span>
                <span className="text-3xl font-extrabold text-gray-900 mt-1 block">
                  {data.leadToAppRate}%
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Proportion of student enquiries that converted into formal applications.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Percent className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  Application-to-Admission Yield
                </span>
                <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">
                  {data.appToAdmissionRate}%
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Proportion of submitted applications resulting in confirmed enrollment.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Conversion Funnel & Time Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FunnelBarChart
              steps={data.funnelSteps}
              title="Admission Funnel Velocity"
              description="Step-by-step conversion from discovery to enrollment."
            />
            <TrendLineChart
              data={data.timeSeries}
              title="Activity Trends Over Time"
              description="Daily progression of leads, applications, and admissions."
            />
          </div>

          {/* Lead Source & Status Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DistributionDonutChart
              data={data.sourceDistribution}
              title="Leads by Acquisition Channel"
              description="Origin channels capturing student interest."
            />
            <DistributionDonutChart
              data={data.statusDistribution}
              title="Portfolio Status Distribution"
              description="Current state of candidate records in the pipeline."
            />
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-gray-500">
          Failed to load analytics data.
        </div>
      )}
    </div>
  );
}
