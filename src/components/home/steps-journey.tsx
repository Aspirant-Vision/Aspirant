"use client";

import React from "react";
import { Search, Headphones, FileText, GraduationCap, ChevronRight } from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

export function StepsJourney() {
  const { openModal } = useCounselingModal();

  const steps = [
    {
      number: "1",
      title: "1. Discover",
      desc: "Find & compare colleges and courses",
      icon: Search,
    },
    {
      number: "2",
      title: "2. Get Counselling",
      desc: "Talk to our expert counsellors",
      icon: Headphones,
    },
    {
      number: "3",
      title: "3. Apply",
      desc: "Submit your application with full support",
      icon: FileText,
    },
    {
      number: "4",
      title: "4. Get Admitted",
      desc: "Receive confirmation and start your journey",
      icon: GraduationCap,
    },
  ];

  return (
    <section className="py-8 max-w-container-max mx-auto px-4 md:px-margin-desktop">
      {/* Dark Curved Container */}
      <div className="relative rounded-[32px] bg-gradient-to-r from-[#200A10] via-[#111827] to-[#1E0911] p-8 md:p-12 overflow-hidden shadow-2xl border border-red-950/40">
        {/* Subtle Ambient Red Glow */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 mb-10">
          <span className="text-[#DC2626] font-bold text-xs uppercase tracking-wider block mb-1">
            — Top Admission Journey
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            From Search to Admission in <span className="text-[#DC2626]">4 Simple Steps</span>
          </h2>
        </div>

        {/* 4 Connected Step Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={idx}>
                <div
                  onClick={() => openModal(step.title)}
                  className="bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-red-500/40 transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[160px]"
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-2xl bg-[#DC2626] text-white flex items-center justify-center shadow-md mb-4">
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-white group-hover:text-[#F87171] transition-colors mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Chevron divider between steps (hidden on mobile / last item) */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center -mx-2 text-white/30">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
