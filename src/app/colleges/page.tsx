import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getPublicCollegesAction } from "@/lib/college/actions";
import { PublicCollegeCatalog } from "@/components/colleges/public-college-catalog";
import { ShieldCheck, Award, Building2, GraduationCap, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";

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
    pageSize: 12,
    collegeType: requestedType !== "all" ? requestedType : undefined,
    search: requestedSearch || undefined,
  });
  const colleges = initialData.success ? initialData.data.colleges : [];
  const totalCount = initialData.success ? initialData.data.totalCount : 0;

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      {/* 1. PRESTIGIOUS EDITORIAL HERO (Bright, inspiring, authentic campus architectural backdrop) */}
      <section className="relative pt-6 sm:pt-10 pb-12 sm:pb-16 overflow-hidden border-b border-[#E7E9F0] bg-white">
        {/* Subtle Campus Architectural Photography in Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/auth/auth_campus_highres.jpg"
            alt="Premier University Campuses in India"
            fill
            priority
            className="object-cover object-[80%_center] opacity-15"
          />
          {/* Ambient luminous white-to-soft-slate gradient for crystal-clear readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/70" />
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
              <span className="text-gray-600">Institutions</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[#E31E2B] font-bold">Colleges &amp; Universities</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#E31E2B] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#E31E2B] animate-pulse" />
              <span>Session 2026–27 Verified Admissions Open</span>
            </div>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#15182D] text-white text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>Verified Institutional Directory</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-[#15182D] tracking-tight leading-[1.14]">
              Discover India&apos;s <span className="text-[#E31E2B]">Premier Colleges</span> &amp; Universities
            </h1>

            <p className="font-body text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
              Explore accredited institutions with verified NIRF rankings, NAAC A++ grades, verified placement packages, and ethical direct merit counselling assistance.
            </p>

            {/* Trust Highlights Row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-1 text-xs text-gray-700 font-semibold">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Govt &amp; AICTE Approved</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Audited Placement Records</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                <ShieldCheck className="w-4 h-4 text-[#E31E2B] shrink-0" />
                <span>Zero Hidden Fees</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMPREHENSIVE DIRECTORY SECTION (Sidebar Filters + Results Grid) */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
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
