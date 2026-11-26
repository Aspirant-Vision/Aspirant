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
} from "lucide-react";
import { Button } from "@/components/ui/button";

function StaffLoginForm() {
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

      // Hard redirect to load full administrative layout with verified roles
      const target = result.data.redirectTo || "/admin/dashboard";
      window.location.href = target;
    } catch (err: unknown) {
      console.error("Staff login unexpected error:", err);
      setServerError("An unexpected network error occurred. Please contact IT support.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C102C] flex flex-col justify-between selection:bg-red-500 selection:text-white">
      {/* Top Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-white/10">
        <Logo inverted />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Public Site</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-md">
          {/* Badge & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold backdrop-blur-sm mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Administrative Operations Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Staff Sign In
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Restricted to authorized Aspirant Vision administrators and counsellors.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            {/* Server Error Alert */}
            {serverError && (
              <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs sm:text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                <div className="flex-1 font-medium">{serverError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5" htmlFor="email">
                  Staff Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="staff@aspirantvision.com"
                    {...register("email")}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-white placeholder:text-gray-500 bg-white/5 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all ${
                      errors.email
                        ? "border-red-400/80 bg-red-950/20"
                        : "border-white/15 focus:border-red-500 hover:border-white/30"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-300" htmlFor="password">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    {...register("password")}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-white placeholder:text-gray-500 bg-white/5 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all ${
                      errors.password
                        ? "border-red-400/80 bg-red-950/20"
                        : "border-white/15 focus:border-red-500 hover:border-white/30"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="w-full py-3 text-sm font-semibold justify-center bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/40 text-white border-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span>Authenticating Staff...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Staff Console</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Student Portal Switch */}
            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                <span>Are you a student applicant? Switch to Student Login</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center text-xs text-gray-500 border-t border-white/5">
        <p>Aspirant Vision Administrative Core • Unauthorized access attempts are logged and monitored.</p>
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C102C] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      }
    >
      <StaffLoginForm />
    </Suspense>
  );
}
