"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Search,
  Building2,
  BookOpen,
  User,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApplicationTableClientProps {
  initialApplications: any[];
  totalCount: number;
  statusCounts: Record<string, number>;
  colleges: Array<{ id: string; name: string }>;
  counsellors: Array<{ id: string; full_name: string }>;
  currentStatus: string;
  currentCollegeId: string;
  currentSearch: string;
  currentPage: number;
  limit: number;
}

export function ApplicationTableClient({
  initialApplications,
  totalCount,
  statusCounts,
  colleges,
  counsellors,
  currentStatus,
  currentCollegeId,
  currentSearch,
  currentPage,
  limit,
}: ApplicationTableClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  const applyFilters = (status?: string, collegeId?: string, search?: string, page: number = 1) => {
    const params = new URLSearchParams();
    const st = status !== undefined ? status : currentStatus;
    const col = collegeId !== undefined ? collegeId : currentCollegeId;
    const s = search !== undefined ? search : searchTerm;

    if (st && st !== "all") params.set("status", st);
    if (col && col !== "all") params.set("collegeId", col);
    if (s && s.trim()) params.set("search", s.trim());
    if (page > 1) params.set("page", page.toString());

    router.push(`/admin/applications?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "submitted":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "under_review":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "documents_required":
        return "bg-red-50 text-red-700 border-red-200 font-bold";
      case "verified":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "forwarded":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "accepted":
        return "bg-emerald-600 text-white border-emerald-600";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "waitlisted":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "withdrawn":
        return "bg-gray-200 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by app # (e.g. AV-APP)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters(undefined, undefined, searchTerm, 1)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={currentStatus}
            onChange={(e) => applyFilters(e.target.value, undefined, undefined, 1)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
          >
            <option value="all">All Statuses ({statusCounts.total || 0})</option>
            <option value="submitted">Submitted ({statusCounts.submitted || 0})</option>
            <option value="under_review">Under Review ({statusCounts.under_review || 0})</option>
            <option value="documents_required">Documents Required ({statusCounts.documents_required || 0})</option>
            <option value="verified">Verified ({statusCounts.verified || 0})</option>
            <option value="forwarded">Forwarded ({statusCounts.forwarded || 0})</option>
            <option value="accepted">Accepted ({statusCounts.accepted || 0})</option>
            <option value="rejected">Rejected ({statusCounts.rejected || 0})</option>
            <option value="waitlisted">Waitlisted ({statusCounts.waitlisted || 0})</option>
            <option value="draft">Drafts ({statusCounts.draft || 0})</option>
          </select>

          {/* College Filter */}
          <select
            value={currentCollegeId}
            onChange={(e) => applyFilters(undefined, e.target.value, undefined, 1)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white max-w-[200px]"
          >
            <option value="all">All Colleges</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button
            onClick={() => applyFilters(undefined, undefined, searchTerm, 1)}
            variant="secondary"
            size="sm"
            className="text-xs"
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Applicant Student</th>
                <th className="py-3 px-4">College & Program</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Staff</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialApplications.length > 0 ? (
                initialApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-red-50/20 transition-colors">
                    {/* App Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {app.application_number}
                      </Link>
                    </td>

                    {/* Student */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{app.student?.full_name || "Student"}</p>
                      <p className="text-[11px] text-gray-500">{app.student?.email}</p>
                    </td>

                    {/* College & Program */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900 truncate max-w-xs">{app.college?.name}</p>
                      <p className="text-[11px] text-gray-500 truncate max-w-xs">
                        {app.college_course?.course_name_override || app.college_course?.course?.name}
                      </p>
                    </td>

                    {/* Submitted Date */}
                    <td className="py-3.5 px-4 text-gray-600">
                      {app.submitted_at
                        ? new Date(app.submitted_at).toLocaleDateString()
                        : "Draft"}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${getStatusBadge(
                          app.application_status
                        )}`}
                      >
                        {app.application_status.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Counsellor */}
                    <td className="py-3.5 px-4 text-gray-600">
                      {app.counsellor?.full_name || (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <Link href={`/admin/applications/${app.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs p-1.5" title="View Application">
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                        </Button>
                      </Link>
                      <Link href={`/admin/applications/${app.id}/review`}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs py-1 px-2.5 bg-red-50 text-primary border-red-100 hover:bg-red-100"
                        >
                          Review
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
                        <FileCheck2 className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">No applications found</h3>
                      <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                        {searchTerm || currentStatus !== "all" || currentCollegeId !== "all"
                          ? "No applications matched your active filters. Try adjusting your search term or status filters."
                          : "There are no applications submitted yet. New student submissions will appear here in real-time."}
                      </p>
                      {(searchTerm || currentStatus !== "all" || currentCollegeId !== "all") && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            router.push("/admin/applications");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing Page {currentPage} of {totalPages} ({totalCount} total)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => applyFilters(undefined, undefined, undefined, currentPage - 1)}
                className="text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => applyFilters(undefined, undefined, undefined, currentPage + 1)}
                className="text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
