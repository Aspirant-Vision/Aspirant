"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Building2,
  MapPin,
  Award,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  GraduationCap,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";
import { CollegeRow, getPublicCollegesAction } from "@/lib/college/actions";
import { COLLEGE_TYPES } from "@/lib/validation/college";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { Button } from "@/components/ui/button";

interface PublicCollegeCatalogProps {
  initialColleges: CollegeRow[];
  initialTotal: number;
}

export function PublicCollegeCatalog({
  initialColleges,
  initialTotal,
}: PublicCollegeCatalogProps) {
  const { openModal } = useCounselingModal();
  const [isPending, startTransition] = useTransition();

  const [colleges, setColleges] = useState<CollegeRow[]>(initialColleges);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const fetchFiltered = (newSearch = search, newType = selectedType, newPage = page) => {
    startTransition(async () => {
      const res = await getPublicCollegesAction({
        search: newSearch,
        collegeType: newType,
        page: newPage,
        pageSize,
      });

      if (res.success) {
        setColleges(res.data.colleges);
        setTotalCount(res.data.totalCount);
        setPage(newPage);
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiltered(search, selectedType, 1);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    fetchFiltered(search, type, 1);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-8">
      {/* 1. FILTER & SEARCH CONTROLS */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 shadow-sm space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search colleges by name, city, or state..."
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
            onClick={() => handleTypeSelect("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              selectedType === "all"
                ? "bg-[#15182D] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Categories
          </button>
          {COLLEGE_TYPES.map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => handleTypeSelect(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedType === type
                  ? "bg-[#E31E2B] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 2. RESULTS SUMMARY */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <div>
          Showing <span className="font-bold text-gray-900">{totalCount}</span> verified institutions
        </div>
        {isPending && <div className="text-xs font-semibold text-[#E31E2B] animate-pulse">Updating...</div>}
      </div>

      {/* 3. COLLEGE CARDS GRID */}
      {colleges.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No institutions match your search</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your category filter or search keywords to find premier colleges.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setSelectedType("all");
              fetchFiltered("", "all", 1);
            }}
            className="text-xs mt-2"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleges.map((college) => {
            const hasRank = Boolean(college.nirf_rank);
            const hasNaac = Boolean(college.naac_grade);

            return (
              <div
                key={college.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group"
              >
                {/* Cover Banner */}
                <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                  {college.cover_image_url ? (
                    <Image
                      src={college.cover_image_url}
                      alt={college.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-slate-500 text-xs">
                      Campus Preview
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Badges on banner */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {hasRank && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 shadow-xs">
                        NIRF #{college.nirf_rank}
                      </span>
                    )}
                    {hasNaac && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-xs">
                        NAAC {college.naac_grade}
                      </span>
                    )}
                  </div>

                  {college.is_featured && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E31E2B] text-white shadow-xs">
                      Featured
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* College Logo & Name */}
                    <div className="flex items-start gap-3 -mt-9 relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 shadow-md overflow-hidden relative shrink-0">
                        {college.logo_url ? (
                          <Image
                            src={college.logo_url}
                            alt={college.name}
                            fill
                            sizes="56px"
                            className="object-contain p-1.5"
                          />
                        ) : (
                          <div className="w-full h-full bg-red-50 text-[#E31E2B] flex items-center justify-center font-bold text-lg">
                            {college.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="pt-8 min-w-0 flex-1">
                        <Link href={`/colleges/${college.slug}`}>
                          <h3 className="font-bold text-sm text-gray-900 hover:text-[#E31E2B] transition-colors line-clamp-2 leading-tight">
                            {college.name}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    {/* Category & Location */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                      <span className="font-semibold text-gray-700">{college.college_type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-gray-500 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {college.city}, {college.state}
                      </span>
                    </div>

                    {/* Short Description */}
                    {college.short_description && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed pt-1">
                        {college.short_description}
                      </p>
                    )}
                  </div>

                  {/* Placement & Highlights pill */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Avg Package</span>
                      <span className="font-bold text-gray-900">
                        {college.average_placement ? `₹${college.average_placement} LPA` : "Confidential"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Highest Package</span>
                      <span className="font-bold text-emerald-600">
                        {college.highest_placement ? `₹${college.highest_placement} LPA` : "Confidential"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Admission</span>
                      <span className="font-bold text-[#E31E2B] uppercase text-[10px]">
                        {college.admission_status?.replace("_", " ") || "Open"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(`Admission Enquiry: ${college.name}`)}
                      className="flex-1 text-xs font-bold border-red-200 text-[#E31E2B] hover:bg-red-50 hover:text-[#c91824]"
                    >
                      Apply Now
                    </Button>

                    <Link href={`/colleges/${college.slug}`} className="flex-1">
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
            onClick={() => fetchFiltered(search, selectedType, page - 1)}
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
            onClick={() => fetchFiltered(search, selectedType, page + 1)}
            className="text-xs"
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
