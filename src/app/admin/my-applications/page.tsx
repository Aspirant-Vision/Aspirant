import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getCounsellorApplicationsAction } from "@/lib/applications/actions";
import { PageHeader } from "@/components/crm/page-header";
import { MetricCard } from "@/components/crm/metric-card";
import { ApplicationTableClient } from "@/components/crm/application-table-client";
import { FileCheck2, Clock, CheckCircle2, AlertCircle, Award } from "lucide-react";
import { ApplicationStatus } from "@/types/database.types";

interface CounsellorApplicationsPageProps {
  searchParams: Promise<{
    status?: string;
    collegeId?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function CounsellorApplicationsPage({
  searchParams,
}: CounsellorApplicationsPageProps) {
  await requireAuth("/admin/login");
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : 1;
  const status = (params.status || "all") as ApplicationStatus | "all";
  const collegeId = params.collegeId || "all";
  const search = params.search || "";

  const [appsRes, supabase] = await Promise.all([
    getCounsellorApplicationsAction({
      status,
      collegeId: collegeId !== "all" ? collegeId : undefined,
      search,
      page,
      limit: 20,
    }),
    createClient(),
  ]);

  const { data: colleges } = await supabase
    .from("colleges")
    .select("id, name")
    .order("name", { ascending: true });

  const { applications, totalCount, statusCounts } =
    appsRes.success && appsRes.data
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
        breadcrumbs={[
          { label: "Applications", href: "/admin/applications" },
          { label: "My Applications" },
        ]}
        title="My Assigned Applications"
        description="Applications assigned to you for eligibility screening, transcript verification, and university admission coordination."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Assigned to Me"
          value={totalCount}
          icon={FileCheck2}
          colorVariant="blue"
          subtitle="My application load"
        />
        <MetricCard
          title="Pending Review"
          value={statusCounts.submitted || 0}
          icon={Clock}
          colorVariant="amber"
          subtitle="Awaiting initial check"
        />
        <MetricCard
          title="Docs Needed"
          value={statusCounts.documents_required || 0}
          icon={AlertCircle}
          colorVariant="red"
          subtitle="Follow-up required"
        />
        <MetricCard
          title="Admitted"
          value={statusCounts.accepted || 0}
          icon={Award}
          colorVariant="emerald"
          subtitle="Confirmed conversions"
        />
      </div>

      {/* Filterable Table */}
      <ApplicationTableClient
        initialApplications={applications}
        totalCount={totalCount}
        statusCounts={statusCounts}
        colleges={colleges || []}
        counsellors={[]}
        currentStatus={status}
        currentCollegeId={collegeId}
        currentSearch={search}
        currentPage={page}
        limit={20}
      />
    </div>
  );
}
