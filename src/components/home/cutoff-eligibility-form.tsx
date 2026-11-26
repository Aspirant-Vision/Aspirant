"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Send,
  Loader2,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Award,
  Phone,
  MessageCircle,
} from "lucide-react";
import { submitPublicEnquiryAction } from "@/lib/crm/actions";

export function CutoffEligibilityForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    stream: "Engineering (B.Tech / B.E.)",
    scoreRange: "75% - 85% (12th / Diploma)",
    preferredLocation: "All India Campuses",
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
      setErrorMessage("Please enter a valid 10-digit mobile number for cutoff alerts.");
      return;
    }

    if (!formData.fullName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const email = `applicant_${cleanPhone.replace(/[^0-9]/g, "")}@aspirantvision.lead`;

      const res = await submitPublicEnquiryAction({
        fullName: formData.fullName.trim(),
        phone: cleanPhone,
        email,
        preferredLocation: formData.preferredLocation,
        currentQualification: formData.scoreRange,
        enquiryMessage: `[Cutoff & Eligibility Predictor] Target Stream: ${formData.stream} | Academic Score: ${formData.scoreRange} | Preferred Location: ${formData.preferredLocation}`,
        source: "home_cutoff_eligibility_form",
        landingPage: "/",
        consentStatus: true,
        honeypot: formData.honeypot,
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error?.message || "Submission failed. Please try again or WhatsApp our counselling team.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8 sm:py-12 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="relative rounded-2xl sm:rounded-3xl border border-red-100 bg-gradient-to-br from-white via-red-50/30 to-white p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Context, Value Proposition & Trust Badges */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#E31E2B] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#E31E2B]" />
              <span>Session 2026–27 Admission Desk</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#15182D] tracking-tight leading-tight">
              Check Your College Cutoff &amp; <span className="text-[#E31E2B]">Admission Eligibility</span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl">
              Not sure which colleges match your academic score? Get an audited shortlist of premier NIRF &amp; NAAC accredited universities with verified seat cutoffs and zero advisory charges.
            </p>

            {/* 3 Key Trust Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-[#E31E2B] font-extrabold text-sm sm:text-base">
                  <TrendingUp className="w-4 h-4" />
                  <span>2,500+</span>
                </div>
                <div className="text-[11px] text-gray-500 font-semibold mt-0.5">Colleges Mapped</div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm sm:text-base">
                  <Award className="w-4 h-4" />
                  <span>100% Free</span>
                </div>
                <div className="text-[11px] text-gray-500 font-semibold mt-0.5">Zero Hidden Charges</div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-blue-600 font-extrabold text-sm sm:text-base">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Instant</span>
                </div>
                <div className="text-[11px] text-gray-500 font-semibold mt-0.5">Counsellor Callback</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Includes AICTE, UGC, NAAC A++ &amp; NIRF Top 100 Ranked Campuses</span>
            </div>
          </div>

          {/* Right Column: High-Converting Tactile Form */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-5 sm:p-8 shadow-md relative">
              {isSuccess ? (
                <div className="py-8 text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-xl font-bold text-[#15182D]">
                      Eligibility Request Received!
                    </h3>
                    <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                      Our senior academic counselor has matched your profile ({formData.stream}) and will share your verified cutoff list within 15 minutes.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href="https://wa.me/919876543210?text=Hello%20Aspirant%20Vision,%20I%20just%20submitted%20my%20cutoff%20eligibility%20enquiry%20for%20admission%20guidance."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat on WhatsApp Instantly</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSuccess(false);
                        setFormData({
                          fullName: "",
                          phone: "",
                          stream: "Engineering (B.Tech / B.E.)",
                          scoreRange: "75% - 85% (12th / Diploma)",
                          preferredLocation: "All India Campuses",
                          honeypot: "",
                        });
                      }}
                      className="text-xs text-gray-500 hover:text-gray-900 font-semibold cursor-pointer underline"
                    >
                      Submit another enquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#15182D]">
                      Instant Seat &amp; Cutoff Calculator
                    </h3>
                    <p className="text-xs text-gray-500">
                      Enter your details below to receive your personalized eligibility report.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#E31E2B] text-xs font-semibold">
                      {errorMessage}
                    </div>
                  )}

                  {/* Anti-spam honeypot */}
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
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] transition-all"
                      />
                    </div>

                    {/* WhatsApp Mobile Number */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        WhatsApp Number *
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
                          className="w-full text-xs font-medium pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Target Academic Stream */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Target Academic Stream
                      </label>
                      <select
                        value={formData.stream}
                        onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white text-gray-800 outline-none cursor-pointer"
                      >
                        <option value="Engineering (B.Tech / B.E.)">Engineering (B.Tech / B.E.)</option>
                        <option value="Management (MBA / PGDM / BBA)">Management (MBA / PGDM / BBA)</option>
                        <option value="Medical & Dental (MBBS / BDS)">Medical &amp; Dental (MBBS / BDS)</option>
                        <option value="Computer Applications (BCA / MCA)">Computer Applications (BCA / MCA)</option>
                        <option value="Law (LL.B / Integrated Law)">Law (LL.B / Integrated Law)</option>
                        <option value="Pharmacy (B.Pharm / D.Pharm)">Pharmacy (B.Pharm / D.Pharm)</option>
                        <option value="Science, Commerce & Humanities">Science, Commerce &amp; Humanities</option>
                      </select>
                    </div>

                    {/* Academic Score / Percentile */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Your Score / Range
                      </label>
                      <select
                        value={formData.scoreRange}
                        onChange={(e) => setFormData({ ...formData, scoreRange: e.target.value })}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white text-gray-800 outline-none cursor-pointer"
                      >
                        <option value="Above 90% (High Merit)">Above 90% (High Merit)</option>
                        <option value="75% - 90% (First Class)">75% - 90% (First Class)</option>
                        <option value="60% - 75% (Direct Eligible)">60% - 75% (Direct Eligible)</option>
                        <option value="50% - 60% (Qualifying Score)">50% - 60% (Qualifying Score)</option>
                        <option value="Appearing in 2026 / Results Awaited">Appearing in 2026 / Awaiting</option>
                        <option value="JEE / CAT / NEET Qualified">JEE / CAT / NEET Qualified</option>
                      </select>
                    </div>
                  </div>

                  {/* Preferred Location */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Preferred Campus Location
                    </label>
                    <select
                      value={formData.preferredLocation}
                      onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white text-gray-800 outline-none cursor-pointer"
                    >
                      <option value="All India Campuses">All India (Any Premier Campus)</option>
                      <option value="Odisha (Bhubaneswar, Cuttack, Rourkela)">Odisha (Bhubaneswar, Cuttack)</option>
                      <option value="Delhi NCR (Delhi, Noida, Gurgaon)">Delhi NCR (Delhi, Noida, Gurgaon)</option>
                      <option value="Karnataka (Bengaluru, Mysuru)">Karnataka (Bengaluru)</option>
                      <option value="Maharashtra (Pune, Mumbai)">Maharashtra (Pune, Mumbai)</option>
                      <option value="Telangana & AP (Hyderabad, Visakhapatnam)">Telangana &amp; AP (Hyderabad)</option>
                      <option value="Tamil Nadu (Chennai, Coimbatore)">Tamil Nadu (Chennai, Coimbatore)</option>
                      <option value="West Bengal (Kolkata)">West Bengal (Kolkata)</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#E31E2B] hover:bg-[#c91824] text-white shadow-md hover:shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Calculating Eligible Colleges...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Predict My Eligible Colleges (Free)</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                    <span>Your data is strictly encrypted. Zero spam guarantee.</span>
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
