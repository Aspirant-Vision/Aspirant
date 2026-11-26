import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getPublicCollegesAction } from "@/lib/college/actions";
import { PublicCollegeCatalog } from "@/components/colleges/public-college-catalog";
import { ShieldCheck, Award, Building2, GraduationCap, Sparkles, TrendingUp, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Explore Colleges & Universities in India | Aspirant Vision",
  description:
    "Discover top engineering, medical, management, and autonomous universities across India. Verified NIRF rankings, accreditation details, and placement analytics.",
  keywords: [
    "Top Colleges India",
    "Engineering Admissions",
    "Medical Colleges",
    "MBA Admissions",
    "NIRF Rankings 2025",
    "Autonomous Institutes",
    "Aspirant Vision Colleges",
  ],
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface CollegesPageProps {
  searchParams?: Promise<{
    type?: string;
    category?: string;
    search?: string;
    q?: string;
  }>;
}

export default async function CollegesPage({ searchParams }: CollegesPageProps) {
  const resolved = searchParams ? await searchParams : {};
  const requestedType = resolved.type || resolved.category || "all";
  const requestedSearch = resolved.search || resolved.q || "";

  const initialData = await getPublicCollegesAction({
    page: 1,
    pageSize: 9,
    collegeType: requestedType !== "all" ? requestedType : undefined,
    search: requestedSearch || undefined,
  });
  const colleges = initialData.success ? initialData.data.colleges : [];
  const totalCount = initialData.success ? initialData.data.totalCount : 0;

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      {/* 1. CINEMATIC HERO BANNER WITH CAMPUS BACKGROUND */}
      <section className="relative pt-8 sm:pt-12 pb-14 sm:pb-20 overflow-hidden border-b border-[#0F143A] bg-[#0A0D28]">
        {/* Campus Background Image with dark luxury overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/auth/auth_campus_highres.jpg"
            alt="Premier University Campuses in India"
            fill
            priority
            className="object-cover object-center opacity-30 mix-blend-luminosity scale-105"
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
              <span className="text-slate-200">Institutional Directory</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-red-400 font-bold">Explore Colleges</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span>Session 2026–27 Verified Admissions Open</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>India&apos;s Verified Institutional Catalog</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                Discover Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-rose-400">Colleges &amp; Universities</span> in India
              </h1>

              <p className="font-body text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                Explore premier engineering, medical, management, and autonomous institutions with verified NIRF rankings, NAAC A++ accreditations, placement records, and 1-on-1 official admission counselling.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Govt &amp; AICTE Approved</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Pan-India Campuses</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Free Expert Counselling</span>
                </div>
              </div>
            </div>

            {/* Right Quick Metric Highlights */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-white">
                <div className="text-2xl sm:text-3xl font-extrabold text-red-400 font-display">2,500+</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">Verified Colleges</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Across India</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-white">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">₹1.15 CPA</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">Highest CTC</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Top Placement</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-white">
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-display">100%</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">Ethical Process</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Direct Admission</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-white">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-display">50,000+</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">Students Guided</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Since 2018</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATALOG SECTION */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PublicCollegeCatalog
          initialColleges={colleges}
          initialTotal={totalCount}
          initialType={requestedType}
          initialSearch={requestedSearch}
        />
      </section>
    </div>
  );
}
