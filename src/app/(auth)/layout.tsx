import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { GraduationCap, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] via-[#F1F3F5] to-[#E9ECEF] flex flex-col justify-between selection:bg-red-100 selection:text-red-700">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-white/80 border border-transparent hover:border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand & Trust Value Proposition (Visible on large screens) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 text-[#151820]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-semibold w-fit">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span>India&apos;s Leading Admission Network</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-[#151820] leading-tight">
              Shape Your Higher Education with <span className="text-primary">Aspirant Vision</span>
            </h1>

            <p className="text-sm text-gray-600 leading-relaxed">
              Access verified college cutoffs, direct admission assistance, and personalized guidance from certified academic mentors across 2,500+ top universities.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-emerald-50 text-emerald-600 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs text-gray-700">
                  <strong className="text-gray-900 block font-semibold">100% Free Direct Counselling</strong>
                  Expert advice tailored to your NEET, JEE, CAT, or CUET rank.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-emerald-50 text-emerald-600 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs text-gray-700">
                  <strong className="text-gray-900 block font-semibold">Real-Time Application Tracking</strong>
                  Monitor document approvals and admission letters in one place.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-emerald-50 text-emerald-600 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs text-gray-700">
                  <strong className="text-gray-900 block font-semibold">Scholarship Matching Engine</strong>
                  Discover merit-based tuition waivers up to ₹2,50,000.
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200/80 flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Enterprise Encrypted</span>
              </div>
              <div className="h-3 w-px bg-gray-300" />
              <span>50,000+ Students Guided</span>
            </div>
          </div>

          {/* Right Column: Auth Form Card */}
          <div className="w-full lg:col-span-7 flex justify-center">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Aspirant Vision. All rights reserved. By continuing, you agree to our Terms of Service & Privacy Policy.</p>
      </footer>
    </div>
  );
}
