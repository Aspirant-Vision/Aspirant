"use client";

import React, { useState } from "react";
import {
  Search,
  Headphones,
  FileText,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { cn } from "@/lib/utils";

interface JourneyStep {
  num: string;
  stepNum: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  timeline: string;
  keyFeature: string;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    num: "1",
    stepNum: "STEP 01",
    title: "Discover",
    desc: "Explore 2,500+ verified colleges, compare cutoffs, fee structures, and campus placements matching your percentile.",
    icon: Search,
    timeline: "Day 1 – 2",
    keyFeature: "AI Percentile & College Matcher",
  },
  {
    num: "2",
    stepNum: "STEP 02",
    title: "Get Counselling",
    desc: "1-on-1 strategic advisory session with our senior counsellors to narrow down choices based on budget and career goals.",
    icon: Headphones,
    timeline: "Day 3 – 5",
    keyFeature: "Dedicated Senior Academic Mentor",
  },
  {
    num: "3",
    stepNum: "STEP 03",
    title: "Apply",
    desc: "Complete error-free multi-college application filing, document verification, and institutional scholarship processing.",
    icon: FileText,
    timeline: "Day 6 – 10",
    keyFeature: "Direct Quota & Merit Documentation",
  },
  {
    num: "4",
    stepNum: "STEP 04",
    title: "Get Admitted",
    desc: "Receive official allotment letters, confirm your seat lock, and get pre-campus hostel and orientation support.",
    icon: GraduationCap,
    timeline: "Day 11+",
    keyFeature: "Confirmed Seat Allotment Guarantee",
  },
];

export function AdmissionJourneyTimeline() {
  const { openModal } = useCounselingModal();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="journey" className="py-20 bg-white border-y border-[#E7E9F0]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header on Pure White Canvas */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-4 border-b border-[#E7E9F0] pb-6">
          <div>
            <span className="text-[#E31E2B] font-bold text-xs uppercase tracking-wider block mb-1">
              — Top Admission Journey
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#15182D] tracking-tight">
              From Search to Admission in{" "}
              <span className="text-[#E31E2B]">4 Simple Steps</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#687086] mt-1.5 max-w-2xl leading-relaxed">
              A transparent, guided roadmap from your very first search to confirmed seat allotment on campus.
            </p>
          </div>

          <button
            onClick={() => openModal("Admission Roadmap Guide")}
            className="tactile-pill inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-[#E31E2B] transition-all"
          >
            <span>Start Your Admission Journey</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP CURVED ROAD (Directly on Pure White Background)   */}
        {/* ======================================================== */}
        <div className="hidden lg:block relative mb-12">
          {/* Elegant SVG Curved Road Path */}
          <div className="relative w-full h-32 mb-4">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 1200 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Road Shadow */}
                <filter id="roadShadow" x="-5%" y="-20%" width="110%" height="160%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#171B52" floodOpacity="0.08" />
                </filter>
                <linearGradient id="roadRedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E31E2B" />
                  <stop offset="50%" stopColor="#FF4D58" />
                  <stop offset="100%" stopColor="#E31E2B" />
                </linearGradient>
              </defs>

              {/* Road Asphalt Bed */}
              <path
                d="M 60 70 C 260 15, 380 115, 580 55 C 780 -5, 900 110, 1140 45"
                stroke="#F1F3F9"
                strokeWidth="24"
                strokeLinecap="round"
                filter="url(#roadShadow)"
              />

              {/* Center Road Guideline (Curved Dash) */}
              <path
                d="M 60 70 C 260 15, 380 115, 580 55 C 780 -5, 900 110, 1140 45"
                stroke="url(#roadRedGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="10 8"
              />
            </svg>

            {/* 4 Connected Milestone Nodes along the curve */}
            <div className="absolute inset-0 pointer-events-none">
              {JOURNEY_STEPS.map((s, idx) => {
                const Icon = s.icon;
                const isActive = activeStep === idx;
                const coords = [
                  { left: "5%", top: "58%" },
                  { left: "33%", top: "62%" },
                  { left: "64%", top: "24%" },
                  { left: "95%", top: "37%" },
                ];
                const pos = coords[idx];

                return (
                  <div
                    key={s.num}
                    style={{ left: pos.left, top: pos.top }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveStep(idx)}
                      className="group flex flex-col items-center focus:outline-none"
                    >
                      <div className="relative">
                        {isActive && (
                          <span className="absolute -inset-2.5 rounded-full bg-[#E31E2B] animate-ping opacity-30" />
                        )}
                        <div
                          className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md",
                            isActive
                              ? "bg-gradient-to-tr from-[#B5121B] to-[#E31E2B] text-white scale-110 shadow-red-500/40"
                              : "bg-white text-[#15182D] border-2 border-[#E7E9F0] hover:border-[#E31E2B] hover:scale-105"
                          )}
                        >
                          <Icon className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <div
                          className={cn(
                            "absolute -top-2 -right-2 w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shadow-xs",
                            isActive ? "bg-[#171B52] text-white" : "bg-[#E31E2B] text-white"
                          )}
                        >
                          {s.num}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4 Direct Text Blocks (NO dark blue box, placed directly on white canvas) */}
          <div className="grid grid-cols-4 gap-6 pt-2">
            {JOURNEY_STEPS.map((s, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={s.num}
                  onClick={() => {
                    setActiveStep(idx);
                    openModal(`Journey: ${s.stepNum} - ${s.title}`);
                  }}
                  className={cn(
                    "p-5 rounded-2xl transition-all duration-300 cursor-pointer border",
                    isActive
                      ? "bg-red-50/40 border-[#E31E2B] shadow-sm"
                      : "bg-[#F7F8FC] border-[#E7E9F0] hover:bg-white hover:border-gray-300 hover:shadow-xs"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold text-[#E31E2B] uppercase tracking-wider">
                      {s.stepNum}
                    </span>
                    <span className="text-[10px] font-bold text-[#687086] bg-white px-2 py-0.5 rounded-md border border-gray-100">
                      {s.timeline}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-base text-[#15182D] mb-1.5">
                    {s.title}
                  </h3>

                  <p className="text-xs text-[#687086] leading-relaxed font-normal">
                    {s.desc}
                  </p>

                  <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-[#15182D]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{s.keyFeature}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* MOBILE RESPONSIVE ROAD (Vertical Connected Milestones)     */}
        {/* ======================================================== */}
        <div className="lg:hidden relative pl-6 border-l-2 border-dashed border-[#E31E2B]/50 space-y-6">
          {JOURNEY_STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                onClick={() => openModal(`Journey: ${s.stepNum} - ${s.title}`)}
                className="relative bg-[#F7F8FC] p-5 rounded-2xl border border-[#E7E9F0] cursor-pointer"
              >
                {/* Milestone Node on the vertical line */}
                <div className="absolute -left-[37px] top-4 w-8 h-8 rounded-full bg-[#E31E2B] text-white flex items-center justify-center font-bold text-xs shadow-md">
                  {s.num}
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold text-[#E31E2B] uppercase">
                    {s.stepNum}
                  </span>
                  <span className="text-[10px] font-bold text-[#687086]">
                    {s.timeline}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-[#E31E2B]" />
                  <h3 className="font-display font-extrabold text-base text-[#15182D]">
                    {s.title}
                  </h3>
                </div>

                <p className="text-xs text-[#687086] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
