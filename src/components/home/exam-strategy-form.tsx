"use client";

import React, { useState } from "react";
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Send,
  Loader2,
  ShieldCheck,
  PhoneCall,
  Clock,
  Compass,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { submitPublicEnquiryAction } from "@/lib/crm/actions";

export function ExamStrategyForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    targetExam: "JEE Main / State CETs",
    callTimeSlot: "Evening (5:00 PM – 8:00 PM)",
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
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!formData.fullName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const email = `strategy_${cleanPhone.replace(/[^0-9]/g, "")}@aspirantvision.lead`;

      const res = await submitPublicEnquiryAction({
        fullName: formData.fullName.trim(),
        phone: cleanPhone,
        email,
        preferredLocation: "1-on-1 Strategy Desk",
        currentQualification: formData.targetExam,
        enquiryMessage: `[1-on-1 Exam Strategy Call] Target Exam: ${formData.targetExam} | Preferred Callback Time: ${formData.callTimeSlot}`,
        source: "home_exam_strategy_form",
        landingPage: "/",
        consentStatus: true,
        honeypot: formData.honeypot,
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error?.message || "Failed to schedule session. Please try again or WhatsApp our team.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8 sm:py-12 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="relative rounded-2xl sm:rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Context & Strategic Advisory Pitch */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-300/60 text-blue-900 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-blue-700" />
              <span>1-on-1 Strategic Academic Roadmapping</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#15182D] tracking-tight leading-tight">
              Worried About Exam Cutoffs? <span className="text-[#E31E2B]">Secure Guaranteed Backup</span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl">
              Entrance exams like JEE, CAT, NEET and CUET have unpredictable percentiles. Speak 1-on-1 with an experienced academic advisor to establish a safety college roadmap with confirmed direct merit eligibility.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                <div className="flex items-center gap-1.5 text-blue-700 font-extrabold text-sm">
                  <PhoneCall className="w-4 h-4" />
                  <span>15-Min Call</span>
                </div>
                <div className="text-[11px] text-gray-500 font-semibold mt-0.5">Private 1-on-1 Session</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Guaranteed</span>
                </div>
                <div className="text-[11px] text-gray-500 font-semibold mt-0.5">Zero Advisory Markup</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                <div className="flex items-center gap-1.5 text-amber-700 font-extrabold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Same-Day</span>
                </div>
                <div className="text-[11px] text-gray-500 font-semibold mt-0.5">Counsellor Matching</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Scheduling Form */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-5 sm:p-8 shadow-md relative">
              {isSuccess ? (
                <div className="py-8 text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-xl font-bold text-[#15182D]">
                      Strategy Session Reserved!
                    </h3>
                    <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                      A senior admission mentor has been assigned to your request for {formData.targetExam}. You will receive a callback during your selected slot ({formData.callTimeSlot}).
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href="https://wa.me/919876543210?text=Hello%20Aspirant%20Vision,%20I%20just%20scheduled%20a%201-on-1%20exam%20strategy%20call."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Connect on WhatsApp Now</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSuccess(false);
                        setFormData({
                          fullName: "",
                          phone: "",
                          targetExam: "JEE Main / State CETs",
                          callTimeSlot: "Evening (5:00 PM – 8:00 PM)",
                          honeypot: "",
                        });
                      }}
                      className="text-xs text-gray-500 hover:text-gray-900 font-semibold cursor-pointer underline"
                    >
                      Schedule another session
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#15182D]">
                      Book a Free 1-on-1 Counselling Slot
                    </h3>
                    <p className="text-xs text-gray-500">
                      Connect directly with an authorized institutional counsellor at your convenience.
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
                        placeholder="e.g. Siddharth Mishra"
                        className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Mobile Number *
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
                          className="w-full text-xs font-medium pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Target Entrance Exam
                      </label>
                      <select
                        value={formData.targetExam}
                        onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white text-gray-800 outline-none cursor-pointer"
                      >
                        <option value="JEE Main / State CETs">JEE Main / State CETs</option>
                        <option value="CAT / XAT / CMAT / MAT">CAT / XAT / CMAT / MAT</option>
                        <option value="NEET-UG / Medical">NEET-UG / Medical</option>
                        <option value="CLAT / AILET / Law">CLAT / Law Entrance</option>
                        <option value="CUET UG / PG">CUET UG / PG</option>
                        <option value="Non-Exam / Direct Merit Seat">Direct Merit / Non-Exam</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Preferred Call Window
                      </label>
                      <select
                        value={formData.callTimeSlot}
                        onChange={(e) => setFormData({ ...formData, callTimeSlot: e.target.value })}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white text-gray-800 outline-none cursor-pointer"
                      >
                        <option value="Morning (10:00 AM – 1:00 PM)">Morning (10:00 AM – 1:00 PM)</option>
                        <option value="Afternoon (1:00 PM – 5:00 PM)">Afternoon (1:00 PM – 5:00 PM)</option>
                        <option value="Evening (5:00 PM – 8:00 PM)">Evening (5:00 PM – 8:00 PM)</option>
                        <option value="Immediate WhatsApp Callback">Immediate Callback (Next 15m)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#E31E2B] hover:bg-[#c91824] text-white shadow-md hover:shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Reserving Slot...</span>
                      </>
                    ) : (
                      <>
                        <PhoneCall className="w-4 h-4" />
                        <span>Schedule Free Strategy Call →</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                    <span>Free 1-on-1 strategic advisory. Guaranteed confidential.</span>
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
