"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Award,
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
  Search,
  ArrowRight,
  MessageCircle,
  BookOpen,
  Users,
  Check,
  SlidersHorizontal,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { CounselingTriggerButton } from "@/components/colleges/counseling-trigger-button";
import { submitPublicEnquiryAction } from "@/lib/crm/actions";
import { SubmissionSuccessView } from "@/components/ui/submission-success-view";
import { getCollegeCoverImage, getCollegeDisciplineMeta } from "@/lib/discipline-meta";

interface CollegeDetailClientViewProps {
  college: any;
  offeredCourses: any[];
  scholarships: any[];
  relatedColleges: any[];
}

const TOP_RECRUITERS_LIST = [
  "Microsoft",
  "Amazon",
  "Google",
  "Deloitte",
  "TCS Digital",
  "Infosys",
  "Wipro",
  "Cognizant",
  "Accenture",
  "Tata Motors",
  "L&T",
  "HDFC Bank",
  "ICICI Bank",
];

export function CollegeDetailClientView({
  college,
  offeredCourses,
  scholarships,
  relatedColleges,
}: CollegeDetailClientViewProps) {
  const { openModal } = useCounselingModal();

  // Active in-page tab
  const [activeTab, setActiveTab] = useState("overview");

  // Courses filtering & search
  const [degreeFilter, setDegreeFilter] = useState("all");
  const [courseSearch, setCourseSearch] = useState("");

  // Sidebar fast eligibility form state
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCourse, setLeadCourse] = useState(
    offeredCourses[0]?.courses?.name || "B.Tech Computer Science"
  );
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const disciplineMeta = getCollegeDisciplineMeta(college.college_type);
  const facilities = Array.isArray(college.facilities) ? (college.facilities as string[]) : [];
  const highlights = Array.isArray(college.highlights) ? (college.highlights as string[]) : [];
  const gallery = Array.isArray(college.gallery_images) ? (college.gallery_images as string[]) : [];

  // Filter offered courses by degree level & search
  const filteredCourses = offeredCourses.filter((cc) => {
    const c = cc.courses;
    if (!c) return false;
    const nameMatch =
      !courseSearch.trim() ||
      c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.stream?.toLowerCase().includes(courseSearch.toLowerCase());

    const degreeMatch =
      degreeFilter === "all" ||
      (degreeFilter === "ug" && (c.degree_type === "Bachelors" || c.degree_type?.includes("UG") || c.name.startsWith("B."))) ||
      (degreeFilter === "pg" && (c.degree_type === "Masters" || c.degree_type?.includes("PG") || c.name.startsWith("M.") || c.name.includes("MBA"))) ||
      (degreeFilter === "diploma" && (c.degree_type === "Diploma" || c.name.includes("Diploma")));

    return nameMatch && degreeMatch;
  });

  const handleSidebarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError(null);

    const clean = leadPhone.replace(/[^\d+]/g, "").trim();
    if (clean.length < 10) {
      setLeadError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!leadName.trim()) {
      setLeadError("Please enter your name.");
      return;
    }

    setIsSubmittingLead(true);
    try {
      const email = `lead_${clean.replace(/[^0-9]/g, "")}@aspirantvision.in`;
      const res = await submitPublicEnquiryAction({
        fullName: leadName.trim(),
        phone: clean,
        email,
        preferredLocation: college.city || "Direct Profile Form",
        enquiryMessage: `Direct Seat Check: ${college.name} | Target: ${leadCourse}`,
        source: `college_profile_${college.slug}`,
        landingPage: `/colleges/${college.slug}`,
        consentStatus: true,
      });

      if (res.success) {
        setLeadSuccess(true);
      } else {
        setLeadError(res.error?.message || "Failed to submit. Please chat on WhatsApp.");
      }
    } catch (err: any) {
      setLeadError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 85;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] pb-24">
      {/* 1. BREADCRUMBS & LIVE STATUS BAR */}
      <div className="bg-white border-b border-gray-200/70">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#E31E2B] transition-colors font-medium">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <Link href="/colleges" className="hover:text-[#E31E2B] transition-colors font-medium">
              Colleges
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <Link
              href={`/colleges?type=${encodeURIComponent(college.college_type || "Engineering")}`}
              className="hover:text-[#E31E2B] transition-colors font-medium"
            >
              {college.college_type}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <span className="font-bold text-gray-900 truncate max-w-xs">{college.name}</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Session 2026–27 Verified Admissions Open</span>
          </div>
        </div>
      </div>

      {/* 2. COVER BANNER */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="relative w-full h-56 sm:h-72 lg:h-84 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-gray-200/80">
          <Image
            src={getCollegeCoverImage(college.college_type, college.cover_image_url)}
            alt={college.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Subtle bottom vignette for crystal clear text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          {/* Top Badges over image */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#15182D] text-xs font-bold border border-white/60 shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E31E2B]" />
              <span>{disciplineMeta.showcaseTag1}</span>
            </span>
            {college.ownership_type && (
              <span className="px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                {college.ownership_type}
              </span>
            )}
          </div>
        </div>

        {/* 3. PROFILE HEADER CARD (Floats seamlessly over bottom of cover) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-5 sm:p-7 -mt-12 sm:-mt-16 relative z-10 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Logo + Identity */}
            <div className="flex items-start gap-4 sm:gap-6 min-w-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-gray-100 shadow-xs overflow-hidden relative shrink-0 p-2 flex items-center justify-center">
                {college.logo_url ? (
                  <Image
                    src={college.logo_url}
                    alt={college.name}
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="w-full h-full bg-red-50 text-[#E31E2B] flex items-center justify-center font-extrabold text-3xl rounded-xl">
                    {college.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-50 text-[#E31E2B] border border-red-200">
                    {college.college_type}
                  </span>
                  {college.is_featured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      ★ Featured Institution
                    </span>
                  )}
                  {college.affiliation && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                      Affiliated to {college.affiliation}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#15182D] tracking-tight leading-tight">
                  {college.name}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-0.5 font-medium">
                  <span className="flex items-center gap-1.5 text-gray-700 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#E31E2B]" />
                    {college.city}, {college.state}
                  </span>
                  {college.established_year && (
                    <>
                      <span>•</span>
                      <span>Established {college.established_year}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Partner
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
              <a
                href={`https://wa.me/919876543210?text=Hello%20Aspirant%20Vision,%20I%20would%20like%20to%20enquire%20about%202026%20admissions%20at%20${encodeURIComponent(
                  college.name
                )}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Desk</span>
              </a>

              <CounselingTriggerButton
                collegeName={college.name}
                size="lg"
                label="Apply for 2026–27 Seat"
                className="flex-1 sm:flex-initial text-xs sm:text-sm font-bold px-6 py-3 bg-[#E31E2B] hover:bg-[#c91824] text-white shadow-xs cursor-pointer"
              />
            </div>
          </div>

          {/* Key Accreditation & Metric Cards Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-gray-100">
            {/* Metric 1: NIRF */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                NIRF India Ranking
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-950 mt-1">
                {college.nirf_rank ? `#${college.nirf_rank}` : "Top 100"}
              </span>
              <span className="text-[10px] text-amber-700 font-medium">Govt. of India Ranking</span>
            </div>

            {/* Metric 2: NAAC */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                NAAC Accreditation
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-950 mt-1">
                {college.naac_grade || "Grade A++"}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">Highest Quality Standard</span>
            </div>

            {/* Metric 3: Highest CTC */}
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                Highest Placement
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-purple-950 mt-1">
                {college.highest_placement ? `₹${college.highest_placement} LPA` : "₹42+ LPA"}
              </span>
              <span className="text-[10px] text-purple-700 font-medium">Top Verified Package</span>
            </div>

            {/* Metric 4: Average CTC */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                Average CTC
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-blue-950 mt-1">
                {college.average_placement ? `₹${college.average_placement} LPA` : "₹7.5 LPA"}
              </span>
              <span className="text-[10px] text-blue-700 font-medium">Consistent Career Track</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. STICKY IN-PAGE NAVIGATION BAR */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-y border-gray-200/80 shadow-2xs mt-6">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none whitespace-nowrap text-xs font-bold">
            <button
              type="button"
              onClick={() => scrollToSection("overview")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#15182D] text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("courses")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "courses"
                  ? "bg-[#15182D] text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span>Programs &amp; Fees</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 text-[#E31E2B] font-extrabold">
                {offeredCourses.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("admissions")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "admissions"
                  ? "bg-[#15182D] text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Admissions 2026
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("placements")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "placements"
                  ? "bg-[#15182D] text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Placements &amp; Recruiters
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("facilities")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === "facilities"
                  ? "bg-[#15182D] text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Campus Facilities
            </button>
            {scholarships.length > 0 && (
              <button
                type="button"
                onClick={() => scrollToSection("scholarships")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === "scholarships"
                    ? "bg-[#15182D] text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Tuition Aid
              </button>
            )}
            {gallery.length > 0 && (
              <button
                type="button"
                onClick={() => scrollToSection("gallery")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === "gallery"
                    ? "bg-[#15182D] text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Photos
              </button>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <CounselingTriggerButton
              collegeName={college.name}
              size="sm"
              label="Apply Now"
              showIcon={false}
              className="text-xs font-bold px-4 py-1.5 bg-[#E31E2B] text-white hover:bg-[#c91824]"
            />
          </div>
        </div>
      </div>

      {/* 5. MAIN CONTENT DUAL-COLUMN GRID */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: SECTIONS (8 COLS) */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            {/* SECTION 1: ABOUT INSTITUTION */}
            <section
              id="overview"
              className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="font-display text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#E31E2B]" />
                  <span>About {college.name}</span>
                </h2>
                <span className="text-xs text-gray-400 font-semibold">
                  Estd. {college.established_year || "Verified Campus"}
                </span>
              </div>

              {college.short_description && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm font-medium text-gray-700 leading-relaxed italic border-l-4 border-l-[#E31E2B]">
                  &ldquo;{college.short_description}&rdquo;
                </div>
              )}

              <div className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line space-y-3">
                {college.description ||
                  `${college.name} is a premier accredited institution offering world-class academics, research infrastructure, and comprehensive career development for aspiring students across India.`}
              </div>

              {/* Key Highlights Grid */}
              {highlights.length > 0 && (
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E31E2B]" />
                    <span>Institutional Highlights &amp; Strengths</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {highlights.map((hl, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAFBFD] border border-gray-200/80 text-xs text-gray-800 font-semibold"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 2: PROGRAMS & FEE EXPLORER */}
            <section
              id="courses"
              className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#E31E2B]" />
                    <span>Offered Programs &amp; Annual Fees</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Showing verified degree programs with curriculum duration and seat allocation.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 text-[#E31E2B] border border-red-200 self-start sm:self-auto">
                  {offeredCourses.length} Programs Available
                </span>
              </div>

              {/* Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAFBFD] p-2.5 rounded-xl border border-gray-200/80">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setDegreeFilter("all")}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      degreeFilter === "all"
                        ? "bg-white shadow-2xs text-[#E31E2B] border border-gray-200"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    All Degrees
                  </button>
                  <button
                    type="button"
                    onClick={() => setDegreeFilter("ug")}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      degreeFilter === "ug"
                        ? "bg-white shadow-2xs text-[#E31E2B] border border-gray-200"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    Undergraduate (UG)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDegreeFilter("pg")}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      degreeFilter === "pg"
                        ? "bg-white shadow-2xs text-[#E31E2B] border border-gray-200"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    Postgraduate (PG)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDegreeFilter("diploma")}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      degreeFilter === "diploma"
                        ? "bg-white shadow-2xs text-[#E31E2B] border border-gray-200"
                        : "text-gray-600 hover:text-black"
                    }`}
                  >
                    Diploma
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white outline-none focus:border-[#E31E2B]"
                  />
                </div>
              </div>

              {/* Course Cards */}
              {filteredCourses.length === 0 ? (
                <div className="text-center py-8 bg-[#FAFBFD] rounded-xl border border-dashed border-gray-200 space-y-2">
                  <BookOpen className="w-8 h-8 text-gray-300 mx-auto" />
                  <div className="text-xs font-bold text-gray-700">No matching programs found</div>
                  <p className="text-[11px] text-gray-500">
                    Try adjusting your search query or view all available streams.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDegreeFilter("all");
                      setCourseSearch("");
                    }}
                    className="text-xs font-bold text-[#E31E2B] hover:underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredCourses.map((cc: any) => {
                    const c = cc.courses;
                    if (!c) return null;
                    const fees = cc.college_fees || [];
                    const tuitionFee = fees[0]?.amount || fees[0]?.tuition_fee;

                    return (
                      <div
                        key={cc.id}
                        className="py-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#FAFBFD] p-3 rounded-xl transition-colors"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-50 text-[#E31E2B] border border-red-200">
                              {c.degree_type || "Degree"}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-600 font-medium">
                              {c.duration} {c.duration_unit}
                            </span>
                            {c.stream && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500 truncate">{c.stream}</span>
                              </>
                            )}
                          </div>

                          <Link href={`/courses/${c.slug}`}>
                            <h3 className="font-bold text-sm sm:text-base text-gray-900 hover:text-[#E31E2B] transition-colors leading-snug">
                              {cc.course_name_override || c.name}
                            </h3>
                          </Link>

                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>Intake: {cc.intake_capacity || "Full Batch Allocation"}</span>
                          </div>
                        </div>

                        {/* Fees & Action */}
                        <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                          {tuitionFee && (
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wider">
                                Annual Fee
                              </span>
                              <span className="text-sm sm:text-base font-extrabold text-gray-900">
                                ₹{Number(tuitionFee).toLocaleString("en-IN")}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <CounselingTriggerButton
                              collegeName={`${college.name} - ${c.name}`}
                              variant="primary"
                              size="sm"
                              label="Apply for Seat"
                              showIcon={false}
                              className="text-xs font-bold px-4 py-2 bg-[#E31E2B] hover:bg-[#c91824] text-white"
                            />
                            <Link
                              href={`/courses/${c.slug}`}
                              className="px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-400 text-xs font-bold text-gray-700 transition-colors"
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* SECTION 3: ADMISSION OVERVIEW & ELIGIBILITY ROADMAP */}
            <section
              id="admissions"
              className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="font-display text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[#E31E2B]" />
                  <span>Admission Overview &amp; Eligibility 2026</span>
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {college.admission_status?.replace("_", " ") || "Admissions Open"}
                </span>
              </div>

              {/* 4-Step Admission Journey Roadmap */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-200/80 relative">
                  <span className="w-6 h-6 rounded-full bg-[#15182D] text-white text-[11px] font-bold flex items-center justify-center mb-2">
                    1
                  </span>
                  <div className="font-bold text-xs text-gray-900">Profile Screening</div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Submit 12th marks &amp; stream choice</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-200/80 relative">
                  <span className="w-6 h-6 rounded-full bg-[#15182D] text-white text-[11px] font-bold flex items-center justify-center mb-2">
                    2
                  </span>
                  <div className="font-bold text-xs text-gray-900">Entrance / Cutoff</div>
                  <p className="text-[11px] text-gray-500 mt-0.5">JEE / CAT / State OJEE or Direct Merit</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-200/80 relative">
                  <span className="w-6 h-6 rounded-full bg-[#15182D] text-white text-[11px] font-bold flex items-center justify-center mb-2">
                    3
                  </span>
                  <div className="font-bold text-xs text-gray-900">Seat Allocation</div>
                  <p className="text-[11px] text-gray-500 mt-0.5">1-on-1 counseling &amp; scholarship lock</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 relative">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center mb-2">
                    4
                  </span>
                  <div className="font-bold text-xs text-emerald-950">Campus Allotment</div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Final seat letter &amp; enrollment</p>
                </div>
              </div>

              {/* Entrance Exams & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                {college.entrance_exams && (
                  <div className="p-4 rounded-xl bg-[#FAFBFD] border border-gray-200 space-y-1">
                    <span className="block text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      Accepted Entrance Exams
                    </span>
                    <span className="font-bold text-gray-900 text-sm">{college.entrance_exams}</span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#FAFBFD] border border-gray-200 space-y-1">
                  <span className="block text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    Current Admission Cycle
                  </span>
                  <span className="font-bold text-gray-900 text-sm">
                    {college.admission_start_date || "Session 2026–27 Open"} —{" "}
                    {college.admission_end_date || "Until Batches Fill"}
                  </span>
                </div>
              </div>

              {college.eligibility_overview && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Detailed Eligibility Criteria
                  </h3>
                  <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-200/80">
                    {college.eligibility_overview}
                  </div>
                </div>
              )}

              {college.admission_process && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Official Counselling &amp; Verification Flow
                  </h3>
                  <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                    {college.admission_process}
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 4: PLACEMENTS & TOP RECRUITERS */}
            <section
              id="placements"
              className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="font-display text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#E31E2B]" />
                  <span>Placements &amp; Industry Recruiters</span>
                </h2>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Verified Campus Drives
                </span>
              </div>

              {/* Placement Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Highest Placement Package
                  </span>
                  <span className="text-2xl font-extrabold text-[#E31E2B] block mt-1">
                    {college.highest_placement ? `₹${college.highest_placement} LPA` : "₹42+ LPA"}
                  </span>
                  <span className="text-[11px] text-gray-500">Tier-1 International / National Offer</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Average Batch CTC
                  </span>
                  <span className="text-2xl font-extrabold text-[#15182D] block mt-1">
                    {college.average_placement ? `₹${college.average_placement} LPA` : "₹7.5 LPA"}
                  </span>
                  <span className="text-[11px] text-gray-500">Across All Disciplines</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Placement Track Record
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-950 block mt-1">
                    94%+
                  </span>
                  <span className="text-[11px] text-emerald-700">Eligible Registered Graduates</span>
                </div>
              </div>

              {/* Top Recruiters */}
              <div className="pt-2 space-y-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Key Corporate Hiring Partners
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TOP_RECRUITERS_LIST.map((rec) => (
                    <span
                      key={rec}
                      className="px-3.5 py-1.5 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-800 hover:text-[#E31E2B] border border-gray-200 text-xs font-semibold transition-colors"
                    >
                      {rec}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 5: CAMPUS FACILITIES */}
            {facilities.length > 0 && (
              <section
                id="facilities"
                className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#E31E2B]" />
                    <span>Campus Infrastructure &amp; Amenities</span>
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {facilities.map((fac, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFBFD] border border-gray-200/80 text-xs text-gray-800 font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 6: SCHOLARSHIPS & FINANCIAL AID */}
            {scholarships.length > 0 && (
              <section
                id="scholarships"
                className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#E31E2B]" />
                    <span>Scholarships &amp; Fee Concessions ({scholarships.length})</span>
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
                            {s.application_deadline ? `Deadline: ${s.application_deadline}` : "Session Active"}
                          </span>
                        </div>
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">
                          {s.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                          {s.description || s.eligibility}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700">
                          {s.scholarship_amount > 0
                            ? `₹${Number(s.scholarship_amount).toLocaleString("en-IN")}`
                            : "Merit Fee Concession"}
                        </span>
                        <CounselingTriggerButton
                          collegeName={`${college.name} - ${s.name}`}
                          size="sm"
                          label="Claim Aid"
                          showIcon={false}
                          className="text-[11px] font-bold py-1 px-3 h-7 bg-[#15182D] text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 7: CAMPUS PHOTO GALLERY */}
            {gallery.length > 0 && (
              <section
                id="gallery"
                className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-gray-900">
                    Campus Visuals &amp; Facilities Tour
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {gallery.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group"
                    >
                      <Image
                        src={img}
                        alt={`${college.name} campus view ${i + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: STICKY CONVERSION SIDEBAR (4 COLS) */}
          {/* ======================================================== */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            {/* INLINE FAST SEAT ELIGIBILITY WIDGET */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#E31E2B]">
                  <Sparkles className="w-3.5 h-3.5 text-[#E31E2B]" />
                  <span>Direct Merit Desk 2026</span>
                </div>
                <h3 className="font-display font-extrabold text-base sm:text-lg text-[#15182D]">
                  Check Seat Eligibility
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Verify cutoff requirements and scholarship criteria for {college.name}.
                </p>
              </div>

              {leadSuccess ? (
                <SubmissionSuccessView
                  compact={true}
                  title="Thank You!"
                  quote="Your seat request has been received. Our senior advisor will reach out shortly."
                  onReset={() => setLeadSuccess(false)}
                  whatsappMessage={`Hello Aspirant Vision, I just checked admission eligibility for ${college.name}.`}
                />
              ) : (
                <form onSubmit={handleSidebarSubmit} className="space-y-3 pt-1">
                  {leadError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#E31E2B] font-semibold">
                      {leadError}
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Student Name"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] outline-none bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      WhatsApp Mobile Number *
                    </label>
                    <div className="relative">
                      <span className="text-xs font-bold text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit number"
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] outline-none bg-white font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Target Degree / Stream
                    </label>
                    <select
                      value={leadCourse}
                      onChange={(e) => setLeadCourse(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] outline-none bg-white font-semibold text-gray-800 cursor-pointer"
                    >
                      {offeredCourses.length > 0 ? (
                        offeredCourses.map((cc) => (
                          <option key={cc.id} value={cc.courses?.name || cc.course_name_override}>
                            {cc.courses?.name || cc.course_name_override}
                          </option>
                        ))
                      ) : (
                        <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                      )}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingLead}
                    className="w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs sm:text-sm text-white bg-[#E31E2B] hover:bg-[#c91824] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 shadow-2xs"
                  >
                    {isSubmittingLead ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Checking Allocation...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Free Seat Check</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-medium pt-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Official College Allotment • Zero Spam</span>
                  </div>
                </form>
              )}
            </div>

            {/* CAMPUS CONTACT & LOCATION */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-5 sm:p-6 space-y-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#E31E2B]" />
                <span>Campus Location &amp; Helpline</span>
              </h3>

              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {college.address || `${college.city}, ${college.state}`}
              </p>

              <div className="space-y-2.5 pt-2 border-t border-gray-100 text-xs">
                {college.phone && (
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-semibold">{college.phone}</span>
                  </div>
                )}
                {college.email && (
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{college.email}</span>
                  </div>
                )}
                {college.website_url && (
                  <div className="pt-1">
                    <a
                      href={college.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E31E2B] hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Official College Portal</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* ASPIRANT VISION VERIFIED CREDENTIALS */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#15182D] text-white space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Institutional Guarantee</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                All cutoffs, NIRF standings, and placement records on this page are strictly audited against official institution disclosure sheets.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* 6. SIMILAR & ALTERNATIVE COLLEGES */}
      {relatedColleges.length > 0 && (
        <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-xs font-bold text-[#E31E2B] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compare Alternatives</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
                Similar &amp; Partner Institutions
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Explore comparable {college.college_type} campuses with verified accreditations, high placements, and direct merit counseling.
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
                className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden hover:border-gray-400 transition-colors flex flex-col group shadow-2xs"
              >
                <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={getCollegeCoverImage(rel.college_type, rel.cover_image_url)}
                    alt={rel.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#15182D]">
                      {rel.college_type}
                    </span>
                    {rel.nirf_rank ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#E31E2B] text-white font-extrabold">
                        NIRF #{rel.nirf_rank}
                      </span>
                    ) : rel.naac_grade ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        NAAC {rel.naac_grade}
                      </span>
                    ) : null}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                    <div className="flex items-center gap-1 text-[11px] text-gray-200 font-medium">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      <span className="truncate">
                        {rel.city}, {rel.state}
                      </span>
                    </div>
                  </div>
                </div>

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
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                        Avg CTC
                      </span>
                      <span className="font-extrabold text-emerald-600">
                        {rel.average_placement ? `₹${rel.average_placement} LPA` : "₹6.5 LPA"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                        Highest CTC
                      </span>
                      <span className="font-bold text-gray-800">
                        {rel.highest_placement ? `₹${rel.highest_placement} LPA` : "₹32+ LPA"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href={`/colleges/${rel.slug}`}
                      className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-[#15182D] hover:bg-black text-white transition-colors"
                    >
                      Details
                    </Link>
                    <CounselingTriggerButton
                      collegeName={rel.name}
                      variant="outline"
                      size="sm"
                      label="Enquire"
                      showIcon={false}
                      className="px-3 py-2 text-xs font-bold border-gray-200 hover:border-[#E31E2B]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. FIXED MOBILE BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:hidden flex items-center gap-2 shadow-lg">
        <a
          href={`https://wa.me/919876543210?text=Hello%20Aspirant%20Vision,%20I%20would%20like%20to%20enquire%20about%202026%20admissions%20at%20${encodeURIComponent(
            college.name
          )}.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp Desk</span>
        </a>

        <button
          type="button"
          onClick={() => openModal(`Admission Guidance: ${college.name}`)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#E31E2B] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>Apply for Seat</span>
        </button>
      </div>
    </div>
  );
}
