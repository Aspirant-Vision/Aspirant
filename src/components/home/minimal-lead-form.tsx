"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  User,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { submitPublicEnquiryAction } from "@/lib/crm/actions";

interface MinimalLeadFormProps {
  badge: string;
  title: string;
  subtitle: string;
  buttonLabel?: string;
  source: string;
  defaultCourse?: string;
}

const STREAM_OPTIONS = [
  "Engineering (B.Tech / B.E.)",
  "Management (MBA / PGDM)",
  "Medical & Dental (MBBS / BDS)",
  "Law (Integrated B.A. LL.B)",
  "Undergraduate (BBA / BCA / B.Sc)",
  "Other Degree / Direct Merit",
];

export function MinimalLeadForm({
  badge,
  title,
  subtitle,
  buttonLabel = "Get Free Guidance",
  source,
  defaultCourse = "Engineering (B.Tech / B.E.)",
}: MinimalLeadFormProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [course, setCourse] = useState(defaultCourse);
  const [honeypot, setHoneypot] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phone.replace(/[^\d+]/g, "").trim();
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const email = `applicant_${cleanPhone.replace(/[^0-9]/g, "")}@aspirantvision.lead`;

      const res = await submitPublicEnquiryAction({
        fullName: fullName.trim(),
        phone: cleanPhone,
        email,
        preferredLocation: "Website Fast Form",
        currentQualification: course,
        enquiryMessage: `[${title}] Target Course: ${course} | Source: ${source}`,
        source,
        landingPage: "/",
        consentStatus: true,
        honeypot,
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error?.message || "Failed to submit. Please try again or WhatsApp our desk.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-5 sm:py-7 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 p-4 sm:p-6 lg:p-7 shadow-xs hover:border-gray-300 transition-colors">
        {/* Minimal Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#E31E2B] mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E31E2B]" />
              <span>{badge}</span>
            </div>
            <h3 className="font-display text-base sm:text-lg lg:text-xl font-extrabold text-[#15182D]">
              {title}
            </h3>
          </div>
          <p className="text-xs text-gray-500 max-w-md font-medium leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Minimalist 1-Row Form */}
        {isSuccess ? (
          <div className="py-4 px-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3 text-emerald-900">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold">
                  Thank you, {fullName}! Your inquiry for {course} is received.
                </div>
                <div className="text-[11px] text-emerald-700">
                  Our academic advisor will contact you within 15 minutes.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href={`https://wa.me/919876543210?text=Hello%20Aspirant%20Vision,%20I%20just%20submitted%20my%20details%20for%20${encodeURIComponent(
                  course
                )}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setFullName("");
                  setPhone("");
                }}
                className="text-xs text-gray-500 hover:text-gray-900 underline font-medium cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[#E31E2B] text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Anti-spam honeypot */}
            <input
              type="text"
              name="honeypot"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Field 1: Full Name */}
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name *"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] transition-all"
                />
              </div>

              {/* Field 2: Mobile Number */}
              <div className="relative">
                <span className="text-xs font-bold text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile / WhatsApp *"
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B] transition-all"
                />
              </div>

              {/* Field 3: Target Course */}
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white text-gray-800 outline-none cursor-pointer"
                >
                  {STREAM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 4: Submit CTA */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#E31E2B] hover:bg-[#c91824] text-white shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>{buttonLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-400 pt-0.5 px-0.5">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Free Consultation • Verified Institutional Allotments</span>
              </span>
              <span className="text-gray-400 hidden sm:inline">
                Zero spam • Encrypted student privacy
              </span>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
