import React from "react";
import { requireAuth, getCurrentProfile } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/crm/page-header";
import { AnalyticsNavTabs } from "@/components/analytics/analytics-nav-tabs";
import { ReportsExportClientView } from "@/components/crm/reports-export-client-view";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const user = await requireAuth("/admin/login");
  const profile = await getCurrentProfile();

  if (!profile || !isStaff(profile.role)) {
    redirect("/admin/login?error=Staff+access+required");
  }

  const isCounsellorOnly = profile.role === "counsellor";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: "Analytics", href: "/admin/analytics" },
          { label: "Reports & Exports" },
        ]}
        title="Operational Reports & Data Exports"
        description="Generate and download secure, formula-injection-protected CSV reports across leads, applications, admissions, and institutional performance."
      />

      <AnalyticsNavTabs isCounsellorOnly={isCounsellorOnly} />

      <ReportsExportClientView userRole={profile.role} />
    </div>
  );
}
