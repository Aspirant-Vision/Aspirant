import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { FeeForm } from "@/components/crm/fee-form";

export const metadata = {
  title: "Add Fee Structure | Aspirant Vision Admin",
};

export default async function NewFeePage() {
  await requireAdmin("/admin/login");

  const supabase = await createClient();
  const { data: associations } = await supabase
    .from("college_courses")
    .select("id, colleges(name), courses(name)")
    .order("created_at", { ascending: false });

  const collegeCourses = (associations || []).map((a: any) => ({
    id: a.id,
    collegeName: a.colleges?.name || "College",
    courseName: a.courses?.name || "Course",
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <FeeForm mode="create" collegeCourses={collegeCourses} />
    </div>
  );
}
