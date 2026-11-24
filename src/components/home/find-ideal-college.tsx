"use client";

import React, { useState } from "react";
import { Search, Sparkles, Filter, CheckCircle2, ArrowRight } from "lucide-react";
import { useCounselingModal } from "@/components/forms/counseling-modal-context";

export function FindIdealCollege() {
  const { openModal } = useCounselingModal();

  const [course, setCourse] = useState("B.Tech (Computer Science)");
  const [location, setLocation] = useState("All India");
  const [budget, setBudget] = useState("₹2L - ₹5L /yr");
  const [collegeType, setCollegeType] = useState("Premier Autonomous");
  const [exam, setExam] = useState("JEE Main");

  const [matchingCount, setMatchingCount] = useState(24);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openModal(
      `Personalized Search: ${course} in ${location} within ${budget} (${collegeType})`
    );
  };

  return (
    <section id="finder" className="py-8 sm:py-14 lg:py-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-[#171B52] via-[#10143E] to-[#171B52] rounded-2xl sm:rounded-[32px] p-5 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E31E2B]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mb-6 sm:mb-8 space-y-2">
          <span className="bg-white/10 text-[#FF8585] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider inline-block border border-white/10">
            Personalized Discovery
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Your Dream College Is Closer Than You Think
          </h2>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-2xl font-normal">
            Tell us what you want to study and where you want to study. We&apos;ll help you discover verified institutions matching your percentile and budget.
          </p>
        </div>

        {/* Multi-parameter interactive recommendation form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Field 1: Preferred Course */}
            <div className="space-y-1.5 bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block">
                Preferred Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-white text-[#15182D] rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold outline-none cursor-pointer"
              >
                <option value="B.Tech (Computer Science)">B.Tech Computer Science (CSE)</option>
                <option value="B.Tech (AI & Machine Learning)">B.Tech AI & Data Science</option>
                <option value="MBA (Marketing & Finance)">MBA / PGDM</option>
                <option value="MBBS / Medical">MBBS / Medical</option>
                <option value="BCA / MCA">BCA / MCA</option>
                <option value="BA LLB / BBA LLB">Integrated Law (LLB)</option>
              </select>
            </div>

            {/* Field 2: Preferred Location */}
            <div className="space-y-1.5 bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block">
                Preferred Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white text-[#15182D] rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold outline-none cursor-pointer"
              >
                <option value="All India">All India (Pan-India)</option>
                <option value="Bhubaneswar / Odisha">Bhubaneswar / Odisha</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Bengaluru / Karnataka">Bengaluru / Karnataka</option>
                <option value="Pune / Maharashtra">Pune / Maharashtra</option>
                <option value="Kolkata / West Bengal">Kolkata / West Bengal</option>
              </select>
            </div>

            {/* Field 3: Budget Range */}
            <div className="space-y-1.5 bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block">
                Tuition Budget Range
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-white text-[#15182D] rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold outline-none cursor-pointer"
              >
                <option value="Under ₹2L /yr">Under ₹2.0 Lakhs / yr</option>
                <option value="₹2L - ₹5L /yr">₹2.0L - ₹5.0 Lakhs / yr</option>
                <option value="₹5L - ₹10L /yr">₹5.0L - ₹10.0 Lakhs / yr</option>
                <option value="Above ₹10L /yr">Flexible / High Return on Investment</option>
              </select>
            </div>

            {/* Field 4: College Type */}
            <div className="space-y-1.5 bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block">
                Institution Type
              </label>
              <select
                value={collegeType}
                onChange={(e) => setCollegeType(e.target.value)}
                className="w-full bg-white text-[#15182D] rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold outline-none cursor-pointer"
              >
                <option value="Premier Autonomous">Premier Autonomous / Institute of Eminence</option>
                <option value="NAAC A++ Deemed">NAAC A++ Deemed Universities</option>
                <option value="Top NIRF Ranked">Top 50 NIRF Institutions</option>
                <option value="Any Verified">Any Verified Recognized Campus</option>
              </select>
            </div>

            {/* Field 5: Entrance Exam */}
            <div className="space-y-1.5 bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block">
                Entrance Exam Taken / Planning
              </label>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="w-full bg-white text-[#15182D] rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold outline-none cursor-pointer"
              >
                <option value="JEE Main">JEE Main / State CET</option>
                <option value="CAT / MAT / CMAT">CAT / MAT / CMAT</option>
                <option value="NEET UG">NEET UG</option>
                <option value="CLAT / LSAT">CLAT / LSAT</option>
                <option value="None / 12th Marks Merit">Direct Merit / 12th Board %</option>
              </select>
            </div>

            {/* Submit Action */}
            <div className="flex items-end">
              <button
                type="submit"
                className="tactile-btn-red w-full text-white py-3 px-6 rounded-2xl font-display font-extrabold text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Find My Colleges ({matchingCount}+ Matches)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
