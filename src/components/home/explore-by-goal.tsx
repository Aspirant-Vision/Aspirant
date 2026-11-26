"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
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
  Sparkles,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

export function ExploreByGoal() {
  const { openModal } = useCounselingModal();

  const streams = [
    {
      name: "Engineering",
      icon: Cog,
      color: "text-[#E31E2B]",
      colleges: "Top B.Tech Campuses",
      href: "/colleges?type=Engineering",
    },
    {
      name: "Management",
      icon: TrendingUp,
      color: "text-[#E31E2B]",
      colleges: "620+ Colleges",
      href: "/mba",
      badge: "MBA | PGDM",
    },
    {
      name: "Medical",
      icon: PlusSquare,
      color: "text-[#E31E2B]",
      colleges: "340+ Colleges",
      href: "/colleges?type=Medical",
    },
    {
      name: "Law",
      icon: Scale,
      color: "text-[#E31E2B]",
      colleges: "180+ Colleges",
      href: "/colleges?type=Law",
    },
    {
      name: "Design",
      icon: PenTool,
      color: "text-[#E31E2B]",
      colleges: "120+ Colleges",
      href: "/colleges?type=Design+%26+Media",
    },
    {
      name: "Commerce",
      icon: Layers,
      color: "text-amber-600",
      colleges: "410+ Colleges",
      href: "/colleges?type=Arts+%26+Science",
    },
    {
      name: "Arts & Science",
      icon: Palette,
      color: "text-[#E31E2B]",
      colleges: "290+ Colleges",
      href: "/colleges?type=Arts+%26+Science",
    },
    {
      name: "More",
      icon: LayoutGrid,
      color: "text-[#171B52]",
      colleges: "All Streams",
      href: "/colleges",
    },
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
        {streams.map((stream: any, idx) => {
          const Icon = stream.icon;
          const CardContent = (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {stream.badge && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-extrabold bg-[#E31E2B] text-white tracking-wider shadow-xs">
                  HOT
                </span>
              )}
              <div
                className={`tactile-icon-box w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${stream.color}`}
              >
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
            </div>
          );

          if (stream.href) {
            return (
              <Link
                key={idx}
                href={stream.href}
                className="tactile-card rounded-xl sm:rounded-2xl p-2.5 sm:p-5 flex flex-col items-center justify-center gap-2 sm:gap-2.5 text-center group cursor-pointer border border-red-200/80 bg-red-50/20 hover:border-[#E31E2B]"
              >
                {CardContent}
              </Link>
            );
          }

          return (
            <button
              key={idx}
              onClick={() => openModal(`Stream: ${stream.name}`)}
              className="tactile-card rounded-xl sm:rounded-2xl p-2.5 sm:p-5 flex flex-col items-center justify-center gap-2 sm:gap-2.5 text-center group cursor-pointer"
            >
              {CardContent}
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
            <div className="max-w-xl space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                Direct Academic Advisory
              </span>
              <h3 className="text-lg sm:text-2xl font-extrabold text-white leading-tight">
                Not sure which stream or college fits your career goals?
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2">
                Our certified counsellors map your CAT, XAT, JEE, NEET &amp; graduation scores to premier eligible colleges with guaranteed zero admission stress.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => openModal("Career Stream Mapping Session")}
                  className="tactile-btn-red text-white px-5 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                  <span>Book Free Stream Mapping</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <Link
                  href="/mba"
                  className="tactile-pill text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Sparkles className="w-3 h-3 text-red-300" />
                  <span>Looking for MBA | PGDM? Explore Special Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
