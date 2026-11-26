"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/validation/auth";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { Loader2, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
      {successEmail ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#151820]">
            Check Your Email
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            We have sent a secure password reset link to <strong className="text-gray-900">{successEmail}</strong>.
            Please click the link in your email to choose a new password.
          </p>

          <div className="p-3.5 bg-gray-50 rounded-xl text-xs text-gray-500 text-left border border-gray-100 space-y-1">
            <p className="font-semibold text-gray-700">Didn&apos;t receive the email?</p>
            <p>Check your Spam or Junk folder, or ensure you entered the email registered with Aspirant Vision.</p>
          </div>

          <div className="pt-2">
            <Link href="/login" className="block w-full">
              <Button variant="primary" className="w-full py-3 text-sm font-semibold justify-center">
                <span>Return to Sign In</span>
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
              Forgot Password?
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Enter your registered email address and we will send you a password reset link.
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
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="email">
                Registered Email Address
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
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Return link */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
