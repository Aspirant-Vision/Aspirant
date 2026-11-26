import React from "react";
import { notFound } from "next/navigation";
import { requireCounsellor } from "@/lib/auth/session";
import { PageHeader } from "@/components/crm/page-header";
import { LeadDetailClient } from "@/components/crm/lead-detail-client";
import { getLeadByIdAction } from "@/lib/crm/actions";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const profile = await requireCounsellor("/admin/login");

  const res = await getLeadByIdAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const { lead, activities, followUps, assignments, counsellors, studentApplications } =
    res.data;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Leads CRM", href: "/admin/leads" },
          { label: lead.full_name },
        ]}
        title={`Lead 360: ${lead.full_name}`}
        description="Complete student profile, counselling engagement history, scheduled follow-ups, and enrollment progress."
      />

      <LeadDetailClient
        lead={lead}
        activities={activities}
        followUps={followUps}
        assignments={assignments}
        counsellors={counsellors}
        studentApplications={studentApplications}
        currentUserRole={profile.role}
      />
    </div>
  );
}
