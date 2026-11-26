"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Sparkles,
  Award,
  BadgePercent,
  Banknote,
  FileCheck2,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

export function FinalCounsellingCta() {
  const { openModal } = useCounselingModal();

  const guaranteeCards = [
    {
      icon: ShieldCheck,
      badge: "Zero Admission Fee Guarantee",
      badgeColor: "bg-red-50 text-[#E31E2B] border-red-100",
      title: "Zero Advisory Fees — Ever",
      desc: "We never charge students for college discovery, choice filling or counselling. Transparent, ethical guidance funded directly through authorized university admissions.",
      highlight: "100% Free Guidance",
      actionText: "Book Free Counselling",
      actionQuery: "Zero Advisory Fee Guarantee",
    },
    {
      icon: Award,
      badge: "Direct Quota & Merit Desk",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      title: "Institutional Merit & Quota Seats",
      desc: "Fast-track confirmed admissions under institutional merit, state quota, and NRI seats with statutory cutoff compliance and zero middleman commissions.",
      highlight: "Verified Institutional Allotments",
      actionText: "Check Quota Eligibility",
      actionQuery: "Institutional Merit & Quota Seats",
    },
    {
      icon: Banknote,
      badge: "Financial Aid & Fee Concession Desk",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      title: "Tuition Waivers & 0% Advance Loans",
      desc: "Pre-approved education loans up to ₹20 Lakhs with nationalized banks (SBI, HDFC Credila) alongside direct 25% to 100% institutional merit fee concessions.",
      highlight: "Up to 100% Tuition Waiver",
      actionText: "Apply for Fee Concession",
      actionQuery: "Fee Concession & Student Loan Guidance",
    },
  ];

  return (
    <section id="counselling" className="py-8 sm:py-14 lg:py-20 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. 3 TACTILE GUARANTEE & ASSURANCE CTA CARDS */}
      <div className="mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 sm:mb-6 gap-2 border-b border-[#E7E9F0] pb-3 sm:pb-4">
          <div>
            <span className="text-[#E31E2B] font-bold text-xs uppercase tracking-wider block mb-1">
              — Guaranteed Student Protection
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
              Our Admission Guarantees to Every Aspirant
            </h2>
          </div>
          <span className="text-xs text-[#687086] font-semibold">
            Institutional Standards • 100% Authentic Allotments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {guaranteeCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => openModal(card.actionQuery)}
                className="tactile-card rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-[#E7E9F0] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group bg-white"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="tactile-icon-box w-12 h-12 rounded-2xl flex items-center justify-center text-[#E31E2B]">
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-lg text-[#15182D] group-hover:text-[#E31E2B] transition-colors leading-snug mb-2">
                    {card.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] text-[#687086] leading-relaxed font-normal mb-4">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#15182D]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{card.highlight}</span>
                  </div>

                  <button
                    type="button"
                    className="tactile-btn-red text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1 group-hover:shadow-md transition-all"
                  >
                    <span>{card.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. FLAGSHIP BANNER: 3D GRADUATION CAP & DIRECT CONSULTATION */}
      <div className="relative rounded-2xl sm:rounded-[32px] bg-gradient-to-r from-[#9F0712] via-[#E31E2B] to-[#80050D] p-5 sm:p-8 lg:p-12 text-white shadow-2xl overflow-hidden border border-white/20">
        {/* Ambient lighting & radial gloss */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-black/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: 3D Graduation Cap Asset & Headlines (8 cols) */}
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 lg:gap-8 text-center sm:text-left">
            {/* 3D Graduation Cap on Red Academic Books */}
            <div className="relative w-36 h-28 sm:w-44 sm:h-36 shrink-0 drop-shadow-[0_20px_25px_rgba(0,0,0,0.45)]">
              <Image
                src="/images/ss_crops/grad_cap_cta.png"
                alt="3D Graduation Cap and Academic Books"
                fill
                priority
                className="object-contain"
              />
            </div>

            {/* Typography & Benefit Chips */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Zero Admission Fee Guarantee</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                Ready to Start Your Admission Journey?
              </h2>

              <p className="text-xs sm:text-sm text-red-100 max-w-xl leading-relaxed font-normal">
                Book a free counselling session with our senior experts and get personalised, end-to-end guidance for the right college, stream and fee planning.
              </p>

              {/* 3 Value Pillars */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 pt-2 text-xs font-bold text-white">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
                  <span>100% Free Guidance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
                  <span>Curated College Shortlist</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
                  <span>End-to-End Application Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Converting Tactile Booking Module (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center gap-3">
            <button
              onClick={() => openModal("Ready to Start Your Journey CTA Banner")}
              className="tactile-btn-white w-full sm:w-auto px-8 py-4 rounded-full font-display font-extrabold text-sm sm:text-base text-[#E31E2B] transition-all flex items-center justify-center gap-3 shadow-2xl hover:scale-105 active:scale-95 group"
            >
              <span>Book Free Counselling</span>
              <ArrowRight className="w-4 h-4 stroke-[3] transition-transform group-hover:translate-x-1" />
            </button>

            {/* Instant Call Alternative */}
            <div className="flex items-center gap-2 text-xs text-red-100 font-semibold pt-1">
              <span>Or speak with a director directly:</span>
              <a
                href="tel:+919876543210"
                className="text-white underline hover:text-amber-200 font-bold transition-colors"
              >
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
