"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Clock,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { cn } from "@/lib/utils";

interface CourseItem {
  id: string;
  name: string;
  degree: string;
  duration: string;
  eligibility: string;
  careerOutcomes: string;
  topColleges: string[];
}

const COURSES: CourseItem[] = [
  {
    id: "btech",
    name: "B.Tech / B.E. (Computer Science, AI, Core)",
    degree: "Undergraduate (UG)",
    duration: "4 Years",
    eligibility: "12th PCM (>60%) + JEE Main / State CET",
    careerOutcomes: "Software Engineer, Data Scientist, Systems Architect (₹8L - ₹45L)",
    topColleges: ["IIT Delhi", "BITS Pilani", "KIIT University", "NIT Trichy"],
  },
  {
    id: "mba",
    name: "MBA / PGDM (Finance, Marketing, Analytics)",
    degree: "Postgraduate (PG)",
    duration: "2 Years",
    eligibility: "Graduation (50%) + CAT / XAT / CMAT",
    careerOutcomes: "Investment Banker, Product Manager, Consultant (₹12L - ₹38L)",
    topColleges: ["IIM Ahmedabad", "ISB Hyderabad", "Birla Global", "SIBM Pune"],
  },
  {
    id: "mbbs",
    name: "MBBS (Bachelor of Medicine & Surgery)",
    degree: "Professional UG",
    duration: "5.5 Years",
    eligibility: "12th PCB (>50%) + NEET UG",
    careerOutcomes: "Medical Officer, Clinical Specialist, Surgeon (₹9L - ₹30L)",
    topColleges: ["AIIMS New Delhi", "CMC Vellore", "KIMS Bhubaneswar"],
  },
  {
    id: "bca",
    name: "BCA / MCA (Application Development)",
    degree: "UG / PG IT Degree",
    duration: "3 Years",
    eligibility: "12th with Math / CS (50%)",
    careerOutcomes: "Full-Stack Developer, Cloud Engineer (₹5L - ₹18L)",
    topColleges: ["SOA University", "Centurion University", "Christ University"],
  },
  {
    id: "law",
    name: "BA LLB / BBA LLB (Integrated Law)",
    degree: "5-Year Integrated",
    duration: "5 Years",
    eligibility: "12th Any Stream + CLAT / LSAT",
    careerOutcomes: "Corporate Lawyer, Legal Advisor, Judicial Services (₹7L - ₹24L)",
    topColleges: ["NLSIU Bengaluru", "NLU Delhi", "KIIT School of Law"],
  },
  {
    id: "bdes",
    name: "B.Des (UI/UX, Product & Fashion Design)",
    degree: "Undergraduate (UG)",
    duration: "4 Years",
    eligibility: "12th Any Stream + NID / UCEED",
    careerOutcomes: "Product Designer, Creative Director, UX Lead (₹6L - ₹22L)",
    topColleges: ["NID Ahmedabad", "IIT Bombay IDC", "NIFT Delhi"],
  },
];

export function PopularCourses() {
  const { openModal } = useCounselingModal();
  const [selectedCourseId, setSelectedCourseId] = useState("btech");

  const currentCourse = COURSES.find((c) => c.id === selectedCourseId) || COURSES[0];

  return (
    <section id="popular-courses" className="py-8 sm:py-14 lg:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-10 gap-4 border-b border-[#E7E9F0] pb-4 sm:pb-5">
        <div>
          <span className="text-[#E31E2B] font-bold text-xs uppercase tracking-wider block mb-1">
            — Degree Programs
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
            Find the Course That Shapes Your Future
          </h2>
          <p className="text-xs sm:text-sm text-[#687086] mt-1">
            Explore industry-aligned degree programs with verified eligibility, career outcomes and premier colleges.
          </p>
        </div>
        <button
          onClick={() => openModal("All Course Catalogs")}
          className="text-[#E31E2B] font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:underline cursor-pointer"
        >
          <span>Explore All 200+ Courses</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Course Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Course Navigation List (4 cols) */}
        <div className="lg:col-span-4 space-y-1.5 sm:space-y-2">
          {COURSES.map((course) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={cn(
                "w-full text-left p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 flex items-center justify-between group",
                selectedCourseId === course.id
                  ? "bg-white border-[#E31E2B] shadow-md ring-1 ring-[#E31E2B]/20"
                  : "bg-white/60 hover:bg-white border-[#E7E9F0] text-[#15182D]"
              )}
            >
              <div>
                <span
                  className={cn(
                    "text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block",
                    selectedCourseId === course.id ? "text-[#E31E2B]" : "text-[#687086]"
                  )}
                >
                  {course.degree}
                </span>
                <span className="font-display font-bold text-xs sm:text-base text-[#15182D] block mt-0.5">
                  {course.name.split(" (")[0]}
                </span>
              </div>
              <ArrowRight
                className={cn(
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform",
                  selectedCourseId === course.id
                    ? "text-[#E31E2B] translate-x-1"
                    : "text-gray-300 group-hover:text-gray-600"
                )}
              />
            </button>
          ))}
        </div>

        {/* Course In-Depth Feature Card (8 cols) */}
        <div className="lg:col-span-8 tactile-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-4 sm:space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E9F0] pb-5">
            <div>
              <span className="bg-red-50 text-[#E31E2B] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-red-100">
                {currentCourse?.degree}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#15182D] mt-2">
                {currentCourse?.name}
              </h3>
            </div>
            <button
              onClick={() => openModal(`Course Admission: ${currentCourse?.name}`)}
              className="tactile-btn-red text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all"
            >
              Check Admission Cutoffs
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
            <div className="space-y-1.5 p-4 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0]">
              <div className="flex items-center gap-2 font-bold text-[#15182D]">
                <Clock className="w-4 h-4 text-[#E31E2B]" />
                <span>Program Duration</span>
              </div>
              <p className="text-[#687086] pl-6 font-medium">
                {currentCourse?.duration} Full-Time Academic Curriculum
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0]">
              <div className="flex items-center gap-2 font-bold text-[#15182D]">
                <CheckCircle2 className="w-4 h-4 text-[#E31E2B]" />
                <span>Admission Eligibility</span>
              </div>
              <p className="text-[#687086] pl-6 font-medium">
                {currentCourse?.eligibility}
              </p>
            </div>
          </div>

          {/* Career Outcomes */}
          <div className="p-4 rounded-2xl bg-red-50/40 border border-red-100 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#15182D] text-xs sm:text-sm">
              <Briefcase className="w-4 h-4 text-[#E31E2B]" />
              <span>Career Roles & Compensation Range</span>
            </div>
            <p className="text-[#15182D] pl-6 text-xs sm:text-sm font-semibold">
              {currentCourse?.careerOutcomes}
            </p>
          </div>

          {/* Top Colleges Offering This Degree */}
          <div>
            <h4 className="text-xs font-bold text-[#687086] uppercase tracking-wider mb-2.5">
              Leading Institutions Offering This Program:
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentCourse?.topColleges.map((colName) => (
                <button
                  key={colName}
                  onClick={() => openModal(`Apply ${colName} for ${currentCourse?.name}`)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#E7E9F0] bg-[#F7F8FC] hover:bg-white hover:border-[#171B52] text-xs font-bold text-[#15182D] transition-all"
                >
                  {colName} ↗
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
