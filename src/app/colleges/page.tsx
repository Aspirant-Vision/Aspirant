import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getPublicCollegesAction } from "@/lib/college/actions";
import { PublicCollegeCatalog } from "@/components/colleges/public-college-catalog";
import { getCollegeDisciplineMeta } from "@/lib/discipline-meta";
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

export const revalidate = 60;

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
  const meta = getCollegeDisciplineMeta(requestedType);

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      {/* 1. PRESTIGIOUS EDITORIAL HERO (Bright, inspiring, stream-specific campus architectural showcase) */}
      <section className="relative pt-6 sm:pt-10 pb-10 sm:pb-14 overflow-hidden border-b border-[#E7E9F0] bg-white">
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
              <span className="text-[#E31E2B] font-bold">
                {requestedType !== "all" ? `${meta.typeKey} Colleges` : "Colleges & Universities"}
              </span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#E31E2B] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#E31E2B] animate-pulse" />
              <span>Session 2026–27 Verified Admissions Open</span>
            </div>
          </div>

          {/* Hero Grid: Narrative (Left) + Crisp Architectural Campus Visual (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headlines, Trust Marks & Quick Metrics */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#15182D] text-white text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>{meta.badge}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-[#15182D] tracking-tight leading-[1.14]">
                {meta.titlePrefix} <span className="text-[#E31E2B]">{meta.highlightedText}</span> {meta.titleSuffix}
              </h1>

              <p className="font-body text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
                {meta.description}
              </p>

              {/* Trust Highlights Row */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 text-xs text-gray-700 font-semibold">
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{meta.trustBadge1}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{meta.trustBadge2}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                  <ShieldCheck className="w-4 h-4 text-[#E31E2B] shrink-0" />
                  <span>{meta.trustBadge3}</span>
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-2 max-w-xl">
                <div className="p-3 rounded-xl bg-[#FAFBFD] border border-gray-200/80">
                  <span className="block font-display font-extrabold text-lg sm:text-2xl text-[#15182D]">
                    {meta.metric1Value}
                  </span>
                  <span className="block text-[11px] text-gray-500 font-medium leading-tight">
                    {meta.metric1Label}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAFBFD] border border-gray-200/80">
                  <span className="block font-display font-extrabold text-lg sm:text-2xl text-[#E31E2B]">
                    {meta.metric2Value}
                  </span>
                  <span className="block text-[11px] text-gray-500 font-medium leading-tight">
                    {meta.metric2Label}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAFBFD] border border-gray-200/80">
                  <span className="block font-display font-extrabold text-lg sm:text-2xl text-emerald-600">
                    {meta.metric3Value}
                  </span>
                  <span className="block text-[11px] text-gray-500 font-medium leading-tight">
                    {meta.metric3Label}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Crisp High-Resolution Stream-Specific Photography Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl sm:rounded-3xl border border-gray-200/90 overflow-hidden bg-slate-100 aspect-[16/11] sm:aspect-[4/3] lg:aspect-[16/12]">
                <Image
                  key={meta.image}
                  src={meta.image}
                  alt={meta.highlightedText}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center"
                />
                {/* Crisp Dark Scrim at bottom for crystal clear caption contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                {/* Floating Tags */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#15182D] text-[11px] font-extrabold border border-white/60">
                    {meta.showcaseTag1}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold tracking-wide">
                    {meta.showcaseTag2}
                  </span>
                </div>

                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                  <p className="text-xs sm:text-sm font-extrabold leading-tight">
                    {meta.captionTitle}
                  </p>
                  <p className="text-[11px] text-gray-200 mt-0.5">
                    {meta.captionSubtitle}
                  </p>
                </div>
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
