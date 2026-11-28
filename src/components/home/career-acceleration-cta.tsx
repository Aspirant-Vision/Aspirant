"use client";

import React from "react";
import { Sparkles, CheckCircle2, PhoneCall } from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

export function CareerAccelerationCta() {
  const { openModal } = useCounselingModal();

  return (
    <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
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
              type="button"
              onClick={() => openModal("Career & Placement Strategy Call")}
              className="tactile-btn-red text-white px-8 py-4 rounded-2xl font-display font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
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
