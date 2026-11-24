"use client";

import React from "react";
import {
  Briefcase,
  TrendingUp,
  Building2,
  Users,
  Award,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

interface RecruiterBrand {
  name: string;
  category: string;
  highestCtc: string;
}

const RECRUITERS: RecruiterBrand[] = [
  { name: "Microsoft", category: "Technology & Cloud", highestCtc: "₹52 LPA" },
  { name: "Google", category: "Software & AI", highestCtc: "₹48 LPA" },
  { name: "Amazon", category: "E-Commerce & AWS", highestCtc: "₹45 LPA" },
  { name: "Deloitte", category: "Management Consulting", highestCtc: "₹24 LPA" },
  { name: "Tata Motors", category: "Automotive & Core Engineering", highestCtc: "₹18 LPA" },
  { name: "Goldman Sachs", category: "Investment Banking", highestCtc: "₹38 LPA" },
  { name: "Infosys", category: "Digital Services & IT", highestCtc: "₹16 LPA" },
  { name: "Larsen & Toubro", category: "Heavy Engineering & Infra", highestCtc: "₹20 LPA" },
  { name: "ICICI Bank", category: "Banking & Financial Services", highestCtc: "₹19 LPA" },
  { name: "PwC", category: "Risk Consulting & Audit", highestCtc: "₹22 LPA" },
  { name: "Cognizant", category: "Global Technology Services", highestCtc: "₹15 LPA" },
  { name: "Reliance Jio", category: "Telecom & Cloud Platforms", highestCtc: "₹21 LPA" },
];

export function RecruitersPlacements() {
  const { openModal } = useCounselingModal();

  return (
    <section id="placements" className="py-8 sm:py-14 lg:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. EDITORIAL HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-10 gap-4 border-b border-[#E7E9F0] pb-4 sm:pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#E31E2B] text-xs font-bold uppercase tracking-wider mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Placement &amp; Career Acceleration</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
            Top University Recruiters &amp; Career Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-[#687086] mt-1 max-w-2xl leading-relaxed">
            Choose institutions with proven placement track records, premier corporate hiring networks, and high return on investment (ROI).
          </p>
        </div>

        <button
          onClick={() => openModal("Placement & Recruiters Report")}
          className="tactile-pill inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-[#E31E2B] transition-all"
        >
          <span>Download Placement Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. PLACEMENT HIGHLIGHT METRICS (4 Tactile Tiles) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10">
        <div className="tactile-card rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-[#E7E9F0] text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-50 text-[#E31E2B] flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <div className="font-display font-black text-xl sm:text-3xl text-[#15182D]">
            ₹52.0 LPA
          </div>
          <div className="text-xs font-semibold text-[#687086] mt-0.5">
            Highest Package Offered
          </div>
        </div>

        <div className="tactile-card rounded-2xl p-5 border border-[#E7E9F0] text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-[#15182D]">
            ₹14.8 LPA
          </div>
          <div className="text-xs font-semibold text-[#687086] mt-0.5">
            Average CTC (Top 50 Colleges)
          </div>
        </div>

        <div className="tactile-card rounded-2xl p-5 border border-[#E7E9F0] text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <Building2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-[#15182D]">
            850+
          </div>
          <div className="text-xs font-semibold text-[#687086] mt-0.5">
            Corporate Hiring Partners
          </div>
        </div>

        <div className="tactile-card rounded-2xl p-5 border border-[#E7E9F0] text-center">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-[#15182D]">
            98.4%
          </div>
          <div className="text-xs font-semibold text-[#687086] mt-0.5">
            Placement Assistance Ratio
          </div>
        </div>
      </div>

      {/* 3. CORPORATE HIRING PARTNERS GRID */}
      <div className="tactile-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#E7E9F0] mb-6 sm:mb-10 bg-white">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-[#15182D]">
              Prominent Campus Recruiters
            </h3>
            <p className="text-xs text-[#687086] mt-0.5">
              Companies actively hiring from our partner universities and institutes.
            </p>
          </div>
          <span className="hidden sm:inline-block text-xs font-bold text-[#E31E2B] bg-red-50 px-3 py-1 rounded-full">
            Verified CTC Records
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {RECRUITERS.map((rec) => (
            <div
              key={rec.name}
              onClick={() => openModal(`Recruiter Details: ${rec.name}`)}
              className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0] hover:border-[#E31E2B] hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-black text-sm text-[#15182D] group-hover:text-[#E31E2B] transition-colors">
                  {rec.name}
                </span>
                <span className="text-[11px] font-extrabold text-[#E31E2B] bg-white px-2 py-0.5 rounded-md border border-gray-100">
                  {rec.highestCtc}
                </span>
              </div>
              <div className="text-[11px] text-[#687086] font-medium truncate">
                {rec.category}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. REPLACEMENT FOR INSTANT AID ESTIMATOR: HIGH-CONVERTING CAREER & PLACEMENT CTA CARD */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#171B52] via-[#10143E] to-[#171B52] p-6 sm:p-8 lg:p-10 text-white shadow-xl overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E31E2B]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#FF6B6B] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Career Acceleration Desk</span>
            </div>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Unsure About Your Career Direction or Salary Potential?
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
              Book a 1-on-1 strategy call with our Senior Placement Analysts. We evaluate your academic profile, match you with highest-placing institutions, and provide authentic branch-wise recruitment packages.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-gray-300 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                <span>Branch-Wise Package Analysis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                <span>Verified NIRF Placement Audits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                <span>100% Free Strategy Session</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 text-center">
            <button
              onClick={() => openModal("Career & Placement Strategy Call")}
              className="tactile-btn-red text-white px-8 py-4 rounded-2xl font-display font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Book Placement Consultation</span>
            </button>
            <span className="text-[11px] text-gray-400 block mt-2 font-medium">
              ⚡ Connect within 15 minutes during working hours
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
