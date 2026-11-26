import React from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getScholarshipByIdAction } from "@/lib/course/actions";
import { ScholarshipForm } from "@/components/crm/scholarship-form";

interface EditScholarshipPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditScholarshipPage({ params }: EditScholarshipPageProps) {
  await requireAdmin("/admin/login");

  const { id } = await params;
  const [scholarshipRes, collegesRes] = await Promise.all([
    getScholarshipByIdAction(id),
    (await createClient()).from("colleges").select("id, name").order("name", { ascending: true }),
  ]);

  if (!scholarshipRes.success || !scholarshipRes.data) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <ScholarshipForm
        mode="edit"
        initialData={scholarshipRes.data}
        colleges={collegesRes.data || []}
      />
    </div>
  );
}
