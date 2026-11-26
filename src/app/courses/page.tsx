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
      {/* 1. CINEMATIC HERO BANNER WITH ACADEMIC LIBRARY BACKGROUND */}
      <section className="relative pt-8 sm:pt-12 pb-14 sm:pb-20 overflow-hidden border-b border-[#0F143A] bg-[#0A0D28]">
        {/* Background Image with dark luxury overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/auth/campus_library.jpg"
            alt="Premier Academic Programs & Degrees"
            fill
            priority
            className="object-cover object-center opacity-25 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080B22]/95 via-[#0C1133]/90 to-[#080B22]/95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/15 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] pointer-events-none" />
        </div>

        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb & Live Session Chip */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-200">Academic Programs</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-red-400 font-bold">Courses &amp; Degrees</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span>Session 2026–27 Curriculum &amp; Intake Live</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>Verified Academic Degree &amp; Specialization Catalog</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                Explore Academic Programs &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-rose-400">Top Specializations</span>
              </h1>

              <p className="font-body text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                Find the right career path with comprehensive curriculum blueprints, UGC/AICTE compliance, eligibility benchmarks, duration requirements, and affiliated top college intake data.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>AICTE / UGC Compliant Curricula</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>Multi-Campus Intakes</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Free Admission Counselling</span>
                </div>
              </div>
            </div>

            {/* Right Quick Metric Highlights */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-white">
                <div className="text-2xl sm:text-3xl font-extrabold text-red-400 font-display">500+</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">Degree Programs</div>
                <div className="text-[11px] text-slate-400 mt-0.5">UG, PG &amp; Diplomas</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-white">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">100%</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">Verified Eligibility</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Cutoffs &amp; Syllabi</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-white">
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-display">35+</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">Disciplines</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Engineering to Law</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-white">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-display">Fast-Track</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">Direct Counselling</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Session 2026–27</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATALOG SECTION */}
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
