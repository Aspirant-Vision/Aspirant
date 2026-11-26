import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Star,
  Award,
  Sparkles,
  PhoneCall,
} from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between selection:bg-red-100 selection:text-red-700 overflow-x-hidden">
      {/* Background Decorative Mesh & Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 [background-image:radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />
      <div
        className="absolute -top-40 -right-40 w-96 h-96 bg-red-400/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 -left-40 w-96 h-96 bg-rose-300/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Logo />

        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="tel:+919876543210"
            className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            <span>Admission Helpline: +91 98765 43210</span>
          </a>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-red-600 transition-all py-2 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs hover:shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Brand, Trust & Social Proof (Visible on large screens) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-semibold w-fit shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <span>India&apos;s Trusted University Admissions Network</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.2]">
              Shape Your Higher Education with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-700">
                Aspirant Vision
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm xl:text-base text-slate-600 leading-relaxed font-normal">
              Direct merit counselling, official cutoff analytics, and verified scholarship
              allocations for 2,500+ top universities across India.
            </p>

            {/* Bento Trust Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs backdrop-blur-sm">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Direct Merit Allocation</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Personalized guidance tailored to your NEET, JEE, CUET & CAT scores.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs backdrop-blur-sm">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Live Application Tracking</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Direct document approval timeline with zero middleman commission.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs backdrop-blur-sm sm:col-span-2">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                    <Award className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Scholarship Matching Engine</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Discover institutional merit waivers & financial grant eligibility up to ₹2,50,000.
                </p>
              </div>
            </div>

            {/* Student Social Proof Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50/80 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
                <span className="text-xs font-bold text-slate-800 ml-1.5">4.9/5</span>
                <span className="text-[11px] text-slate-500 font-normal ml-1">
                  (12,000+ Enrolled Students)
                </span>
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                &ldquo;Aspirant Vision helped me understand cutoff percentiles accurately. Got direct
                admission in CSE at my dream college without unnecessary agent fees!&rdquo;
              </p>
              <div className="mt-2 text-[11px] font-semibold text-slate-900">
                — Priya Sengupta • B.Tech AI & Data Science
              </div>
            </div>

            {/* Trust Footer Row */}
            <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>256-Bit SSL Encryption</span>
              </div>
              <div className="h-3 w-px bg-slate-300" />
              <span>AICTE & UGC Recognized Network</span>
            </div>
          </div>

          {/* Right Column: Form Container */}
          <div className="w-full lg:col-span-6 flex justify-center lg:justify-end">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center text-xs text-slate-500 border-t border-slate-200/60">
        <p>
          © {new Date().getFullYear()} Aspirant Vision Educational Network. All rights reserved.
          AICTE & UGC recognized institutional guidance.
        </p>
      </footer>
    </div>
  );
}
