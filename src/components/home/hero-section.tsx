"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Search,
  MapPin,
  ArrowRight,
  Landmark,
  GraduationCap,
  FileText,
  Play,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const { openModal } = useCounselingModal();
  const [activeTab, setActiveTab] = useState<"colleges" | "courses" | "exams">("colleges");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All India");

  const popularSearches = [
    "Engineering",
    "Management",
    "Medical",
    "Law",
    "Design",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    openModal(searchQuery ? `${activeTab}: ${searchQuery} in ${selectedLocation}` : selectedLocation);
  };

  return (
    <section className="relative w-full min-h-0 sm:min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden bg-[#F7F8FC]">
      {/* 1. CINEMATIC FULL-WIDTH BACKGROUND PHOTOGRAPHY (herobg.png) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/herobg.png"
          alt="Premier Academic Campus and Aspirant Vision Student"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[84%_10%] sm:object-[82%_center]"
        />
      </div>

      {/* 2. HERO CONTENT LAYER */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-16 lg:py-20">
        <div className="max-w-2xl space-y-3 sm:space-y-5">
          {/* Hero Headline & Intro Card (Frosted glass on mobile ensures 100% text clarity over background photo) */}
          <div className="bg-white/90 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none p-3.5 sm:p-0 rounded-2xl sm:rounded-none border border-white/80 sm:border-transparent shadow-xs sm:shadow-none space-y-2.5 sm:space-y-4">
            {/* Eyebrow Trust Badge & Mobile Student Metric Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#E7E9F0] text-[11px] sm:text-xs font-bold text-[#E31E2B] shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E31E2B]" />
                <span>India&apos;s Trusted Admission Partner</span>
              </div>

              {/* Mobile-only compact Students Guided chip */}
              <div
                onClick={() => openModal("50,000+ Guided Students Showcase")}
                className="inline-flex sm:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-[#E7E9F0] text-[10px] font-bold text-[#15182D] shadow-2xs cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>50,000+ Students Guided</span>
              </div>
            </div>

            {/* Main Headline - perfectly scaled for mobile with 100% legibility */}
            <h1 className="font-display text-[27px] sm:text-5xl lg:text-[56px] font-extrabold text-[#15182D] leading-[1.14] tracking-tight">
              Discover. Compare. Apply. <br />
              <span className="text-[#E31E2B]">Get Admitted.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="font-body text-xs sm:text-lg text-[#15182D] font-medium leading-relaxed max-w-xl">
              Find the right college, explore top courses, and get expert counselling to complete your admission journey — all in one place.
            </p>
          </div>

          {/* Tactile Skeuomorphic Search Engine Module - Compact on Mobile */}
          <div className="tactile-card rounded-2xl sm:rounded-3xl p-3 sm:p-5 max-w-xl pt-3 sm:pt-4">
            {/* Search Category Tabs with Skeuomorphic Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 pb-2 border-b border-gray-100">
              <button
                type="button"
                onClick={() => setActiveTab("colleges")}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all",
                  activeTab === "colleges"
                    ? "tactile-btn-red text-white"
                    : "tactile-pill text-[#687086] hover:text-[#15182D]"
                )}
              >
                <Landmark className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Colleges</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("courses")}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all",
                  activeTab === "courses"
                    ? "tactile-btn-red text-white"
                    : "tactile-pill text-[#687086] hover:text-[#15182D]"
                )}
              >
                <GraduationCap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Courses</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("exams")}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all",
                  activeTab === "exams"
                    ? "tactile-btn-red text-white"
                    : "tactile-pill text-[#687086] hover:text-[#15182D]"
                )}
              >
                <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Exams</span>
              </button>
            </div>

            {/* Input & Location Row with Tactile Well */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 bg-[#F7F8FC] rounded-xl sm:rounded-2xl p-1 sm:p-1.5 border border-[#E7E9F0] shadow-inner"
            >
              {/* Search text input */}
              <div className="relative flex-1 flex items-center">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search colleges, courses or programs..."
                  className="w-full pl-8 sm:pl-10 pr-2.5 py-2 sm:py-2.5 text-xs sm:text-sm bg-transparent outline-none text-[#15182D] placeholder:text-[#687086] font-medium"
                />
              </div>

              {/* Location Selector */}
              <div className="flex items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-gray-200 px-2 sm:px-3 py-1.5 sm:py-0">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E31E2B] shrink-0" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-transparent text-[11px] sm:text-xs font-semibold text-[#15182D] outline-none cursor-pointer"
                >
                  <option value="All India">All India</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                </select>
              </div>

              {/* Red Tactile Search Button */}
              <button
                type="submit"
                className="tactile-btn-red text-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
                aria-label="Search"
              >
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* Popular Searches Tactile Chips */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 sm:pt-3 px-0.5 text-xs">
              <span className="text-[#15182D] font-bold text-[10px] sm:text-[11px]">Popular:</span>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                    openModal(`${activeTab}: ${term}`);
                  }}
                  className="tactile-pill px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg text-[#15182D] hover:text-[#E31E2B] font-semibold text-[10px] sm:text-[11px] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. FLOATING TACTILE BADGE: TOP RIGHT (50,000+ Students Guided) */}
        <div className="hidden lg:block absolute top-16 right-16 z-20">
          <div
            onClick={() => openModal("50,000+ Guided Students Showcase")}
            className="tactile-card rounded-2xl px-5 py-3 flex items-center gap-3.5 shadow-xl hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-200 relative shadow-sm">
                <Image src="/images/ss_crops/priya_sharma.png" alt="Student" fill className="object-cover" />
              </div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-amber-100 relative shadow-sm">
                <Image src="/images/hero/hero_student_wide.png" alt="Student" fill className="object-cover object-top" />
              </div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-rose-100 relative shadow-sm">
                <Image src="/images/ss_crops/priya_sharma.png" alt="Student" fill className="object-cover" />
              </div>
            </div>
            <div>
              <div className="font-display font-extrabold text-sm text-[#15182D] leading-none">
                50,000+
              </div>
              <div className="text-[11px] font-semibold text-[#687086] mt-0.5">
                Students Guided
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
