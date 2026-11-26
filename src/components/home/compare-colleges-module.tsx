"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, X, ArrowRight, ArrowLeftRight } from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";
import { FEATURED_COLLEGES, CollegeShowcase } from "./featured-colleges";

export function CompareCollegesModule() {
  const { openModal } = useCounselingModal();

  // Selected colleges for comparison (up to 4)
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "iit-delhi",
    "bits-pilani",
    "kiit-university",
  ]);

  const selectedColleges = selectedIds
    .map((id) => FEATURED_COLLEGES.find((c) => c.id === id))
    .filter(Boolean) as CollegeShowcase[];

  const removeCollege = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const addCollege = (id: string) => {
    if (selectedIds.length < 4 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const availableColleges = FEATURED_COLLEGES.filter(
    (c) => !selectedIds.includes(c.id)
  );

  return (
    <section id="compare" className="py-8 sm:py-14 lg:py-16 bg-[#171B52]/[0.02] border-y border-[#E7E9F0]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 gap-4">
          <div>
            <span className="text-[#E31E2B] font-bold text-xs uppercase tracking-wider block mb-1">
              — Comparison Engine
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
              Make Smarter College Decisions
            </h2>
            <p className="text-xs sm:text-sm text-[#687086] mt-1 max-w-2xl">
              Compare your shortlisted colleges side-by-side and find the institution that matches your goals, budget and career ambitions.
            </p>
          </div>
          <button
            onClick={() => openModal("Detailed Comparison Tool")}
            className="tactile-btn-red inline-flex items-center gap-1.5 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Matrix Spotlight Banner */}
        <div className="mb-6 sm:mb-8 relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E7E9F0] shadow-sm bg-slate-900">
          <div className="relative h-32 sm:h-44 md:h-52 w-full">
            <Image
              src="/images/comparision_matrix1.webp"
              alt="College Comparison Matrix Framework - Aspirant Vision"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent flex items-center p-6 sm:p-8">
              <div className="max-w-md space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-[11px] font-bold backdrop-blur-xs">
                  Side-by-Side Analytics
                </span>
                <h3 className="text-base sm:text-xl font-extrabold text-white leading-tight">
                  Cutoffs • Placements • Total Fees
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2">
                  Select and evaluate up to 4 universities side-by-side with verified institutional metrics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COMPARISON MATRIX TABLE (Universal Across All Devices with smooth touch scrolling on mobile) */}
        <div className="tactile-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-[#E7E9F0] w-full max-w-full">
          {/* Mobile Swipe Guidance Banner */}
          <div className="sm:hidden px-4 py-2.5 bg-gradient-to-r from-red-50/60 to-white border-b border-[#E7E9F0] flex items-center justify-between text-xs text-[#687086]">
            <span className="flex items-center gap-1.5 font-bold text-[#E31E2B]">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Swipe table horizontally to compare</span>
            </span>
            <span className="text-[11px] font-semibold text-[#15182D] bg-white px-2 py-0.5 rounded-full border border-[#E7E9F0] shadow-2xs">
              {selectedColleges.length} Colleges
            </span>
          </div>

          <div className="overflow-x-auto w-full max-w-full overscroll-x-contain touch-pan-x">
            <table className="w-full text-left border-collapse table-fixed min-w-[700px] sm:min-w-[880px]">
              <thead>
                <tr className="border-b border-[#E7E9F0] bg-[#F7F8FC]">
                  {/* Label Column Header */}
                  <th className="p-3.5 sm:p-5 w-44 sm:w-56 text-xs font-bold uppercase tracking-wider text-[#687086] border-r border-[#E7E9F0]">
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4 text-[#E31E2B]" />
                      <span>Comparison Matrix</span>
                    </div>
                  </th>

                  {/* College Columns */}
                  {selectedColleges.map((col) => (
                    <th key={col.id} className="p-3.5 sm:p-5 w-56 sm:w-64 align-top border-r border-[#E7E9F0] last:border-r-0">
                      <div className="relative">
                        <button
                          onClick={() => removeCollege(col.id)}
                          className="absolute -top-1 -right-1 text-gray-400 hover:text-[#E31E2B] p-1 rounded-full hover:bg-red-50 transition-colors"
                          aria-label={`Remove ${col.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="relative h-20 sm:h-24 w-full rounded-xl overflow-hidden mb-2.5 sm:mb-3 bg-gray-100 shadow-inner">
                          <Image
                            src={col.image}
                            alt={col.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h4 className="font-display font-bold text-xs sm:text-sm text-[#15182D] line-clamp-1">
                          {col.name}
                        </h4>
                        <span className="text-[11px] text-[#687086] block mt-0.5 line-clamp-1">
                          {col.location}
                        </span>
                      </div>
                    </th>
                  ))}

                  {/* Empty slot to add college if < 4 */}
                  {selectedColleges.length < 4 && (
                    <th className="p-3.5 sm:p-5 w-52 sm:w-64 align-middle">
                      <div className="border-2 border-dashed border-[#E7E9F0] hover:border-[#E31E2B] rounded-2xl p-4 sm:p-5 text-center transition-all bg-white hover:bg-red-50/20">
                        <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-[#E31E2B] mx-auto mb-1.5" />
                        <span className="text-xs font-bold text-[#15182D] block mb-2">
                          Add College
                        </span>
                        {availableColleges.length > 0 ? (
                          <select
                            onChange={(e) => e.target.value && addCollege(e.target.value)}
                            value=""
                            className="w-full text-xs border border-[#E7E9F0] rounded-lg px-2.5 py-1.5 outline-none font-medium bg-white text-[#15182D] cursor-pointer hover:border-[#171B52]"
                          >
                            <option value="">Select College...</option>
                            {availableColleges.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name.split(" - ")[0]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            onClick={() => openModal("Add custom college to compare")}
                            className="text-[11px] text-[#E31E2B] font-semibold hover:underline"
                          >
                            Search Full Database
                          </button>
                        )}
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E9F0] text-xs sm:text-sm">
                {/* Row 1: NIRF Ranking */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3.5 sm:p-4 font-bold text-[#15182D] bg-[#F7F8FC]/60 border-r border-[#E7E9F0]">
                    NIRF Ranking
                  </td>
                  {selectedColleges.map((col) => (
                    <td key={col.id} className="p-3.5 sm:p-4 font-semibold text-[#15182D] border-r border-[#E7E9F0] last:border-r-0">
                      <span className="bg-red-50 text-[#E31E2B] px-2.5 sm:px-3 py-1 rounded-md text-xs font-extrabold inline-block border border-red-100 shadow-2xs">
                        {col.nirfRank}
                      </span>
                    </td>
                  ))}
                  {selectedColleges.length < 4 && <td className="p-3.5 sm:p-4 bg-gray-50/20" />}
                </tr>

                {/* Row 2: Tuition Fees */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3.5 sm:p-4 font-bold text-[#15182D] bg-[#F7F8FC]/60 border-r border-[#E7E9F0]">
                    Annual Tuition
                  </td>
                  {selectedColleges.map((col) => (
                    <td key={col.id} className="p-3.5 sm:p-4 font-extrabold text-[#15182D] border-r border-[#E7E9F0] last:border-r-0">
                      {col.fees}
                    </td>
                  ))}
                  {selectedColleges.length < 4 && <td className="p-3.5 sm:p-4 bg-gray-50/20" />}
                </tr>

                {/* Row 3: Average CTC */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3.5 sm:p-4 font-bold text-[#15182D] bg-[#F7F8FC]/60 border-r border-[#E7E9F0]">
                    Average Placement
                  </td>
                  {selectedColleges.map((col) => (
                    <td key={col.id} className="p-3.5 sm:p-4 font-extrabold text-[#16A34A] border-r border-[#E7E9F0] last:border-r-0">
                      {col.avgCtc}
                    </td>
                  ))}
                  {selectedColleges.length < 4 && <td className="p-3.5 sm:p-4 bg-gray-50/20" />}
                </tr>

                {/* Row 4: Accreditation */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3.5 sm:p-4 font-bold text-[#15182D] bg-[#F7F8FC]/60 border-r border-[#E7E9F0]">
                    Accreditation
                  </td>
                  {selectedColleges.map((col) => (
                    <td key={col.id} className="p-3.5 sm:p-4 text-[#687086] font-medium border-r border-[#E7E9F0] last:border-r-0">
                      {col.type}
                    </td>
                  ))}
                  {selectedColleges.length < 4 && <td className="p-3.5 sm:p-4 bg-gray-50/20" />}
                </tr>

                {/* Row 5: Action Row */}
                <tr className="bg-[#F7F8FC]/30">
                  <td className="p-3.5 sm:p-4 font-bold text-[#15182D] bg-[#F7F8FC]/60 border-r border-[#E7E9F0]">
                    Admissions
                  </td>
                  {selectedColleges.map((col) => (
                    <td key={col.id} className="p-3.5 sm:p-4 border-r border-[#E7E9F0] last:border-r-0">
                      <button
                        onClick={() => openModal(`Apply: ${col.name}`)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#171B52] hover:bg-[#E31E2B] text-white text-xs font-bold transition-all text-center shadow-sm"
                      >
                        Apply Now
                      </button>
                    </td>
                  ))}
                  {selectedColleges.length < 4 && <td className="p-3.5 sm:p-4 bg-gray-50/20" />}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Add Campus Suggestions */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-[#687086] text-[11px] uppercase tracking-wider">
            Quick Add to Compare:
          </span>
          {availableColleges.slice(0, 5).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => addCollege(c.id)}
              disabled={selectedIds.length >= 4}
              className="tactile-pill px-3 py-1 rounded-full text-xs font-semibold text-[#15182D] hover:text-[#E31E2B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              + {c.name.split(" - ")[0]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
