"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Award,
  Calendar,
  Building2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { ScholarshipRow, getPublicScholarshipsAction } from "@/lib/course/actions";
import { SCHOLARSHIP_CATEGORIES } from "@/lib/validation/course";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { Button } from "@/components/ui/button";

interface PublicScholarshipCatalogProps {
  initialScholarships: any[];
  initialTotal: number;
}

export function PublicScholarshipCatalog({
  initialScholarships,
  initialTotal,
}: PublicScholarshipCatalogProps) {
  const { openModal } = useCounselingModal();
  const [isPending, startTransition] = useTransition();

  const [scholarships, setScholarships] = useState<any[]>(initialScholarships);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const fetchFiltered = (
    newSearch = search,
    newCat = selectedCategory,
    newPage = page
  ) => {
    startTransition(async () => {
      const res = await getPublicScholarshipsAction({
        search: newSearch,
        category: newCat,
        page: newPage,
        pageSize,
      });

      if (res.success && res.data) {
        setScholarships(res.data.scholarships);
        setTotalCount(res.data.totalCount);
        setPage(newPage);
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiltered(search, selectedCategory, 1);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    fetchFiltered(search, cat, 1);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

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
            placeholder="Search scholarships by title, sponsor, or provider..."
            className="w-full pl-11 pr-28 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] transition-all"
          />
          <Button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-bold px-4 py-1.5 bg-[#E31E2B] hover:bg-[#c91824] text-white rounded-lg"
          >
            Search
          </Button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            type="button"
            onClick={() => handleCategorySelect("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "bg-[#15182D] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Aid Types
          </button>
          {SCHOLARSHIP_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-[#E31E2B] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <div>
          Showing <span className="font-bold text-gray-900">{totalCount}</span> scholarship programs
        </div>
        {isPending && <div className="text-xs font-semibold text-[#E31E2B] animate-pulse">Updating...</div>}
      </div>

      {/* Cards Grid */}
      {scholarships.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <Award className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No scholarships found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your category filter to explore all available financial grants.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map((s) => {
            const hasAmount = s.scholarship_amount > 0;
            const hasPercentage = Boolean(s.scholarship_percentage);

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                      {s.category?.replace("_", " ")}
                    </span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {s.application_deadline
                        ? new Date(s.application_deadline).toLocaleDateString("en-IN")
                        : "Ongoing"}
                    </span>
                  </div>

                  <Link href={`/scholarships/${s.slug}`}>
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#E31E2B] transition-colors line-clamp-2 leading-snug">
                      {s.name}
                    </h3>
                  </Link>

                  <div className="text-xs text-gray-500 font-medium">{s.provider}</div>

                  {s.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Benefit</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {hasAmount ? `₹${Number(s.scholarship_amount).toLocaleString("en-IN")}` : "Tuition Waiver"}
                      {hasPercentage ? ` (${s.scholarship_percentage}%)` : ""}
                    </span>
                  </div>

                  <div className="text-right max-w-[140px]">
                    <span className="text-[10px] text-gray-400 block font-medium">Scope</span>
                    <span className="text-xs font-semibold text-gray-800 truncate block">
                      {s.colleges?.name || "National Scheme"}
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(`Scholarship Enquiry: ${s.name}`)}
                    className="flex-1 text-xs font-bold border-red-200 text-[#E31E2B] hover:bg-red-50"
                  >
                    Check Eligibility
                  </Button>

                  <Link href={`/scholarships/${s.slug}`} className="flex-1">
                    <Button
                      type="button"
                      size="sm"
                      className="w-full text-xs font-bold bg-[#15182D] hover:bg-black text-white"
                    >
                      <span>Details</span>
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
            onClick={() => fetchFiltered(search, selectedCategory, page - 1)}
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
            onClick={() => fetchFiltered(search, selectedCategory, page + 1)}
            className="text-xs"
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
