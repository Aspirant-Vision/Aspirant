import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/crm/page-header";
import { MetricCard } from "@/components/crm/metric-card";
import { Button } from "@/components/ui/button";
import { Award, Plus, GraduationCap, Globe2, Users } from "lucide-react";
import { getScholarshipsListingAction } from "@/lib/course/actions";
import { ScholarshipTableClient } from "@/components/crm/scholarship-table-client";

export default async function AdminScholarshipsPage() {
  await requireAdmin("/admin/login");

  const supabase = await createClient();

  const [totalRes, publishedRes] = await Promise.all([
    supabase.from("scholarships").select("*", { count: "exact", head: true }),
    supabase.from("scholarships").select("*", { count: "exact", head: true }).eq("publication_status", "published"),
  ]);

  const totalCount = totalRes.count ?? 0;
  const publishedCount = publishedRes.count ?? 0;

  const initialScholarships = await getScholarshipsListingAction({ page: 1, pageSize: 10 });
  const scholarships = initialScholarships.success && initialScholarships.data ? initialScholarships.data.scholarships : [];
  const initialTotal = initialScholarships.success && initialScholarships.data ? initialScholarships.data.totalCount : totalCount;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Scholarships" }]}
        title="Scholarships & Financial Aid Grants"
        description="Administer university tuition waivers, government fellowships, merit awards, and minority category grants."
      >
        <Link href="/admin/scholarships/new">
          <Button size="sm" className="text-xs bg-[#E31E2B] hover:bg-[#c91824] text-white">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Create Scholarship</span>
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Recorded Schemes"
          value={totalCount}
          icon={Award}
          colorVariant="purple"
          subtitle="All aid packages"
        />
        <MetricCard
          title="Live on Portal"
          value={publishedCount}
          icon={Globe2}
          colorVariant="emerald"
          subtitle="Publicly accessible"
        />
        <MetricCard
          title="Target Beneficiaries"
          value="Merit & Need Based"
          icon={Users}
          colorVariant="blue"
          subtitle="All eligible students"
        />
      </div>

      <ScholarshipTableClient
        initialScholarships={scholarships}
        initialTotal={initialTotal}
      />
    </div>
  );
}
