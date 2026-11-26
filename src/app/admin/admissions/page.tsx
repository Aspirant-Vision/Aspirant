import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getAdminAdmissionsAction } from "@/lib/applications/actions";
import { PageHeader } from "@/components/crm/page-header";
import { MetricCard } from "@/components/crm/metric-card";
import { AdmissionsTableClient } from "@/components/crm/admissions-table-client";
import { Award, Download, CheckCircle2, FileText, UserCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminAdmissionsPageProps {
  searchParams: Promise<{
    collegeId?: string;
    academicYear?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AdminAdmissionsPage({
  searchParams,
}: AdminAdmissionsPageProps) {
  await requireAuth("/admin/login");
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : 1;
  const collegeId = params.collegeId || "all";
  const academicYear = params.academicYear || "all";
  const search = params.search || "";

  const [admissionsRes, supabase] = await Promise.all([
    getAdminAdmissionsAction({
      collegeId: collegeId !== "all" ? collegeId : undefined,
      academicYear: academicYear !== "all" ? academicYear : undefined,
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

  const { admissions, totalCount, collegeCounts } =
    admissionsRes.success && admissionsRes.data
      ? admissionsRes.data
      : { admissions: [], totalCount: 0, collegeCounts: [] };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Admissions" }]}
        title="Final Admissions & Seat Allotments"
        description="Monitor verified admission confirmations, university allotment letters, seat quotas, and official enrollment records."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Confirmed Admissions"
          value={totalCount}
          icon={Award}
          colorVariant="emerald"
          subtitle="Allotments issued"
        />
        <MetricCard
          title="Allotment Session"
          value="Session 2026-27"
          icon={FileText}
          colorVariant="blue"
          subtitle="Current active cycle"
        />
        <MetricCard
          title="Top Institution"
          value={collegeCounts[0]?.collegeName || "Partner Institutions"}
          icon={Building2}
          colorVariant="amber"
          subtitle={collegeCounts[0] ? `${collegeCounts[0].count} seats allotted` : "Active allotments"}
        />
      </div>

      {/* Admissions Table */}
      <AdmissionsTableClient
        initialAdmissions={admissions}
        totalCount={totalCount}
        colleges={colleges || []}
        currentCollegeId={collegeId}
        currentAcademicYear={academicYear}
        currentSearch={search}
        currentPage={page}
        limit={20}
      />
    </div>
  );
}
