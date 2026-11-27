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
      {/* 1. PRESTIGIOUS EDITORIAL HERO (Bright, inspiring, crisp academic library showcase) */}
      <section className="relative pt-6 sm:pt-10 pb-10 sm:pb-14 overflow-hidden border-b border-[#E7E9F0] bg-white">
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

          {/* Hero Grid: Narrative (Left) + Crisp Academic Showcase (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headlines, Trust Marks & Quick Metrics */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
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
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 text-xs text-gray-700 font-semibold">
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

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-2 max-w-xl">
                <div className="p-3 rounded-xl bg-[#FAFBFD] border border-gray-200/80">
                  <span className="block font-display font-extrabold text-lg sm:text-2xl text-[#15182D]">150+</span>
                  <span className="block text-[11px] text-gray-500 font-medium leading-tight">Accredited Curricula</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAFBFD] border border-gray-200/80">
                  <span className="block font-display font-extrabold text-lg sm:text-2xl text-[#E31E2B]">10,000+</span>
                  <span className="block text-[11px] text-gray-500 font-medium leading-tight">Course Specializations</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAFBFD] border border-gray-200/80">
                  <span className="block font-display font-extrabold text-lg sm:text-2xl text-blue-600">100%</span>
                  <span className="block text-[11px] text-gray-500 font-medium leading-tight">Verified Admission Paths</span>
                </div>
              </div>
            </div>

            {/* Right Column: Crisp High-Resolution Academic Library Photography Showcase (No white fog, no shadows) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl sm:rounded-3xl border border-gray-200/90 overflow-hidden bg-slate-100 aspect-[16/11] sm:aspect-[4/3] lg:aspect-[16/12]">
                <Image
                  src="/images/auth/campus_library.jpg"
                  alt="Premier Academic Programs & Degrees in India"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center"
                />
                {/* Crisp Dark Scrim at bottom for crystal clear caption contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Floating Tags */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#15182D] text-[11px] font-extrabold border border-white/60">
                    📚 Degree Catalog
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#E31E2B] text-white text-[10px] font-extrabold tracking-wide">
                    UGC &amp; AICTE Approved
                  </span>
                </div>

                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                  <p className="text-xs sm:text-sm font-extrabold leading-tight">
                    Engineering, Medical, Management, Law &amp; Tech
                  </p>
                  <p className="text-[11px] text-gray-200 mt-0.5">
                    Verified duration, eligibility requirements &amp; direct intake counselling
                  </p>
                </div>
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
