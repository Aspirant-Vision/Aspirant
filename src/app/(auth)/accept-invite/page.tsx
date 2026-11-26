"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { acceptStaffInviteSchema, AcceptStaffInviteInput } from "@/lib/validation/auth";
import { acceptStaffInviteAction } from "@/lib/auth/actions";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ email: string; role: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AcceptStaffInviteInput>({
    resolver: zodResolver(acceptStaffInviteSchema),
    defaultValues: {
      token,
      fullName: "",
      phone: "",
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

  const onSubmit = async (data: AcceptStaffInviteInput) => {
    try {
      setServerError(null);
      setIsSubmitting(true);

      const result = await acceptStaffInviteAction(data);

      if (!result.success) {
        setServerError(result.error.message || "Failed to accept invitation. The invitation link may have expired or already been used.");
        setIsSubmitting(false);
        return;
      }

      setSuccessData(result.data);
      setIsSubmitting(false);
    } catch (err: unknown) {
      console.error("Accept invite unexpected error:", err);
      setServerError("An unexpected error occurred. Please contact your system administrator.");
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl mx-auto flex items-center justify-center border border-red-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Invalid Invitation Link</h2>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          No invitation token was detected in your request. Please click the exact link sent to your email or request a new invitation from your administrator.
        </p>
        <div className="pt-2">
          <Link href="/admin/login">
            <Button variant="primary" className="w-full py-2.5 text-xs font-semibold">
              Return to Staff Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
      {successData ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#151820]">
            Invitation Accepted!
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Your staff account has been provisioned with the role of{" "}
            <span className="font-bold text-primary uppercase tracking-wide px-2 py-0.5 bg-red-50 rounded-md">
              {successData.role}
            </span>{" "}
            for <strong className="text-gray-900">{successData.email}</strong>.
          </p>

          <p className="text-xs text-gray-500">
            You can now proceed to the administrative operations console to sign in with your new password.
          </p>

          <div className="pt-2">
            <Link href="/admin/login" className="block w-full">
              <Button variant="primary" className="w-full py-3 text-sm font-semibold justify-center shadow-lg shadow-primary/20">
                <span>Sign In to Staff Console</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff Invitation Verified</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#151820]">
              Activate Your Staff Account
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Complete your profile details and set a secure password to access the administrative portal.
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 font-medium">{serverError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("token")} value={token} />

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
                  placeholder="e.g. Priya Nair"
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

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="phone">
                Contact Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  {...register("phone")}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-gray-300"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone.message}</p>
              )}
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
                  placeholder="Create secure password"
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
                  placeholder="Re-enter password"
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

            {/* Submit */}
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
                    <span>Activating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Activation</span>
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

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-gray-100 flex items-center justify-center min-h-[360px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
