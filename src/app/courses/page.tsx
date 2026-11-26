import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getPublicCoursesAction } from "@/lib/course/actions";
import { PublicCourseCatalog } from "@/components/courses/public-course-catalog";
import { GraduationCap, ShieldCheck, Award, Layers, Sparkles, ChevronRight, BookOpen, Clock } from "lucide-react";

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
      {/* 1. PRESTIGIOUS EDITORIAL HERO (Bright, inspiring, academic campus library backdrop) */}
      <section className="relative pt-6 sm:pt-10 pb-12 sm:pb-16 overflow-hidden border-b border-[#E7E9F0] bg-white">
        {/* Subtle Academic Library / Campus Architectural Photography in Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/auth/campus_library.jpg"
            alt="Premier Academic Programs & Degrees in India"
            fill
            priority
            className="object-cover object-[80%_center] opacity-15"
          />
          {/* Ambient luminous white-to-soft-slate gradient for crystal-clear readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/75" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-radial from-red-500/5 to-transparent pointer-events-none" />
        </div>

        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation & Live Status Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <nav className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <Link href="/" className="hover:text-[#E31E2B] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-600">Curricula</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[#E31E2B] font-bold">Courses &amp; Degrees</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#E31E2B] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#E31E2B] animate-pulse" />
              <span>Session 2026–27 Syllabi &amp; Cutoffs Live</span>
            </div>
          </div>

          {/* Editorial Title & Overview */}
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#E31E2B]" />
              <span>Verified Degree &amp; Specialization Catalog</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#15182D] tracking-tight leading-[1.12]">
              Explore India&apos;s <span className="text-[#E31E2B]">Flagship Programs</span> &amp; Specializations
            </h1>

            <p className="font-body text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
              Discover accredited degree programs with verified UGC &amp; AICTE compliant syllabi, entrance exam requirements, duration benchmarks, and participating campus intakes.
            </p>

            {/* Trust Highlights Row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-1 text-xs text-gray-700 font-semibold">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>AICTE &amp; UGC Compliant Curricula</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Multi-Campus Verified Intakes</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                <ShieldCheck className="w-4 h-4 text-[#E31E2B] shrink-0" />
                <span>Free Academic Advisory</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATALOG SECTION */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
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
