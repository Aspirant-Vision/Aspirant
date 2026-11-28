"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Banknote,
  BadgePercent,
  CheckCircle2,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

export function ScholarshipSupport() {
  const { openModal } = useCounselingModal();
  const [percentage, setPercentage] = useState("85");
  const [calculatedWaiver, setCalculatedWaiver] = useState("50% Tuition Waiver");

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setPercentage(val.toString());
    if (val >= 95) {
      setCalculatedWaiver("100% Full Tuition Waiver");
    } else if (val >= 88) {
      setCalculatedWaiver("75% Tuition Scholarship");
    } else if (val >= 80) {
      setCalculatedWaiver("50% Merit Scholarship");
    } else if (val >= 70) {
      setCalculatedWaiver("25% Institutional Grant");
    } else {
      setCalculatedWaiver("Special EWS / Category Aid Available");
    }
  };

  const programs = [
    {
      icon: BadgePercent,
      title: "Merit-Based Scholarships",
      benefit: "Up to 100% Tuition Waiver",
      description:
        "Students securing 85%+ in Class 12 or top percentiles in JEE/CAT/NEET qualify for direct institutional tuition fee waivers.",
      eligibility: "Based on 12th Board marks or Entrance Score",
      badge: "Highest Savings",
    },
    {
      icon: Banknote,
      title: "0% Advance Loan Assistance",
      benefit: "Pre-approved up to ₹20 Lakhs",
      description:
        "Partnered with leading nationalized banks (SBI, HDFC Credila, Axis Bank). Fast-track sanction with moratorium periods.",
      eligibility: "Collateral-free for premier NAAC A++ colleges",
      badge: "Zero Processing Hassle",
    },
    {
      icon: GraduationCap,
      title: "Special Category Concessions",
      benefit: "₹25,000 to ₹1.5L /yr",
      description:
        "Special grants for single girl child, defense personnel dependents, state domicile students, and national sports achievers.",
      eligibility: "Statutory verified certificates required",
      badge: "Direct University Quota",
    },
  ];

  return (
    <section className="py-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4 border-b border-[#E7E9F0] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#E31E2B] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Financial Accessibility &amp; Aid</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
            100% Transparent Scholarships &amp; Loan Support
          </h2>
          <p className="text-xs sm:text-sm text-[#687086] mt-1 max-w-2xl leading-relaxed">
            Higher education should be accessible. We help families secure institutional scholarships, state government concessions, and low-interest student loans.
          </p>
        </div>

        <button
          onClick={() => openModal("Scholarship & Loan Counselling")}
          className="tactile-btn-red px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-1.5"
        >
          <span>Apply for Financial Aid</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3 Tactile Benefit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {programs.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              onClick={() => openModal(`Financial Aid: ${p.title}`)}
              className="tactile-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="tactile-icon-box w-12 h-12 rounded-2xl flex items-center justify-center text-[#E31E2B]">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-red-50 text-[#E31E2B] border border-red-100 px-2.5 py-1 rounded-full">
                    {p.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-[#15182D] group-hover:text-[#E31E2B] transition-colors leading-snug">
                    {p.title}
                  </h3>
                  <div className="font-extrabold text-base text-[#16A34A] mt-1">
                    {p.benefit}
                  </div>
                  <p className="text-xs text-[#687086] mt-2.5 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#15182D]">
                <span className="text-[#687086] text-[11px]">{p.eligibility}</span>
                <span className="text-[#E31E2B] font-bold inline-flex items-center gap-0.5">
                  Check →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Live Scholarship Eligibility Calculator Bar */}
      <div className="rounded-3xl bg-gradient-to-r from-[#171B52] via-[#1B2060] to-[#171B52] p-6 sm:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center lg:text-left max-w-md">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-[#FFE088] text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Instant Aid Estimator</span>
            </div>
            <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white">
              Check Your Estimated Scholarship
            </h3>
            <p className="text-xs text-gray-300">
              Drag the slider to your Class 12 or Entrance score to see potential fee waivers.
            </p>
          </div>

          {/* Interactive Range Input & Dynamic Result */}
          <div className="flex flex-col sm:flex-row items-center gap-5 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 w-full sm:w-64 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-gray-300">Your Score / Percentile:</span>
                <span className="text-[#FFE088] font-black text-sm font-display">{percentage}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="99"
                value={percentage}
                onChange={handleSliderChange}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#E31E2B]"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>60%</span>
                <span>80%</span>
                <span>99%</span>
              </div>
            </div>

            {/* Calculated Output Pill */}
            <div className="bg-white rounded-2xl p-4 text-[#15182D] shadow-lg text-center sm:text-left shrink-0 min-w-[200px] border border-white">
              <div className="text-[10px] text-[#687086] font-bold uppercase tracking-wider">
                Qualified Benefit
              </div>
              <div className="font-display font-black text-base text-[#E31E2B] mt-0.5">
                {calculatedWaiver}
              </div>
              <button
                onClick={() => openModal(`Claim Scholarship: ${percentage}% Score - ${calculatedWaiver}`)}
                className="mt-2 w-full py-1.5 px-3 rounded-lg bg-[#E31E2B] hover:bg-[#c91622] text-white text-xs font-bold transition-all shadow-xs"
              >
                Claim This Waiver
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
