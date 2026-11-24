"use client";

import React from "react";
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
    <section id="courses" className="py-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-3 border-b border-[#E7E9F0] pb-5">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
            Explore by <span className="text-[#E31E2B]">Your Goal</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#687086] mt-1">
            Choose your stream and find the best colleges, courses and admission options.
          </p>
        </div>
        <button
          onClick={() => openModal("All Courses & Streams")}
          className="tactile-pill px-4 py-2 rounded-full text-[#E31E2B] font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:text-[#c91622] group"
        >
          <span>Explore All Courses</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* 8 Tactile Cards with Interactive Skeuomorphic Icon Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5 sm:gap-4">
        {streams.map((stream, idx) => {
          const Icon = stream.icon;
          return (
            <button
              key={idx}
              onClick={() => openModal(`Stream: ${stream.name}`)}
              className="tactile-card rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 text-center group cursor-pointer"
            >
              <div className={`tactile-icon-box w-12 h-12 rounded-2xl flex items-center justify-center ${stream.color}`}>
                <Icon className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="leading-tight mt-1">
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
    </section>
  );
}
