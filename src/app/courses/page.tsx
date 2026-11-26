import React from "react";
import { Metadata } from "next";
import { getPublicCoursesAction } from "@/lib/course/actions";
import { PublicCourseCatalog } from "@/components/courses/public-course-catalog";
import { GraduationCap, ShieldCheck, Award, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Explore Degree Programs & Specializations | Aspirant Vision",
  description:
    "Discover premier academic courses in Engineering, Management, Medical, Law, and Sciences. Verified syllabi, eligibility criteria, and college intake records.",
  keywords: [
    "B.Tech admissions",
    "MBA programs India",
    "MBBS courses",
    "Law degrees",
    "Course eligibility",
    "Aspirant Vision Courses",
  ],
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface CoursesPageProps {
  searchParams?: Promise<{
    category?: string;
    stream?: string;
    degree?: string;
    search?: string;
    q?: string;
  }>;
}

export default async function PublicCoursesPage({ searchParams }: CoursesPageProps) {
  const resolved = searchParams ? await searchParams : {};
  const requestedCategory = resolved.category || resolved.stream || "all";
  const requestedDegree = resolved.degree || "all";
  const requestedSearch = resolved.search || resolved.q || "";

  const initialData = await getPublicCoursesAction({
    page: 1,
    pageSize: 9,
    category: requestedCategory !== "all" ? requestedCategory : undefined,
    degreeType: requestedDegree !== "all" ? requestedDegree : undefined,
    search: requestedSearch || undefined,
  });
  const courses = initialData.success ? initialData.data.courses : [];
  const totalCount = initialData.success ? initialData.data.totalCount : 0;

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      {/* HERO BANNER */}
      <section className="bg-linear-to-b from-white to-[#F7F8FC] border-b border-gray-200/60 py-12 sm:py-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-[#E31E2B]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Degree & Specialization Catalog</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#15182D] tracking-tight leading-tight">
              Explore Academic Programs & Top Specializations
            </h1>

            <p className="font-body text-sm sm:text-base text-gray-600 leading-relaxed">
              Find the right career path with comprehensive curriculum outlines, eligibility benchmarks, duration requirements, and affiliated colleges across India.
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-gray-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>AICTE / UGC Compliant Curricula</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-500" />
                <span>Multi-Campus Intakes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <span>Admission Guidance Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG SECTION */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PublicCourseCatalog
          initialCourses={courses}
          initialTotal={totalCount}
          initialCategory={requestedCategory}
          initialDegree={requestedDegree}
          initialSearch={requestedSearch}
        />
      </section>
    </div>
  );
}
