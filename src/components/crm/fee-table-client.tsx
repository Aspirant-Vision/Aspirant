"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  IndianRupee,
  Building2,
  GraduationCap,
  Edit,
  Archive,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { getFeesListingAction } from "@/lib/course/actions";
import { FEE_TYPES } from "@/lib/validation/course";
import { Button } from "@/components/ui/button";

interface FeeTableClientProps {
  initialFees: any[];
  initialTotal: number;
}

export function FeeTableClient({ initialFees, initialTotal }: FeeTableClientProps) {
  const [isPending, startTransition] = useTransition();

  const [fees, setFees] = useState<any[]>(initialFees);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);

  const [search, setSearch] = useState("");
  const [feeType, setFeeType] = useState("all");
  const [academicYear, setAcademicYear] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchFiltered = (newType = feeType, newYear = academicYear, newPage = page) => {
    startTransition(async () => {
      const res = await getFeesListingAction({
        feeType: newType,
        academicYear: newYear,
        page: newPage,
        pageSize,
      });

      if (res.success && res.data) {
        setFees(res.data.fees);
        setTotalCount(res.data.totalCount);
        setPage(res.data.page);
      }
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter By:
          </span>

          <select
            value={feeType}
            onChange={(e) => {
              setFeeType(e.target.value);
              fetchFiltered(e.target.value, academicYear, 1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-700"
          >
            <option value="all">All Fee Types</option>
            {FEE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={academicYear}
            onChange={(e) => {
              setAcademicYear(e.target.value);
              fetchFiltered(feeType, e.target.value, 1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-700"
          >
            <option value="all">All Academic Years</option>
            <option value="2025-26">2025-26</option>
            <option value="2024-25">2024-25</option>
            <option value="2023-24">2023-24</option>
          </select>
        </div>

        <div className="text-xs text-gray-500">
          Showing <span className="font-bold text-gray-800">{totalCount}</span> fee records
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
                <th className="px-4 py-3">College & Course</th>
                <th className="px-3 py-3">Fee Type</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Frequency</th>
                <th className="px-3 py-3">Academic Year</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <IndianRupee className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-gray-600">No fee records found</p>
                    <p className="text-xs text-gray-400 mt-1">Configure tuition or hostel fees for academic programs.</p>
                  </td>
                </tr>
              ) : (
                fees.map((fee) => {
                  const collegeName = fee.college_courses?.colleges?.name || "College";
                  const courseName = fee.college_courses?.courses?.name || "Course";
                  const displayAmount = fee.amount || fee.tuition_fee || 0;

                  return (
                    <tr key={fee.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900 truncate max-w-xs">{collegeName}</div>
                        <div className="text-[11px] text-gray-500 truncate">{courseName}</div>
                      </td>

                      <td className="px-3 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">
                          {fee.fee_type || "Tuition"}
                        </span>
                      </td>

                      <td className="px-3 py-3 font-bold text-gray-900">
                        ₹{displayAmount.toLocaleString("en-IN")}
                      </td>

                      <td className="px-3 py-3 text-gray-600 capitalize">
                        {fee.payment_frequency?.replace("_", " ") || "Annual"}
                      </td>

                      <td className="px-3 py-3 font-semibold text-gray-800">
                        {fee.academic_year}
                      </td>

                      <td className="px-3 py-3 text-gray-500 uppercase text-[10px]">
                        {fee.student_category || "All"}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/fees/${fee.id}/edit`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 inline-block"
                          title="Edit Fee"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
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
              onClick={() => fetchFiltered(feeType, academicYear, page - 1)}
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
              onClick={() => fetchFiltered(feeType, academicYear, page + 1)}
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
