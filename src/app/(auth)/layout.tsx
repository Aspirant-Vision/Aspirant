import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import {
  GraduationCap,
  ShieldCheck,
  Star,
  Award,
  ArrowLeft,
  Sparkles,
  Building2,
  CheckCircle2,
  BookOpen,
  Compass,
} from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col lg:flex-row select-none">
      {/* =========================================================================
          LEFT PANEL: Visual Graphics, Brand Authority & Social Proof
          ========================================================================= */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-[52%] h-full bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1a0f1d] text-white p-8 xl:p-12 flex-col justify-between overflow-hidden">
        {/* Background Decorative Mesh & Atmospheric Gradient Orbs */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden="true"
        />
        <div
          className="absolute -top-32 -left-32 w-80 h-80 bg-red-600/20 rounded-full blur-[100px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 right-0 w-96 h-96 bg-rose-500/15 rounded-full blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 left-1/4 w-80 h-80 bg-red-900/20 rounded-full blur-[90px] pointer-events-none"
          aria-hidden="true"
        />

        {/* Top Header: Inverted Brand Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <Logo inverted />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-rose-300">
            <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>Official University Network</span>
          </div>
        </div>

        {/* Center: Hero Value Headline + Custom Admissions SVG Graphic */}
        <div className="relative z-10 my-auto py-4 space-y-6 max-w-xl">
          <div>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-[1.2]">
              Your Gateway to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
                Top University Admissions
              </span>
            </h1>
            <p className="text-xs xl:text-sm text-slate-300 mt-2 leading-relaxed font-normal">
              Direct merit counselling, official cutoff analytics, and verified scholarships for
              2,500+ premier institutions across India.
            </p>
          </div>

          {/* Bespoke Admissions Graphic Illustration (Interactive SVG Flow) */}
          <div className="relative p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-3 border-b border-white/10 pb-2">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Compass className="w-3.5 h-3.5 text-red-400" />
                Admission Matching Pipeline
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 100% Direct Merit
              </span>
            </div>

            {/* SVG Interactive Architecture Illustration */}
            <svg
              className="w-full h-24 overflow-visible"
              viewBox="0 0 400 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Connection Paths */}
              <path
                d="M 40 45 C 100 45, 120 20, 200 45"
                stroke="url(#lineGradient1)"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <path
                d="M 40 45 C 100 45, 120 70, 200 45"
                stroke="url(#lineGradient1)"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <path
                d="M 200 45 C 280 45, 300 20, 360 45"
                stroke="url(#lineGradient2)"
                strokeWidth="2.5"
              />

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F43F5E" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>

              {/* Node 1: Entrance Ranks */}
              <g transform="translate(15, 25)">
                <rect width="50" height="40" rx="8" fill="#1E293B" stroke="#334155" strokeWidth="1" />
                <text x="25" y="18" fill="#94A3B8" fontSize="8" fontWeight="bold" textAnchor="middle">
                  EXAMS
                </text>
                <text x="25" y="30" fill="#F8FAFC" fontSize="9" fontWeight="bold" textAnchor="middle">
                  JEE / NEET
                </text>
              </g>

              {/* Node 2: AI Direct Cutoff Engine */}
              <g transform="translate(170, 20)">
                <rect width="60" height="50" rx="10" fill="#E11D48" stroke="#FB7185" strokeWidth="1.5" />
                <circle cx="30" cy="18" r="7" fill="white" fillOpacity="0.2" />
                <text x="30" y="21" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">
                  ⚡
                </text>
                <text x="30" y="34" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">
                  ASPIRANT
                </text>
                <text x="30" y="43" fill="#FFE4E6" fontSize="7" textAnchor="middle">
                  Matching Engine
                </text>
              </g>

              {/* Node 3: Allotment */}
              <g transform="translate(330, 25)">
                <rect width="55" height="40" rx="8" fill="#064E3B" stroke="#059669" strokeWidth="1" />
                <text x="27.5" y="18" fill="#A7F3D0" fontSize="8" fontWeight="bold" textAnchor="middle">
                  ADMISSION
                </text>
                <text x="27.5" y="30" fill="#ECFDF5" fontSize="9" fontWeight="bold" textAnchor="middle">
                  Direct Allotment
                </text>
              </g>
            </svg>

            {/* Quick Chips */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <GraduationCap className="w-3.5 h-3.5 text-red-400" />
                <span>2,500+ Top Colleges</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Up to ₹2.5L Scholarships</span>
              </div>
            </div>
          </div>

          {/* Student Social Proof Snippet */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
              PS
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 text-amber-400 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
                <span className="text-[10px] font-bold text-slate-300 ml-1">4.9/5</span>
              </div>
              <p className="text-[11px] text-slate-300 italic leading-snug">
                &ldquo;Aspirant Vision helped me compare cutoffs accurately. Secured my B.Tech seat at
                my target college without broker fees!&rdquo;
              </p>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">
                — Priya Sengupta • B.Tech AI &amp; Data Science &apos;26
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Row */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-4">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>256-Bit SSL Secured</span>
          </div>
          <span>ISO 9001:2015 Certified</span>
          <span>50,000+ Students Guided</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: Minimalist, Single-Window Form Canvas
          ========================================================================= */}
      <div className="w-full lg:w-1/2 xl:w-[48%] h-full bg-white flex flex-col justify-between p-6 sm:p-8 xl:p-12 overflow-y-auto lg:overflow-hidden">
        {/* Top Header Row in Right Panel */}
        <div className="flex items-center justify-between w-full max-w-[420px] mx-auto">
          {/* Logo visible only on mobile/tablet where left panel is hidden */}
          <div className="lg:hidden">
            <Logo />
          </div>

          <div className="hidden lg:block text-xs font-semibold text-slate-500">
            Admission Helpline:{" "}
            <a href="tel:+919876543210" className="text-red-600 hover:underline">
              +91 98765 43210
            </a>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 border border-slate-200/80 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Center: The Minimalist Form Container (Directly centered, no outer scroll) */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-4">
          {children}
        </div>

        {/* Subtle Footer Bottom Row */}
        <div className="w-full max-w-[420px] mx-auto text-center text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          <p>© {new Date().getFullYear()} Aspirant Vision Educational Network. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
