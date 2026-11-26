import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/crm/page-header";
import { MetricCard } from "@/components/crm/metric-card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, GraduationCap, Globe2, Star, Layers } from "lucide-react";
import { getCoursesListingAction } from "@/lib/course/actions";
import { CourseTableClient } from "@/components/crm/course-table-client";

export default async function AdminCoursesPage() {
  await requireAdmin("/admin/login");

  const supabase = await createClient();

  const [totalRes, publishedRes, draftRes, featuredRes] = await Promise.all([
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("publication_status", "published"),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("publication_status", "draft"),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_featured", true),
  ]);

  const totalCount = totalRes.count ?? 0;
  const publishedCount = publishedRes.count ?? 0;
  const draftCount = draftRes.count ?? 0;
  const featuredCount = featuredRes.count ?? 0;

  const initialListing = await getCoursesListingAction({
    page: 1,
    pageSize: 10,
    sortBy: "updated_at",
    sortOrder: "desc",
  });

  const courses = initialListing.success ? initialListing.data.courses : [];
  const initialTotal = initialListing.success ? initialListing.data.totalCount : totalCount;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Courses" }]}
        title="Courses & Academic Degrees"
        description="Configure undergraduate, postgraduate, and diploma programs (B.Tech, MBBS, MBA, Law) with branch specializations, eligibility rules, and multi-college offerings."
      >
        <Link href="/admin/courses/new">
          <Button size="sm" className="text-xs bg-[#E31E2B] hover:bg-[#c91824] text-white">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add New Course</span>
          </Button>
        </Link>
      </PageHeader>

      {/* METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Programs"
          value={totalCount}
          icon={BookOpen}
          colorVariant="blue"
          subtitle="Catalog courses"
        />
        <MetricCard
          title="Published & Live"
          value={publishedCount}
          icon={Globe2}
          colorVariant="emerald"
          subtitle="Publicly discoverable"
        />
        <MetricCard
          title="Draft / In Review"
          value={draftCount}
          icon={Layers}
          colorVariant="amber"
          subtitle="Awaiting publish"
        />
        <MetricCard
          title="Featured Programs"
          value={featuredCount}
          icon={Star}
          colorVariant="purple"
          subtitle="Priority spotlight"
        />
      </div>

      {/* TABLE */}
      <CourseTableClient
        initialCourses={courses as any}
        initialTotal={initialTotal}
      />
    </div>
  );
}
