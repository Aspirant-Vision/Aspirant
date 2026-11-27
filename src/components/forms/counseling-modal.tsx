"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Loader2,
  AlertCircle,
  Building2,
  MapPin,
  User,
  Phone,
  Mail,
  Award,
  ShieldCheck,
  Clock,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { submitPublicEnquiryAction } from "@/lib/crm/actions";
import { SubmissionSuccessView } from "@/components/ui/submission-success-view";
import {
  getRecommendedCollegesForDiscipline,
  getCollegeTypeFromCourseCategory,
} from "@/lib/discipline-meta";

interface CounselingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCollege?: string;
}

/**
 * Sanitizes triggers like "Apply Now", "Free Consultation", "Course Guidance: ...", etc.
 * so generic button labels never populate the "Preferred College" field.
 */
function sanitizeTriggerContext(raw?: string): { college: string; course?: string; intent?: string } {
  if (!raw) return { college: "" };
  const trimmed = raw.trim();

  const genericPhrases = [
    "apply now",
    "apply",
    "free consultation",
    "sticky vertical consultation tab",
    "admission journey banner",
    "ready to start your journey cta banner",
    "50,000+ guided students showcase",
    "admission roadmap guide",
    "placement report download",
    "directory sidebar direct evaluation",
    "all courses & streams",
    "all educational articles",
    "blogs",
    "why aspirant vision - expert guidance",
    "college comparison",
    "detailed comparison tool",
    "add custom college to compare",
    "full entrance exam calendar",
    "placement & recruiters report",
    "career & placement strategy call",
    "1-on-1 mba direct admission call",
    "mba fast-track application 2026",
    "mba entrance exam guidance",
    "mba colleges shortlisting assistance",
  ];

  if (genericPhrases.includes(trimmed.toLowerCase())) {
    return { college: "", intent: trimmed };
  }

  // Course triggers, e.g. "Course Guidance: B.Tech Computer Science (CSE)"
  if (/^Course Guidance:\s*/i.test(trimmed)) {
    const course = trimmed.replace(/^Course Guidance:\s*/i, "").trim();
    return { college: "", course, intent: "course_guidance" };
  }
  if (/^Stream:\s*/i.test(trimmed)) {
    return { college: "", intent: trimmed };
  }

  // Specific college action triggers
  let cleanName = trimmed
    .replace(
      /^(Admission Guidance:\s*|Admission Enquiry:\s*|Apply for Seat:\s*|Apply:\s*|View College:\s*|Compare:\s*|Apply for MBA \/ PGDM:\s*|MBA Cutoff Inquiry:\s*|MBA Specialization Counselling:\s*|Exam Advisory:\s*|Claim Scholarship:\s*|Success Story:\s*|Recruiter Details:\s*|Article:\s*)/i,
      ""
    )
    .trim();

  if (cleanName.includes(" - ")) {
    const parts = cleanName.split(" - ");
    return { college: parts[0].trim(), course: parts[1]?.trim() };
  }

  return { college: cleanName };
}

export function CounselingModal({
  isOpen,
  onClose,
  initialCollege = "",
}: CounselingModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedTrigger = sanitizeTriggerContext(initialCollege);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    interestedCollege: parsedTrigger.college || "",
    interestedCourse: parsedTrigger.course || "B.Tech Computer Science (CSE)",
    score: "",
    consent: true,
    honeypot: "",
  });

  // Keep preferred college in sync when initialCollege prop changes
  useEffect(() => {
    const parsed = sanitizeTriggerContext(initialCollege);
    setFormData((prev) => ({
      ...prev,
      interestedCollege: parsed.college || prev.interestedCollege,
      interestedCourse: parsed.course || prev.interestedCourse,
    }));
  }, [initialCollege]);

  const recommendedColleges = getRecommendedCollegesForDiscipline(formData.interestedCourse);
  const disciplineName = getCollegeTypeFromCourseCategory(formData.interestedCourse);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = formData.phone.replace(/[^\d+]/g, "").trim();
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your official full name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const utmSource = urlParams?.get("utm_source") || null;
      const utmMedium = urlParams?.get("utm_medium") || null;
      const utmCampaign = urlParams?.get("utm_campaign") || null;
      const landingPage = typeof window !== "undefined" ? window.location.pathname : "/";
      const referringPage = typeof document !== "undefined" ? document.referrer : null;

      const res = await submitPublicEnquiryAction({
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        phone: cleanPhone,
        preferredLocation: formData.city.trim() || "India",
        enquiryMessage: `College: ${formData.interestedCollege || "Not specified / Open to counseling"} | Course: ${
          formData.interestedCourse
        }${formData.score ? ` | Score/Rank: ${formData.score}` : ""}`,
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
        setErrorMessage(
          res.error?.message ||
            "Unable to register your enquiry right now. Please message our admissions desk directly on WhatsApp."
        );
      } else {
        setSubmitted(true);
      }
    } catch (err: unknown) {
      console.error("[CounselingModal] Submission caught error:", err);
      setErrorMessage("An unexpected error occurred. Please chat with our counselor on WhatsApp directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 sm:my-8 text-[#15182D]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Brand Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#E31E2B] via-red-500 to-[#15182D]" />

        {/* Modal Header — Prestigious, Human & Official */}
        <div className="px-6 sm:px-8 pt-5 pb-4 bg-gradient-to-b from-slate-50/90 to-white border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-[#E31E2B] text-[11px] font-bold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E31E2B] animate-pulse" />
                <span>Official Admissions Desk • Session 2026–27</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#15182D] tracking-tight">
                Direct Admission &amp; Merit Guidance
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed max-w-md">
                1-on-1 verified admission counselling, cutoff analytics, and institutional seat allotment support.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Pre-selected Target Context Chip */}
          {parsedTrigger.college && (
            <div className="mt-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-2 truncate">
                <Building2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="text-gray-300">Selected Institute:</span>
                <span className="font-bold text-white truncate">{parsedTrigger.college}</span>
              </div>
              <span className="text-[10px] bg-[#E31E2B] text-white font-extrabold px-2 py-0.5 rounded shrink-0">
                Verified Campus
              </span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {submitted ? (
            <SubmissionSuccessView
              title="Thank You!"
              quote="Your request has been received. Our senior advisor will reach out to you shortly."
              onClose={() => {
                setSubmitted(false);
                onClose();
              }}
              whatsappMessage={`Hello Aspirant Vision, I just submitted my enquiry for ${
                formData.interestedCollege || formData.interestedCourse
              }.`}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-[#E31E2B] animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">Admissions Desk Notice</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Anti-spam Honeypot */}
              <input
                type="text"
                name="user_note"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Student Full Name <span className="text-[#E31E2B]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] text-xs sm:text-sm outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                {/* WhatsApp Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    WhatsApp Mobile Number <span className="text-[#E31E2B]">*</span>
                  </label>
                  <div className="relative">
                    <span className="text-xs font-bold text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] text-xs sm:text-sm outline-none transition-all bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address <span className="text-[#E31E2B]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="student@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] text-xs sm:text-sm outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                {/* City / State */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Current City / State <span className="text-[#E31E2B]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bhubaneswar / Patna"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] text-xs sm:text-sm outline-none transition-all bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Target Program */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Target Program / Stream <span className="text-[#E31E2B]">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={formData.interestedCourse}
                      onChange={(e) =>
                        setFormData({ ...formData, interestedCourse: e.target.value })
                      }
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] text-xs sm:text-sm outline-none transition-all bg-white font-semibold text-gray-800 cursor-pointer"
                    >
                      <option value="B.Tech Computer Science (CSE)">B.Tech Computer Science (CSE)</option>
                      <option value="B.Tech AI & Data Science">B.Tech AI & Data Science</option>
                      <option value="B.Tech Core (Mechanical / Civil / Electrical)">B.Tech Core Engineering</option>
                      <option value="MBA (Marketing / Finance / HR)">MBA / PGDM Specializations</option>
                      <option value="BCA / MCA">BCA / MCA Software</option>
                      <option value="Medical / MBBS / BDS / Allied">MBBS / BDS / Medical & Allied</option>
                      <option value="Law / BA LLB / BBA LLB">Integrated Law (BA LLB / BBA LLB)</option>
                      <option value="Pharmacy / B.Pharm">Pharmacy (B.Pharm / M.Pharm)</option>
                      <option value="BBA / B.Com / Undergraduate">Undergraduate (BBA / B.Com / B.Sc)</option>
                    </select>
                  </div>
                </div>

                {/* Preferred College */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Preferred College / Campus
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. KIIT, SOA, Centurion or Any"
                      value={formData.interestedCollege}
                      onChange={(e) =>
                        setFormData({ ...formData, interestedCollege: e.target.value })
                      }
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] text-xs sm:text-sm outline-none transition-all bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Discipline Campus Recommendations */}
              <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#E31E2B]" />
                    <span>Recommended Top {disciplineName} Campuses:</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">Click to select campus</span>
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
                            ? "bg-[#15182D] text-white border-[#15182D] shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-black"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        <span>{rec.name}</span>
                        {rec.nirf && (
                          <span
                            className={`text-[9px] px-1 rounded font-extrabold ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
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

              {/* Optional Score / Percentile */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  12th Marks / Entrance Rank (Optional)
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. 84% in 12th PCM or 88 percentile in JEE/CAT/NEET"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] text-xs sm:text-sm outline-none transition-all bg-white"
                  />
                </div>
              </div>

              {/* Reassuring Trust Bar */}
              <div className="grid grid-cols-3 gap-2 py-2 px-1 text-[10px] sm:text-[11px] text-gray-600 font-semibold border-t border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Zero Donation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>15-Min Response</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Official Allocation</span>
                </div>
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-2 pt-0.5 text-[11px] text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-0.5 rounded border-gray-300 text-[#E31E2B] focus:ring-[#E31E2B]"
                />
                <span>
                  I authorize Aspirant Vision senior academic counsellors to share verified cutoff reports and seat updates via WhatsApp &amp; Call.
                </span>
              </label>

              {/* Main Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl font-display font-bold text-sm sm:text-base text-white bg-[#E31E2B] hover:bg-[#c91824] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying &amp; Registering Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application for Official Counselling</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Instant WhatsApp Alternative */}
              <div className="pt-1 text-center">
                <a
                  href={`https://wa.me/919876543210?text=Hello%20Aspirant%20Vision,%20I%20would%20like%20guidance%20for%20admission%20into%20${encodeURIComponent(
                    formData.interestedCollege || formData.interestedCourse
                  )}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 px-4 py-2 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Prefer direct chat? Connect on WhatsApp with an Admissions Officer</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
