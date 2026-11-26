"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentLoginSchema, StudentLoginInput, getSafeRedirectUrl } from "@/lib/validation/auth";
import { loginAction } from "@/lib/auth/actions";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  Mail,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

function LoginForm() {
  const router = useRouter();
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
  } = useForm<StudentLoginInput>({
    resolver: zodResolver(studentLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
      redirectUrl: nextParam ? getSafeRedirectUrl(nextParam) : "/student/dashboard",
    },
  });

  const onSubmit = async (data: StudentLoginInput) => {
    try {
      setServerError(null);
      setIsSubmitting(true);

      const result = await loginAction(data);

      if (!result.success) {
        setServerError(result.error.message || "Failed to log in. Please check your credentials.");
        setIsSubmitting(false);
        return;
      }

      // Hard redirect to refresh full server session and load student layout
      const target = result.data.redirectTo || "/student/dashboard";
      window.location.href = target;
    } catch (err: unknown) {
      console.error("Login unexpected error:", err);
      setServerError("An unexpected network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-[0_20px_50px_-10px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] border border-slate-200/90 p-7 sm:p-9 transition-all">
      {/* Category Pill & Heading */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-[11px] font-bold tracking-wider uppercase mb-2.5">
          <Sparkles className="w-3 h-3 text-red-600" />
          <span>Student Portal Access</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Student Login
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
          Sign in to track your college applications, shortlists, and counselling status.
        </p>
      </div>

      {/* Error Alert Box */}
      {serverError && (
        <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs sm:text-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{serverError}</div>
        </div>
      )}

      {/* Google One-Click Login */}
      <div className="mb-5">
        <GoogleSignInButton
          label="Continue with Google"
          redirectUrl={nextParam ? getSafeRedirectUrl(nextParam) : "/student/dashboard"}
          onError={(msg) => setServerError(msg)}
        />
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              or sign in with email
            </span>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              {...register("email")}
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                errors.email
                  ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/10"
                  : "border-slate-200/90 focus:border-red-500 focus:ring-red-500/10 hover:border-slate-300"
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register("password")}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                errors.password
                  ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/10"
                  : "border-slate-200/90 focus:border-red-500 focus:ring-red-500/10 hover:border-slate-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none p-1 cursor-pointer transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="w-4 h-4 rounded text-red-600 border-slate-300 focus:ring-red-500/20 cursor-pointer accent-red-600"
            />
            <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:via-rose-500 hover:to-red-600 active:scale-[0.99] shadow-[0_10px_25px_-5px_rgba(225,29,72,0.35)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
        Don&apos;t have an account yet?{" "}
        <Link
          href="/register"
          className="font-bold text-red-600 hover:text-red-700 transition-colors ml-1"
        >
          Create student account &rarr;
        </Link>
      </div>

      {/* Security Reassurance */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>Direct 256-bit SSL encrypted student session</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[460px] bg-white rounded-3xl p-8 border border-slate-200 flex items-center justify-center min-h-[380px] shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
