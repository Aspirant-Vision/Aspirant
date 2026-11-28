"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

export function AdmissionJourneyBanner() {
  const { openModal } = useCounselingModal();

  return (
    <section className="py-10 max-w-container-max mx-auto px-4 md:px-margin-desktop">
      {/* Red Gradient Banner */}
      <div className="relative rounded-[32px] bg-gradient-to-r from-[#990011] via-[#C61D24] to-[#7A000D] p-8 md:py-10 md:px-12 overflow-hidden shadow-2xl border border-red-900/40 text-white">
        {/* Subtle decorative background waves */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cta-stripes" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="#FFFFFF" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-stripes)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: 3D Graduation Cap on Books */}
          <div className="relative w-36 h-28 sm:w-44 sm:h-32 shrink-0 drop-shadow-2xl">
            <Image
              src="/images/ss_crops/grad_cap_cta.png"
              alt="Graduation Cap and Books"
              fill
              className="object-contain"
            />
          </div>

          {/* Center: Title & Subtitle */}
          <div className="flex-1 text-center lg:text-left space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-extrabold leading-tight tracking-tight">
              Ready to Start Your <br className="hidden sm:inline" />
              Admission Journey?
            </h2>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl leading-relaxed">
              Book a free counselling session with our experts and get personalised guidance for the right college and course.
            </p>
          </div>

          {/* Right: Book Free Counselling Button */}
          <div className="shrink-0">
            <button
              onClick={() => openModal("Admission Journey Banner")}
              className="bg-white hover:bg-gray-50 text-[#C61D24] px-7 py-3.5 rounded-full font-display font-extrabold text-sm sm:text-base shadow-md transition-colors flex items-center gap-2 group cursor-pointer"
            >
              <span>Book Free Counselling</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="relative z-10 mt-8 pt-5 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-white/90">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Free Guidance</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>College Shortlist</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Application Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
