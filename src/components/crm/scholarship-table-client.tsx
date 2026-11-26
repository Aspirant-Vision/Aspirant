"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Award,
  Building2,
  Calendar,
  ExternalLink,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Globe2,
} from "lucide-react";
import {
  getScholarshipsListingAction,
  togglePublishScholarshipAction,
} from "@/lib/course/actions";
import { SCHOLARSHIP_CATEGORIES } from "@/lib/validation/course";
import { Button } from "@/components/ui/button";

interface ScholarshipTableClientProps {
  initialScholarships: any[];
  initialTotal: number;
}

export function ScholarshipTableClient({
  initialScholarships,
  initialTotal,
}: ScholarshipTableClientProps) {
  const [isPending, startTransition] = useTransition();

  const [scholarships, setScholarships] = useState<any[]>(initialScholarships);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const fetchFiltered = (newSearch = search, newCat = category, newStat = status, newPage = page) => {
    startTransition(async () => {
      const res = await getScholarshipsListingAction({
        search: newSearch,
        category: newCat,
        status: newStat,
        page: newPage,
        pageSize,
      });

      if (res.success && res.data) {
        setScholarships(res.data.scholarships);
        setTotalCount(res.data.totalCount);
        setPage(res.data.page);
      }
    });
  };

  const handleTogglePublish = async (s: any) => {
    const willPublish = s.publication_status !== "published";
    try {
      setActiveActionId(s.id);
      setActionFeedback(null);
      const res = await togglePublishScholarshipAction(s.id, willPublish);
      if (!res.success) {
        setActionFeedback({ type: "error", message: res.error?.message || "Action failed" });
      } else {
        setActionFeedback({
          type: "success",
          message: willPublish ? `"${s.name}" is now live!` : `"${s.name}" moved to draft.`,
        });
        fetchFiltered();
      }
    } catch {
      setActionFeedback({ type: "error", message: "Failed to update publication status." });
    } finally {
      setActiveActionId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-4">
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
          <button onClick={() => setActionFeedback(null)} className="text-gray-400 hover:text-gray-600 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchFiltered(search, category, status, 1);
            }}
            className="relative flex-1"
          >
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by scholarship title or provider..."
              className="w-full pl-9 pr-20 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20"
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

          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                fetchFiltered(search, e.target.value, status, 1);
              }}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-700"
            >
              <option value="all">All Categories</option>
              {SCHOLARSHIP_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {[
            { id: "all", label: "All Scholarships" },
            { id: "published", label: "Live on Portal" },
            { id: "draft", label: "Drafts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatus(tab.id);
                fetchFiltered(search, category, tab.id, 1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                status === tab.id ? "bg-[#15182D] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
                <th className="px-4 py-3">Scholarship & Provider</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Benefit</th>
                <th className="px-3 py-3">Target Scope</th>
                <th className="px-3 py-3">Deadline</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scholarships.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Award className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-gray-600">No scholarships found</p>
                    <p className="text-xs text-gray-400 mt-1">Configure grants, awards or financial aid packages.</p>
                  </td>
                </tr>
              ) : (
                scholarships.map((s) => {
                  const isActionLoading = activeActionId === s.id;
                  const isPublished = s.publication_status === "published";

                  return (
                    <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/scholarships/${s.id}`}
                          className="font-bold text-gray-900 hover:text-[#E31E2B] transition-colors truncate block max-w-xs"
                        >
                          {s.name}
                        </Link>
                        <div className="text-[11px] text-gray-500">{s.provider}</div>
                      </td>

                      <td className="px-3 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 uppercase">
                          {s.category?.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <div className="font-bold text-gray-900">
                          {s.scholarship_amount > 0 ? `₹${s.scholarship_amount.toLocaleString("en-IN")}` : "Fee Waiver"}
                        </div>
                        {s.scholarship_percentage && (
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            {s.scholarship_percentage}% Tuition Waiver
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-3 text-gray-600">
                        {s.colleges?.name || "National / All Colleges"}
                      </td>

                      <td className="px-3 py-3 text-gray-700 font-medium">
                        {s.application_deadline
                          ? new Date(s.application_deadline).toLocaleDateString("en-IN")
                          : "Ongoing / Rolling"}
                      </td>

                      <td className="px-3 py-3">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Draft
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isActionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <>
                              {isPublished && s.slug && (
                                <Link
                                  href={`/scholarships/${s.slug}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#E31E2B] hover:bg-gray-100"
                                  title="View Public Page"
                                >
                                  <Globe2 className="w-3.5 h-3.5" />
                                </Link>
                              )}

                              <Link
                                href={`/admin/scholarships/${s.id}`}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>

                              <Link
                                href={`/admin/scholarships/${s.id}/edit`}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                title="Edit Scholarship"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleTogglePublish(s)}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                                  isPublished
                                    ? "text-amber-700 hover:bg-amber-50 border border-amber-200"
                                    : "text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                                }`}
                              >
                                {isPublished ? "Unpublish" : "Publish"}
                              </button>
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

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div>
            Showing <span className="font-semibold text-gray-800">{totalCount === 0 ? 0 : (page - 1) * pageSize + 1}</span>{" "}
            to <span className="font-semibold text-gray-800">{Math.min(page * pageSize, totalCount)}</span> of{" "}
            <span className="font-semibold text-gray-800">{totalCount}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => fetchFiltered(search, category, status, page - 1)}
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
              onClick={() => fetchFiltered(search, category, status, page + 1)}
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
