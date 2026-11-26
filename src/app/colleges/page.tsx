import React from "react";
import { Metadata } from "next";
import { getPublicCollegesAction } from "@/lib/college/actions";
import { PublicCollegeCatalog } from "@/components/colleges/public-college-catalog";
import { ShieldCheck, Award, Building2, GraduationCap } from "lucide-react";

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
      {/* 1. HERO BANNER */}
      <section className="relative bg-linear-to-b from-white to-[#F7F8FC] border-b border-gray-200/60 py-12 sm:py-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-[#E31E2B]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Institutional Directory</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#15182D] tracking-tight leading-tight">
              Discover Top Colleges & Universities in India
            </h1>

            {/* Subtitle */}
            <p className="font-body text-sm sm:text-base text-gray-600 leading-relaxed">
              Explore premier engineering, medical, and management institutions with verified NIRF
              rankings, NAAC accreditations, placement statistics, and official counselling support.
            </p>

            {/* Trust highlights */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-gray-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Govt & AICTE Approved</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span>Pan-India Campuses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <span>Free Admission Counselling</span>
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
