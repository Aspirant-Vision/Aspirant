"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
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
  KeyRound,
  Server,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
        setServerError(result.error.message || "Failed to authenticate administrator credentials.");
        setIsSubmitting(false);
        return;
      }

      // Hard redirect to load full administrative layout with verified roles
      const target = result.data.redirectTo || "/admin/dashboard";
      window.location.href = target;
    } catch (err: unknown) {
      console.error("Admin login unexpected error:", err);
      setServerError("An unexpected network error occurred. Please contact system support.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col lg:flex-row select-none">
      {/* =========================================================================
          LEFT PANEL: Architectural Admin Operations Command Visual (50% Desktop)
          ========================================================================= */}
      <div className="relative hidden lg:flex lg:w-1/2 h-full overflow-hidden bg-[#0A0D26]">
        {/* Cinematic High-Res Campus Photography */}
        <Image
          src="/images/auth/auth_campus_highres.jpg"
          alt="Aspirant Vision Administrative Core"
          fill
          priority
          quality={90}
          sizes="50vw"
          className="object-cover object-center opacity-40 mix-blend-luminosity"
        />

        {/* Executive Deep Gradient Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D26] via-[#0D1238]/85 to-[#0A0D26]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(#E31E2B_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

        {/* Left Panel Content */}
        <div className="relative z-10 w-full h-full p-10 xl:p-14 flex flex-col justify-between text-white">
          {/* Top: Brand Logo + Admin Console Pill */}
          <div className="flex items-center gap-3">
            <Logo inverted />
            <span className="px-2.5 py-1 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 text-[10px] font-extrabold uppercase tracking-widest">
              Admin Console
            </span>
          </div>

          {/* Center: Command Center Narrative & Telemetry */}
          <div className="max-w-lg space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Administrative Operations &amp; Verification Hub</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Centralized Admissions &amp; Institutional Governance.
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Real-time management for 2,500+ premier colleges, student lead verification pipelines, direct merit seat allotments, and regional counsellor workflows.
              </p>
            </div>

            {/* 3 Interactive Telemetry Cards */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>2,500+</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 leading-tight">
                  Partner Colleges
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>256-Bit</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 leading-tight">
                  SSL Encrypted
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>RBAC</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 leading-tight">
                  Strict Access Control
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Administrative Governance Notice */}
          <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-slate-400">
            <span className="font-light">
              Restricted to authorized Aspirant Vision administrators and coordinators.
            </span>
            <span className="font-mono text-[11px] text-slate-400">v2.6.4</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: Clean, Minimalist Admin Sign In Canvas (50% Desktop)
          ========================================================================= */}
      <div className="w-full lg:w-1/2 h-full bg-[#FAFBFD] flex flex-col justify-between p-6 sm:p-10 xl:p-12 overflow-y-auto lg:overflow-hidden">
        {/* Top Header Row */}
        <div className="flex items-center justify-between w-full max-w-[400px] mx-auto">
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

        {/* Center: Clean Admin Sign In Card */}
        <div className="w-full max-w-[400px] mx-auto my-auto py-4">
          {/* Badge & Title */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-[#E31E2B] text-xs font-bold mb-3">
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Operations Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#15182D] tracking-tight">
              Admin Sign In
            </h2>
            <p className="text-xs sm:text-sm text-[#687086] mt-1.5">
              Enter your administrator credentials to access the central operations console.
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{serverError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Admin Email */}
            <div>
              <label className="block text-xs font-bold text-[#15182D] mb-1.5" htmlFor="email">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@aspirantvision.com"
                  {...register("email")}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-[#15182D] placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 transition-all ${
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
                <label className="block text-xs font-bold text-[#15182D]" htmlFor="password">
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
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-[#15182D] placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 transition-all ${
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

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 text-sm font-bold justify-center bg-[#E31E2B] hover:bg-[#c91824] shadow-md hover:shadow-lg shadow-red-500/25 text-white border-0 rounded-xl transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Authenticating Administrator...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Console</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Student Portal Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-slate-900 shadow-xs transition-all"
            >
              <UserCheck className="w-4 h-4 text-[#E31E2B]" />
              <span>Are you a student applicant? Switch to Student Login</span>
            </Link>
          </div>
        </div>

        {/* Bottom: Security Notice */}
        <div className="w-full max-w-[400px] mx-auto text-center text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Aspirant Vision Educational Network. All rights reserved.</p>
          <p className="mt-0.5 text-slate-400/80">Unauthorized administrative access attempts are logged and monitored.</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0D26] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
