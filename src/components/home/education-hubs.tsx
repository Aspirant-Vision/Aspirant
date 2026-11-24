"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Building2, TrendingUp, ArrowRight, Sparkles, Compass } from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

interface EducationHub {
  id: string;
  city: string;
  region: string;
  collegesCount: string;
  topInstitutes: string[];
  avgPackage: string;
  badge: string;
  highlight: string;
  accent: string;
}

const HUBS: EducationHub[] = [
  {
    id: "delhi-ncr",
    city: "Delhi NCR",
    region: "Northern Capital Region",
    collegesCount: "480+ Colleges",
    topInstitutes: ["IIT Delhi", "DTU Delhi", "FMS Delhi", "NSUT"],
    avgPackage: "₹18.5 LPA",
    badge: "Corporate & Policy Capital",
    highlight: "Highest density of top Fortune 500 corporate headquarters & national labs.",
    accent: "from-blue-600 to-indigo-700",
  },
  {
    id: "bhubaneswar",
    city: "Bhubaneswar & Odisha",
    region: "Eastern Education Hub",
    collegesCount: "240+ Colleges",
    topInstitutes: ["KIIT University", "SOA University", "NIT Rourkela", "AIIMS"],
    avgPackage: "₹9.8 LPA",
    badge: "Smart City & IT Corridor",
    highlight: "Fastest-growing education cluster with world-class residential campuses.",
    accent: "from-red-600 to-rose-700",
  },
  {
    id: "bangalore",
    city: "Bangalore & Karnataka",
    region: "Southern Tech Corridor",
    collegesCount: "520+ Colleges",
    topInstitutes: ["IISc Bangalore", "IIM Bangalore", "RVCE", "PES University"],
    avgPackage: "₹21.0 LPA",
    badge: "Silicon Valley of India",
    highlight: "Unmatched tech startup ecosystem with premier global R&D recruitment.",
    accent: "from-emerald-600 to-teal-700",
  },
  {
    id: "mumbai-pune",
    city: "Mumbai & Pune",
    region: "Western Commercial Hub",
    collegesCount: "380+ Colleges",
    topInstitutes: ["IIT Bombay", "SPJIMR", "COEP Tech", "VJTI Mumbai"],
    avgPackage: "₹19.4 LPA",
    badge: "Finance & Manufacturing",
    highlight: "Banking, capital markets, automotive and aerospace hiring epicenter.",
    accent: "from-amber-600 to-orange-700",
  },
];

export function EducationHubs() {
  const { openModal } = useCounselingModal();
  const [activeHub, setActiveHub] = useState(HUBS[0].id);

  return (
    <section className="py-8 sm:py-14 lg:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-10 gap-4 border-b border-[#E7E9F0] pb-4 sm:pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#E31E2B] text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Geographical Discovery</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
            Explore Top Education Hubs Across India
          </h2>
          <p className="text-xs sm:text-sm text-[#687086] mt-1 max-w-2xl leading-relaxed">
            Discover leading institutions by regional placement ecosystems, industry proximity, and university culture.
          </p>
        </div>

        <button
          onClick={() => openModal("All Educational Hubs across India")}
          className="tactile-btn-white inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#15182D] transition-all"
        >
          <span>View All Regions</span>
          <ArrowRight className="w-4 h-4 text-[#E31E2B]" />
        </button>
      </div>

      {/* 4 Interactive Skeuomorphic Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {HUBS.map((hub) => {
          const isSelected = activeHub === hub.id;
          return (
            <div
              key={hub.id}
              onMouseEnter={() => setActiveHub(hub.id)}
              onClick={() => openModal(`Education Hub: ${hub.city}`)}
              className={`tactile-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 cursor-pointer flex flex-col justify-between group ${
                isSelected ? "border-[#E31E2B]/50 ring-1 ring-[#E31E2B]/30" : ""
              }`}
            >
              <div className="space-y-4">
                {/* Header Tag & Icon */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-gray-100 text-[#15182D]">
                    {hub.collegesCount}
                  </span>
                  <div className="tactile-icon-box w-10 h-10 rounded-2xl flex items-center justify-center text-[#E31E2B]">
                    <MapPin className="w-5 h-5 stroke-[2.2]" />
                  </div>
                </div>

                {/* Hub City & Tagline */}
                <div>
                  <h3 className="font-display font-bold text-xl text-[#15182D] group-hover:text-[#E31E2B] transition-colors leading-tight">
                    {hub.city}
                  </h3>
                  <span className="text-xs text-[#E31E2B] font-semibold block mt-0.5">
                    {hub.badge}
                  </span>
                  <p className="text-xs text-[#687086] mt-2 leading-relaxed">
                    {hub.highlight}
                  </p>
                </div>

                {/* Key Institutions List */}
                <div className="p-3.5 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0]/80 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#687086]">
                    Top Institutions
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {hub.topInstitutes.map((inst) => (
                      <span
                        key={inst}
                        className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded-md border border-[#E7E9F0] text-[#15182D]"
                      >
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Metrics & Action */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#687086] font-medium">Avg Package</div>
                  <div className="font-display font-extrabold text-sm text-[#16A34A] flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{hub.avgPackage}</span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-red-50 text-[#E31E2B] flex items-center justify-center group-hover:bg-[#E31E2B] group-hover:text-white transition-colors shadow-xs">
                  <ArrowRight className="w-4 h-4 stroke-[2.2] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
