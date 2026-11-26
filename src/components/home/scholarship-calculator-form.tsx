"use client";

import React, { useState } from "react";
import {
  Banknote,
  Sparkles,
  CheckCircle2,
  Send,
  Loader2,
  ShieldCheck,
  BadgePercent,
  FileCheck2,
  Check,
  MessageCircle,
} from "lucide-react";
import { submitPublicEnquiryAction } from "@/lib/crm/actions";

export function ScholarshipCalculatorForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    targetDegree: "B.Tech Computer Science (CSE)",
    academicStatus: "12th Appearing (Session 2026)",
    budgetRange: "₹2.5L – ₹5L / year",
    honeypot: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = formData.phone.replace(/[^\d+]/g, "").trim();
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!formData.fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const email = `scholarship_${cleanPhone.replace(/[^0-9]/g, "")}@aspirantvision.lead`;

      const res = await submitPublicEnquiryAction({
        fullName: formData.fullName.trim(),
        phone: cleanPhone,
        email,
        preferredLocation: "Scholarship & Fee Portal",
        currentQualification: formData.academicStatus,
        enquiryMessage: `[Merit Scholarship & Fee Enquiry] Target Degree: ${formData.targetDegree} | Status: ${formData.academicStatus} | Annual Budget: ${formData.budgetRange}`,
        source: "home_scholarship_calculator_form",
        landingPage: "/",
        consentStatus: true,
        honeypot: formData.honeypot,
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error?.message || "Failed to submit request. Please try again or WhatsApp our desk.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8 sm:py-12 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="relative rounded-2xl sm:rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50/40 via-white to-rose-50/30 p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Scholarship Highlights */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <BadgePercent className="w-3.5 h-3.5 text-amber-700" />
              <span>Direct Tuition Concessions 2026–27</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#15182D] tracking-tight leading-tight">
              Claim Up to <span className="text-[#E31E2B]">₹5 Lakhs Scholarship</span> &amp; Official Fee Breakdown
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl">
              Did you know that over 40% of meritorious students miss out on official fee waivers simply due to lack of early quota processing? We verify your eligibility and process institutional tuition concessions directly with partner universities.
            </p>

            {/* Checklist of Guarantees */}
            <div className="space-y-2.5 pt-1 text-xs text-gray-700 font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>100% Direct University Account Deposit (Zero Hidden Middleman Markup)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Pre-Approved 0% Collateral Education Loan Tie-ups (SBI, HDFC Credila)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Merit, Sports &amp; Girl Child Concessions Audited by Senior Counsellors</span>
              </div>
            </div>
          </div>

          {/* Right Column: Scholarship Form */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-5 sm:p-8 shadow-md relative">
              {isSuccess ? (
                <div className="py-8 text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-xl font-bold text-[#15182D]">
                      Scholarship Assessment Submitted!
                    </h3>
                    <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                      Our financial aid mentor is matching your profile with available university tuition waivers for {formData.targetDegree}. We will reach out shortly with an official fee breakdown.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href="https://wa.me/919876543210?text=Hello%20Aspirant%20Vision,%20I%20would%20like%20to%20know%20about%20merit%20scholarships%20and%20fee%20structures."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Scholarship Desk</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSuccess(false);
                        setFormData({
                          fullName: "",
                          phone: "",
                          targetDegree: "B.Tech Computer Science (CSE)",
                          academicStatus: "12th Appearing (Session 2026)",
                          budgetRange: "₹2.5L – ₹5L / year",
                          honeypot: "",
                        });
                      }}
                      className="text-xs text-gray-500 hover:text-gray-900 font-semibold cursor-pointer underline"
                    >
                      Apply for another program
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#15182D]">
                      Calculate Your Fee Waiver
                    </h3>
                    <p className="text-xs text-gray-500">
                      Check tuition concessions &amp; institutional aid available for your preferred course.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#E31E2B] text-xs font-semibold">
                      {errorMessage}
                    </div>
                  )}

                  {/* Honeypot */}
                  <input
                    type="text"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Ananya Senapati"
                        className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Mobile Number (WhatsApp) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="98765 43210"
                          className="w-full text-xs font-medium pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Target Degree Course
                      </label>
                      <select
                        value={formData.targetDegree}
                        onChange={(e) => setFormData({ ...formData, targetDegree: e.target.value })}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white text-gray-800 outline-none cursor-pointer"
                      >
                        <option value="B.Tech Computer Science (CSE)">B.Tech CSE / AI &amp; DS</option>
                        <option value="B.Tech Core (ECE, Mech, Civil)">B.Tech Core Branches</option>
                        <option value="MBA / PGDM (Marketing, Finance)">MBA / PGDM</option>
                        <option value="MBBS / BDS (Medical & Dental)">MBBS / Dental</option>
                        <option value="BBA / BCA / B.Sc IT">BBA / BCA / B.Sc IT</option>
                        <option value="Law (Integrated B.A. LL.B)">Integrated Law (LL.B)</option>
                        <option value="Pharmacy (B.Pharm / M.Pharm)">Pharmacy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Current Academic Level
                      </label>
                      <select
                        value={formData.academicStatus}
                        onChange={(e) => setFormData({ ...formData, academicStatus: e.target.value })}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white text-gray-800 outline-none cursor-pointer"
                      >
                        <option value="12th Appearing (Session 2026)">12th Appearing (2026)</option>
                        <option value="12th Passed (Looking for Admissions)">12th Passed</option>
                        <option value="Final Year Graduation Student">Final Year Graduation</option>
                        <option value="Graduate / Working Professional">Graduate</option>
                        <option value="Diploma / Lateral Entry Candidate">Diploma / Lateral Entry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Annual Tuition Budget Preference
                    </label>
                    <select
                      value={formData.budgetRange}
                      onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white text-gray-800 outline-none cursor-pointer"
                    >
                      <option value="Under ₹1.5 Lakhs / year">Under ₹1.5 Lakhs / year (Low Budget / Govt Merit)</option>
                      <option value="₹1.5L – ₹3L / year">₹1.5L – ₹3L / year (Affordable Private)</option>
                      <option value="₹3L – ₹6L / year">₹3L – ₹6L / year (Premier University)</option>
                      <option value="Above ₹6L / year">Above ₹6L / year (Top Tier / International)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#15182D] hover:bg-black text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Aid Eligibility...</span>
                      </>
                    ) : (
                      <>
                        <Banknote className="w-4 h-4 text-amber-400" />
                        <span>Claim My Scholarship Breakdown →</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                    <span>Official university fee receipt guaranteed. Zero capitation.</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
