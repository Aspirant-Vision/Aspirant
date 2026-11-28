"use client";

import React from "react";
import Image from "next/image";
import {
  Headphones,
  Layers,
  Zap,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Building,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

export function WhyAspirantVision() {
  const { openModal } = useCounselingModal();

  const benefits = [
    {
      icon: Headphones,
      title: "Expert Counsellors",
      description: "Personalized 1-on-1 strategy sessions with senior admission mentors.",
    },
    {
      icon: Layers,
      title: "Verified Colleges",
      description: "Only UGC, AICTE & NAAC accredited institutions with verified cutoffs.",
    },
    {
      icon: Zap,
      title: "End-to-End Support",
      description: "From form filling and documentation to final seat allotment on campus.",
    },
    {
      icon: ShieldCheck,
      title: "Transparent Process",
      description: "100% ethical admission guidance with zero hidden charges or commissions.",
    },
  ];

  return (
    <section id="why" className="py-8 sm:py-14 lg:py-20 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* 32px Rounded Tactile Canvas with Clearly Visible Campus Background Image */}
      <div className="relative rounded-2xl sm:rounded-[32px] overflow-hidden border border-[#E7E9F0] shadow-2xl bg-white p-5 sm:p-10 lg:p-16">
        {/* Authentic Academic Campus Photography (Why Aspirant Vision Custom Visual) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/why_Aspirantvision.webp"
            alt="Premier Academic University Campus - Why Aspirant Vision"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Subtle gradient to enhance depth */}
          <div className="absolute inset-0 bg-white/40 lg:bg-white/20 pointer-events-none" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (5 cols) wrapped in high-contrast tactile card */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/90 shadow-xl space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#E31E2B] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Why Aspirant Vision</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#15182D] leading-[1.2] tracking-tight">
              More Than a Platform — <br />
              Your <span className="text-[#E31E2B]">Admission Partner</span>
            </h2>

            <p className="font-body text-xs sm:text-sm text-[#4B5563] leading-relaxed font-normal">
              Navigating university admissions can be stressful. We provide authenticated college data, cutoff predictability, and personal mentorship so students make informed choices with complete clarity.
            </p>

            {/* Quick Trust Checklist */}
            <div className="space-y-2.5 pt-1 text-xs sm:text-sm font-semibold text-[#15182D]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E31E2B] shrink-0" />
                <span>20+ Years of Senior Academic Advisory</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E31E2B] shrink-0" />
                <span>Zero Hidden Fees or Advisory Markups</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E31E2B] shrink-0" />
                <span>2,500+ Verified NAAC &amp; NIRF Partner Campuses</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => openModal("Why Aspirant Vision - Expert Guidance")}
                className="tactile-btn-red text-white px-7 py-3 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-md transition-colors group cursor-pointer"
              >
                <span>Get Expert Guidance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right 2x2 Tactile Glass Cards Grid (7 cols) Floating Over Visible Campus Image */}
          <div className="lg:col-span-7">
            {/* Campus Floating Tag */}
            <div className="mb-4 flex items-center justify-end">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 backdrop-blur-md border border-white/80 text-[11px] font-bold text-[#15182D] shadow-sm">
                <Building className="w-3.5 h-3.5 text-[#E31E2B]" />
                <span>Premier Accredited Partner Campuses</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {benefits.map((b, idx) => {
                const Icon = b.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => openModal(`Why Aspirant Vision: ${b.title}`)}
                    className="tactile-card bg-white/85 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/90 shadow-md transition-colors duration-200 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31E2B] flex items-center justify-center shrink-0 border border-red-100 group-hover:bg-[#E31E2B] group-hover:text-white transition-colors mb-3.5 shadow-xs">
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <h3 className="font-display font-extrabold text-base text-[#15182D] group-hover:text-[#E31E2B] transition-colors leading-snug mb-1.5">
                      {b.title}
                    </h3>
                    <p className="text-xs text-[#687086] leading-relaxed font-normal">
                      {b.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
