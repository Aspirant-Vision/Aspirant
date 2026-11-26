"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  Search,
  Building2,
  BookOpen,
  Calendar,
  UserCheck,
  Download,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdmissionsTableClientProps {
  initialAdmissions: any[];
  totalCount: number;
  colleges: Array<{ id: string; name: string }>;
  currentCollegeId: string;
  currentAcademicYear: string;
  currentSearch: string;
  currentPage: number;
  limit: number;
}

export function AdmissionsTableClient({
  initialAdmissions,
  totalCount,
  colleges,
  currentCollegeId,
  currentAcademicYear,
  currentSearch,
  currentPage,
  limit,
}: AdmissionsTableClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  const applyFilters = (collegeId?: string, academicYear?: string, search?: string, page: number = 1) => {
    const params = new URLSearchParams();
    const col = collegeId !== undefined ? collegeId : currentCollegeId;
    const yr = academicYear !== undefined ? academicYear : currentAcademicYear;
    const s = search !== undefined ? search : searchTerm;

    if (col && col !== "all") params.set("collegeId", col);
    if (yr && yr !== "all") params.set("academicYear", yr);
    if (s && s.trim()) params.set("search", s.trim());
    if (page > 1) params.set("page", page.toString());

    router.push(`/admin/admissions?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ref # (e.g. AV-ADM)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters(undefined, undefined, searchTerm, 1)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* College Filter */}
          <select
            value={currentCollegeId}
            onChange={(e) => applyFilters(e.target.value, undefined, undefined, 1)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white max-w-[200px]"
          >
            <option value="all">All Colleges</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Academic Year Filter */}
          <select
            value={currentAcademicYear}
            onChange={(e) => applyFilters(undefined, e.target.value, undefined, 1)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
          >
            <option value="all">All Sessions</option>
            <option value="2025-26">2025-26</option>
            <option value="2026-27">2026-27</option>
            <option value="2027-28">2027-28</option>
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

      {/* Admissions Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Admission Ref</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Allotted College & Course</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4">Session</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Authorized Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialAdmissions.length > 0 ? (
                initialAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-red-50/20 transition-colors">
                    {/* Reference */}
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      {adm.admission_reference}
                    </td>

                    {/* Student */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{adm.student?.full_name || "Student"}</p>
                      <p className="text-[11px] text-gray-500">{adm.student?.email}</p>
                    </td>

                    {/* College & Course */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900 truncate max-w-xs">{adm.college?.name}</p>
                      <p className="text-[11px] text-gray-500 truncate max-w-xs">
                        {adm.course?.name} ({adm.course?.degree_type || "Degree"})
                      </p>
                    </td>

                    {/* Admission Date */}
                    <td className="py-3.5 px-4 text-gray-600">
                      {new Date(adm.admission_date).toLocaleDateString()}
                    </td>

                    {/* Academic Session */}
                    <td className="py-3.5 px-4 font-semibold text-gray-700">
                      {adm.academic_year}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 capitalize border border-emerald-200">
                        {adm.admission_status}
                      </span>
                    </td>

                    {/* Officer */}
                    <td className="py-3.5 px-4 text-gray-600">
                      {adm.officer?.full_name || "Central Committee"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No confirmed admission records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
