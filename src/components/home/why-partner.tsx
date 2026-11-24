"use client";

import React from "react";
import { ArrowRight, Headphones, Layers, Zap, ShieldCheck } from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

export function WhyPartner() {
  const { openModal } = useCounselingModal();

  const features = [
    {
      icon: Headphones,
      title: "Expert Counsellors",
      desc: "Personalized guidance from admission experts.",
    },
    {
      icon: Layers,
      title: "Verified Colleges",
      desc: "Only trusted and recognized institutions.",
    },
    {
      icon: Zap,
      title: "End-to-End Support",
      desc: "From application to final admission — we're with you.",
    },
    {
      icon: ShieldCheck,
      title: "Transparent Process",
      desc: "Clear information, no hidden charges.",
    },
  ];

  return (
    <section className="py-16 max-w-container-max mx-auto px-4 md:px-margin-desktop">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Heading & CTA */}
        <div className="lg:col-span-5 space-y-5">
          <span className="text-[#DC2626] font-bold text-xs uppercase tracking-wider block">
            — Why Aspirant Vision
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            More Than a Platform — <br />
            Your <span className="text-[#DC2626]">Admission Partner</span>
          </h2>
          <p className="font-body text-sm sm:text-base text-gray-600 leading-relaxed">
            Expert guidance, verified colleges and end-to-end support for a stress-free admission journey.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#DC2626] text-[#DC2626] hover:bg-red-50 text-xs sm:text-sm font-bold transition-all shadow-xs"
            >
              <span>Get Expert Guidance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: 2x2 Feature Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0 border border-red-100">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900 mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
