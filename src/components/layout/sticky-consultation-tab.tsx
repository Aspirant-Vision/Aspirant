"use client";

import React from "react";
import { Headphones, PhoneCall, Sparkles } from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

export function StickyConsultationTab() {
  const { openModal } = useCounselingModal();

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 pointer-events-auto">
      <button
        type="button"
        onClick={() => openModal("Sticky Vertical Consultation Tab")}
        className="group relative flex flex-col items-center justify-between py-4 px-2 sm:px-2.5 rounded-l-2xl text-white transition-all duration-300 cursor-pointer shadow-[-4px_4px_20px_rgba(227,30,43,0.35)] hover:shadow-[-6px_6px_25px_rgba(227,30,43,0.5)] hover:-translate-x-1 active:translate-x-0 border-y border-l border-white/30 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #FF3845 0%, #E31E2B 45%, #B30E19 100%)",
        }}
        aria-label="Get Free Consultation"
      >
        {/* Sleek top 3D specular highlight */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

        {/* Clean Integrated Icon (No separate bulbous circle, prevents double look) */}
        <div className="relative z-10 w-7 h-7 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs group-hover:scale-110 transition-transform">
          <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>

        {/* Vertical Typography (Single unified continuous label) */}
        <div
          className="relative z-10 my-3 font-display font-extrabold text-[11px] tracking-widest uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] select-none"
          style={{ writingMode: "vertical-rl" }}
        >
          Free Consultation
        </div>

        {/* Pulsing Green Online Indicator */}
        <div className="relative z-10 flex items-center justify-center h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-sm" />
        </div>
      </button>
    </div>
  );
}
