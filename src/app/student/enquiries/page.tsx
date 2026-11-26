import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { getStudentEnquiriesAction } from "@/lib/student/actions";
import { createClient } from "@/lib/supabase/server";
import { EnquiriesClientView } from "@/components/student/enquiries-client-view";

export default async function StudentEnquiriesPage() {
  await requireAuth();
  const [enquiriesRes, supabase] = await Promise.all([
    getStudentEnquiriesAction(),
    createClient(),
  ]);

  // Load active colleges and courses for selection in the enquiry modal
  const [{ data: colleges }, { data: courses }] = await Promise.all([
    supabase
      .from("colleges")
      .select("id, name")
      .eq("publication_status", "published")
      .order("name", { ascending: true })
      .limit(100),
    supabase
      .from("courses")
      .select("id, name")
      .order("name", { ascending: true })
      .limit(100),
  ]);

  const enquiries = (enquiriesRes.success && enquiriesRes.data ? enquiriesRes.data : []) || [];

  return (
    <EnquiriesClientView
      enquiries={enquiries}
      colleges={colleges || []}
      courses={courses || []}
    />
  );
}
