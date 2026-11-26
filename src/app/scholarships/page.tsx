import React from "react";
import { Metadata } from "next";
import { getPublicScholarshipsAction } from "@/lib/course/actions";
import { PublicScholarshipCatalog } from "@/components/scholarships/public-scholarship-catalog";
import { Award, ShieldCheck, CheckCircle2, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Scholarships & Financial Aid Grants | Aspirant Vision",
  description:
    "Explore merit fellowships, government schemes, and university financial aid grants for higher education in India. Verified deadlines and eligibility guidelines.",
  keywords: [
    "Scholarships in India",
    "College financial aid",
    "Merit scholarships 2025",
    "Tuition fee waivers",
    "Aspirant Vision Scholarships",
  ],
};

export default async function PublicScholarshipsPage() {
  const initialData = await getPublicScholarshipsAction({ page: 1, pageSize: 9 });
  const scholarships = initialData.success && initialData.data ? initialData.data.scholarships : [];
  const totalCount = initialData.success && initialData.data ? initialData.data.totalCount : 0;

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      {/* HERO BANNER */}
      <section className="bg-linear-to-b from-white to-[#F7F8FC] border-b border-gray-200/60 py-12 sm:py-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-[#E31E2B]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Financial Aid & Fellowships Directory</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#15182D] tracking-tight leading-tight">
              Scholarships & Financial Grants for Students
            </h1>

            <p className="font-body text-sm sm:text-base text-gray-600 leading-relaxed">
              Discover merit awards, government subsidies, corporate fellowships, and institutional tuition waivers to empower your academic journey.
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-gray-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Up to 100% Tuition Waivers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Verified Direct Application Links</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <span>National & University Schemes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG SECTION */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PublicScholarshipCatalog initialScholarships={scholarships} initialTotal={totalCount} />
      </section>
    </div>
  );
}
