"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Search,
  MapPin,
  ArrowRight,
  Landmark,
  GraduationCap,
  FileText,
  Sparkles,
  Building2,
  Loader2,
  X,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import {
  getLiveSearchSuggestionsAction,
  LiveSearchResults,
  LiveSearchSuggestion,
} from "@/lib/search/actions";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const router = useRouter();
  const { openModal } = useCounselingModal();

  const [activeTab, setActiveTab] = useState<"colleges" | "courses" | "exams">("colleges");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All India");

  // Autocomplete state
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LiveSearchResults | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const popularSearches: Array<{ label: string; href: string }> = [
    { label: "Engineering", href: "/colleges?type=Engineering" },
    { label: "Management", href: "/colleges?type=Management" },
    { label: "Medical", href: "/colleges?type=Medical" },
    { label: "Law", href: "/colleges?type=Law" },
    { label: "Design", href: "/colleges?type=Design" },
  ];

  // Flat list of visible suggestions for keyboard navigation (up/down/enter)
  const flattenedSuggestions: LiveSearchSuggestion[] = React.useMemo(() => {
    if (!suggestions) return [];
    if (activeTab === "courses") {
      return [...suggestions.courses, ...suggestions.colleges, ...suggestions.exams];
    }
    if (activeTab === "exams") {
      return [...suggestions.exams, ...suggestions.colleges, ...suggestions.courses];
    }
    return [...suggestions.colleges, ...suggestions.courses, ...suggestions.exams];
  }, [suggestions, activeTab]);

  // Fetch live suggestions from database
  const fetchSuggestions = React.useCallback(
    async (query: string, loc: string, tab: "colleges" | "courses" | "exams") => {
      setIsLoading(true);
      try {
        const res = await getLiveSearchSuggestionsAction(query, {
          location: loc,
          tab,
        });
        if (res.success && res.data) {
          setSuggestions(res.data);
        }
      } catch (err) {
        console.error("Live search failed:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounce user keystrokes (only fetch when user types something)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim()) {
      setSuggestions(null);
      setIsOpen(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(searchQuery, selectedLocation, activeTab);
    }, 180);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, selectedLocation, activeTab, fetchSuggestions]);

  // Dismiss dropdown on outside clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Form search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);

    // If an item was highlighted with keyboard arrows, navigate directly to it
    if (selectedIndex >= 0 && flattenedSuggestions[selectedIndex]) {
      const selected = flattenedSuggestions[selectedIndex];
      router.push(selected.href);
      return;
    }

    const trimmed = searchQuery.trim();

    if (!trimmed) {
      if (activeTab === "courses") {
        router.push("/courses");
      } else if (activeTab === "exams") {
        router.push("/colleges");
      } else {
        if (selectedLocation && selectedLocation !== "All India") {
          router.push(`/colleges?search=${encodeURIComponent(selectedLocation)}`);
        } else {
          router.push("/colleges");
        }
      }
      return;
    }

    if (activeTab === "courses") {
      router.push(`/courses?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/colleges?search=${encodeURIComponent(trimmed)}`);
    }
  };

  // Keyboard navigation inside search dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || flattenedSuggestions.length === 0) {
      if (e.key === "ArrowDown") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flattenedSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flattenedSuggestions.length - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelectItem = (item: LiveSearchSuggestion) => {
    setIsOpen(false);
    setSearchQuery(item.title);
    router.push(item.href);
  };

  return (
    <section className="relative z-30 w-full min-h-0 sm:min-h-[640px] lg:min-h-[720px] flex items-center overflow-visible bg-[#F7F8FC]">
      {/* 1. CINEMATIC FULL-WIDTH BACKGROUND PHOTOGRAPHY (herobg.png) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/images/herobg.png"
          alt="Premier Academic Campus and Aspirant Vision Student"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[64%_top] sm:object-[82%_center]"
        />
      </div>

      {/* 2. HERO CONTENT LAYER */}
      <div className="relative z-30 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-16 lg:py-20">
        <div className="max-w-2xl space-y-3.5 sm:space-y-5">
          {/* Eyebrow Trust Badge & Mobile Student Metric Row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#E7E9F0] text-[11px] sm:text-xs font-bold text-[#E31E2B] shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E31E2B]" />
              <span>India&apos;s Trusted Admission Partner</span>
            </div>

            {/* Mobile-only compact Students Guided chip */}
            <div
              onClick={() => openModal("50,000+ Guided Students Showcase")}
              className="inline-flex sm:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-[#E7E9F0] text-[10px] font-bold text-[#15182D] shadow-2xs cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>50,000+ Students Guided</span>
            </div>
          </div>

          {/* Main Headline - crystal clear contrast over light campus background */}
          <h1 className="font-display text-[29px] sm:text-5xl lg:text-[56px] font-extrabold text-[#15182D] leading-[1.14] tracking-tight">
            Discover. Compare. Apply. <br />
            <span className="text-[#E31E2B]">
              Get Admitted.
            </span>
          </h1>

          {/* Supporting Copy - bold, crisp, completely readable without any enclosing card */}
          <p className="font-body text-xs sm:text-lg text-[#15182D] font-bold leading-relaxed max-w-xl">
            Find the right college, explore top courses, and get expert counselling to complete your admission journey — all in one place.
          </p>

          {/* Search Engine Module - Solid, static, with live database autocomplete */}
          <div
            ref={containerRef}
            className="relative bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 max-w-xl pt-3 sm:pt-4 border border-[#E7E9F0] shadow-md z-30"
          >
            {/* Search Category Tabs with Skeuomorphic Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 pb-2 border-b border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("colleges");
                  setSelectedIndex(-1);
                }}
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
                onClick={() => {
                  setActiveTab("courses");
                  setSelectedIndex(-1);
                }}
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
                onClick={() => {
                  setActiveTab("exams");
                  setSelectedIndex(-1);
                }}
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
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim().length > 0) {
                      setIsOpen(true);
                    } else {
                      setIsOpen(false);
                      setSuggestions(null);
                    }
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) {
                      setIsOpen(true);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    activeTab === "courses"
                      ? "Search B.Tech, MBA, MBBS, MCA, BBA..."
                      : activeTab === "exams"
                      ? "Search KIITEE, JEE, CAT, NEET, OJEE..."
                      : "Search colleges (e.g. KIIT, IIM, RVCE, Centurion)..."
                  }
                  className="w-full pl-8 sm:pl-10 pr-8 py-2 sm:py-2.5 text-xs sm:text-sm bg-transparent outline-none text-[#15182D] placeholder:text-[#687086] font-medium"
                />

                {/* Clear button or loading indicator */}
                <div className="absolute right-2.5 flex items-center gap-1">
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                  ) : searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSuggestions(null);
                        setIsOpen(false);
                        setSelectedIndex(-1);
                        inputRef.current?.focus();
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                      aria-label="Clear search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Location Selector */}
              <div className="flex items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-gray-200 px-2 sm:px-3 py-1.5 sm:py-0">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E31E2B] shrink-0" />
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    if (searchQuery.trim().length > 0) {
                      setIsOpen(true);
                    }
                  }}
                  className="bg-transparent text-[11px] sm:text-xs font-semibold text-[#15182D] outline-none cursor-pointer"
                >
                  <option value="All India">All India</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
              </div>

              {/* Red Tactile Search Button */}
              <button
                type="submit"
                className="tactile-btn-red text-white py-2.5 px-4 sm:p-3 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 shrink-0 font-bold text-xs sm:text-sm"
                aria-label="Search"
              >
                <span className="sm:hidden">
                  {activeTab === "courses" ? "Search Courses" : activeTab === "exams" ? "Search Exams" : "Search Colleges"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* LIVE AUTOCOMPLETE DROPDOWN POPOVER (only when user types) */}
            {isOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2.5 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 max-h-[380px] flex flex-col">
                {/* Header status */}
                <div className="px-4 py-2 bg-gray-50/80 flex items-center justify-between text-[11px] text-[#687086] font-medium border-b border-gray-100">
                  <span>
                    {isLoading ? (
                      <span className="flex items-center gap-1.5 text-red-600 font-semibold">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Fetching live database results...
                      </span>
                    ) : searchQuery.trim() ? (
                      `Matching suggestions for "${searchQuery}"`
                    ) : (
                      "Popular & Recommended Searches"
                    )}
                  </span>
                  <span className="text-[10px] text-gray-400">Use ↑↓ keys to navigate</span>
                </div>

                {/* Suggestions List Body */}
                <div className="overflow-y-auto flex-1 p-2 space-y-3">
                  {/* Empty State */}
                  {!isLoading && flattenedSuggestions.length === 0 && searchQuery.trim() && (
                    <div className="py-6 px-4 text-center space-y-3">
                      <p className="text-xs text-[#687086]">
                        No exact match for <strong className="text-[#15182D]">&quot;{searchQuery}&quot;</strong> in our database.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            router.push(`/colleges?search=${encodeURIComponent(searchQuery)}`);
                          }}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#15182D] text-xs font-semibold rounded-lg transition-colors"
                        >
                          Search All Colleges
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            openModal(`General Search: ${searchQuery}`);
                          }}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#E31E2B] text-xs font-semibold rounded-lg transition-colors"
                        >
                          Request Free Counselling
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 1. COLLEGES SECTION */}
                  {suggestions && suggestions.colleges.length > 0 && (
                    <div>
                      <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <Landmark className="w-3 h-3 text-[#E31E2B]" />
                        <span>Colleges &amp; Universities ({suggestions.colleges.length})</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {suggestions.colleges.map((col) => {
                          const idx = flattenedSuggestions.findIndex((x) => x.id === col.id && x.type === col.type);
                          const isSelected = idx === selectedIndex;
                          return (
                            <button
                              key={`col-${col.id}`}
                              type="button"
                              onClick={() => handleSelectItem(col)}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-3 transition-colors",
                                isSelected ? "bg-red-50/80 border border-red-200/60" : "hover:bg-gray-50"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200/80 flex items-center justify-center shrink-0 overflow-hidden text-gray-600">
                                  {col.logoUrl ? (
                                    <Image
                                      src={col.logoUrl}
                                      alt={col.title}
                                      width={32}
                                      height={32}
                                      className="object-contain w-full h-full p-0.5"
                                    />
                                  ) : (
                                    <Building2 className="w-4 h-4 text-[#E31E2B]" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-[#15182D] truncate">
                                    {col.title}
                                  </div>
                                  <div className="text-[11px] text-[#687086] truncate">
                                    {col.subtitle}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {col.badge && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                    {col.badge}
                                  </span>
                                )}
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. COURSES SECTION */}
                  {suggestions && suggestions.courses.length > 0 && (
                    <div>
                      <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <GraduationCap className="w-3 h-3 text-blue-600" />
                        <span>Degree Curricula &amp; Programs ({suggestions.courses.length})</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {suggestions.courses.map((crs) => {
                          const idx = flattenedSuggestions.findIndex((x) => x.id === crs.id && x.type === crs.type);
                          const isSelected = idx === selectedIndex;
                          return (
                            <button
                              key={`crs-${crs.id}`}
                              type="button"
                              onClick={() => handleSelectItem(crs)}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-3 transition-colors",
                                isSelected ? "bg-blue-50/80 border border-blue-200/60" : "hover:bg-gray-50"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0 text-blue-600">
                                  <GraduationCap className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-[#15182D] truncate">
                                    {crs.title}
                                  </div>
                                  <div className="text-[11px] text-[#687086] truncate">
                                    {crs.subtitle}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {crs.badge && (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                    {crs.badge}
                                  </span>
                                )}
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. ENTRANCE EXAMS SECTION */}
                  {suggestions && suggestions.exams.length > 0 && (
                    <div>
                      <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-amber-600" />
                        <span>Entrance Examinations ({suggestions.exams.length})</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {suggestions.exams.map((exm) => {
                          const idx = flattenedSuggestions.findIndex((x) => x.id === exm.id && x.type === exm.type);
                          const isSelected = idx === selectedIndex;
                          return (
                            <button
                              key={`exm-${exm.id}`}
                              type="button"
                              onClick={() => handleSelectItem(exm)}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-3 transition-colors",
                                isSelected ? "bg-amber-50/80 border border-amber-200/60" : "hover:bg-gray-50"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 text-amber-600 font-bold text-[11px]">
                                  {exm.title.slice(0, 3)}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-[#15182D] truncate">
                                    {exm.title}
                                  </div>
                                  <div className="text-[11px] text-[#687086] truncate">
                                    {exm.subtitle}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {exm.badge && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                                    {exm.badge}
                                  </span>
                                )}
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="p-2.5 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                  <span className="text-[11px] text-gray-500 font-medium">
                    Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px] font-mono text-gray-700 shadow-2xs">Enter ↵</kbd> to view full results
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleSearch(e)}
                    className="text-xs font-bold text-[#E31E2B] hover:text-red-700 flex items-center gap-1 transition-colors"
                  >
                    <span>View all matching results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Popular Searches Tactile Chips */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 sm:pt-3 px-0.5 text-xs">
              <span className="text-[#15182D] font-bold text-[10px] sm:text-[11px]">Popular:</span>
              <Link
                href="/mba"
                className="tactile-pill px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg text-[#E31E2B] bg-red-50 font-bold text-[10px] sm:text-[11px] transition-colors flex items-center gap-1 hover:bg-red-100 border border-red-200/60"
              >
                <Sparkles className="w-3 h-3" />
                <span>MBA | PGDM Special</span>
              </Link>
              {popularSearches.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setSearchQuery(item.label);
                    router.push(item.href);
                  }}
                  className="tactile-pill px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg text-[#15182D] hover:text-[#E31E2B] font-semibold text-[10px] sm:text-[11px] transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. FLOATING TACTILE BADGE: TOP RIGHT (50,000+ Students Guided) */}
        <div className="hidden lg:block absolute top-16 right-16 z-20">
          <div
            onClick={() => openModal("50,000+ Guided Students Showcase")}
            className="rounded-2xl px-5 py-3 flex items-center gap-3.5 shadow-md bg-white/95 backdrop-blur-md border border-[#E7E9F0] cursor-pointer"
          >
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-200 relative shadow-sm">
                <Image src="/images/hero-single-student.webp" alt="Student" fill className="object-cover" />
              </div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-amber-100 relative shadow-sm">
                <Image src="/images/ss_crops/student_1_highres.jpg" alt="Student" fill className="object-cover object-top" />
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
