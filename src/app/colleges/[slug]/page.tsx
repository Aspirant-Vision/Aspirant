import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCollegeBySlugPublicAction } from "@/lib/college/actions";
import { getCoursesForCollegeAction } from "@/lib/course/actions";
import { createClient } from "@/lib/supabase/server";
import { CounselingTriggerButton } from "@/components/colleges/counseling-trigger-button";
import {
  MapPin,
  Building2,
  Award,
  Calendar,
  Globe,
  Phone,
  Mail,
  CheckCircle2,
  Sparkles,
  Layers,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Clock,
  IndianRupee,
} from "lucide-react";

interface PublicCollegeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicCollegeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getCollegeBySlugPublicAction(slug);

  if (!res.success || !res.data) {
    return {
      title: "College Not Found | Aspirant Vision",
    };
  }

  const college = res.data;
  const pageTitle = college.seo_title || `${college.name} - Admissions, Fees, Ranking & Placements | Aspirant Vision`;
  const pageDesc =
    college.seo_description ||
    college.short_description ||
    `Explore ${college.name} admissions, courses, fees, scholarships, NIRF rankings, and placement statistics on Aspirant Vision.`;

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      canonical: college.canonical_url || `https://aspirantvision.com/colleges/${college.slug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      images: college.og_image_url || college.cover_image_url || "/images/hero/students-hero.png",
      type: "website",
    },
    robots: {
      index: !college.no_index,
      follow: !college.no_index,
    },
  };
}

export default async function PublicCollegeDetailPage({
  params,
}: PublicCollegeDetailPageProps) {
  const { slug } = await params;
  const res = await getCollegeBySlugPublicAction(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  const college = res.data;
  const facilities = Array.isArray(college.facilities) ? (college.facilities as string[]) : [];
  const highlights = Array.isArray(college.highlights) ? (college.highlights as string[]) : [];
  const gallery = Array.isArray(college.gallery_images) ? (college.gallery_images as string[]) : [];

  // Fetch offered courses, scholarships, and related colleges
  const supabase = await createClient();
  const [coursesRes, scholarshipsRes, relatedCollegesRes] = await Promise.all([
    getCoursesForCollegeAction(college.id),
    supabase
      .from("scholarships")
      .select("*")
      .or(`college_id.eq.${college.id},college_id.is.null`)
      .eq("publication_status", "published")
      .is("deleted_at", null)
      .limit(6),
    supabase
      .from("colleges")
      .select("*")
      .eq("publication_status", "published")
      .neq("id", college.id)
      .is("deleted_at", null)
      .limit(8),
  ]);

  const offeredCourses: any[] = (coursesRes.success && coursesRes.data ? coursesRes.data : []) || [];
  const scholarships = scholarshipsRes.data || [];

  // Prioritize matching college_type or state for related colleges
  const allCandidates = relatedCollegesRes.data || [];
  const sameTypeOrState = allCandidates.filter(
    (c) => c.college_type === college.college_type || c.state === college.state
  );
  const remainingCandidates = allCandidates.filter(
    (c) => c.college_type !== college.college_type && c.state !== college.state
  );
  const relatedColleges = [...sameTypeOrState, ...remainingCandidates].slice(0, 4);

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
            <Link href="/colleges" className="hover:text-gray-900 transition-colors">
              Colleges
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="font-semibold text-gray-900 truncate">{college.name}</span>
          </nav>
        </div>
      </div>

      {/* 2. COVER BANNER */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="relative w-full h-56 sm:h-80 lg:h-96 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-md">
          {college.cover_image_url ? (
            <Image
              src={college.cover_image_url}
              alt={college.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-tr from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center text-slate-500 text-sm">
              Campus Overview
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* 3. PROFILE HEADER CARD (Floats over bottom of banner) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-5 sm:p-8 shadow-sm -mt-14 sm:-mt-20 relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-6">
              {/* College Logo */}
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white border-2 border-white shadow-lg overflow-hidden relative shrink-0">
                {college.logo_url ? (
                  <Image
                    src={college.logo_url}
                    alt={college.name}
                    fill
                    sizes="112px"
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="w-full h-full bg-red-50 text-[#E31E2B] flex items-center justify-center font-extrabold text-3xl">
                    {college.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-[#E31E2B] border border-red-200">
                    {college.college_type}
                  </span>
                  {college.ownership_type && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                      {college.ownership_type}
                    </span>
                  )}
                  {college.is_featured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                      ★ Featured
                    </span>
                  )}
                </div>

                <h1 className="font-display text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  {college.name}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-0.5">
                  <span className="flex items-center gap-1 font-medium text-gray-700">
                    <MapPin className="w-3.5 h-3.5 text-[#E31E2B]" />
                    {college.city}, {college.state}
                  </span>
                  {college.established_year && (
                    <>
                      <span>•</span>
                      <span>Estd. {college.established_year}</span>
                    </>
                  )}
                  {college.affiliation && (
                    <>
                      <span>•</span>
                      <span>{college.affiliation}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <CounselingTriggerButton
                collegeName={college.name}
                size="lg"
                label="Apply for 2025-26"
                className="text-sm px-6"
              />
            </div>
          </div>

          {/* Key Accreditation & Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-gray-100">
            {college.nirf_rank ? (
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  NIRF Rank
                </span>
                <span className="text-xl font-extrabold text-amber-900">
                  #{college.nirf_rank}
                </span>
              </div>
            ) : null}

            {college.naac_grade ? (
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  NAAC Grade
                </span>
                <span className="text-xl font-extrabold text-emerald-900">
                  {college.naac_grade}
                </span>
              </div>
            ) : null}

            {college.average_placement ? (
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  Average CTC
                </span>
                <span className="text-xl font-extrabold text-blue-900">
                  ₹{college.average_placement} LPA
                </span>
              </div>
            ) : null}

            {college.highest_placement ? (
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 text-center">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  Highest CTC
                </span>
                <span className="text-xl font-extrabold text-purple-900">
                  ₹{college.highest_placement} LPA
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* 4. MAIN DETAILS & SIDEBAR */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN (2 COLS) */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Institution */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#E31E2B]" /> About {college.name}
              </h2>

              {college.short_description && (
                <p className="text-sm text-gray-700 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {college.short_description}
                </p>
              )}

              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line space-y-3">
                {college.description ||
                  "Detailed institutional profile, academic curriculum, and department details are available through our counselling desk."}
              </div>
            </div>

            {/* Key Highlights */}
            {highlights.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#E31E2B]" /> Key Highlights & Strengths
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((hl, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/70 border border-gray-200/80 text-xs text-gray-800 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campus Facilities */}
            {facilities.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#E31E2B]" /> Campus Infrastructure & Facilities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {facilities.map((fac, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Admission Information */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[#E31E2B]" /> Admission Overview & Eligibility
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {college.admission_status?.replace("_", " ") || "Open"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {college.entrance_exams && (
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="block text-gray-500 font-semibold mb-1">
                      Accepted Entrance Exams
                    </span>
                    <span className="font-bold text-gray-900">{college.entrance_exams}</span>
                  </div>
                )}

                {(college.admission_start_date || college.admission_end_date) && (
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="block text-gray-500 font-semibold mb-1">Admission Cycle</span>
                    <span className="font-bold text-gray-900">
                      {college.admission_start_date || "Open now"} to{" "}
                      {college.admission_end_date || "Until seats last"}
                    </span>
                  </div>
                )}
              </div>

              {college.eligibility_overview && (
                <div className="space-y-1.5 pt-2">
                  <h3 className="text-xs font-bold text-gray-800">Eligibility Criteria</h3>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {college.eligibility_overview}
                  </p>
                </div>
              )}

              {college.admission_process && (
                <div className="space-y-1.5 pt-2">
                  <h3 className="text-xs font-bold text-gray-800">How to Apply</h3>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                    {college.admission_process}
                  </p>
                </div>
              )}
            </div>

            {/* Academic Programs & Degrees Offered */}
            {offeredCourses.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#E31E2B]" /> Programs & Courses Offered ({offeredCourses.length})
                  </h2>
                </div>

                <div className="divide-y divide-gray-100">
                  {offeredCourses.map((cc: any) => {
                    const c = cc.courses;
                    if (!c) return null;
                    const fees = cc.college_fees || [];
                    const tuitionFee = fees[0]?.amount || fees[0]?.tuition_fee;

                    return (
                      <div key={cc.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-[#E31E2B] border border-red-200">
                              {c.degree_type}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{c.duration} {c.duration_unit}</span>
                          </div>

                          <Link href={`/courses/${c.slug}`}>
                            <h3 className="font-bold text-sm text-gray-900 hover:text-[#E31E2B]">
                              {cc.course_name_override || c.name}
                            </h3>
                          </Link>

                          <div className="text-xs text-gray-500">
                            {c.stream} • Intake: {cc.intake_capacity || "Full Batch"}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {tuitionFee && (
                            <div className="text-right">
                              <span className="text-[10px] text-gray-400 block font-medium">Annual Tuition</span>
                              <span className="text-sm font-bold text-gray-900">
                                ₹{Number(tuitionFee).toLocaleString("en-IN")}
                              </span>
                            </div>
                          )}

                          <CounselingTriggerButton
                            collegeName={`${college.name} - ${c.name}`}
                            variant="primary"
                            size="sm"
                            label="Apply"
                            showIcon={false}
                            className="text-xs font-bold px-4 h-8"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Scholarships & Financial Aid */}
            {scholarships.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#E31E2B]" /> Scholarships & Financial Grants ({scholarships.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {scholarships.map((s: any) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-xl bg-gray-50/70 border border-gray-200/90 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                            {s.category}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {s.application_deadline ? `Deadline: ${s.application_deadline}` : "Rolling"}
                          </span>
                        </div>
                        <h3 className="font-bold text-xs text-gray-900 leading-snug">{s.name}</h3>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{s.description || s.eligibility}</p>
                      </div>

                      <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700">
                          {s.scholarship_amount > 0 ? `₹${Number(s.scholarship_amount).toLocaleString("en-IN")}` : "Tuition Waiver"}
                        </span>
                        {s.slug && (
                          <Link href={`/scholarships/${s.slug}`} className="text-[11px] font-bold text-[#E31E2B] hover:underline">
                            Details →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campus Photo Gallery */}
            {gallery.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Campus Photo Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {gallery.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
                    >
                      <Image
                        src={img}
                        alt={`${college.name} campus view ${i + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN / SIDEBAR (1 COL) */}
          <div className="space-y-6">
            {/* COUNSELLING ASSISTANCE CTA CARD */}
            <div className="bg-gradient-to-br from-[#15182D] to-slate-900 rounded-2xl p-6 text-white space-y-4 shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-red-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Expert Admission Guidance</span>
              </div>

              <h3 className="text-lg font-bold leading-snug">
                Want to secure admission at {college.name}?
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed">
                Connect with our certified education counsellors to check eligibility, seat
                availability, scholarship criteria, and application assistance.
              </p>

              <CounselingTriggerButton
                collegeName={college.name}
                variant="white"
                size="md"
                label="Book Free Consultation"
                className="w-full text-xs"
              />
            </div>

            {/* CONTACT & LOCATION CARD */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E31E2B]" /> Campus Location & Contact
              </h3>

              <p className="text-xs text-gray-700 leading-relaxed">
                {college.address || `${college.city}, ${college.state}`}
              </p>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                {college.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{college.phone}</span>
                  </div>
                )}
                {college.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{college.email}</span>
                  </div>
                )}
                {college.website_url && (
                  <div className="pt-2">
                    <a
                      href={college.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E31E2B] hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Official Website</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* TRUST BADGE */}
            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 text-xs text-gray-700 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#E31E2B]">
                <ShieldCheck className="w-4 h-4" />
                <span>Aspirant Vision Verified</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                All metrics, accreditations, and placement stats are verified against official NIRF
                and institute disclosure reports.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RELATED & SIMILAR INSTITUTIONS */}
      {relatedColleges.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-xs font-bold text-[#E31E2B] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Alternative Campus Options</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
                Similar &amp; Partner Colleges
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Explore comparable {college.college_type} institutions with verified accreditations, placement track records, and open admissions.
              </p>
            </div>
            <Link
              href={`/colleges?type=${encodeURIComponent(college.college_type || "Engineering")}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E31E2B] hover:text-[#B5121B] transition-colors self-start sm:self-auto"
            >
              <span>View All {college.college_type || "Engineering"} Colleges</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedColleges.map((rel) => (
              <div
                key={rel.id}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                {/* Cover Image */}
                <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                  {rel.cover_image_url ? (
                    <Image
                      src={rel.cover_image_url}
                      alt={rel.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-slate-500 text-xs font-medium">
                      Campus View
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#15182D] shadow-xs">
                      {rel.college_type}
                    </span>
                    {rel.nirf_rank ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#E31E2B] text-white shadow-xs font-extrabold">
                        NIRF #{rel.nirf_rank}
                      </span>
                    ) : rel.naac_grade ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                        NAAC {rel.naac_grade}
                      </span>
                    ) : null}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                    <div className="flex items-center gap-1 text-[11px] text-gray-200 font-medium">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      <span className="truncate">{rel.city}, {rel.state}</span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-[#E31E2B] transition-colors leading-snug">
                      {rel.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {rel.ownership_type || "Private / Approved"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">Avg Package</span>
                      <span className="font-extrabold text-emerald-600">
                        {rel.average_placement ? `₹${rel.average_placement} LPA` : "₹5.5 - 12 LPA"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">Highest Package</span>
                      <span className="font-bold text-gray-800">
                        {rel.highest_placement ? `₹${rel.highest_placement} LPA` : "Verified Placements"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href={`/colleges/${rel.slug}`}
                      className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-[#15182D] hover:bg-[#E31E2B] text-white transition-colors"
                    >
                      View College
                    </Link>
                    <CounselingTriggerButton
                      collegeName={rel.name}
                      variant="outline"
                      size="sm"
                      label="Enquire"
                      className="px-3 py-2 text-xs font-bold border-gray-200 hover:border-[#E31E2B]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
