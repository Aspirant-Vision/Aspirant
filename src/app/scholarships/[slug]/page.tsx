import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getScholarshipBySlugPublicAction } from "@/lib/course/actions";
import { CounselingTriggerButton } from "@/components/colleges/counseling-trigger-button";
import {
  Award,
  Calendar,
  Building2,
  FileCheck,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicScholarshipDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicScholarshipDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getScholarshipBySlugPublicAction(slug);

  if (!res.success || !res.data) {
    return { title: "Scholarship Not Found | Aspirant Vision" };
  }

  const s = res.data;
  const pageTitle = `${s.name} - Eligibility, Benefits & Application | Aspirant Vision`;
  const pageDesc =
    s.description ||
    `Complete guidelines for ${s.name} provided by ${s.provider}. Check eligibility, award benefits, and deadlines.`;

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      canonical: `https://aspirantvision.com/scholarships/${s.slug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      type: "website",
    },
  };
}

export default async function PublicScholarshipDetailPage({
  params,
}: PublicScholarshipDetailPageProps) {
  const { slug } = await params;
  const res = await getScholarshipBySlugPublicAction(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  const s = res.data;
  const docs = Array.isArray(s.required_documents) ? (s.required_documents as string[]) : [];

  return (
    <div className="min-h-screen bg-[#F7F8FC] pb-24">
      {/* 1. BREADCRUMBS */}
      <div className="bg-white border-b border-gray-200/60">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link href="/scholarships" className="hover:text-gray-900 transition-colors">
              Scholarships
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="font-semibold text-gray-900 truncate">{s.name}</span>
          </nav>
        </div>
      </div>

      {/* 2. HERO HEADER */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                  {s.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {s.provider}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {s.application_deadline
                    ? `Deadline: ${new Date(s.application_deadline).toLocaleDateString("en-IN")}`
                    : "Rolling Application"}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {s.name}
              </h1>

              <div className="text-xs text-gray-500 font-medium">
                Target Institution:{" "}
                <span className="font-bold text-gray-800">
                  {s.colleges?.name || "All Recognized Institutions across India"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              {s.official_url ? (
                <a href={s.official_url} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="text-xs sm:text-sm font-bold bg-[#E31E2B] hover:bg-[#c91824] text-white w-full sm:w-auto px-6"
                  >
                    <span>Apply on Official Portal</span>
                    <ExternalLink className="w-4 h-4 ml-1.5" />
                  </Button>
                </a>
              ) : (
                <CounselingTriggerButton
                  collegeName={`Scholarship Assistance: ${s.name}`}
                  size="lg"
                  label="Enquire for Guidance"
                  className="text-sm px-6"
                />
              )}
            </div>
          </div>

          {/* BENEFIT HIGHLIGHT */}
          <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                Total Financial Award
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
                {s.scholarship_amount > 0 ? `₹${Number(s.scholarship_amount).toLocaleString("en-IN")}` : "Full / Partial Tuition Waiver"}
              </div>
            </div>

            {s.scholarship_percentage && (
              <div className="text-right">
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                  Tuition Fee Coverage
                </span>
                <span className="text-xl font-bold text-emerald-900">
                  {s.scholarship_percentage}% of annual fee
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. MAIN DETAILS */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#E31E2B]" /> About the Financial Aid Program
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line space-y-3">
                {s.description || "Detailed program instructions can be accessed through official channels."}
              </div>
            </div>

            {/* Eligibility */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#E31E2B]" /> Eligibility Guidelines
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                {s.eligibility || "Standard merit and income requirements apply."}
              </div>
            </div>

            {/* Required Documents */}
            {docs.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Required Documentation Checklist</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {docs.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-3 rounded-xl bg-gray-50/70 border border-gray-200 text-xs text-gray-800 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#15182D] to-slate-900 rounded-2xl p-6 text-white space-y-4 shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-red-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Scholarship Assistance</span>
              </div>

              <h3 className="text-lg font-bold leading-snug">
                Need Help Applying for {s.name}?
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed">
                Connect with our education counselling desk for documentation guidance, verification assistance, and institution-specific criteria.
              </p>

              <CounselingTriggerButton
                collegeName={`Scholarship Advisory: ${s.name}`}
                variant="white"
                size="md"
                label="Talk to a Counsellor"
                className="w-full text-xs"
              />
            </div>

            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 text-xs text-gray-700 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#E31E2B]">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Benefit Terms</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                All scholarship criteria are sourced from official government gazettes and participating university disclosures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
