import React from "react";
import { SITE_CONFIG } from "@/lib/constants";

export function PartnersMarquee() {
  const partners = SITE_CONFIG.partners;

  return (
    <section className="bg-surface-container py-12 border-y border-outline-variant/30 overflow-hidden">
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-outline">
          Our Elite Academic Partners
        </p>
      </div>

      <div className="marquee-container">
        <div className="marquee-content flex items-center gap-12 sm:gap-20">
          {/* First loop */}
          {partners.map((partner, index) => (
            <span
              key={`p1-${index}`}
              className="font-display text-lg sm:text-2xl font-black text-primary/40 hover:text-primary transition-all duration-300 cursor-default tracking-wide uppercase select-none whitespace-nowrap"
            >
              {partner}
            </span>
          ))}
          {/* Second loop for seamless continuous scrolling */}
          {partners.map((partner, index) => (
            <span
              key={`p2-${index}`}
              className="font-display text-lg sm:text-2xl font-black text-primary/40 hover:text-primary transition-all duration-300 cursor-default tracking-wide uppercase select-none whitespace-nowrap"
            >
              {partner}
            </span>
          ))}
          {/* Third loop for ultrawide displays */}
          {partners.map((partner, index) => (
            <span
              key={`p3-${index}`}
              className="font-display text-lg sm:text-2xl font-black text-primary/40 hover:text-primary transition-all duration-300 cursor-default tracking-wide uppercase select-none whitespace-nowrap"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
