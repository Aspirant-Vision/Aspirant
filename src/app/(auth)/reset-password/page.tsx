"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validation/auth";
import { resetPasswordAction } from "@/lib/auth/actions";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password", "");

  const rules = [
    { label: "At least 8 characters", valid: passwordValue.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", valid: /[A-Z]/.test(passwordValue) },
    { label: "At least one lowercase letter (a-z)", valid: /[a-z]/.test(passwordValue) },
    { label: "At least one numeric digit (0-9)", valid: /[0-9]/.test(passwordValue) },
    { label: "At least one special character (!@#$%...)", valid: /[^A-Za-z0-9]/.test(passwordValue) },
  ];

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      setServerError(null);
      setIsSubmitting(true);

      const result = await resetPasswordAction(data);

      if (!result.success) {
        setServerError(result.error.message || "Failed to update password. Your reset link may have expired.");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      setIsSubmitting(false);
    } catch (err: unknown) {
      console.error("Reset password error:", err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
      {isSuccess ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#151820]">
            Password Updated!
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Your account password has been successfully reset. You can now log in using your new credentials.
          </p>

          <div className="pt-2">
            <Link href="/login" className="block w-full">
              <Button variant="primary" className="w-full py-3 text-sm font-semibold justify-center shadow-lg shadow-primary/20">
                <span>Sign In Now</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-[#151820]">
              Create New Password
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Please enter and confirm your new secure password below.
            </p>
          </div>

          {/* Error Alert */}
          {serverError && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 font-medium">{serverError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter new password"
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
                <div className="mt-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 grid grid-cols-1 gap-1 text-[11px]">
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
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
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
                    <span>Updating password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
