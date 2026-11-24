"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

export function ComparisonPreview() {
  const { openModal } = useCounselingModal();

  return (
    <section id="compare" className="bg-primary text-white py-20 lg:py-24 overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value Prop */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-secondary-fixed text-xs font-bold tracking-widest uppercase">
              Side-By-Side Intelligence
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              Stop Guessing. <br />
              <span className="text-secondary-fixed">Start Comparing.</span>
            </h2>

            <p className="font-body text-base text-primary-fixed-dim leading-relaxed">
              Our proprietary comparison tool looks at over 50 metrics including ROI, faculty quality, NIRF ranks, and verified recruiter ties to help you decide.
            </p>

            <ul className="space-y-4 pt-2">
              {[
                "Direct placement data & CTC comparisons",
                "Transparent fee structure & scholarship analysis",
                "Campus infrastructure & lab walkthroughs",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                  <span className="text-sm sm:text-base font-medium text-white/90">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Button
                onClick={() => openModal("College Comparison")}
                variant="accent"
                size="lg"
                className="rounded-xl px-8 text-primary font-extrabold shadow-xl hover:shadow-2xl"
              >
                Try Comparison Tool
              </Button>
            </div>
          </div>

          {/* Right Column: Comparison Card Preview */}
          <div className="lg:col-span-7 relative">
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              {/* Card A: KIIT */}
              <div className="glass-card-dark p-6 rounded-2xl flex-1 border border-white/20 shadow-2xl relative">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-[11px] uppercase tracking-widest font-extrabold text-secondary-fixed">
                    Selection A
                  </span>
                  <button className="text-white/40 hover:text-white" aria-label="Close">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative h-14 w-14 rounded-xl mb-4 bg-white p-2 overflow-hidden shadow-sm flex items-center justify-center">
                  <Image
                    src="/images/campuses/kiit.png"
                    alt="KIIT University"
                    fill
                    className="object-cover"
                  />
                </div>

                <h4 className="text-white font-display font-bold text-xl mb-6">
                  KIIT University
                </h4>

                <div className="space-y-4 pt-2 border-t border-white/10">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>Placement Index</span>
                      <span className="font-bold text-secondary-fixed">9.5/10</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full w-[95%]" />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs pt-1 text-white/80">
                    <span>Avg Package:</span>
                    <span className="font-bold text-white">₹8.5 LPA</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/80">
                    <span>Highest CTC:</span>
                    <span className="font-bold text-secondary-fixed">₹52.0 LPA</span>
                  </div>
                </div>
              </div>

              {/* Central VS Badge */}
              <div className="flex items-center justify-center -my-2 md:my-0">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-primary font-black text-sm shadow-xl z-10 border-2 border-primary">
                  VS
                </div>
              </div>

              {/* Card B: SOA */}
              <div className="glass-card-dark p-6 rounded-2xl flex-1 border border-white/20 shadow-2xl relative">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-[11px] uppercase tracking-widest font-extrabold text-secondary-fixed">
                    Selection B
                  </span>
                  <button className="text-white/40 hover:text-white" aria-label="Close">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative h-14 w-14 rounded-xl mb-4 bg-white p-2 overflow-hidden shadow-sm flex items-center justify-center">
                  <Image
                    src="/images/campuses/soa.png"
                    alt="SOA University"
                    fill
                    className="object-cover"
                  />
                </div>

                <h4 className="text-white font-display font-bold text-xl mb-6">
                  SOA University
                </h4>

                <div className="space-y-4 pt-2 border-t border-white/10">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>Placement Index</span>
                      <span className="font-bold text-secondary-fixed">8.8/10</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary-light rounded-full w-[88%]" />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs pt-1 text-white/80">
                    <span>Avg Package:</span>
                    <span className="font-bold text-white">₹7.2 LPA</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/80">
                    <span>Highest CTC:</span>
                    <span className="font-bold text-secondary-fixed">₹42.0 LPA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
