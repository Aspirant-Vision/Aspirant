import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getAdminApplicationsAction } from "@/lib/applications/actions";
import { PageHeader } from "@/components/crm/page-header";
import { MetricCard } from "@/components/crm/metric-card";
import { ApplicationTableClient } from "@/components/crm/application-table-client";
import { FileCheck2, Clock, CheckCircle2, AlertCircle, Award, Users } from "lucide-react";
import { ApplicationStatus } from "@/types/database.types";

interface AdminApplicationsPageProps {
  searchParams: Promise<{
    status?: string;
    collegeId?: string;
    counsellorId?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AdminApplicationsPage({
  searchParams,
}: AdminApplicationsPageProps) {
  await requireAuth("/admin/login");
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : 1;
  const status = (params.status || "all") as ApplicationStatus | "all";
  const collegeId = params.collegeId || "all";
  const search = params.search || "";

  const [appsRes, supabase] = await Promise.all([
    getAdminApplicationsAction({
      status,
      collegeId: collegeId !== "all" ? collegeId : undefined,
      counsellorId: params.counsellorId,
      search,
      page,
      limit: 20,
    }),
    createClient(),
  ]);

  const [{ data: colleges }, { data: counsellors }] = await Promise.all([
    supabase.from("colleges").select("id, name").order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "counsellor")
      .order("full_name", { ascending: true }),
  ]);

  const { applications, totalCount, statusCounts } = appsRes.success && appsRes.data
    ? appsRes.data
    : {
        applications: [],
        totalCount: 0,
        statusCounts: {
          total: 0,
          submitted: 0,
          under_review: 0,
          documents_required: 0,
          verified: 0,
          accepted: 0,
          rejected: 0,
        },
      };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Applications" }]}
        title="College Applications & Verification Desk"
        description="Review student admission dossiers, verify academic credentials, request replacement documents, and coordinate institutional approvals."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Applications"
          value={statusCounts.total || 0}
          icon={FileCheck2}
          colorVariant="blue"
          subtitle="All submitted packets"
        />
        <MetricCard
          title="Under Review"
          value={statusCounts.under_review || 0}
          icon={Clock}
          colorVariant="amber"
          subtitle="Active counsellor evaluations"
        />
        <MetricCard
          title="Documents Required"
          value={statusCounts.documents_required || 0}
          icon={AlertCircle}
          colorVariant="red"
          subtitle="Awaiting student uploads"
        />
        <MetricCard
          title="Admissions Approved"
          value={statusCounts.accepted || 0}
          icon={Award}
          colorVariant="emerald"
          subtitle="Ready for enrollment"
        />
      </div>

      {/* Filterable Table */}
      <ApplicationTableClient
        initialApplications={applications}
        totalCount={totalCount}
        statusCounts={statusCounts}
        colleges={colleges || []}
        counsellors={(counsellors || []).map((c) => ({
          id: c.id,
          full_name: c.full_name || "Counsellor",
        }))}
        currentStatus={status}
        currentCollegeId={collegeId}
        currentSearch={search}
        currentPage={page}
        limit={20}
      />
    </div>
  );
}
