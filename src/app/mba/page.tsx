import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { MbaPageClient } from "@/components/mba/mba-page-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MbaLandingPage() {
  let dbMbaColleges: any[] = [];

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("colleges")
      .select(
        "id, name, slug, city, state, college_type, ownership_type, nirf_rank, naac_grade, average_placement, highest_placement, cover_image_url, entrance_exams, is_featured"
      )
      .eq("publication_status", "published")
      .is("deleted_at", null)
      .or(
        "college_type.eq.Management,college_type.eq.MBA / PGDM,name.ilike.%MBA%,name.ilike.%PGDM%,name.ilike.%Management%,name.ilike.%Business%"
      )
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (data) {
      dbMbaColleges = data;
    }
  } catch (err) {
    console.error("Failed to load MBA/PGDM colleges from DB:", err);
  }

  return <MbaPageClient dbMbaColleges={dbMbaColleges} />;
}
