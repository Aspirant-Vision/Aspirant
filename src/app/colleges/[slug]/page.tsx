import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCollegeBySlugPublicAction } from "@/lib/college/actions";
import { getCoursesForCollegeAction } from "@/lib/course/actions";
import { createClient } from "@/lib/supabase/server";
import { CollegeDetailClientView } from "@/components/colleges/college-detail-client-view";

interface PublicCollegeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PublicCollegeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getCollegeBySlugPublicAction(slug);

  if (!res.success || !res.data) {
    return {
      title: "College Not Found | Aspirant Vision",
    };
  }

  const college = res.data;
  const pageTitle = college.seo_title || `${college.name} - Admissions, Fees, Ranking & Placements | Aspirant Vision`;
  const pageDesc =
    college.seo_description ||
    college.short_description ||
    `Explore ${college.name} admissions, courses, fees, scholarships, NIRF rankings, and placement statistics on Aspirant Vision.`;

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      canonical: college.canonical_url || `https://aspirantvision.com/colleges/${college.slug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      images: college.og_image_url || college.cover_image_url || "/images/hero/students-hero.png",
      type: "website",
    },
    robots: {
      index: !college.no_index,
      follow: !college.no_index,
    },
  };
}

export default async function PublicCollegeDetailPage({
  params,
}: PublicCollegeDetailPageProps) {
  const { slug } = await params;
  const res = await getCollegeBySlugPublicAction(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  const college = res.data;

  // Fetch offered courses, scholarships, and related colleges in parallel
  const supabase = await createClient();
  const [coursesRes, scholarshipsRes, relatedCollegesRes] = await Promise.all([
    getCoursesForCollegeAction(college.id),
    supabase
      .from("scholarships")
      .select("*")
      .or(`college_id.eq.${college.id},college_id.is.null`)
      .eq("publication_status", "published")
      .is("deleted_at", null)
      .limit(6),
    supabase
      .from("colleges")
      .select("*")
      .eq("publication_status", "published")
      .neq("id", college.id)
      .is("deleted_at", null)
      .limit(8),
  ]);

  const offeredCourses: any[] = (coursesRes.success && coursesRes.data ? coursesRes.data : []) || [];
  const scholarships = scholarshipsRes.data || [];

  // Prioritize matching college_type or state for related colleges
  const allCandidates = relatedCollegesRes.data || [];
  const sameTypeOrState = allCandidates.filter(
    (c) => c.college_type === college.college_type || c.state === college.state
  );
  const remainingCandidates = allCandidates.filter(
    (c) => c.college_type !== college.college_type && c.state !== college.state
  );
  const relatedColleges = [...sameTypeOrState, ...remainingCandidates].slice(0, 4);

  return (
    <CollegeDetailClientView
      college={college}
      offeredCourses={offeredCourses}
      scholarships={scholarships}
      relatedColleges={relatedColleges}
    />
  );
}
