import React from "react";
import { requireAuth, getCurrentProfile } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/crm/page-header";
import { ReportsExportClientView } from "@/components/crm/reports-export-client-view";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const user = await requireAuth("/admin/login");
  const profile = await getCurrentProfile();

  if (!profile || !isStaff(profile.role)) {
    redirect("/admin/login?error=Staff+access+required");
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        breadcrumbs={[
          { label: "Management", href: "/admin" },
          { label: "Reports & Export" },
        ]}
        title="Reports & Export"
        description="Select an operational dataset, configure the timeframe, and generate clean CSV spreadsheet exports directly to your device."
      />

      <ReportsExportClientView userRole={profile.role} />
    </div>
  );
}
