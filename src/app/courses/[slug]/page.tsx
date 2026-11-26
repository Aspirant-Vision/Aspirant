import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCourseBySlugPublicAction } from "@/lib/course/actions";
import { createClient } from "@/lib/supabase/server";
import { CounselingTriggerButton } from "@/components/colleges/counseling-trigger-button";
import {
  GraduationCap,
  Building2,
  Clock,
  BookOpen,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Sparkles,
} from "lucide-react";

interface PublicCourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicCourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getCourseBySlugPublicAction(slug);

  if (!res.success || !res.data) {
    return { title: "Course Not Found | Aspirant Vision" };
  }

  const course = res.data;
  const pageTitle = course.seo_title || `${course.name} - Admissions, Eligibility, Duration & Colleges | Aspirant Vision`;
  const pageDesc =
    course.seo_description ||
    course.short_description ||
    `Explore ${course.name} curriculum, eligibility criteria, entrance exams, and top offering colleges in India.`;

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      canonical: `https://aspirantvision.com/courses/${course.slug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      images: course.og_image_url || "/images/hero/students-hero.png",
      type: "website",
    },
    robots: {
      index: !course.no_index,
      follow: !course.no_index,
    },
  };
}

export default async function PublicCourseDetailPage({
  params,
}: PublicCourseDetailPageProps) {
  const { slug } = await params;
  const res = await getCourseBySlugPublicAction(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  const course = res.data;
  const offeringColleges = (course.college_courses || []).filter(
    (cc: any) => cc.colleges && cc.colleges.publication_status === "published"
  );

  // Fetch related courses
  const supabase = await createClient();
  const { data: candidates } = await supabase
    .from("courses")
    .select("id, name, slug, code, category, degree_type, duration, duration_unit, min_percentage, short_description")
    .eq("publication_status", "published")
    .neq("id", course.id)
    .is("deleted_at", null)
    .limit(8);

  const allCandidates = candidates || [];
  const sameCategory = allCandidates.filter((c) => c.category === course.category);
  const remaining = allCandidates.filter((c) => c.category !== course.category);
  const relatedCourses = [...sameCategory, ...remaining].slice(0, 4);

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
            <Link href="/courses" className="hover:text-gray-900 transition-colors">
              Courses
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="font-semibold text-gray-900 truncate">{course.name}</span>
          </nav>
        </div>
      </div>

      {/* 2. HERO HEADER */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="relative rounded-2xl sm:rounded-3xl border border-[#0F143A] p-6 sm:p-10 shadow-xl overflow-hidden bg-[#0A0D28] text-white">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/auth/campus_library.jpg"
              alt={course.name}
              fill
              priority
              className="object-cover object-center opacity-25 mix-blend-luminosity scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080B22]/95 via-[#0C1133]/90 to-[#080B22]/95" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/15 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-xs">
                  {course.degree_type}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-slate-200">
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/20 text-blue-300">
                  {course.study_mode?.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {course.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium pt-1">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-red-400" />
                  <span>Duration: {course.duration} {course.duration_unit}</span>
                </span>
                <span className="bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  Level: {course.level?.toUpperCase()}
                </span>
                {course.language && (
                  <span className="bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    Medium: {course.language}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0">
              <CounselingTriggerButton
                collegeName={`Course Enquiry: ${course.name}`}
                size="lg"
                label="Apply for Admission"
                className="text-sm px-8 w-full md:w-auto shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. DETAILS & OFFERING COLLEGES */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#E31E2B]" /> Program Overview
              </h2>
              {course.short_description && (
                <p className="text-sm text-gray-700 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {course.short_description}
                </p>
              )}
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {course.description || "Detailed curriculum information is available via counselling assistance."}
              </div>
            </div>

            {/* Eligibility Benchmarks */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#E31E2B]" /> Eligibility Benchmarks
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="block text-gray-500 font-semibold mb-1">Qualifying Examination</span>
                  <span className="font-bold text-gray-900">{course.min_qualification || "10+2 / Intermediate"}</span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="block text-gray-500 font-semibold mb-1">Minimum Aggregate Marks</span>
                  <span className="font-bold text-gray-900">
                    {course.min_percentage ? `${course.min_percentage}% marks` : "Pass percentage"}
                  </span>
                </div>
              </div>

              {course.required_subjects && (
                <div className="text-xs space-y-1">
                  <span className="font-bold text-gray-800">Mandatory Subjects:</span>
                  <p className="text-gray-600">{course.required_subjects}</p>
                </div>
              )}

              {course.entrance_exam_information && (
                <div className="text-xs space-y-1 pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-800">Accepted Entrance Examinations:</span>
                  <p className="text-gray-600">{course.entrance_exam_information}</p>
                </div>
              )}
            </div>

            {/* Offering Colleges */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#E31E2B]" /> Colleges Offering {course.name} ({offeringColleges.length})
              </h2>

              {offeringColleges.length === 0 ? (
                <p className="text-xs text-gray-500 py-4">
                  Campus-specific seat allocation is currently being updated for the 2025-26 cycle.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {offeringColleges.map((cc: any) => {
                    const col = cc.colleges;
                    return (
                      <div key={cc.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <Link href={`/colleges/${col.slug}`} className="font-bold text-sm text-gray-900 hover:text-[#E31E2B]">
                            {col.name}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {col.city}, {col.state}
                            </span>
                            {col.nirf_rank && <span>• NIRF #{col.nirf_rank}</span>}
                            {col.naac_grade && <span>• NAAC {col.naac_grade}</span>}
                          </div>
                        </div>

                        <Link href={`/colleges/${col.slug}`}>
                          <button
                            type="button"
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors"
                          >
                            View College Profile
                          </button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar (1 col) */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#15182D] to-slate-900 rounded-2xl p-6 text-white space-y-4 shadow-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-red-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Admission Guidance</span>
              </div>

              <h3 className="text-lg font-bold leading-snug">
                Need Help Choosing the Best College for {course.name}?
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed">
                Connect with our certified counsellors to check rank cutoffs, tuition fees, placement records, and seat bookings.
              </p>

              <CounselingTriggerButton
                collegeName={`Course Consultation: ${course.name}`}
                variant="white"
                size="md"
                label="Book Free Consultation"
                className="w-full text-xs"
              />
            </div>

            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 text-xs text-gray-700 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#E31E2B]">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Curriculum</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                All degree requirements and entrance standards are verified against university council announcements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RELATED ACADEMIC PROGRAMS & ALTERNATIVE DEGREES */}
      {relatedCourses.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-xs font-bold text-[#E31E2B] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curriculum Alternatives</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
                Related Programs &amp; Degrees
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Explore related degree tracks in {course.category || "this discipline"} offering similar career outcomes and top campus intakes.
              </p>
            </div>
            <Link
              href={`/courses?category=${encodeURIComponent(course.category || "Engineering")}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E31E2B] hover:text-[#B5121B] transition-colors self-start sm:self-auto"
            >
              <span>View All {course.category || "Discipline"} Courses</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedCourses.map((rel) => (
              <div
                key={rel.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#E31E2B] border border-red-200">
                      {rel.degree_type}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                      {rel.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-[#E31E2B] transition-colors leading-snug">
                    {rel.name}
                  </h3>

                  {rel.short_description ? (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {rel.short_description}
                    </p>
                  ) : null}

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#E31E2B]" />
                      {rel.duration} {rel.duration_unit}
                    </span>
                    <span>
                      {rel.min_percentage ? `Min ${rel.min_percentage}%` : "10+2 / Grad"}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <Link
                    href={`/courses/${rel.slug}`}
                    className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-[#15182D] hover:bg-[#E31E2B] text-white transition-colors"
                  >
                    View Details
                  </Link>
                  <CounselingTriggerButton
                    collegeName={`Related Program: ${rel.name}`}
                    variant="outline"
                    size="sm"
                    label="Guidance"
                    className="px-3 py-2 text-xs font-bold border-gray-200 hover:border-[#E31E2B]"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
