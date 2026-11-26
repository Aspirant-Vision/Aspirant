import React from "react";
import { requireCounsellor } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/crm/page-header";
import { FollowUpTableClient } from "@/components/crm/follow-up-table-client";
import { getFollowUpsListingAction } from "@/lib/crm/actions";

export default async function AdminFollowUpsPage() {
  const profile = await requireCounsellor("/admin/login");
  const supabase = await createClient();

  const [followUpsRes, counsellorsRes] = await Promise.all([
    getFollowUpsListingAction({
      tab: "today",
      counsellorId: profile.role === "counsellor" ? profile.id : undefined,
    }),
    supabase
      .from("user_roles")
      .select("user_id, profiles:user_id(id, full_name, email, account_status)")
      .eq("role", "counsellor"),
  ]);

  const initialFollowUps = followUpsRes.success && followUpsRes.data ? followUpsRes.data : [];

  const counsellors = (counsellorsRes.data || [])
    .filter((c: any) => c.profiles?.account_status === "active")
    .map((c: any) => ({
      id: c.profiles.id,
      full_name: c.profiles.full_name || "Staff Counsellor",
      email: c.profiles.email,
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Leads CRM", href: "/admin/leads" },
          { label: "Follow-ups" },
        ]}
        title="Counsellor Follow-ups & Task Queue"
        description="Daily admission task workflow: scheduled callbacks, WhatsApp engagements, counselling calls, and overdue reminder tracking."
      />

      <FollowUpTableClient
        initialFollowUps={initialFollowUps}
        counsellors={counsellors}
        isCounsellorOnly={profile.role === "counsellor"}
      />
    </div>
  );
}
