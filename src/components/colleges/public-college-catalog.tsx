"use client";

import React, { useState, useEffect, useTransition } from "react";
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
  X,
  RotateCcw,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { CollegeRow, getPublicCollegesAction } from "@/lib/college/actions";
import { COLLEGE_TYPES } from "@/lib/validation/college";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { Button } from "@/components/ui/button";

interface PublicCollegeCatalogProps {
  initialColleges: CollegeRow[];
  initialTotal: number;
  initialType?: string;
  initialSearch?: string;
}

const POPULAR_STATES = [
  "All India",
  "Odisha",
  "Delhi NCR",
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
  "Punjab",
];

const OWNERSHIP_OPTIONS = [
  { label: "All Ownerships", value: "all" },
  { label: "Private", value: "private" },
  { label: "Autonomous", value: "autonomous" },
  { label: "Deemed University", value: "deemed" },
  { label: "Government", value: "government" },
];

const SORT_OPTIONS = [
  { label: "Featured & Popular", value: "featured" },
  { label: "Highest Placement (CTC)", value: "placement" },
  { label: "College Name (A-Z)", value: "name" },
];

export function PublicCollegeCatalog({
  initialColleges,
  initialTotal,
  initialType = "all",
  initialSearch = "",
}: PublicCollegeCatalogProps) {
  const { openModal } = useCounselingModal();
  const [isPending, startTransition] = useTransition();

  const [colleges, setColleges] = useState<CollegeRow[]>(initialColleges);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);

  const [search, setSearch] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedState, setSelectedState] = useState("all");
  const [selectedOwnership, setSelectedOwnership] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "placement" | "name">("featured");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    setColleges(initialColleges);
    setTotalCount(initialTotal);
    setSelectedType(initialType);
    setSearch(initialSearch);
    setPage(1);
  }, [initialColleges, initialTotal, initialType, initialSearch]);

  const fetchFiltered = (
    newSearch = search,
    newType = selectedType,
    newState = selectedState,
    newOwnership = selectedOwnership,
    newSort = sortBy,
    newPage = page
  ) => {
    startTransition(async () => {
      const res = await getPublicCollegesAction({
        search: newSearch,
        collegeType: newType,
        state: newState !== "all" ? newState : undefined,
        ownershipType: newOwnership !== "all" ? newOwnership : undefined,
        sortBy: newSort,
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
    fetchFiltered(search, selectedType, selectedState, selectedOwnership, sortBy, 1);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    fetchFiltered(search, type, selectedState, selectedOwnership, sortBy, 1);
  };

  const handleStateSelect = (st: string) => {
    setSelectedState(st);
    fetchFiltered(search, selectedType, st, selectedOwnership, sortBy, 1);
  };

  const handleOwnershipSelect = (own: string) => {
    setSelectedOwnership(own);
    fetchFiltered(search, selectedType, selectedState, own, sortBy, 1);
  };

  const handleSortChange = (newSort: "featured" | "placement" | "name") => {
    setSortBy(newSort);
    fetchFiltered(search, selectedType, selectedState, selectedOwnership, newSort, 1);
  };

  const handleResetFilters = () => {
    setSelectedType("all");
    setSelectedState("all");
    setSelectedOwnership("all");
    setSortBy("featured");
    setSearch("");
    fetchFiltered("", "all", "all", "all", "featured", 1);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const hasActiveFilters =
    selectedType !== "all" ||
    selectedState !== "all" ||
    selectedOwnership !== "all" ||
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
              placeholder="Search colleges by name, city, or state..."
              className="w-full pl-11 pr-24 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] transition-all"
            />
            <Button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-bold px-4 py-1.5 bg-[#E31E2B] hover:bg-[#c91824] text-white rounded-lg cursor-pointer"
            >
              Search
            </Button>
          </form>

          {/* Location / State Quick Select */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[140px] sm:min-w-[160px]">
              <select
                value={selectedState}
                onChange={(e) => handleStateSelect(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white text-gray-700 outline-none cursor-pointer"
              >
                {POPULAR_STATES.map((st) => (
                  <option key={st} value={st === "All India" ? "all" : st}>
                    {st === "All India" ? "📍 All Locations" : `📍 ${st}`}
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
                showAdvanced || selectedOwnership !== "all"
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
                Ownership / Governance
              </label>
              <div className="flex flex-wrap gap-1.5">
                {OWNERSHIP_OPTIONS.map((own) => (
                  <button
                    key={own.value}
                    type="button"
                    onClick={() => handleOwnershipSelect(own.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedOwnership === own.value
                        ? "bg-[#15182D] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {own.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Fast-Track Pathways
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => openModal("Direct Merit Counselling")}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Direct Merit Seats</span>
                </button>
                <button
                  type="button"
                  onClick={() => openModal("Scholarship Assessment")}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Scholarships Guidance</span>
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

        {/* Category Pills (Stream / College Type) */}
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Explore by Academic Stream</span>
            {selectedType !== "all" && (
              <span className="text-[11px] text-[#E31E2B] font-semibold lowercase">
                active: {selectedType}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <button
              type="button"
              onClick={() => handleTypeSelect("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedType === "all"
                  ? "bg-[#15182D] text-white shadow-xs"
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedType === type
                    ? "bg-[#E31E2B] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-400 font-medium">Applied:</span>

            {selectedType !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-[#E31E2B] font-bold text-[11px] border border-red-200">
                Stream: {selectedType}
                <button
                  type="button"
                  onClick={() => handleTypeSelect("all")}
                  className="hover:text-black cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedState !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                State: {selectedState}
                <button
                  type="button"
                  onClick={() => handleStateSelect("all")}
                  className="hover:text-black cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedOwnership !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-300">
                Type: {selectedOwnership}
                <button
                  type="button"
                  onClick={() => handleOwnershipSelect("all")}
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
                    fetchFiltered("", selectedType, selectedState, selectedOwnership, sortBy, 1);
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

      {/* 2. RESULTS SUMMARY HEADER */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <div>
          Showing <span className="font-bold text-gray-900">{totalCount}</span> verified institutions
        </div>
        {isPending && <div className="text-xs font-semibold text-[#E31E2B] animate-pulse">Updating catalogue...</div>}
      </div>

      {/* 3. COLLEGE CARDS GRID */}
      {colleges.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No institutions match your search</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your category filter, location, or search keywords to find premier colleges.
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
          {colleges.map((college) => {
            const hasRank = Boolean(college.nirf_rank);
            const hasNaac = Boolean(college.naac_grade);

            return (
              <div
                key={college.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
              >
                {/* Cover Banner */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={college.cover_image_url || "/images/auth/auth_campus_highres.jpg"}
                    alt={college.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

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
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E31E2B] text-white shadow-xs">
                      Featured
                    </div>
                  )}

                  {/* Location badge on bottom left of banner */}
                  <div className="absolute bottom-2.5 left-3 text-[11px] text-white/90 font-medium flex items-center gap-1 drop-shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{college.city}, {college.state}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* College Logo & Name */}
                    <div className="flex items-start gap-3 -mt-10 relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-white border-2 border-white shadow-md overflow-hidden relative shrink-0">
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

                    {/* Category & Ownership Pill */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                      <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                        {college.college_type}
                      </span>
                      {college.ownership_type && (
                        <span className="text-gray-500 capitalize">
                          • {college.ownership_type}
                        </span>
                      )}
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
                      <span className="text-[10px] text-gray-400 block font-medium">Avg CTC</span>
                      <span className="font-bold text-gray-900">
                        {college.average_placement ? `₹${college.average_placement} LPA` : "Top Placements"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Highest CTC</span>
                      <span className="font-bold text-emerald-600">
                        {college.highest_placement ? `₹${college.highest_placement} LPA` : "Verified"}
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
                      className="flex-1 text-xs font-bold border-red-200 text-[#E31E2B] hover:bg-red-50 hover:text-[#c91824] cursor-pointer"
                    >
                      Apply Now
                    </Button>

                    <Link href={`/colleges/${college.slug}`} className="flex-1">
                      <Button
                        type="button"
                        size="sm"
                        className="w-full text-xs font-bold bg-[#15182D] hover:bg-black text-white cursor-pointer"
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
            onClick={() => fetchFiltered(search, selectedType, selectedState, selectedOwnership, sortBy, page - 1)}
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
            onClick={() => fetchFiltered(search, selectedType, selectedState, selectedOwnership, sortBy, page + 1)}
            className="text-xs cursor-pointer"
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
