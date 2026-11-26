import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/crm/page-header";
import { MetricCard } from "@/components/crm/metric-card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Globe2, FileText, Star } from "lucide-react";
import { getCollegesListingAction } from "@/lib/college/actions";
import { CollegeTableClient } from "@/components/crm/college-table-client";

export default async function AdminCollegesPage() {
  await requireAdmin("/admin/login");

  const supabase = await createClient();

  // Parallel metric counts
  const [totalRes, publishedRes, draftRes, featuredRes] = await Promise.all([
    supabase.from("colleges").select("*", { count: "exact", head: true }),
    supabase.from("colleges").select("*", { count: "exact", head: true }).eq("publication_status", "published"),
    supabase.from("colleges").select("*", { count: "exact", head: true }).eq("publication_status", "draft"),
    supabase.from("colleges").select("*", { count: "exact", head: true }).eq("is_featured", true),
  ]);

  const totalCount = totalRes.count ?? 0;
  const publishedCount = publishedRes.count ?? 0;
  const draftCount = draftRes.count ?? 0;
  const featuredCount = featuredRes.count ?? 0;

  // Initial listing
  const initialListing = await getCollegesListingAction({
    page: 1,
    pageSize: 10,
    sortBy: "updated_at",
    sortOrder: "desc",
  });

  const colleges = initialListing.success ? initialListing.data.colleges : [];
  const initialTotal = initialListing.success ? initialListing.data.totalCount : totalCount;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Colleges" }]}
        title="Colleges & Universities Directory"
        description="Manage institutional profiles, regional campuses, NIRF rankings, accreditations, media galleries, and admission statuses."
      >
        <Link href="/admin/colleges/new">
          <Button size="sm" className="text-xs bg-[#E31E2B] hover:bg-[#c91824] text-white">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add New College</span>
          </Button>
        </Link>
      </PageHeader>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Colleges"
          value={totalCount}
          icon={Building2}
          colorVariant="purple"
          subtitle="All recorded institutes"
        />
        <MetricCard
          title="Live on Portal"
          value={publishedCount}
          icon={Globe2}
          colorVariant="emerald"
          subtitle="Publicly discoverable"
        />
        <MetricCard
          title="Draft / Unpublished"
          value={draftCount}
          icon={FileText}
          colorVariant="amber"
          subtitle="Under preparation"
        />
        <MetricCard
          title="Featured Institutes"
          value={featuredCount}
          icon={Star}
          colorVariant="blue"
          subtitle="Priority placement"
        />
      </div>

      {/* INTERACTIVE TABLE & FILTERS */}
      <CollegeTableClient
        initialColleges={colleges}
        initialTotal={initialTotal}
      />
    </div>
  );
}
