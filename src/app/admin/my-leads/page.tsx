import React from "react";
import Link from "next/link";
import { requireCounsellor } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/crm/page-header";
import { MetricCard } from "@/components/crm/metric-card";
import { LeadTableClient } from "@/components/crm/lead-table-client";
import { Button } from "@/components/ui/button";
import {
  Inbox,
  Clock,
  UserCheck,
  CalendarClock,
  Award,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { getLeadMetricsAction, getLeadsListingAction } from "@/lib/crm/actions";

export default async function MyLeadsPage() {
  const profile = await requireCounsellor("/admin/login");
  const supabase = await createClient();

  const [metricsRes, leadsRes, collegesRes, coursesRes] = await Promise.all([
    getLeadMetricsAction(profile.id),
    getLeadsListingAction({ page: 1, pageSize: 15, onlyMine: true }),
    supabase
      .from("colleges")
      .select("id, name")
      .eq("publication_status", "published")
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("courses")
      .select("id, name")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("name", { ascending: true }),
  ]);

  const metrics = metricsRes.success && metricsRes.data ? metricsRes.data : {
    totalLeads: 0,
    newLeads: 0,
    unassignedLeads: 0,
    assignedLeads: 0,
    contactedLeads: 0,
    interestedLeads: 0,
    followUpsDueToday: 0,
    overdueFollowUps: 0,
    applicationsStarted: 0,
    convertedLeads: 0,
    lostLeads: 0,
  };

  const initialLeads = leadsRes.success && leadsRes.data ? leadsRes.data.leads : [];
  const initialTotal = leadsRes.success && leadsRes.data ? leadsRes.data.total : 0;
  const initialPage = leadsRes.success && leadsRes.data ? leadsRes.data.page : 1;
  const initialPageSize = leadsRes.success && leadsRes.data ? leadsRes.data.pageSize : 15;
  const initialTotalPages = leadsRes.success && leadsRes.data ? leadsRes.data.totalPages : 1;

  const colleges = collegesRes.data || [];
  const courses = coursesRes.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Leads CRM", href: "/admin/leads" },
          { label: "My Assigned Leads" },
        ]}
        title={`My Lead Portfolio: ${profile.fullName || profile.email}`}
        description="Dedicated counsellor workbench: track student inquiries assigned to you, execute follow-ups, and guide students to admission."
      >
        <Link href="/admin/leads/new">
          <Button variant="primary" size="sm" className="text-xs bg-[#E31E2B] text-white">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Create Personal Lead</span>
          </Button>
        </Link>
      </PageHeader>

      {/* COUNSELLOR PERSONAL METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="My Leads"
          value={metrics.totalLeads}
          icon={Inbox}
          colorVariant="blue"
          subtitle="Assigned to you"
        />
        <MetricCard
          title="New Inquiries"
          value={metrics.newLeads}
          icon={Clock}
          colorVariant="red"
          subtitle="Pending contact"
        />
        <MetricCard
          title="Interested"
          value={metrics.interestedLeads}
          icon={UserCheck}
          colorVariant="amber"
          subtitle="Warm prospects"
        />
        <MetricCard
          title="Due Today"
          value={metrics.followUpsDueToday}
          icon={CalendarClock}
          colorVariant="purple"
          subtitle="Today's calls"
        />
        <MetricCard
          title="Overdue Tasks"
          value={metrics.overdueFollowUps}
          icon={AlertTriangle}
          colorVariant="red"
          subtitle="Needs attention"
        />
        <MetricCard
          title="Enrolled"
          value={metrics.convertedLeads}
          icon={Award}
          colorVariant="emerald"
          subtitle="Confirmed admissions"
        />
      </div>

      {/* LEAD TABLE IN COUNSELLOR-ONLY SCOPE */}
      <LeadTableClient
        initialLeads={initialLeads}
        initialTotal={initialTotal}
        initialPage={initialPage}
        initialPageSize={initialPageSize}
        initialTotalPages={initialTotalPages}
        counsellors={[{ id: profile.id, full_name: profile.fullName || "Me", email: profile.email }]}
        colleges={colleges}
        courses={courses}
        isCounsellorOnly={true}
      />
    </div>
  );
}
