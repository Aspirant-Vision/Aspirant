"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  User,
  GraduationCap,
  MessageCircle,
  Clock,
  Lock,
} from "lucide-react";
import { submitPublicEnquiryAction } from "@/lib/crm/actions";
import { SubmissionSuccessView } from "@/components/ui/submission-success-view";
import { cn } from "@/lib/utils";

interface MinimalLeadFormProps {
  badge: string;
  title: string;
  subtitle: string;
  buttonLabel?: string;
  source: string;
  defaultCourse?: string;
  className?: string;
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
  className,
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
        landingPage: typeof window !== "undefined" ? window.location.pathname : "/",
        consentStatus: true,
        honeypot,
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error?.message || "Failed to submit. Please try again or WhatsApp our desk.");
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error)?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={cn("py-4 sm:py-6 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full", className)}>
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E7E9F0] p-4 sm:p-6 lg:p-7 shadow-md">
        {/* Minimal Impressive Header (Punchy, Less Text) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-[#E31E2B] text-[10.5px] font-extrabold uppercase tracking-wider border border-red-100 mb-1.5">
              <Sparkles className="w-3 h-3 text-[#E31E2B]" />
              <span>{badge}</span>
            </div>
            <h3 className="font-display text-base sm:text-xl lg:text-2xl font-extrabold text-[#15182D] tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#687086] max-w-md font-medium leading-relaxed md:text-right">
            {subtitle}
          </p>
        </div>

        {/* Minimalist 1-Row Form */}
        {isSuccess ? (
          <SubmissionSuccessView
            compact={true}
            title="Thank You!"
            quote="Your inquiry has been received. Our senior advisor will connect with you shortly."
            onReset={() => {
              setIsSuccess(false);
              setFullName("");
              setPhone("");
            }}
            whatsappMessage={`Hello Aspirant Vision, I just submitted my details for ${course}.`}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Field 1: Full Name */}
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name *"
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-xl border border-gray-200 bg-[#F7F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/15 focus:border-[#E31E2B] transition-all shadow-inner"
                />
              </div>

              {/* Field 2: Mobile Number */}
              <div className="relative">
                <span className="text-xs font-bold text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile / WhatsApp *"
                  className="w-full pl-11 pr-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-xl border border-gray-200 bg-[#F7F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/15 focus:border-[#E31E2B] transition-all shadow-inner"
                />
              </div>

              {/* Field 3: Target Course */}
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-xl border border-gray-200 bg-[#F7F8FC] focus:bg-white text-gray-800 outline-none cursor-pointer shadow-inner"
                >
                  {STREAM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 4: Skeuomorphic Tactile Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="tactile-btn-red text-white w-full py-2.5 sm:py-3 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>{buttonLabel}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Clean, Impressive Trust Bar (Less Text, High Value) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-[#687086] font-medium">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero Donation Guarantee</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>15-Minute Response</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-gray-500 font-semibold">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <span>Encrypted Student Data</span>
                </span>
              </div>

              <a
                href={`https://wa.me/919876543210?text=Hello%20Aspirant%20Vision,%20I%20would%20like%20guidance%20for%20admission%20into%20${encodeURIComponent(
                  course
                )}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition-colors ml-auto sm:ml-0"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Prefer WhatsApp? Chat Now →</span>
              </a>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
