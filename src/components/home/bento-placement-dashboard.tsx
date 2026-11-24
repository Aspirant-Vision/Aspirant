"use client";

import React from "react";
import { Download, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { SITE_CONFIG } from "@/lib/constants";

const RECRUITERS = [
  "TCS",
  "Infosys",
  "Deloitte",
  "Accenture",
  "Wipro",
  "Google",
];

export function BentoPlacementDashboard() {
  const { openModal } = useCounselingModal();

  return (
    <section id="placements" className="py-16 lg:py-20 max-w-container-max mx-auto px-4 md:px-margin-desktop">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column (4 cols): Recruiter Cloud */}
        <div className="lg:col-span-4 bg-white p-7 sm:p-8 rounded-3xl border border-outline-variant/40 shadow-card flex flex-col justify-between">
          <div>
            <span className="text-secondary font-extrabold tracking-widest uppercase text-xs">
              Corporate Network
            </span>
            <h3 className="font-display text-2xl font-bold text-primary mt-1 mb-2">
              Our Network
            </h3>
            <p className="text-sm text-outline leading-relaxed mb-6">
              Connecting our students with India and the world&apos;s most prestigious tier-1 employers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 my-auto">
            {RECRUITERS.map((company, i) => (
              <div
                key={i}
                className="bg-surface-container py-5 px-4 rounded-2xl flex items-center justify-center border border-outline-variant/20 hover:border-primary/30 hover:bg-white hover:shadow-md transition-all group cursor-default"
              >
                <span className="font-display font-extrabold text-primary/60 group-hover:text-primary transition-colors text-base tracking-wide">
                  {company}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-outline-variant/30 text-xs text-outline">
            Over <strong className="text-primary font-bold">400+ recruiting partners</strong> across IT, Consulting, Banking & Core Engineering.
          </div>
        </div>

        {/* Right Column (8 cols): Dashboard Stats Bento */}
        <div className="lg:col-span-8 bg-primary-container p-7 sm:p-10 rounded-3xl text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
          {/* Decorative ambient blur circle */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/15 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-1">
                  Placement Dashboard
                </h3>
                <p className="text-sm text-on-primary-container">
                  Aggregated performance of 2023–24 batch across partner universities.
                </p>
              </div>
              <div className="bg-white/10 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-secondary-fixed border border-white/10 backdrop-blur-sm shrink-0">
                Real-time Data
              </div>
            </div>

            {/* 3 Metric Stat Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              {/* Stat 1 */}
              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="text-secondary-fixed font-display font-black text-3xl">
                  {SITE_CONFIG.stats.averageCtc}
                </div>
                <div className="text-on-primary-container text-xs uppercase font-bold tracking-wider">
                  Average Package
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full w-[65%]" />
                </div>
              </div>

              {/* Stat 2 */}
              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="text-[#62DF7D] font-display font-black text-3xl">
                  {SITE_CONFIG.stats.highestCtc}
                </div>
                <div className="text-on-primary-container text-xs uppercase font-bold tracking-wider">
                  Highest Package
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#16A34A] rounded-full w-[92%]" />
                </div>
              </div>

              {/* Stat 3 */}
              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="text-white font-display font-black text-3xl">
                  {SITE_CONFIG.stats.placementRate}
                </div>
                <div className="text-on-primary-container text-xs uppercase font-bold tracking-wider">
                  Overall Placements
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full w-[96.5%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Growth Callout & Report Download */}
          <div className="mt-8 bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-secondary-container rounded-xl flex items-center justify-center text-primary shrink-0 font-bold">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-white/90 italic">
                &ldquo;Packages across IT & Management sectors saw an {SITE_CONFIG.stats.growthRate} growth.&rdquo;
              </span>
            </div>
            <Button
              onClick={() => openModal("Placement Report Download")}
              variant="accent"
              size="sm"
              className="rounded-xl px-5 py-2.5 text-xs font-bold text-primary shadow-md hover:bg-white shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
