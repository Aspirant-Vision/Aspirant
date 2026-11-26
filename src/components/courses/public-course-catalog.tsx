"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  GraduationCap,
  Building2,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  Check,
  Filter,
} from "lucide-react";
import { CourseRow, getPublicCoursesAction } from "@/lib/course/actions";
import { COURSE_CATEGORIES, DEGREE_TYPES } from "@/lib/validation/course";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { Button } from "@/components/ui/button";

interface PublicCourseCatalogProps {
  initialCourses: (CourseRow & { college_courses?: { count: number }[] })[];
  initialTotal: number;
  initialCategory?: string;
  initialDegree?: string;
  initialSearch?: string;
}

const POPULAR_DEGREES = [
  "all",
  "B.Tech / B.E.",
  "MBA / PGDM",
  "MBBS",
  "BBA",
  "BCA",
  "M.Tech / M.E.",
  "MCA",
  "B.Sc",
  "LLB",
];

const DURATION_OPTIONS = [
  { label: "All Durations", value: 0 },
  { label: "2 Years (MBA / M.Tech)", value: 2 },
  { label: "3 Years (BBA / BCA / B.Sc)", value: 3 },
  { label: "4 Years (B.Tech / B.E.)", value: 4 },
  { label: "5 Years (MBBS / Int. Law)", value: 5 },
];

const LEVEL_OPTIONS = [
  { label: "All Levels", value: "all" },
  { label: "Undergraduate (UG)", value: "undergraduate" },
  { label: "Postgraduate (PG)", value: "postgraduate" },
  { label: "Diploma / Certificate", value: "diploma" },
];

const SORT_OPTIONS = [
  { label: "Featured & High Demand", value: "featured" },
  { label: "Duration (Short to Long)", value: "duration" },
  { label: "Course Name (A-Z)", value: "name" },
];

export function PublicCourseCatalog({
  initialCourses,
  initialTotal,
  initialCategory = "all",
  initialDegree = "all",
  initialSearch = "",
}: PublicCourseCatalogProps) {
  const { openModal } = useCounselingModal();
  const [isPending, startTransition] = useTransition();

  const [courses, setCourses] = useState<any[]>(initialCourses);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDegree, setSelectedDegree] = useState(initialDegree);
  const [selectedDuration, setSelectedDuration] = useState<number>(0);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "name" | "duration">("featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    setCourses(initialCourses);
    setTotalCount(initialTotal);
    setSelectedCategory(initialCategory);
    setSelectedDegree(initialDegree);
    setSearch(initialSearch);
    setPage(1);
  }, [initialCourses, initialTotal, initialCategory, initialDegree, initialSearch]);

  const fetchFiltered = (
    newSearch = search,
    newCat = selectedCategory,
    newDeg = selectedDegree,
    newDur = selectedDuration,
    newLev = selectedLevel,
    newSort = sortBy,
    newPage = page
  ) => {
    startTransition(async () => {
      const res = await getPublicCoursesAction({
        search: newSearch,
        category: newCat !== "all" ? newCat : undefined,
        degreeType: newDeg !== "all" ? newDeg : undefined,
        level: newLev !== "all" ? newLev : undefined,
        duration: newDur > 0 ? newDur : undefined,
        sortBy: newSort,
        page: newPage,
        pageSize,
      });

      if (res.success) {
        setCourses(res.data.courses);
        setTotalCount(res.data.totalCount);
        setPage(newPage);
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiltered(search, selectedCategory, selectedDegree, selectedDuration, selectedLevel, sortBy, 1);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    fetchFiltered(search, cat, selectedDegree, selectedDuration, selectedLevel, sortBy, 1);
  };

  const handleDegreeSelect = (deg: string) => {
    setSelectedDegree(deg);
    fetchFiltered(search, selectedCategory, deg, selectedDuration, selectedLevel, sortBy, 1);
  };

  const handleDurationSelect = (dur: number) => {
    setSelectedDuration(dur);
    fetchFiltered(search, selectedCategory, selectedDegree, dur, selectedLevel, sortBy, 1);
  };

  const handleLevelSelect = (lev: string) => {
    setSelectedLevel(lev);
    fetchFiltered(search, selectedCategory, selectedDegree, selectedDuration, lev, sortBy, 1);
  };

  const handleSortChange = (newSort: "featured" | "name" | "duration") => {
    setSortBy(newSort);
    fetchFiltered(search, selectedCategory, selectedDegree, selectedDuration, selectedLevel, newSort, 1);
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedDegree("all");
    setSelectedDuration(0);
    setSelectedLevel("all");
    setSortBy("featured");
    setSearch("");
    fetchFiltered("", "all", "all", 0, "all", "featured", 1);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedDegree !== "all" ||
    selectedDuration > 0 ||
    selectedLevel !== "all" ||
    Boolean(search) ||
    sortBy !== "featured";

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedDegree !== "all" ? 1 : 0) +
    (selectedDuration > 0 ? 1 : 0) +
    (selectedLevel !== "all" ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Mobile Filters Trigger Bar */}
      <div className="lg:hidden flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#E31E2B]" />
          <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
        </button>

        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as any)}
          className="text-xs font-semibold py-2 px-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main Dual-Column Layout: Sidebar Filters (Left) + Course Grid (Right) */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* LEFT SIDEBAR: Comprehensive Filter Panel */}
        <aside
          className={`w-full lg:w-72 xl:w-80 shrink-0 space-y-5 ${
            isMobileFilterOpen ? "block" : "hidden lg:block"
          }`}
        >
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs space-y-6 sticky top-24">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E31E2B]" />
                <h3 className="font-display font-extrabold text-sm text-[#15182D]">Filter Programs</h3>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-100 text-[#E31E2B] text-[10px] font-extrabold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-[#E31E2B] hover:underline cursor-pointer"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Filter Section 1: Academic Discipline */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-[#15182D] uppercase tracking-wider block">
                Academic Discipline
              </label>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => handleCategorySelect("all")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-red-50 text-[#E31E2B] font-bold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>All Disciplines</span>
                  {selectedCategory === "all" && <Check className="w-3.5 h-3.5" />}
                </button>
                {COURSE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-red-50 text-[#E31E2B] font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Section 2: Target Degree Type */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-[#15182D] uppercase tracking-wider block">
                Target Degree
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {POPULAR_DEGREES.map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => handleDegreeSelect(deg)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedDegree === deg
                        ? "bg-red-50 text-[#E31E2B] font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{deg === "all" ? "All Degree Levels" : deg}</span>
                    {selectedDegree === deg && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Section 3: Academic Level */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-[#15182D] uppercase tracking-wider block">
                Academic Level
              </label>
              <div className="space-y-1">
                {LEVEL_OPTIONS.map((lev) => (
                  <button
                    key={lev.value}
                    type="button"
                    onClick={() => handleLevelSelect(lev.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedLevel === lev.value
                        ? "bg-red-50 text-[#E31E2B] font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{lev.label}</span>
                    {selectedLevel === lev.value && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Section 4: Course Duration */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-[#15182D] uppercase tracking-wider block">
                Course Duration
              </label>
              <div className="space-y-1">
                {DURATION_OPTIONS.map((dur) => (
                  <button
                    key={dur.value}
                    type="button"
                    onClick={() => handleDurationSelect(dur.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedDuration === dur.value
                        ? "bg-red-50 text-[#E31E2B] font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{dur.label}</span>
                    {selectedDuration === dur.value && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Fast-Track Pathways Card */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Specialized Portals
              </label>
              <Link
                href="/mba"
                className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/80 text-xs font-bold text-[#E31E2B] flex items-center justify-between hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E31E2B] shrink-0" />
                  <span>MBA | PGDM Special Portal</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#E31E2B]" />
              </Link>

              <button
                type="button"
                onClick={() => openModal("Lateral Entry & Credit Transfer Guidance")}
                className="w-full text-left p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs font-semibold text-blue-800 flex items-center justify-between hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Lateral Entry &amp; Credit Transfer</span>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CATALOG */}
        <main className="flex-1 w-full space-y-6">
          {/* Top Control Bar: Search Input & Sort Dropdown */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search programs by name, specialization, or stream..."
                  className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] transition-all"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-bold px-3 py-1 bg-[#E31E2B] hover:bg-[#c91824] text-white rounded-lg cursor-pointer"
                >
                  Search
                </Button>
              </form>

              {/* Sort Dropdown for Desktop */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as any)}
                  className="text-xs font-semibold py-2 px-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filter Chips Bar */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
                <span className="text-gray-400 font-semibold text-[11px]">Applied:</span>

                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-[#E31E2B] font-bold text-[11px] border border-red-200">
                    Discipline: {selectedCategory}
                    <button
                      type="button"
                      onClick={() => handleCategorySelect("all")}
                      className="hover:text-black cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedDegree !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
                    Degree: {selectedDegree}
                    <button
                      type="button"
                      onClick={() => handleDegreeSelect("all")}
                      className="hover:text-black cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedLevel !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-300">
                    Level: {selectedLevel}
                    <button
                      type="button"
                      onClick={() => handleLevelSelect("all")}
                      className="hover:text-black cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedDuration > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                    Duration: {selectedDuration} Years
                    <button
                      type="button"
                      onClick={() => handleDurationSelect(0)}
                      className="hover:text-black cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {search && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
                    Keyword: &ldquo;{search}&rdquo;
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        fetchFiltered("", selectedCategory, selectedDegree, selectedDuration, selectedLevel, sortBy, 1);
                      }}
                      className="hover:text-black cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[#E31E2B] font-bold text-xs hover:underline ml-auto cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-gray-600 px-1">
            <div>
              Showing <span className="font-extrabold text-[#15182D]">{courses.length}</span> of{" "}
              <span className="font-extrabold text-[#15182D]">{totalCount}</span> verified academic programs
            </div>
            {isPending && <div className="text-xs font-semibold text-[#E31E2B] animate-pulse">Updating catalog...</div>}
          </div>

          {/* Programs Grid */}
          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 text-[#E31E2B] flex items-center justify-center mx-auto">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-800">No programs match your filters</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try broadening your academic discipline, degree type, or clearing active filters to view all courses.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#E31E2B] border-red-200 hover:bg-red-50 cursor-pointer"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {courses.map((course) => {
                const collegeCount = course.college_courses?.[0]?.count ?? 0;

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:shadow-lg hover:border-gray-300 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-[#E31E2B] border border-red-200">
                          {course.degree_type}
                        </span>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1 font-medium bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200/60">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {course.duration} {course.duration_unit}
                        </span>
                      </div>

                      <Link href={`/courses/${course.slug}`}>
                        <h3 className="font-display font-bold text-base text-[#15182D] group-hover:text-[#E31E2B] transition-colors line-clamp-2 leading-snug">
                          {course.name}
                        </h3>
                      </Link>

                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{course.category}</span>
                        {course.stream && (
                          <>
                            <span>•</span>
                            <span className="truncate">{course.stream}</span>
                          </>
                        )}
                      </div>

                      {course.short_description && (
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {course.short_description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>{collegeCount} Verified Campuses</span>
                        </div>
                        <span className="text-gray-500 uppercase text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded-md">
                          {course.study_mode?.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openModal(`Course Guidance: ${course.name}`)}
                          className="flex-1 text-xs font-bold border-red-200 text-[#E31E2B] hover:bg-red-50 cursor-pointer"
                        >
                          Get Guidance
                        </Button>

                        <Link href={`/courses/${course.slug}`} className="flex-1">
                          <Button
                            type="button"
                            size="sm"
                            className="w-full text-xs font-bold bg-[#15182D] hover:bg-[#E31E2B] text-white transition-colors cursor-pointer"
                          >
                            <span>Explore Details</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isPending}
                onClick={() =>
                  fetchFiltered(
                    search,
                    selectedCategory,
                    selectedDegree,
                    selectedDuration,
                    selectedLevel,
                    sortBy,
                    page - 1
                  )
                }
                className="text-xs cursor-pointer font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </Button>
              <span className="text-xs font-semibold text-gray-600 px-3">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isPending}
                onClick={() =>
                  fetchFiltered(
                    search,
                    selectedCategory,
                    selectedDegree,
                    selectedDuration,
                    selectedLevel,
                    sortBy,
                    page + 1
                  )
                }
                className="text-xs cursor-pointer font-semibold"
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
