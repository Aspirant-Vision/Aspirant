"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffLoginSchema, StaffLoginInput, getSafeRedirectUrl } from "@/lib/validation/auth";
import { staffLoginAction } from "@/lib/auth/actions";
import { Logo } from "@/components/ui/logo";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  UserCheck,
  ArrowLeft,
  Building2,
  Headphones,
  Users,
} from "lucide-react";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const errorParam = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(errorParam || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffLoginInput>({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      redirectUrl: nextParam ? getSafeRedirectUrl(nextParam, "/admin/dashboard") : "/admin/dashboard",
    },
  });

  const onSubmit = async (data: StaffLoginInput) => {
    try {
      setServerError(null);
      setIsSubmitting(true);

      const result = await staffLoginAction(data);

      if (!result.success) {
        setServerError(result.error.message || "Failed to authenticate staff credentials.");
        setIsSubmitting(false);
        return;
      }

      // Hard redirect to load full staff layout with verified roles
      const target = result.data.redirectTo || "/admin/dashboard";
      window.location.href = target;
    } catch (err: unknown) {
      console.error("Staff login unexpected error:", err);
      setServerError("An unexpected network error occurred. Please contact system support.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col lg:flex-row select-none">
      {/* =========================================================================
          LEFT PANEL: Clean, High-Contrast Operations Hub (Counsellor, Admin & Super Admin)
          ========================================================================= */}
      <div className="relative hidden lg:flex lg:w-1/2 h-full overflow-hidden bg-[#0B0F19]">
        {/* Subtle Crisp Technical Grid (No blurry image, no murky blue shadow) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Ambient Warm Crimson Glow Accent */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

        {/* Left Panel Content */}
        <div className="relative z-10 w-full h-full p-10 xl:p-14 flex flex-col justify-between text-white">
          {/* Top: Brand Logo + Staff Portal Pill */}
          <div className="flex items-center gap-3">
            <Logo inverted />
            <span className="px-2.5 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Staff &amp; Operations Portal
            </span>
          </div>

          {/* Center: Command Center Narrative & Multi-Role Breakdown */}
          <div className="max-w-lg space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-red-400" />
              <span>Unified Access: Counsellor • Admin • Super Admin</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Admissions, Operations &amp; Governance.
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed font-normal">
                One centralized workspace built for educational counsellors, admissions coordinators, and institutional leadership.
              </p>
            </div>

            {/* 3 Role-Specific Capability Cards (Crisp, High Contrast, Clean) */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold mb-1">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Counsellors</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Lead triage, follow-ups, daily punch clock &amp; salary
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-200 text-xs font-bold mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Admins</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Colleges, courses, fees &amp; application approvals
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Super Admin</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Full governance, salary settings &amp; leave approvals
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Clean Footer */}
          <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Aspirant Vision Educational Network • Secure Staff Access</span>
            <span className="font-mono text-[11px] text-slate-500">v2.6.4</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: Clean, Minimalist Sign In Canvas (50% Desktop)
          ========================================================================= */}
      <div className="w-full lg:w-1/2 h-full bg-[#FAFAFC] flex flex-col justify-between p-6 sm:p-10 xl:p-12 overflow-y-auto lg:overflow-hidden">
        {/* Top Header Row */}
        <div className="flex items-center justify-between w-full max-w-[420px] mx-auto">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="ml-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#E31E2B] transition-colors py-1.5 px-3 rounded-full hover:bg-slate-200/60"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Site</span>
            </Link>
          </div>
        </div>

        {/* Center: Clean Sign In Card */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-4">
          {/* Badge & Title */}
          <div className="mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#E31E2B] text-xs font-bold mb-3">
              <Lock className="w-3.5 h-3.5" />
              <span>Staff &amp; Management Portal</span>
            </div>

            {/* Clear Multi-Role Badges Strip */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl mb-4 border border-slate-200/80">
              <span className="flex-1 text-center py-1 px-2 rounded-lg text-[11px] font-bold text-slate-800 bg-white shadow-2xs">
                Counsellor
              </span>
              <span className="flex-1 text-center py-1 px-2 rounded-lg text-[11px] font-bold text-slate-800 bg-white shadow-2xs">
                Admin
              </span>
              <span className="flex-1 text-center py-1 px-2 rounded-lg text-[11px] font-bold text-slate-800 bg-white shadow-2xs">
                Super Admin
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Team Sign In
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter your official staff credentials to access your dashboard.
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{serverError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Staff Email */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5" htmlFor="email">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@aspirantvision.com"
                  {...register("email")}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 transition-all ${
                    errors.email
                      ? "border-red-400 bg-red-50/20 focus:border-red-500"
                      : "border-slate-200 focus:border-[#E31E2B] hover:border-slate-300"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800" htmlFor="password">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#E31E2B] hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  {...register("password")}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 transition-all ${
                    errors.password
                      ? "border-red-400 bg-red-50/20 focus:border-red-500"
                      : "border-slate-200 focus:border-[#E31E2B] hover:border-slate-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Skeuomorphic Tactile Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="tactile-btn-red text-white w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Student Portal Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-slate-900 shadow-2xs transition-all"
            >
              <UserCheck className="w-4 h-4 text-[#E31E2B]" />
              <span>Are you a student applicant? Switch to Student Login</span>
            </Link>
          </div>
        </div>

        {/* Bottom: Clean Security Notice */}
        <div className="w-full max-w-[420px] mx-auto text-center text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Aspirant Vision Educational Network. All rights reserved.</p>
          <p className="mt-0.5 text-slate-400/80">Authorized access for Counsellors, Admins &amp; Super Admins.</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
