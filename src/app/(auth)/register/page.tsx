"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentRegisterSchema, StudentRegisterInput } from "@/lib/validation/auth";
import { registerStudentAction } from "@/lib/auth/actions";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
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

  const rules = [
    { label: "8+ characters", valid: passwordValue.length >= 8 },
    { label: "One uppercase", valid: /[A-Z]/.test(passwordValue) },
    { label: "One lowercase", valid: /[a-z]/.test(passwordValue) },
    { label: "One digit", valid: /[0-9]/.test(passwordValue) },
    { label: "One symbol", valid: /[^A-Za-z0-9]/.test(passwordValue) },
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
        window.location.href = "/student/dashboard";
      }
    } catch (err: unknown) {
      console.error("Register unexpected error:", err);
      setServerError("An unexpected error occurred. Please try again later.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Create Account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Join 50,000+ students discovering verified admissions & scholarships.
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-3.5 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{serverError}</div>
        </div>
      )}

      {/* Google One-Click Registration */}
      <div className="mb-3.5">
        <GoogleSignInButton
          label="Sign up with Google"
          redirectUrl="/student/dashboard"
          onError={(msg) => setServerError(msg)}
        />
        <div className="relative my-3.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-slate-400 text-[11px]">
              or register with email
            </span>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="fullName">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Rahul Sharma"
            {...register("fullName")}
            className={`w-full px-3.5 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none transition-colors ${
              errors.fullName
                ? "border-red-400 bg-red-50/20 focus:border-red-500"
                : "border-slate-200 focus:border-slate-900"
            }`}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="student@example.com"
              {...register("email")}
              className={`w-full px-3.5 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none transition-colors ${
                errors.email
                  ? "border-red-400 bg-red-50/20 focus:border-red-500"
                  : "border-slate-200 focus:border-slate-900"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="phone">
              Mobile Number
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="10-digit number"
              {...register("phone")}
              className={`w-full px-3.5 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none transition-colors ${
                errors.phone
                  ? "border-red-400 bg-red-50/20 focus:border-red-500"
                  : "border-slate-200 focus:border-slate-900"
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              {...register("password")}
              className={`w-full pl-3.5 pr-10 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none transition-colors ${
                errors.password
                  ? "border-red-400 bg-red-50/20 focus:border-red-500"
                  : "border-slate-200 focus:border-slate-900"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
          )}

          {passwordValue.length > 0 && (
            <div className="mt-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-wrap gap-2 text-[10px]">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1 ${
                    rule.valid ? "text-emerald-700 font-medium" : "text-slate-400"
                  }`}
                >
                  {rule.valid ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 text-slate-300 shrink-0" />
                  )}
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter password"
              {...register("confirmPassword")}
              className={`w-full pl-3.5 pr-10 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none transition-colors ${
                errors.confirmPassword
                  ? "border-red-400 bg-red-50/20 focus:border-red-500"
                  : "border-slate-200 focus:border-slate-900"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms Consent */}
        <div className="pt-0.5">
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("termsConsent")}
              className="w-3.5 h-3.5 mt-0.5 rounded text-red-600 border-slate-300 focus:ring-red-500/20 accent-red-600 cursor-pointer"
            />
            <span className="text-[11px] text-slate-600 leading-tight">
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="font-semibold text-slate-900 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="font-semibold text-slate-900 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.termsConsent && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.termsConsent.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-slate-900 hover:text-red-600 transition-colors ml-0.5">
          Sign In
        </Link>
      </div>
    </div>
  );
}
