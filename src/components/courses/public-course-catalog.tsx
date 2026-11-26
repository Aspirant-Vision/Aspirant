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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 9;

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

  return (
    <div className="space-y-6">
      {/* 1. ADVANCED FILTER & SEARCH CONTROL CONSOLE */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-4 sm:p-6 shadow-xs space-y-4">
        {/* Search Bar & Quick Dropdowns Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search academic programs by name, specialization, or stream..."
              className="w-full pl-11 pr-24 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] transition-all"
            />
            <Button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-bold px-4 py-1.5 bg-[#E31E2B] hover:bg-[#c91824] text-white rounded-lg cursor-pointer"
            >
              Search
            </Button>
          </form>

          <div className="flex items-center gap-2">
            {/* Duration Select */}
            <div className="relative min-w-[140px] sm:min-w-[170px]">
              <select
                value={selectedDuration}
                onChange={(e) => handleDurationSelect(Number(e.target.value))}
                className="w-full text-xs font-semibold px-3 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white text-gray-700 outline-none cursor-pointer"
              >
                {DURATION_OPTIONS.map((dur) => (
                  <option key={dur.value} value={dur.value}>
                    ⏱ {dur.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="relative min-w-[150px]">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as any)}
                className="w-full text-xs font-semibold px-3 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white text-gray-700 outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    ⚡ {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Filters Toggle Button */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-3 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                showAdvanced || selectedLevel !== "all"
                  ? "bg-red-50 text-[#E31E2B] border-red-200"
                  : "bg-gray-50/50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showAdvanced && (
          <div className="pt-3 pb-1 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Academic Level
              </label>
              <div className="flex flex-wrap gap-1.5">
                {LEVEL_OPTIONS.map((lev) => (
                  <button
                    key={lev.value}
                    type="button"
                    onClick={() => handleLevelSelect(lev.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedLevel === lev.value
                        ? "bg-[#15182D] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {lev.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Specialized Fast-Track
              </label>
              <div className="flex flex-wrap gap-1.5">
                <Link
                  href="/mba"
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-50 text-[#E31E2B] border border-red-200 hover:bg-red-100 transition-colors inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>MBA | PGDM Special Portal</span>
                </Link>
                <button
                  type="button"
                  onClick={() => openModal("Lateral Entry & Credit Transfer Guidance")}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  Lateral Entry / Credit
                </button>
              </div>
            </div>

            <div className="flex items-end justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-gray-500 hover:text-[#E31E2B] inline-flex items-center gap-1 py-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        )}

        {/* Category / Discipline Pills */}
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Filter by Academic Discipline</span>
            {selectedCategory !== "all" && (
              <span className="text-[11px] text-[#E31E2B] font-semibold lowercase">
                active: {selectedCategory}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#15182D] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Disciplines
            </button>
            {COURSE_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#E31E2B] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Degree Filter Pills */}
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Target Degree Type</span>
            {selectedDegree !== "all" && (
              <span className="text-[11px] text-[#171B52] font-bold lowercase">
                selected: {selectedDegree}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {POPULAR_DEGREES.map((deg) => (
              <button
                type="button"
                key={deg}
                onClick={() => handleDegreeSelect(deg)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedDegree === deg
                    ? "bg-[#171B52] text-white shadow-xs font-bold"
                    : "bg-gray-50 text-gray-600 border border-gray-200/80 hover:bg-gray-100"
                }`}
              >
                {deg === "all" ? "All Degree Levels" : deg}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-400 font-medium">Applied:</span>

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
              className="text-[#E31E2B] font-bold hover:underline ml-auto cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* 2. RESULTS SUMMARY */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <div>
          Showing <span className="font-bold text-gray-900">{totalCount}</span> academic programs
        </div>
        {isPending && <div className="text-xs font-semibold text-[#E31E2B] animate-pulse">Updating catalogue...</div>}
      </div>

      {/* 3. COURSES CARDS GRID */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No courses match your filter</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your discipline, degree type, or search terms to explore available degrees.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs mt-2 cursor-pointer"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const collegeCount = course.college_courses?.[0]?.count ?? 0;

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#E31E2B] border border-red-200">
                      {course.degree_type}
                    </span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1 font-medium bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200/60">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {course.duration} {course.duration_unit}
                    </span>
                  </div>

                  <Link href={`/courses/${course.slug}`}>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#E31E2B] transition-colors line-clamp-2 leading-snug">
                      {course.name}
                    </h3>
                  </Link>

                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="font-medium text-gray-700">{course.category}</span>
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

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{collegeCount} Verified Colleges</span>
                  </div>
                  <span className="text-gray-500 uppercase text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded-md">
                    {course.study_mode?.replace("_", " ")}
                  </span>
                </div>

                <div className="pt-1 flex items-center gap-2">
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
                      className="w-full text-xs font-bold bg-[#15182D] hover:bg-black text-white cursor-pointer"
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. PAGINATION */}
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
            className="text-xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
          </Button>
          <span className="text-xs font-medium text-gray-600 px-3">
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
            className="text-xs cursor-pointer"
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
