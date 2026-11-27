"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Send, GraduationCap, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";
import { submitPublicEnquiryAction } from "@/lib/crm/actions";
import {
  getRecommendedCollegesForDiscipline,
  getCollegeTypeFromCourseCategory,
} from "@/lib/discipline-meta";

interface CounselingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCollege?: string;
}

export function CounselingModal({
  isOpen,
  onClose,
  initialCollege = "",
}: CounselingModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    interestedCollege: initialCollege || "KIIT University",
    interestedCourse: "B.Tech Computer Science (CSE)",
    score: "",
    consent: true,
    honeypot: "",
  });

  // Keep preferred college in sync when initialCollege prop changes
  useEffect(() => {
    if (initialCollege) {
      setFormData((prev) => ({ ...prev, interestedCollege: initialCollege }));
    }
  }, [initialCollege]);

  const recommendedColleges = getRecommendedCollegesForDiscipline(formData.interestedCourse);
  const disciplineName = getCollegeTypeFromCourseCategory(formData.interestedCourse);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // Capture UTM parameters from URL if present
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const utmSource = urlParams?.get("utm_source") || null;
      const utmMedium = urlParams?.get("utm_medium") || null;
      const utmCampaign = urlParams?.get("utm_campaign") || null;
      const landingPage = typeof window !== "undefined" ? window.location.pathname : "/";
      const referringPage = typeof document !== "undefined" ? document.referrer : null;

      const res = await submitPublicEnquiryAction({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferredLocation: formData.city,
        enquiryMessage: `College: ${formData.interestedCollege} | Course: ${formData.interestedCourse}${
          formData.score ? ` | Score/Scorecard: ${formData.score}` : ""
        }`,
        consentStatus: formData.consent,
        source: initialCollege ? `modal_${initialCollege.slice(0, 30)}` : "website_modal",
        landingPage,
        referringPage,
        utmSource,
        utmMedium,
        utmCampaign,
        honeypot: formData.honeypot,
      });

      if (!res.success) {
        setErrorMessage(res.error?.message || "Failed to submit enquiry. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C102C]/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-[#E31E2B] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg leading-tight">
                Free Academic Counseling
              </h3>
              <p className="text-xs text-white/80">
                Personalized guidance from verified admission counsellors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 md:p-8">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-display font-bold text-2xl text-[#15182D]">
                Enquiry Registered!
              </h4>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Thank you <strong className="text-gray-900">{formData.name}</strong>. Your enquiry has been received and assigned to a senior academic counsellor. We will connect with you at{" "}
                <strong className="text-gray-900">{formData.phone}</strong> shortly.
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  variant="primary"
                  className="rounded-xl px-8"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Honeypot field (hidden from real users, trips bots) */}
              <input
                type="text"
                name="user_note"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div>
                <label className="block text-xs font-bold text-[#15182D] uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B] focus:border-[#E31E2B] text-sm outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#15182D] uppercase tracking-wider mb-1.5">
                    WhatsApp Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B] focus:border-[#E31E2B] text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#15182D] uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B] focus:border-[#E31E2B] text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#15182D] uppercase tracking-wider mb-1.5">
                    Your City / State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhubaneswar / Patna"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B] focus:border-[#E31E2B] text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#15182D] uppercase tracking-wider mb-1.5">
                    Preferred College
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KIIT University"
                    value={formData.interestedCollege}
                    onChange={(e) =>
                      setFormData({ ...formData, interestedCollege: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B] focus:border-[#E31E2B] text-sm outline-none transition-all bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#15182D] uppercase tracking-wider mb-1.5">
                    Target Course
                  </label>
                  <select
                    value={formData.interestedCourse}
                    onChange={(e) =>
                      setFormData({ ...formData, interestedCourse: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B] focus:border-[#E31E2B] text-sm outline-none transition-all bg-white"
                  >
                    <option value="B.Tech Computer Science (CSE)">B.Tech CSE</option>
                    <option value="B.Tech AI & Data Science">B.Tech AI & Data Science</option>
                    <option value="MBA (Marketing / Finance / HR)">MBA</option>
                    <option value="BCA / MCA">BCA / MCA</option>
                    <option value="B.Tech Core (Mechanical / Civil / Electrical)">B.Tech Core</option>
                    <option value="Medical / MBBS / BDS / Allied">Medical / Allied</option>
                    <option value="Law / BA LLB / BBA LLB">Law / LLB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#15182D] uppercase tracking-wider mb-1.5">
                    12th Score / JEE (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 84% in PCM or 88 percentile"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B] focus:border-[#E31E2B] text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Dynamic Discipline Campus Recommendations */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#E31E2B]" />
                    <span>Recommended {disciplineName} Colleges:</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">Click to select college</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recommendedColleges.map((rec) => {
                    const isSelected = formData.interestedCollege === rec.name;
                    return (
                      <button
                        key={rec.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, interestedCollege: rec.name })}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-[#E31E2B] text-white border-[#E31E2B] shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-black"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                        <span>{rec.name}</span>
                        {rec.nirf && (
                          <span
                            className={`text-[9px] px-1 rounded font-bold ${
                              isSelected ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            NIRF {rec.nirf}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-2 pt-1 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-0.5 rounded border-gray-300 text-[#E31E2B] focus:ring-[#E31E2B]"
                />
                <span>
                  I authorize Aspirant Vision to contact me via Call, SMS and WhatsApp regarding admissions.
                </span>
              </label>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="primary"
                  size="lg"
                  className="w-full justify-center py-3.5 text-base shadow-lg hover:shadow-xl font-bold bg-[#E31E2B] hover:bg-[#C91A25]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span>Submitting Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      <span>Request Instant Counseling</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center pt-2">
                <a
                  href={SITE_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Prefer direct chat? Connect on WhatsApp directly
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
