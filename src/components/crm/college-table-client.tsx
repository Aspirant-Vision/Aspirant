"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  MapPin,
  ExternalLink,
  Edit,
  Eye,
  Star,
  Archive,
  RotateCcw,
  Globe2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MoreVertical,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  CollegeRow,
  getCollegesListingAction,
  togglePublishCollegeAction,
  toggleFeaturedCollegeAction,
  archiveCollegeAction,
  restoreCollegeAction,
} from "@/lib/college/actions";
import { COLLEGE_TYPES } from "@/lib/validation/college";
import { Button } from "@/components/ui/button";

interface CollegeTableClientProps {
  initialColleges: CollegeRow[];
  initialTotal: number;
}

export function CollegeTableClient({ initialColleges, initialTotal }: CollegeTableClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [colleges, setColleges] = useState<CollegeRow[]>(initialColleges);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);

  // Filter States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [collegeType, setCollegeType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"updated_at" | "name" | "created_at">("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Action status message
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const fetchFilteredData = async (
    newSearch = search,
    newStatus = status,
    newType = collegeType,
    newSort = sortBy,
    newOrder = sortOrder,
    newPage = page
  ) => {
    startTransition(async () => {
      const res = await getCollegesListingAction({
        search: newSearch,
        status: newStatus,
        collegeType: newType,
        sortBy: newSort,
        sortOrder: newOrder,
        page: newPage,
        pageSize,
      });

      if (res.success) {
        setColleges(res.data.colleges);
        setTotalCount(res.data.totalCount);
        setPage(res.data.page);
      } else {
        setActionFeedback({ type: "error", message: res.error.message });
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFilteredData(search, status, collegeType, sortBy, sortOrder, 1);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    fetchFilteredData(search, newStatus, collegeType, sortBy, sortOrder, 1);
  };

  const handleTypeChange = (newType: string) => {
    setCollegeType(newType);
    fetchFilteredData(search, status, newType, sortBy, sortOrder, 1);
  };

  const handleSortChange = (newSort: "updated_at" | "name" | "created_at") => {
    setSortBy(newSort);
    fetchFilteredData(search, status, collegeType, newSort, sortOrder, 1);
  };

  const handlePageChange = (newPage: number) => {
    fetchFilteredData(search, status, collegeType, sortBy, sortOrder, newPage);
  };

  // Toggle Publication
  const handleTogglePublish = async (college: CollegeRow) => {
    const willPublish = college.publication_status !== "published";
    try {
      setActiveActionId(college.id);
      setActionFeedback(null);
      const res = await togglePublishCollegeAction(college.id, willPublish);
      if (!res.success) {
        setActionFeedback({ type: "error", message: res.error.message });
      } else {
        setActionFeedback({
          type: "success",
          message: willPublish
            ? `"${college.name}" is now published and live on the portal!`
            : `"${college.name}" has been unpublished and moved to draft.`,
        });
        await fetchFilteredData();
      }
    } catch {
      setActionFeedback({ type: "error", message: "Failed to update publication status." });
    } finally {
      setActiveActionId(null);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (college: CollegeRow) => {
    const nextFeatured = !college.is_featured;
    try {
      setActiveActionId(college.id);
      setActionFeedback(null);
      const res = await toggleFeaturedCollegeAction(college.id, nextFeatured);
      if (!res.success) {
        setActionFeedback({ type: "error", message: res.error.message });
      } else {
        setActionFeedback({
          type: "success",
          message: nextFeatured
            ? `"${college.name}" is now featured!`
            : `"${college.name}" is no longer featured.`,
        });
        await fetchFilteredData();
      }
    } catch {
      setActionFeedback({ type: "error", message: "Failed to update featured state." });
    } finally {
      setActiveActionId(null);
    }
  };

  // Archive / Soft Delete
  const handleArchive = async (college: CollegeRow) => {
    if (!confirm(`Are you sure you want to archive "${college.name}"? It will be hidden from the public portal.`)) {
      return;
    }
    try {
      setActiveActionId(college.id);
      setActionFeedback(null);
      const res = await archiveCollegeAction(college.id);
      if (!res.success) {
        setActionFeedback({ type: "error", message: res.error.message });
      } else {
        setActionFeedback({
          type: "success",
          message: `"${college.name}" has been archived.`,
        });
        await fetchFilteredData();
      }
    } catch {
      setActionFeedback({ type: "error", message: "Failed to archive college." });
    } finally {
      setActiveActionId(null);
    }
  };

  // Restore
  const handleRestore = async (college: CollegeRow) => {
    try {
      setActiveActionId(college.id);
      setActionFeedback(null);
      const res = await restoreCollegeAction(college.id);
      if (!res.success) {
        setActionFeedback({ type: "error", message: res.error.message });
      } else {
        setActionFeedback({
          type: "success",
          message: `"${college.name}" has been restored to Draft status.`,
        });
        await fetchFilteredData();
      }
    } catch {
      setActionFeedback({ type: "error", message: "Failed to restore college." });
    } finally {
      setActiveActionId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-4">
      {/* Action feedback toast */}
      {actionFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            actionFeedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-gray-400 hover:text-gray-600 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-3">
        {/* Top search & category row */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by college name, city, or state..."
              className="w-full pl-9 pr-20 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-xs h-7 px-2.5 text-[#E31E2B] font-semibold"
            >
              Search
            </Button>
          </form>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <select
              value={collegeType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              <option value="all">All Categories</option>
              {COLLEGE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Sort order */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              <option value="updated_at">Recently Updated</option>
              <option value="name">Name (A-Z)</option>
              <option value="created_at">Recently Created</option>
            </select>
          </div>
        </div>

        {/* Status Tab Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {[
            { id: "all", label: "All Colleges" },
            { id: "published", label: "Published (Live)" },
            { id: "draft", label: "Drafts" },
            { id: "archived", label: "Archived" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleStatusChange(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                status === tab.id
                  ? "bg-[#15182D] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* COLLEGES TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {isPending && (
          <div className="h-1 bg-red-100 overflow-hidden">
            <div className="h-full bg-[#E31E2B] animate-pulse w-full" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">College & Location</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Accreditation</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Featured</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {colleges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-gray-600">No colleges found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try adjusting your search filters or add a new college.
                    </p>
                  </td>
                </tr>
              ) : (
                colleges.map((college) => {
                  const isActionLoading = activeActionId === college.id;
                  const isPublished = college.publication_status === "published";
                  const isArchived = college.publication_status === "archived";

                  return (
                    <tr
                      key={college.id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      {/* 1. Name & Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {college.logo_url ? (
                            <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white overflow-hidden shrink-0 relative">
                              <Image
                                src={college.logo_url}
                                alt={college.name}
                                fill
                                sizes="40px"
                                className="object-contain p-1"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg border border-gray-200 bg-red-50 text-[#E31E2B] flex items-center justify-center font-bold text-sm shrink-0">
                              {college.name.charAt(0)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <Link
                              href={`/admin/colleges/${college.id}`}
                              className="font-bold text-gray-900 hover:text-[#E31E2B] transition-colors truncate block max-w-xs sm:max-w-md"
                            >
                              {college.name}
                            </Link>
                            <div className="flex items-center gap-2 text-gray-400 text-[11px] mt-0.5">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {college.city}, {college.state}
                              </span>
                              <span>•</span>
                              <span className="font-mono text-[10px] text-gray-400 truncate">
                                /{college.slug}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Category & Ownership */}
                      <td className="px-3 py-3">
                        <span className="font-medium text-gray-900">{college.college_type}</span>
                        {college.ownership_type && (
                          <span className="block text-[10px] text-gray-400">
                            {college.ownership_type}
                          </span>
                        )}
                      </td>

                      {/* 3. Accreditation & Rank */}
                      <td className="px-3 py-3">
                        {college.nirf_rank ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mr-1.5">
                            NIRF #{college.nirf_rank}
                          </span>
                        ) : null}
                        {college.naac_grade ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            NAAC {college.naac_grade}
                          </span>
                        ) : null}
                        {!college.nirf_rank && !college.naac_grade && (
                          <span className="text-gray-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* 4. Publication Status */}
                      <td className="px-3 py-3">
                        {college.publication_status === "published" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Published
                          </span>
                        )}
                        {college.publication_status === "draft" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Draft
                          </span>
                        )}
                        {college.publication_status === "archived" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Archived
                          </span>
                        )}
                      </td>

                      {/* 5. Featured Toggle */}
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(college)}
                          disabled={isActionLoading}
                          title={college.is_featured ? "Remove featured" : "Mark as featured"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            college.is_featured
                              ? "text-amber-500 hover:bg-amber-50"
                              : "text-gray-300 hover:text-amber-400 hover:bg-gray-100"
                          }`}
                        >
                          <Star
                            className={`w-4 h-4 ${college.is_featured ? "fill-amber-400" : ""}`}
                          />
                        </button>
                      </td>

                      {/* 6. Action Buttons */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isActionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <>
                              {/* Public page link if published */}
                              {isPublished && (
                                <Link
                                  href={`/colleges/${college.slug}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#E31E2B] hover:bg-gray-100"
                                  title="View on public portal"
                                >
                                  <Globe2 className="w-3.5 h-3.5" />
                                </Link>
                              )}

                              {/* View detail in CRM */}
                              <Link
                                href={`/admin/colleges/${college.id}`}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                title="View College Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>

                              {/* Edit College */}
                              <Link
                                href={`/admin/colleges/${college.id}/edit`}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                title="Edit College Information"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Link>

                              {/* Publish / Unpublish Toggle */}
                              {!isArchived && (
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublish(college)}
                                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                                    isPublished
                                      ? "text-amber-700 hover:bg-amber-50 border border-amber-200"
                                      : "text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                                  }`}
                                >
                                  {isPublished ? "Unpublish" : "Publish"}
                                </button>
                              )}

                              {/* Archive / Restore */}
                              {isArchived ? (
                                <button
                                  type="button"
                                  onClick={() => handleRestore(college)}
                                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                                  title="Restore to Draft"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleArchive(college)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  title="Archive College"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-800">
              {Math.min(page * pageSize, totalCount)}
            </span>{" "}
            of <span className="font-semibold text-gray-800">{totalCount}</span> colleges
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => handlePageChange(page - 1)}
              className="h-7 text-xs px-2"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
            </Button>
            <span className="px-2 font-medium text-gray-700">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              onClick={() => handlePageChange(page + 1)}
              className="h-7 text-xs px-2"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
