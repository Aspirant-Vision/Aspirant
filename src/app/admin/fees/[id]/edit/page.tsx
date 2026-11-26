import React from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { FeeForm } from "@/components/crm/fee-form";

interface EditFeePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFeePage({ params }: EditFeePageProps) {
  await requireAdmin("/admin/login");

  const { id } = await params;
  const supabase = await createClient();

  const [feeRes, associationsRes] = await Promise.all([
    supabase.from("college_fees").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("college_courses")
      .select("id, colleges(name), courses(name)")
      .order("created_at", { ascending: false }),
  ]);

  if (!feeRes.data) {
    notFound();
  }

  const collegeCourses = (associationsRes.data || []).map((a: any) => ({
    id: a.id,
    collegeName: a.colleges?.name || "College",
    courseName: a.courses?.name || "Course",
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <FeeForm mode="edit" initialData={feeRes.data} collegeCourses={collegeCourses} />
    </div>
  );
}
