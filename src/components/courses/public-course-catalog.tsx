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
    newPage = page
  ) => {
    startTransition(async () => {
      const res = await getPublicCoursesAction({
        search: newSearch,
        category: newCat,
        degreeType: newDeg,
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
    fetchFiltered(search, selectedCategory, selectedDegree, 1);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    fetchFiltered(search, cat, selectedDegree, 1);
  };

  const handleDegreeSelect = (deg: string) => {
    setSelectedDegree(deg);
    fetchFiltered(search, selectedCategory, deg, 1);
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedDegree("all");
    setSearch("");
    fetchFiltered("", "all", "all", 1);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const popularDegrees = [
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

  return (
    <div className="space-y-8">
      {/* 1. FILTER & SEARCH CONTROLS */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search academic programs by name, specialization, or stream..."
            className="w-full pl-11 pr-28 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] transition-all"
          />
          <Button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-bold px-4 py-1.5 bg-[#E31E2B] hover:bg-[#c91824] text-white rounded-lg"
          >
            Search
          </Button>
        </form>

        {/* Category / Discipline Pills */}
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Filter by Discipline
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
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
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Target Degree Level
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {popularDegrees.map((deg) => (
              <button
                type="button"
                key={deg}
                onClick={() => handleDegreeSelect(deg)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedDegree === deg
                    ? "bg-[#171B52] text-white shadow-xs"
                    : "bg-gray-50 text-gray-600 border border-gray-200/80 hover:bg-gray-100"
                }`}
              >
                {deg === "all" ? "All Degree Levels" : deg}
              </button>
            ))}
          </div>
        </div>

        {(selectedCategory !== "all" || selectedDegree !== "all" || search) && (
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-gray-500">
              Filters active:{" "}
              {selectedCategory !== "all" && <strong className="text-gray-900">{selectedCategory} </strong>}
              {selectedDegree !== "all" && <strong className="text-gray-900">({selectedDegree}) </strong>}
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[#E31E2B] font-bold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <div>
          Showing <span className="font-bold text-gray-900">{totalCount}</span> academic programs
        </div>
        {isPending && <div className="text-xs font-semibold text-[#E31E2B] animate-pulse">Updating...</div>}
      </div>

      {/* Cards Grid */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No courses match your filter</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your discipline or search terms to explore available degrees.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const collegeCount = course.college_courses?.[0]?.count ?? 0;

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#E31E2B] border border-red-200">
                      {course.degree_type}
                    </span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
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
                    <span>{collegeCount} Colleges Offering</span>
                  </div>
                  <span className="text-gray-400 uppercase text-[10px] font-medium">
                    {course.study_mode?.replace("_", " ")}
                  </span>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(`Course Guidance: ${course.name}`)}
                    className="flex-1 text-xs font-bold border-red-200 text-[#E31E2B] hover:bg-red-50"
                  >
                    Get Guidance
                  </Button>

                  <Link href={`/courses/${course.slug}`} className="flex-1">
                    <Button
                      type="button"
                      size="sm"
                      className="w-full text-xs font-bold bg-[#15182D] hover:bg-black text-white"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isPending}
            onClick={() => fetchFiltered(search, selectedCategory, selectedDegree, page - 1)}
            className="text-xs"
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
            onClick={() => fetchFiltered(search, selectedCategory, selectedDegree, page + 1)}
            className="text-xs"
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
