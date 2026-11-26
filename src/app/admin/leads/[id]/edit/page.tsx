import React from "react";
import { notFound } from "next/navigation";
import { requireCounsellor } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/crm/page-header";
import { LeadForm } from "@/components/crm/lead-form";
import { getLeadByIdAction } from "@/lib/crm/actions";

interface EditLeadPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLeadPage({ params }: EditLeadPageProps) {
  const { id } = await params;
  await requireCounsellor("/admin/login");

  const [leadRes, counsellorsRes, collegesRes, coursesRes] = await Promise.all([
    getLeadByIdAction(id),
    (await createClient())
      .from("user_roles")
      .select("user_id, profiles:user_id(id, full_name, email, account_status)")
      .eq("role", "counsellor"),
    (await createClient())
      .from("colleges")
      .select("id, name")
      .eq("publication_status", "published")
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    (await createClient())
      .from("courses")
      .select("id, name")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("name", { ascending: true }),
  ]);

  if (!leadRes.success || !leadRes.data) {
    notFound();
  }

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
          { label: leadRes.data.lead.full_name, href: `/admin/leads/${id}` },
          { label: "Edit" },
        ]}
        title={`Edit Lead: ${leadRes.data.lead.full_name}`}
        description="Update student contact information, qualification details, interested institutions, or priority assignment."
      />

      <LeadForm
        leadId={id}
        initialData={leadRes.data.lead}
        counsellors={counsellors}
        colleges={colleges}
        courses={courses}
        isEditMode={true}
      />
    </div>
  );
}
