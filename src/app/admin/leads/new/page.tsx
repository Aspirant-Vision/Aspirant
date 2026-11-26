import React from "react";
import { requireCounsellor } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/crm/page-header";
import { LeadForm } from "@/components/crm/lead-form";

export default async function NewLeadPage() {
  await requireCounsellor("/admin/login");
  const supabase = await createClient();

  const [counsellorsRes, collegesRes, coursesRes] = await Promise.all([
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

  const counsellors = (counsellorsRes.data || [])
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
        breadcrumbs={[
          { label: "Leads CRM", href: "/admin/leads" },
          { label: "New Lead" },
        ]}
        title="Create Student Lead"
        description="Manually register an inbound admission enquiry received via phone, WhatsApp, referral, or educational expo."
      />

      <LeadForm
        counsellors={counsellors}
        colleges={colleges}
        courses={courses}
      />
    </div>
  );
}
