"use client";

import React from "react";
import Image from "next/image";
import {
  Cog,
  TrendingUp,
  PlusSquare,
  Scale,
  PenTool,
  Layers,
  Palette,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

export function ExploreByGoal() {
  const { openModal } = useCounselingModal();

  const streams = [
    { name: "Engineering", icon: Cog, color: "text-[#E31E2B]", colleges: "850+ Colleges" },
    { name: "Management", icon: TrendingUp, color: "text-[#E31E2B]", colleges: "620+ Colleges" },
    { name: "Medical", icon: PlusSquare, color: "text-[#E31E2B]", colleges: "340+ Colleges" },
    { name: "Law", icon: Scale, color: "text-[#E31E2B]", colleges: "180+ Colleges" },
    { name: "Design", icon: PenTool, color: "text-[#E31E2B]", colleges: "120+ Colleges" },
    { name: "Commerce", icon: Layers, color: "text-amber-600", colleges: "410+ Colleges" },
    { name: "Arts", icon: Palette, color: "text-[#E31E2B]", colleges: "290+ Colleges" },
    { name: "More", icon: LayoutGrid, color: "text-[#171B52]", colleges: "All Streams" },
  ];

  return (
    <section id="courses" className="py-8 sm:py-14 lg:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-3 border-b border-[#E7E9F0] pb-4 sm:pb-5">
        <div>
          <h2 className="font-display text-xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
            Explore by <span className="text-[#E31E2B]">Your Goal</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#687086] mt-1">
            Choose your stream and find the best colleges, courses and admission options.
          </p>
        </div>
        <button
          onClick={() => openModal("All Courses & Streams")}
          className="tactile-pill px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[#E31E2B] font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:text-[#c91622] group"
        >
          <span>Explore All Courses</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* 8 Tactile Cards with Interactive Skeuomorphic Icon Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-4">
        {streams.map((stream, idx) => {
          const Icon = stream.icon;
          return (
            <button
              key={idx}
              onClick={() => openModal(`Stream: ${stream.name}`)}
              className="tactile-card rounded-xl sm:rounded-2xl p-2.5 sm:p-5 flex flex-col items-center justify-center gap-2 sm:gap-2.5 text-center group cursor-pointer"
            >
              <div className={`tactile-icon-box w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${stream.color}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              <div className="leading-tight mt-0.5 sm:mt-1">
                <span className="text-xs sm:text-sm font-bold text-[#15182D] group-hover:text-[#E31E2B] transition-colors block">
                  {stream.name}
                </span>
                <span className="text-[10px] text-[#687086] font-medium block mt-0.5">
                  {stream.colleges}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Featured Goal & Stream Exploration Visual Banner */}
      <div className="mt-6 sm:mt-8 relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E7E9F0] shadow-sm bg-slate-900 group">
        <div className="relative h-44 sm:h-56 md:h-64 w-full">
          <Image
            src="/images/explore-by-goal-v2.webp"
            alt="Explore Colleges by Degree Goal - Aspirant Vision"
            fill
            sizes="100vw"
            className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent flex items-center p-6 sm:p-10">
            <div className="max-w-md space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                Direct Academic Advisory
              </span>
              <h3 className="text-lg sm:text-2xl font-extrabold text-white leading-tight">
                Not sure which stream fits your career goals?
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2">
                Our certified counsellors map your JEE, NEET, CUET &amp; 12th scores to top eligible colleges with guaranteed zero admission stress.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => openModal("Career Stream Mapping Session")}
                  className="tactile-btn-red text-white px-5 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                  <span>Book Free Stream Mapping</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
