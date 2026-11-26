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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    { label: "At least one uppercase letter (A-Z)", valid: /[A-Z]/.test(passwordValue) },
    { label: "At least one lowercase letter (a-z)", valid: /[a-z]/.test(passwordValue) },
    { label: "At least one numeric digit (0-9)", valid: /[0-9]/.test(passwordValue) },
    { label: "At least one special character (!@#$%...)", valid: /[^A-Za-z0-9]/.test(passwordValue) },
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
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-[#151820]">
          Create Student Account
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Join 50,000+ aspirants discovering top colleges, cutoffs, and verified scholarships.
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 font-medium">{serverError}</div>
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
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400 font-medium uppercase tracking-wider text-[11px]">
              or register with email
            </span>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="e.g. Rahul Sharma"
              {...register("fullName")}
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                errors.fullName
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-gray-200 focus:border-primary hover:border-gray-300"
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="student@example.com"
                {...register("email")}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors.email
                    ? "border-red-400 bg-red-50/30 focus:border-red-500"
                    : "border-gray-200 focus:border-primary hover:border-gray-300"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Mobile Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="phone">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="10-digit number"
                {...register("phone")}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                  errors.phone
                    ? "border-red-400 bg-red-50/30 focus:border-red-500"
                    : "border-gray-200 focus:border-primary hover:border-gray-300"
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="password">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create strong password"
              {...register("password")}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                errors.password
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-gray-200 focus:border-primary hover:border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
          )}

          {/* Password Strength Checklist */}
          {passwordValue.length > 0 && (
            <div className="mt-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 ${
                    rule.valid ? "text-emerald-700 font-medium" : "text-gray-500"
                  }`}
                >
                  {rule.valid ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                  )}
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="confirmPassword">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                errors.confirmPassword
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-gray-200 focus:border-primary hover:border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms and Privacy Consent */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("termsConsent")}
              className="w-4 h-4 mt-0.5 rounded text-primary border-gray-300 focus:ring-primary/30 cursor-pointer"
            />
            <span className="text-xs text-gray-600 leading-normal">
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="font-semibold text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="font-semibold text-primary hover:underline">
                Privacy Policy
              </Link>
              , and consent to receiving counselling guidance via WhatsApp and SMS.
            </span>
          </label>
          {errors.termsConsent && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.termsConsent.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full py-3 text-sm font-semibold justify-center shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Creating your account...</span>
              </>
            ) : (
              <>
                <span>Register as Student</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 text-center text-xs text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-primary hover:text-red-700 transition-colors">
          Sign In here
        </Link>
      </div>
    </div>
  );
}
