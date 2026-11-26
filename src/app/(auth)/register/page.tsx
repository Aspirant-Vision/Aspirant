"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentRegisterSchema, StudentRegisterInput } from "@/lib/validation/auth";
import { registerStudentAction } from "@/lib/auth/actions";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StudentRegisterInput>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      termsConsent: false,
    },
  });

  const passwordValue = watch("password", "");

  // Live password criteria validation
  const rules = [
    { label: "At least 8 characters", valid: passwordValue.length >= 8 },
    { label: "One uppercase letter (A-Z)", valid: /[A-Z]/.test(passwordValue) },
    { label: "One lowercase letter (a-z)", valid: /[a-z]/.test(passwordValue) },
    { label: "One numeric digit (0-9)", valid: /[0-9]/.test(passwordValue) },
    { label: "One special symbol (!@#$...)", valid: /[^A-Za-z0-9]/.test(passwordValue) },
  ];

  const onSubmit = async (data: StudentRegisterInput) => {
    try {
      setServerError(null);
      setIsSubmitting(true);

      const result = await registerStudentAction(data);

      if (!result.success) {
        setServerError(result.error.message || "Failed to register. Please check your information.");
        setIsSubmitting(false);
        return;
      }

      if (result.data.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        // Immediate session created, hard redirect to student dashboard
        window.location.href = "/student/dashboard";
      }
    } catch (err: unknown) {
      console.error("Register unexpected error:", err);
      setServerError("An unexpected error occurred. Please try again later.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[500px] bg-white rounded-3xl shadow-[0_20px_50px_-10px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] border border-slate-200/90 p-7 sm:p-9 transition-all">
      {/* Category Pill & Heading */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-[11px] font-bold tracking-wider uppercase mb-2.5">
          <Sparkles className="w-3 h-3 text-red-600" />
          <span>New Student Registration</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Create Student Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
          Join 50,000+ aspirants discovering verified cutoffs, direct admissions & scholarships.
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs sm:text-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{serverError}</div>
        </div>
      )}

      {/* Google One-Click Registration */}
      <div className="mb-5">
        <GoogleSignInButton
          label="Sign up with Google"
          redirectUrl="/student/dashboard"
          onError={(msg) => setServerError(msg)}
        />
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              or register with email
            </span>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="e.g. Rahul Sharma"
              {...register("fullName")}
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                errors.fullName
                  ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/10"
                  : "border-slate-200/90 focus:border-red-500 focus:ring-red-500/10 hover:border-slate-300"
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="student@example.com"
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

          {/* Mobile Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="phone">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="10-digit number"
                {...register("phone")}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                  errors.phone
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/10"
                    : "border-slate-200/90 focus:border-red-500 focus:ring-red-500/10 hover:border-slate-300"
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="password">
            Create Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
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

          {/* Password Strength Checklist */}
          {passwordValue.length > 0 && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 ${
                    rule.valid ? "text-emerald-700 font-medium" : "text-slate-400"
                  }`}
                >
                  {rule.valid ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  )}
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="confirmPassword">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter password"
              {...register("confirmPassword")}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                errors.confirmPassword
                  ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/10"
                  : "border-slate-200/90 focus:border-red-500 focus:ring-red-500/10 hover:border-slate-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none p-1 cursor-pointer transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms and Privacy Consent */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("termsConsent")}
              className="w-4 h-4 mt-0.5 rounded text-red-600 border-slate-300 focus:ring-red-500/20 cursor-pointer accent-red-600"
            />
            <span className="text-xs text-slate-600 leading-normal">
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="font-semibold text-red-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="font-semibold text-red-600 hover:underline">
                Privacy Policy
              </Link>
              , and consent to receiving verified counselling updates.
            </span>
          </label>
          {errors.termsConsent && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.termsConsent.message}</p>
          )}
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
                <span>Creating your account...</span>
              </>
            ) : (
              <>
                <span>Register as Student</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-red-600 hover:text-red-700 transition-colors ml-1">
          Sign In here &rarr;
        </Link>
      </div>

      {/* Security Reassurance */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>Direct 256-bit SSL encrypted student registration</span>
      </div>
    </div>
  );
}
