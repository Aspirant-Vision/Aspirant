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
  Plus,
  Clock,
  UserCheck,
  PhoneCall,
  CalendarClock,
  Sparkles,
  Award,
  AlertTriangle,
  UserX,
} from "lucide-react";
import { getLeadMetricsAction, getLeadsListingAction } from "@/lib/crm/actions";

export default async function AdminLeadsPage() {
  const profile = await requireCounsellor("/admin/login");
  const supabase = await createClient();

  const [metricsRes, leadsRes, counsellorsRes, collegesRes, coursesRes] =
    await Promise.all([
      getLeadMetricsAction(),
      getLeadsListingAction({ page: 1, pageSize: 15 }),
      supabase
        .from("user_roles")
        .select("user_id, profiles:user_id(id, full_name, email, account_status)")
        .eq("role", "counsellor"),
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

  const activeCounsellors = (counsellorsRes.data || [])
    .filter((c: any) => c.profiles?.account_status === "active")
    .map((c: any) => ({
      id: c.profiles.id,
      full_name: c.profiles.full_name || "Staff Counsellor",
      email: c.profiles.email,
    }));

  const colleges = collegesRes.data || [];
  const courses = coursesRes.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Leads CRM" }]}
        title="Admission Inquiries & Leads CRM"
        description="Comprehensive admission pipeline: capture student inquiries, assign to regional counsellors, schedule follow-ups, and track enrollment conversions."
      >
        <Link href="/admin/leads/new">
          <Button variant="primary" size="sm" className="text-xs bg-[#E31E2B] text-white">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Create Lead</span>
          </Button>
        </Link>
      </PageHeader>

      {/* OVERVIEW METRICS GRID (100% Real Database Queries) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Total Leads"
          value={metrics.totalLeads}
          icon={Inbox}
          colorVariant="blue"
          subtitle="All inquiries"
        />
        <MetricCard
          title="New Inquiries"
          value={metrics.newLeads}
          icon={Clock}
          colorVariant="red"
          subtitle="Awaiting first touch"
        />
        <MetricCard
          title="Unassigned"
          value={metrics.unassignedLeads}
          icon={UserX}
          colorVariant="amber"
          subtitle="Needs triage"
        />
        <MetricCard
          title="Follow-ups Today"
          value={metrics.followUpsDueToday}
          icon={CalendarClock}
          colorVariant="purple"
          subtitle="Scheduled today"
        />
        <MetricCard
          title="Overdue Tasks"
          value={metrics.overdueFollowUps}
          icon={AlertTriangle}
          colorVariant="red"
          subtitle="Pending follow-up"
        />
        <MetricCard
          title="Admitted"
          value={metrics.convertedLeads}
          icon={Award}
          colorVariant="emerald"
          subtitle="Successfully enrolled"
        />
      </div>

      {/* INTERACTIVE TABLE & PIPELINE VIEW */}
      <LeadTableClient
        initialLeads={initialLeads}
        initialTotal={initialTotal}
        initialPage={initialPage}
        initialPageSize={initialPageSize}
        initialTotalPages={initialTotalPages}
        counsellors={activeCounsellors}
        colleges={colleges}
        courses={courses}
        isCounsellorOnly={profile.role === "counsellor"}
      />
    </div>
  );
}
