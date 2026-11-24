"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Bell,
  ArrowRight,
  ExternalLink,
  Clock,
  Sparkles,
  AlertCircle,
  FileCheck,
  CheckCircle,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { cn } from "@/lib/utils";

interface EntranceExam {
  id: string;
  name: string;
  category: "engineering" | "management" | "medical";
  streamLabel: string;
  month: string;
  day: string;
  year: string;
  appOpen: string;
  deadline: string;
  examDate: string;
  eligibility: string;
  mode: string;
  status: "APPLICATIONS OPEN" | "CLOSING SOON" | "UPCOMING";
  statusColor: string;
  countdown: string;
}

const EXAMS_DATA: EntranceExam[] = [
  {
    id: "jee-main",
    name: "JEE Main 2026 (Session 1 & 2)",
    category: "engineering",
    streamLabel: "Engineering (B.Tech / B.E.)",
    month: "JAN",
    day: "22",
    year: "2026",
    appOpen: "Nov 01, 2025",
    deadline: "Dec 15, 2025",
    examDate: "Jan 22 - 31, 2026",
    eligibility: "12th Science (PCM) with 75% aggregate",
    mode: "Computer Based Test (CBT)",
    status: "APPLICATIONS OPEN",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    countdown: "Closes in 22 Days",
  },
  {
    id: "cat",
    name: "CAT 2025 (Common Admission Test)",
    category: "management",
    streamLabel: "Management (IIMs & Top B-Schools)",
    month: "NOV",
    day: "30",
    year: "2025",
    appOpen: "Aug 02, 2025",
    deadline: "Sep 20, 2025",
    examDate: "Nov 30, 2025",
    eligibility: "Bachelor's Degree with minimum 50% marks",
    mode: "Online CBT (3 Sessions)",
    status: "CLOSING SOON",
    statusColor: "bg-amber-50 text-amber-700 border-amber-200",
    countdown: "Admit Card Out",
  },
  {
    id: "neet",
    name: "NEET UG 2026",
    category: "medical",
    streamLabel: "Medical & Dental (MBBS / BDS / AYUSH)",
    month: "MAY",
    day: "03",
    year: "2026",
    appOpen: "Feb 09, 2026",
    deadline: "Mar 16, 2026",
    examDate: "May 03, 2026",
    eligibility: "12th with Physics, Chem, Biology / Biotech",
    mode: "Pen & Paper (OMR Sheet)",
    status: "UPCOMING",
    statusColor: "bg-blue-50 text-blue-700 border-blue-200",
    countdown: "Starts Feb 2026",
  },
  {
    id: "bitsat",
    name: "BITSAT 2026 (Pilani / Goa / Hyderabad)",
    category: "engineering",
    streamLabel: "Engineering & Integrated Sciences",
    month: "MAY",
    day: "19",
    year: "2026",
    appOpen: "Jan 15, 2026",
    deadline: "Apr 11, 2026",
    examDate: "May 19 - 24, 2026",
    eligibility: "12th with 75% aggregate in PCM and 60% in each",
    mode: "Online CBT Mode",
    status: "UPCOMING",
    statusColor: "bg-purple-50 text-purple-700 border-purple-200",
    countdown: "Registration in Jan",
  },
  {
    id: "ojee",
    name: "OJEE 2026 (Odisha Joint Entrance Exam)",
    category: "engineering",
    streamLabel: "Engineering, Lateral Entry & MBA",
    month: "MAY",
    day: "06",
    year: "2026",
    appOpen: "Jan 25, 2026",
    deadline: "Mar 22, 2026",
    examDate: "May 06 - 10, 2026",
    eligibility: "10+2 Science or relevant Bachelor's degree",
    mode: "Computer Based Test (CBT)",
    status: "UPCOMING",
    statusColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    countdown: "Schedule Announced",
  },
];

export function UpcomingExams() {
  const { openModal } = useCounselingModal();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "engineering" | "management" | "medical">("all");
  const [alertSubscribed, setAlertSubscribed] = useState<Record<string, boolean>>({});

  const filteredExams = EXAMS_DATA.filter(
    (e) => selectedFilter === "all" || e.category === selectedFilter
  );

  const toggleAlert = (id: string, name: string) => {
    setAlertSubscribed((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!alertSubscribed[id]) {
      openModal(`Free Exam Deadline Alert: ${name}`);
    }
  };

  return (
    <section id="exams" className="py-16 bg-[#171B52]/[0.02] border-y border-[#E7E9F0]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-[#E7E9F0] pb-6">
          <div>
            <span className="text-[#E31E2B] font-bold text-xs uppercase tracking-wider block mb-1">
              — Official Admission Calendar
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
              Stay Ahead of Every Admission Deadline
            </h2>
            <p className="text-xs sm:text-sm text-[#687086] mt-1 max-w-xl">
              Verified entrance schedules, registration windows, and counselling dates across top central, state and private universities.
            </p>
          </div>

          <button
            onClick={() => openModal("Full Entrance Exam Calendar")}
            className="tactile-pill inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[#E31E2B] text-xs font-bold transition-all"
          >
            <span>Download 2026 Exam Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setSelectedFilter("all")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              selectedFilter === "all"
                ? "tactile-btn-red text-white"
                : "tactile-pill text-[#687086] hover:text-[#15182D]"
            )}
          >
            All Entrance Exams ({EXAMS_DATA.length})
          </button>
          <button
            onClick={() => setSelectedFilter("engineering")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              selectedFilter === "engineering"
                ? "tactile-btn-red text-white"
                : "tactile-pill text-[#687086] hover:text-[#15182D]"
            )}
          >
            Engineering (JEE / BITSAT / OJEE)
          </button>
          <button
            onClick={() => setSelectedFilter("management")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              selectedFilter === "management"
                ? "tactile-btn-red text-white"
                : "tactile-pill text-[#687086] hover:text-[#15182D]"
            )}
          >
            Management (CAT / CMAT)
          </button>
          <button
            onClick={() => setSelectedFilter("medical")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              selectedFilter === "medical"
                ? "tactile-btn-red text-white"
                : "tactile-pill text-[#687086] hover:text-[#15182D]"
            )}
          >
            Medical (NEET UG)
          </button>
        </div>

        {/* Calendar Cards Grid */}
        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="tactile-card rounded-2xl p-5 sm:p-6 transition-all hover:shadow-lg border border-[#E7E9F0] flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Left Column: Calendar Date Badge & Exam Info */}
              <div className="flex items-start sm:items-center gap-4 flex-1">
                {/* 3D Calendar Tear-Off Sheet Badge */}
                <div className="w-16 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 shadow-md border border-[#E7E9F0] text-center flex flex-col justify-between bg-white">
                  <div className="bg-[#E31E2B] text-white py-1 text-[11px] font-black uppercase tracking-wider">
                    {exam.month}
                  </div>
                  <div className="font-display font-black text-xl sm:text-2xl text-[#15182D] py-1">
                    {exam.day}
                  </div>
                  <div className="text-[10px] text-[#687086] font-bold bg-gray-50 py-0.5 border-t border-gray-100">
                    {exam.year}
                  </div>
                </div>

                {/* Exam Title & Meta */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border",
                        exam.statusColor
                      )}
                    >
                      {exam.status}
                    </span>
                    <span className="text-[11px] font-bold text-[#E31E2B] bg-red-50 px-2 py-0.5 rounded-md">
                      {exam.countdown}
                    </span>
                    <span className="text-xs text-[#687086] font-medium hidden sm:inline">
                      • {exam.streamLabel}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base sm:text-lg text-[#15182D] leading-snug">
                    {exam.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#687086]">
                    <span>
                      Mode: <strong className="text-[#15182D]">{exam.mode}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Eligibility: <strong className="text-[#15182D]">{exam.eligibility}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Center / Right Column: Deadline Stats & Interactive Alert Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                {/* Deadline Data Well */}
                <div className="bg-[#F7F8FC] px-4 py-2.5 rounded-xl border border-[#E7E9F0] grid grid-cols-2 gap-4 text-xs min-w-[240px]">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#687086]">
                      Form Deadline
                    </div>
                    <div className="font-black text-[#E31E2B] text-xs sm:text-sm mt-0.5">
                      {exam.deadline}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#687086]">
                      Exam Schedule
                    </div>
                    <div className="font-bold text-[#15182D] text-xs sm:text-sm mt-0.5">
                      {exam.examDate}
                    </div>
                  </div>
                </div>

                {/* Free Alert Trigger Button */}
                <button
                  type="button"
                  onClick={() => toggleAlert(exam.id, exam.name)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs",
                    alertSubscribed[exam.id]
                      ? "bg-emerald-600 text-white"
                      : "tactile-btn-red text-white"
                  )}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>
                    {alertSubscribed[exam.id] ? "Alert Enabled" : "Get Free Alert"}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
