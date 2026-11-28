"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  GraduationCap,
  Loader2,
  AlertCircle,
  Building2,
  MapPin,
  User,
  Mail,
  Award,
  ShieldCheck,
  Clock,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { submitPublicEnquiryAction } from "@/lib/crm/actions";
import { SubmissionSuccessView } from "@/components/ui/submission-success-view";
import { cn } from "@/lib/utils";

interface CounselingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCollege?: string;
}

interface TriggerContext {
  college: string;
  course?: string;
  city?: string;
  intent?: string;
}

/**
 * Sanitizes triggers like "Education Hub: Bhubaneswar", "Apply Now", "Free Consultation", etc.
 * so generic button labels never populate the "Preferred College" field, and locations
 * prefill the location field correctly.
 */
function sanitizeTriggerContext(raw?: string): TriggerContext {
  if (!raw) return { college: "" };
  const trimmed = raw.trim();

  // Known location / education hub triggers
  if (/^Education Hub:\s*/i.test(trimmed)) {
    const hubCity = trimmed.replace(/^Education Hub:\s*/i, "").trim();
    return { college: "", city: hubCity, intent: `hub_${hubCity}` };
  }
  if (/^All Educational Hubs/i.test(trimmed)) {
    return { college: "", intent: "all_hubs" };
  }

  const genericLocations = [
    "bhubaneswar",
    "bhubaneswar & odisha",
    "delhi",
    "delhi ncr",
    "bangalore",
    "bangalore & karnataka",
    "mumbai",
    "mumbai & pune",
    "pune",
    "kolkata",
    "hyderabad",
    "chennai",
  ];
  if (genericLocations.includes(trimmed.toLowerCase())) {
    return { college: "", city: trimmed, intent: `location_${trimmed}` };
  }

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
    city: parsedTrigger.city || "",
    interestedCollege: parsedTrigger.college || "",
    interestedCourse: parsedTrigger.course || "B.Tech Computer Science (CSE)",
    score: "",
    consent: true,
    honeypot: "",
  });

  // Keep state in sync when initialCollege prop changes
  useEffect(() => {
    const parsed = sanitizeTriggerContext(initialCollege);
    setFormData((prev) => ({
      ...prev,
      city: parsed.city || prev.city,
      interestedCollege: parsed.college || prev.interestedCollege,
      interestedCourse: parsed.course || prev.interestedCourse,
    }));
  }, [initialCollege]);

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
        preferredLocation: formData.city.trim() || parsedTrigger.city || "India",
        enquiryMessage: `College: ${formData.interestedCollege || "Not specified / Open to counseling"} | Course: ${
          formData.interestedCourse
        }${formData.city ? ` | Location: ${formData.city}` : ""}${
          formData.score ? ` | Score/Rank: ${formData.score}` : ""
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-[#15182D] flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact, Clean Header (No harsh top line) */}
        <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100/80 flex items-center justify-center text-[#E31E2B] shrink-0 shadow-2xs">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm sm:text-base font-bold text-[#15182D] truncate">
                  Direct Admission &amp; Merit Guidance
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 text-[#E31E2B] text-[10px] font-extrabold uppercase tracking-wide shrink-0">
                  Session 2026–27
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                {parsedTrigger.city
                  ? `Regional advisory desk for ${parsedTrigger.city}`
                  : parsedTrigger.college
                  ? `Verified cutoffs, fees & seat advisory for ${parsedTrigger.college}`
                  : "Official advisory • Cutoffs, fee waivers & verified institutional seats"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors shrink-0 ml-2 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Clean, elegant, no horizontal scrolling */}
        <div className="overflow-y-auto overflow-x-hidden p-4 sm:p-5 flex-1 space-y-3.5">
          {submitted ? (
            <SubmissionSuccessView
              title="Thank You!"
              quote="Your request has been received. Our senior advisor will reach out to you shortly."
              onClose={() => {
                setSubmitted(false);
                onClose();
              }}
              whatsappMessage={`Hello Aspirant Vision, I just submitted my enquiry for ${
                formData.interestedCollege || formData.city || formData.interestedCourse
              }.`}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-[#E31E2B] animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">Admissions Notice</span>
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

              {/* Context Pill (if triggered by a specific location or college) */}
              {(parsedTrigger.city || parsedTrigger.college) && (
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    {parsedTrigger.city ? (
                      <MapPin className="w-3.5 h-3.5 text-[#E31E2B] shrink-0" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-[#E31E2B] shrink-0" />
                    )}
                    <span className="text-gray-500 text-[11px] font-medium">
                      {parsedTrigger.city ? "Target Location:" : "Selected Campus:"}
                    </span>
                    <span className="font-bold truncate text-[11.5px] text-[#15182D]">
                      {parsedTrigger.city || parsedTrigger.college}
                    </span>
                  </div>
                  <span className="text-[10px] bg-red-50 text-[#E31E2B] border border-red-200 font-extrabold px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider">
                    Verified
                  </span>
                </div>
              )}

              {/* Personal Details Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Student Full Name <span className="text-[#E31E2B]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B]/10 focus:border-[#E31E2B] text-xs sm:text-[13px] outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
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
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B]/10 focus:border-[#E31E2B] text-xs sm:text-[13px] outline-none transition-all bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Details Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Email Address <span className="text-[#E31E2B]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="student@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B]/10 focus:border-[#E31E2B] text-xs sm:text-[13px] outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Current City / State <span className="text-[#E31E2B]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bhubaneswar / Patna"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B]/10 focus:border-[#E31E2B] text-xs sm:text-[13px] outline-none transition-all bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Target Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Target Program / Stream <span className="text-[#E31E2B]">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={formData.interestedCourse}
                      onChange={(e) =>
                        setFormData({ ...formData, interestedCourse: e.target.value })
                      }
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B]/10 focus:border-[#E31E2B] text-xs sm:text-[13px] outline-none transition-all bg-white font-semibold text-gray-800 cursor-pointer"
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

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Preferred College / Campus
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. KIIT, SOA, Centurion or Any"
                      value={formData.interestedCollege}
                      onChange={(e) =>
                        setFormData({ ...formData, interestedCollege: e.target.value })
                      }
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B]/10 focus:border-[#E31E2B] text-xs sm:text-[13px] outline-none transition-all bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Score & Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                    12th Score / Exam Rank (Optional)
                  </label>
                  <div className="relative">
                    <Award className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. 84% or JEE / NEET rank"
                      value={formData.score}
                      onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E31E2B]/10 focus:border-[#E31E2B] text-xs sm:text-[13px] outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-600 font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 mt-0 sm:mt-5">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Zero Donation</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>15-Min Response</span>
                  </span>
                </div>
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-2.5 text-[11px] text-gray-500 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  required
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-0.5 rounded border-gray-300 text-[#E31E2B] focus:ring-[#E31E2B]"
                />
                <span>
                  I authorize senior academic counsellors to share verified cutoff &amp; admission updates via WhatsApp &amp; Call.
                </span>
              </label>

              {/* Submit CTA */}
              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#E31E2B] hover:bg-[#cf1823] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registering Counselling Request...</span>
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
              <div className="text-center pt-1">
                <a
                  href={`https://wa.me/919876543210?text=Hello%20Aspirant%20Vision,%20I%20would%20like%20guidance%20for%20admission%20into%20${encodeURIComponent(
                    formData.interestedCollege || formData.city || formData.interestedCourse
                  )}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/60 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Prefer direct chat? Connect on WhatsApp</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
