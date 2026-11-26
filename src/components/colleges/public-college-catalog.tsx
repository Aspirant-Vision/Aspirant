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
  Check,
  Filter,
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
  "Telangana",
  "Gujarat",
  "Tamil Nadu",
  "West Bengal",
  "Uttar Pradesh",
  "Punjab",
];

const OWNERSHIP_OPTIONS = [
  { label: "All Types", value: "all" },
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

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
        collegeType: newType !== "all" ? newType : undefined,
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

  const activeFiltersCount =
    (selectedType !== "all" ? 1 : 0) +
    (selectedState !== "all" ? 1 : 0) +
    (selectedOwnership !== "all" ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Mobile Filters Trigger Bar */}
      <div className="lg:hidden flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200">
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

      {/* Main Dual-Column Layout: Sidebar Filters (Left) + College Grid (Right) */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* LEFT SIDEBAR: Comprehensive Filter Panel */}
        <aside
          className={`w-full lg:w-72 xl:w-80 shrink-0 space-y-5 ${
            isMobileFilterOpen ? "block" : "hidden lg:block"
          }`}
        >
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 space-y-6 sticky top-24">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E31E2B]" />
                <h3 className="font-display font-extrabold text-sm text-[#15182D]">Filter Campuses</h3>
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

            {/* Filter Section 1: Academic Stream */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-[#15182D] uppercase tracking-wider block">
                Academic Stream
              </label>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => handleTypeSelect("all")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedType === "all"
                      ? "bg-red-50 text-[#E31E2B] font-bold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>All Categories</span>
                  {selectedType === "all" && <Check className="w-3.5 h-3.5" />}
                </button>
                {COLLEGE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedType === type
                        ? "bg-red-50 text-[#E31E2B] font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{type}</span>
                    {selectedType === type && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Section 2: Location / State */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-[#15182D] uppercase tracking-wider block">
                Location &amp; Hubs
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {POPULAR_STATES.map((st) => {
                  const val = st === "All India" ? "all" : st;
                  const isSelected = selectedState === val;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStateSelect(val)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white font-bold"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        {st}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Section 3: Ownership / Governance */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-[#15182D] uppercase tracking-wider block">
                Ownership Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {OWNERSHIP_OPTIONS.map((own) => (
                  <button
                    key={own.value}
                    type="button"
                    onClick={() => handleOwnershipSelect(own.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer truncate ${
                      selectedOwnership === own.value
                        ? "bg-[#15182D] text-white font-bold"
                        : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {own.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Section 4: Fast-Track Counselling Assist */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <div className="bg-red-50/60 border border-red-200/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#E31E2B]">
                  <Sparkles className="w-4 h-4" />
                  <span>Direct Merit Allocation</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Have your score evaluated directly for pre-qualified merit seats with 0 donation.
                </p>
                <button
                  type="button"
                  onClick={() => openModal("Directory Sidebar Direct Evaluation")}
                  className="w-full text-center py-1.5 px-3 rounded-lg bg-[#E31E2B] text-white font-bold text-xs hover:bg-[#c81622] transition-colors cursor-pointer"
                >
                  Apply Direct
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT: Search bar, active tags & college cards grid */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Top Search & Sorting Bar */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search colleges by name, city, or specialization..."
                className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] transition-all"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-bold px-3.5 py-1 bg-[#E31E2B] hover:bg-[#c91824] text-white rounded-lg cursor-pointer"
              >
                Search
              </Button>
            </form>

            {/* Desktop Sort Dropdown */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400 font-medium">Sort by:</span>
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

          {/* Active Filter Chips & Results Count */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">
                Showing <strong className="text-gray-900">{totalCount}</strong> verified institutions
              </span>

              {selectedType !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-[#E31E2B] font-bold text-[11px] border border-red-200">
                  {selectedType}
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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                  {selectedState}
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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-300">
                  {selectedOwnership}
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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
                  &ldquo;{search}&rdquo;
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

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[#E31E2B] font-bold hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {isPending && (
              <span className="text-xs font-semibold text-[#E31E2B] animate-pulse">
                Updating catalogue...
              </span>
            )}
          </div>

          {/* College Cards Grid */}
          {colleges.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-800">No institutions match this filter</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try clearing stream or location filters to browse our nationwide partner directory.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {colleges.map((college) => {
                const hasRank = Boolean(college.nirf_rank);
                const hasNaac = Boolean(college.naac_grade);

                return (
                  <div
                    key={college.id}
                    className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden hover:border-gray-400 transition-colors flex flex-col group"
                  >
                    {/* Cover Photography */}
                    <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                      <Image
                        src={college.cover_image_url || "/images/auth/auth_campus_highres.jpg"}
                        alt={college.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Badges on banner */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {hasRank && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
                            NIRF #{college.nirf_rank}
                          </span>
                        )}
                        {hasNaac && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white">
                            NAAC {college.naac_grade}
                          </span>
                        )}
                      </div>

                      {college.is_featured && (
                        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E31E2B] text-white">
                          Featured
                        </div>
                      )}

                      {/* City & State Tag */}
                      <div className="absolute bottom-2.5 left-3 text-[11px] text-white/95 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>{college.city}, {college.state}</span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        {/* Logo & Name */}
                        <div className="flex items-start gap-3 -mt-10 relative z-10">
                          <div className="w-14 h-14 rounded-xl bg-white border-2 border-white overflow-hidden relative shrink-0">
                            {college.logo_url ? (
                              <Image
                                src={college.logo_url}
                                alt={college.name}
                                fill
                                sizes="56px"
                                className="object-contain p-1"
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

                        {/* Stream & Ownership Badges */}
                        <div className="flex items-center gap-2 text-xs pt-1">
                          <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                            {college.college_type}
                          </span>
                          {college.ownership_type && (
                            <span className="text-gray-500 capitalize">
                              • {college.ownership_type}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {college.short_description && (
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed pt-1">
                            {college.short_description}
                          </p>
                        )}
                      </div>

                      {/* Placement Package Highlights */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Avg CTC</span>
                          <span className="font-bold text-gray-900">
                            {college.average_placement ? `₹${college.average_placement} LPA` : "Verified"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Highest CTC</span>
                          <span className="font-bold text-emerald-600">
                            {college.highest_placement ? `₹${college.highest_placement} LPA` : "Top Placement"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 block font-medium">Admission</span>
                          <span className="font-bold text-[#E31E2B] uppercase text-[10px]">
                            {college.admission_status?.replace("_", " ") || "Open"}
                          </span>
                        </div>
                      </div>

                      {/* Action CTAs */}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isPending}
                onClick={() =>
                  fetchFiltered(
                    search,
                    selectedType,
                    selectedState,
                    selectedOwnership,
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
                    selectedType,
                    selectedState,
                    selectedOwnership,
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
      </div>
    </div>
  );
}
