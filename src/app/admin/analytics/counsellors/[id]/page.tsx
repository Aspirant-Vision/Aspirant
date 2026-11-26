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
import { ArrowLeft, UserCheck, CalendarCheck, AlertTriangle, TrendingUp, Award } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function IndividualCounsellorAnalyticsPage({
  params,
  searchParams,
}: PageProps) {
  const user = await requireAuth("/admin/login");
  const profile = await getCurrentProfile();

  if (!profile || !isStaff(profile.role)) {
    redirect("/admin/login?error=Staff+access+required");
  }

  const { id } = await params;
  const isCounsellorOnly = profile.role === "counsellor";

  // Strict tenant security: Counsellors cannot inspect peers
  if (isCounsellorOnly && id !== user.id) {
    redirect("/admin/analytics/counsellors");
  }

  const resolvedParams = await searchParams;
  const preset = (resolvedParams.preset as DateRangePreset) || "30d";

  const res = await AnalyticsService.getCounsellorAnalytics(
    profile.role,
    user.id,
    { preset },
    id
  );

  const counsellor = res.success && res.data ? res.data.counsellors[0] : null;

  if (!counsellor) {
    redirect("/admin/analytics/counsellors");
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: "Analytics", href: "/admin/analytics" },
          { label: "Counsellors", href: "/admin/analytics/counsellors" },
          { label: counsellor.name },
        ]}
        title={`${counsellor.name} — Performance Dossier`}
        description={`Detailed breakdown of enquiries handled, follow-ups scheduled, and admissions secured for ${counsellor.email}.`}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/admin/analytics/counsellors"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Counsellors</span>
          </Link>
          <DateRangeFilter currentPreset={preset} />
        </div>
      </PageHeader>

      <AnalyticsNavTabs isCounsellorOnly={isCounsellorOnly} />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Assigned Leads
          </span>
          <span className="text-3xl font-extrabold text-gray-900 mt-1 block">
            {counsellor.assignedLeads}
          </span>
          <span className="text-[11px] text-gray-400 mt-1 block">Portfolio allocations</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Contacted Leads
          </span>
          <span className="text-3xl font-extrabold text-indigo-600 mt-1 block">
            {counsellor.contactedLeads}
          </span>
          <span className="text-[11px] text-gray-400 mt-1 block">Initial call or meeting</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Completed Follow-ups
          </span>
          <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">
            {counsellor.completedFollowUps}
          </span>
          <span className="text-[11px] text-gray-400 mt-1 block">Scheduled tasks fulfilled</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Overdue Follow-ups
          </span>
          <span className={`text-3xl font-extrabold mt-1 block ${counsellor.overdueFollowUps > 0 ? "text-rose-600" : "text-gray-900"}`}>
            {counsellor.overdueFollowUps}
          </span>
          <span className="text-[11px] text-gray-400 mt-1 block">Missed deadline alerts</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Conversion Yield
          </span>
          <span className="text-3xl font-extrabold text-emerald-700 mt-1 block">
            {counsellor.conversionRate}%
          </span>
          <span className="text-[11px] text-gray-400 mt-1 block">{counsellor.admittedLeads} Admitted</span>
        </div>
      </div>
    </div>
  );
}
