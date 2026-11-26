import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ScholarshipForm } from "@/components/crm/scholarship-form";

export const metadata = {
  title: "Create Scholarship | Aspirant Vision Admin",
};

export default async function NewScholarshipPage() {
  await requireAdmin("/admin/login");

  const supabase = await createClient();
  const { data: colleges } = await supabase
    .from("colleges")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto">
      <ScholarshipForm mode="create" colleges={colleges || []} />
    </div>
  );
}
