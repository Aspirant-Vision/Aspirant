"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Search,
  Headphones,
  FileText,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Play,
  Pause,
  ShieldCheck,
  ChevronRight,
  Clock,
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
  actionText: string;
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
    actionText: "Search Matching Colleges",
  },
  {
    num: "2",
    stepNum: "STEP 02",
    title: "Get Counselling",
    desc: "1-on-1 strategic advisory session with our senior counsellors to narrow down choices based on budget and career goals.",
    icon: Headphones,
    timeline: "Day 3 – 5",
    keyFeature: "Dedicated Senior Academic Mentor",
    actionText: "Book Free Advisory Session",
  },
  {
    num: "3",
    stepNum: "STEP 03",
    title: "Apply",
    desc: "Complete error-free multi-college application filing, document verification, and institutional fee concession & aid processing.",
    icon: FileText,
    timeline: "Day 6 – 10",
    keyFeature: "Direct Quota & Merit Documentation",
    actionText: "Start Application Filing",
  },
  {
    num: "4",
    stepNum: "STEP 04",
    title: "Get Admitted",
    desc: "Receive official allotment letters, confirm your seat lock, and get pre-campus hostel and orientation support.",
    icon: GraduationCap,
    timeline: "Day 11+",
    keyFeature: "Confirmed Seat Allotment Guarantee",
    actionText: "Confirm Seat Allocation",
  },
];

export function AdmissionJourneyTimeline() {
  const { openModal } = useCounselingModal();
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-moving interval (cycles every 3.5 seconds)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % JOURNEY_STEPS.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section id="journey" className="py-8 sm:py-14 lg:py-20 bg-white border-y border-[#E7E9F0]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Live Progression Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-10 gap-4 border-b border-[#E7E9F0] pb-4 sm:pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[#E31E2B] font-bold text-xs uppercase tracking-wider">
                — Interactive Admission Roadmap
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Auto-Moving Roadmap</span>
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#15182D] tracking-tight">
              From Search to Admission in{" "}
              <span className="text-[#E31E2B]">4 Simple Steps</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#687086] mt-1 max-w-2xl leading-relaxed">
              A transparent, guided roadmap from your very first search to confirmed seat allotment on campus.
            </p>
          </div>

          {/* Controls: Step Progress Dots & Pause/Play toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/80 rounded-xl p-1 shadow-2xs">
              {JOURNEY_STEPS.map((s, idx) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                    activeStep === idx
                      ? "bg-[#E31E2B] text-white shadow-2xs"
                      : "text-gray-600 hover:text-[#15182D] hover:bg-gray-100"
                  )}
                  aria-label={`Jump to ${s.stepNum}`}
                >
                  <span>{s.num}</span>
                  {activeStep === idx && <span className="hidden sm:inline text-[10px]">• {s.title}</span>}
                </button>
              ))}

              <div className="h-4 w-px bg-gray-200 mx-0.5" />

              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200/70 transition-colors cursor-pointer"
                title={isPaused ? "Resume auto-play" : "Pause auto-play"}
                aria-label={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={() => openModal(`Roadmap Consultation: Step 0${activeStep + 1} - ${JOURNEY_STEPS[activeStep].title}`)}
              className="tactile-pill inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold text-[#E31E2B] transition-colors shrink-0 cursor-pointer"
            >
              <span>Get Guided Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top Admission Showcase Panorama Banner */}
        <div className="mb-8 sm:mb-10 relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E7E9F0] shadow-md bg-slate-900">
          <div className="relative h-36 sm:h-44 md:h-52 w-full">
            <Image
              src="/images/top_admission.webp"
              alt="Top University Admissions Process - Aspirant Vision"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent flex items-center p-6 sm:p-10">
              <div className="max-w-xl space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E31E2B] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-xs">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Direct Merit Admissions</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300">
                    <Clock className="w-3 h-3 text-red-400" />
                    <span>Session 2026–27 Live Allotment Desk</span>
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">
                  Guaranteed Seat Allotment Support
                </h3>

                <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-lg">
                  Official counselling partnerships with 2,500+ premier institutions across India with verified cutoffs, direct institutional seats, and 100% transparent fee structures.
                </p>

                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openModal("Panorama Banner Guaranteed Seat Support")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#15182D] font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Check Eligibility</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-slate-300 font-medium">
                    Over 50,000+ candidates guided
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* INTERACTIVE CURVED ROAD & AUTO-MOVING STEP CARDS */}
        {/* ======================================================== */}
        <div
          className="relative mb-6 sm:mb-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Elegant SVG Curved Road with Flowing Center Dashes */}
          <div className="relative w-full h-24 sm:h-32 mb-2 sm:mb-4">
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
                d="M 60 60 C 100 60, 110 50, 150 50 C 250 50, 350 25, 450 25 C 550 25, 650 58, 750 58 C 850 58, 950 30, 1050 30 C 1110 30, 1150 45, 1180 50"
                stroke="#F1F3F9"
                strokeWidth="24"
                strokeLinecap="round"
                filter="url(#roadShadow)"
              />

              {/* Center Road Guideline with Continuous Dash Flow Animation */}
              <path
                d="M 60 60 C 100 60, 110 50, 150 50 C 250 50, 350 25, 450 25 C 550 25, 650 58, 750 58 C 850 58, 950 30, 1050 30 C 1110 30, 1150 45, 1180 50"
                stroke="url(#roadRedGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="10 8"
                className="animate-road-flow"
              />
            </svg>

            {/* 4 Connected Milestone Nodes Mathematically Centered Above the 4 Columns (12.5%, 37.5%, 62.5%, 87.5%) */}
            <div className="absolute inset-0 pointer-events-none">
              {JOURNEY_STEPS.map((s, idx) => {
                const Icon = s.icon;
                const isActive = activeStep === idx;
                const coords = [
                  { left: "12.5%", top: "42%" },
                  { left: "37.5%", top: "21%" },
                  { left: "62.5%", top: "48%" },
                  { left: "87.5%", top: "25%" },
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
                      className="group flex flex-col items-center focus:outline-none cursor-pointer"
                    >
                      {/* Floating Active Stage Badge */}
                      {isActive && (
                        <div className="absolute -top-7 sm:-top-8 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#15182D] text-white text-[9px] sm:text-[10px] font-bold shadow-md animate-fade-in flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E31E2B] animate-pulse" />
                          <span>Active Stage</span>
                        </div>
                      )}

                      <div className="relative">
                        {isActive && (
                          <span className="absolute -inset-2 sm:-inset-3 rounded-full bg-[#E31E2B] animate-ping opacity-30" />
                        )}
                        <div
                          className={cn(
                            "w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md",
                            isActive
                              ? "bg-gradient-to-tr from-[#B5121B] via-[#E31E2B] to-[#FF4D58] text-white shadow-red-500/40 ring-4 ring-red-100"
                              : "bg-white text-[#15182D] border-2 border-[#E7E9F0] hover:border-[#E31E2B]"
                          )}
                        >
                          <Icon className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.2]" />
                        </div>
                        <div
                          className={cn(
                            "absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[9px] sm:text-[10px] font-black flex items-center justify-center shadow-xs transition-colors",
                            isActive ? "bg-[#15182D] text-white" : "bg-[#E31E2B] text-white"
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

          {/* 4 Connected Step Cards with Countdown Progress Bar & Visual Alignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 pt-2">
            {JOURNEY_STEPS.map((s, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={s.num}
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    "relative overflow-hidden p-4 sm:p-5 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between border",
                    isActive
                      ? "bg-gradient-to-b from-red-50/40 via-white to-white border-[#E31E2B] shadow-md ring-2 ring-[#E31E2B]/15"
                      : "bg-[#F7F8FC] border-[#E7E9F0] hover:bg-white hover:border-gray-300 hover:shadow-xs"
                  )}
                >
                  {/* Active Step Auto-Progress Line */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-red-100 overflow-hidden">
                      <div
                        key={`progress-${idx}-${isPaused}`}
                        className={cn("h-full bg-[#E31E2B]", !isPaused && "animate-step-fill")}
                        style={isPaused ? { width: "100%" } : undefined}
                      />
                    </div>
                  )}

                  <div>
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          "text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md",
                          isActive
                            ? "bg-[#E31E2B] text-white"
                            : "bg-gray-100 text-[#15182D]"
                        )}
                      >
                        {s.stepNum}
                      </span>
                      <span className="text-[10px] font-bold text-[#687086] bg-white px-2 py-0.5 rounded-md border border-gray-100 shadow-2xs">
                        {s.timeline}
                      </span>
                    </div>

                    <h3 className="font-display font-extrabold text-sm sm:text-base text-[#15182D] mb-1.5 flex items-center justify-between">
                      <span>{s.title}</span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#E31E2B] animate-ping" />
                      )}
                    </h3>

                    <p className="text-xs text-[#687086] leading-relaxed font-medium line-clamp-3">
                      {s.desc}
                    </p>
                  </div>

                  {/* Footer & Action Feature */}
                  <div className="mt-3.5 pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#15182D]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{s.keyFeature}</span>
                    </div>

                    {/* Step CTA Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(`Roadmap ${s.stepNum}: ${s.title}`);
                      }}
                      className={cn(
                        "w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer",
                        isActive
                          ? "bg-[#E31E2B] text-white hover:bg-red-700 shadow-2xs"
                          : "bg-white hover:bg-gray-100 text-[#15182D] border border-gray-200"
                      )}
                    >
                      <span>{s.actionText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
