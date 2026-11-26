"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/validation/auth";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      setServerError(null);
      setIsSubmitting(true);

      const result = await forgotPasswordAction(data);

      if (!result.success) {
        setServerError(result.error.message || "Failed to send reset link. Please check your email.");
        setIsSubmitting(false);
        return;
      }

      setSuccessEmail(data.email);
      setIsSubmitting(false);
    } catch (err: unknown) {
      console.error("Forgot password error:", err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {successEmail ? (
        <div className="text-center py-2 space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Check Your Email
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed">
            We sent a password reset link to <strong className="text-slate-900">{successEmail}</strong>.
          </p>

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 text-left border border-slate-200/60">
            <p className="font-semibold text-slate-800">Didn&apos;t receive it?</p>
            <p>Check your Spam folder, or ensure the email is registered with Aspirant Vision.</p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-block w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Forgot Password
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your email address and we will send you a reset link.
            </p>
          </div>

          {/* Error Alert */}
          {serverError && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{serverError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="email">
                Registered Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="student@example.com"
                {...register("email")}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none transition-colors ${
                  errors.email
                    ? "border-red-400 bg-red-50/20 focus:border-red-500"
                    : "border-slate-200 focus:border-slate-900"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </div>
          </form>

          {/* Return link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-700 hover:text-red-600 transition-colors"
            >
              &larr; Back to Sign In
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
