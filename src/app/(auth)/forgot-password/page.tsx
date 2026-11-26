"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/validation/auth";
import { forgotPasswordAction } from "@/lib/auth/actions";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

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
    <div className="w-full max-w-[390px] sm:max-w-[410px] mx-auto py-2">
      {successEmail ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center border border-emerald-100 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Check Your Email
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We have sent a secure password reset link to <strong className="text-slate-900">{successEmail}</strong>.
            Please click the link in your email to choose a new password.
          </p>

          <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-500 text-left border border-slate-200/70 space-y-1">
            <p className="font-semibold text-slate-800">Didn&apos;t receive the email?</p>
            <p>Check your Spam or Junk folder, or ensure you entered the email registered with Aspirant Vision.</p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:via-rose-500 hover:to-red-600 shadow-[0_10px_25px_-5px_rgba(225,29,72,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Return to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-[11px] font-bold tracking-wider uppercase mb-2.5">
              <Sparkles className="w-3 h-3 text-red-600" />
              <span>Account Recovery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Forgot Password?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Enter your registered email address and we will send you a secure reset link.
            </p>
          </div>

          {/* Error Alert */}
          {serverError && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs sm:text-sm animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{serverError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="email">
                Registered Email Address
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:via-rose-500 hover:to-red-600 active:scale-[0.99] shadow-[0_10px_25px_-5px_rgba(225,29,72,0.35)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Return link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>

          {/* Security Reassurance */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Encrypted password recovery • One-time secure token</span>
          </div>
        </>
      )}
    </div>
  );
}
