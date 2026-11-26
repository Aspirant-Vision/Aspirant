import React from "react";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getAdminApplicationDetailAction } from "@/lib/applications/actions";
import { ApplicationReviewWorkspace } from "@/components/crm/application-review-workspace";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminApplicationReviewPage({ params }: ReviewPageProps) {
  await requireAuth("/admin/login");
  const { id } = await params;
  const [appRes, supabase] = await Promise.all([
    getAdminApplicationDetailAction(id),
    createClient(),
  ]);

  if (!appRes.success || !appRes.data) {
    notFound();
  }

  const { data: counsellors } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "counsellor")
    .order("full_name", { ascending: true });

  return (
    <ApplicationReviewWorkspace
      application={appRes.data}
      counsellors={(counsellors || []).map((c) => ({
        id: c.id,
        full_name: c.full_name || "Counsellor",
      }))}
    />
  );
}
