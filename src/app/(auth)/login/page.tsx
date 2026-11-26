"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentLoginSchema, StudentLoginInput, getSafeRedirectUrl } from "@/lib/validation/auth";
import { loginAction } from "@/lib/auth/actions";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight, ShieldCheck, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
      {/* Form Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-[#151820]">
          Student Login
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Sign in to track your college applications, shortlists, and counselling status.
        </p>
      </div>

      {/* Error Alert */}
      {serverError && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 font-medium">{serverError}</div>
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
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400 font-medium uppercase tracking-wider text-[11px]">
              or sign in with email
            </span>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
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

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-gray-700" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:text-red-700 transition-colors"
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
              placeholder="Enter your password"
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
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary/30 cursor-pointer"
            />
            <span className="text-xs text-gray-600 font-medium">Keep me signed in</span>
          </label>
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
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 text-center text-xs text-gray-600">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="font-bold text-primary hover:text-red-700 transition-colors">
          Create student account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-gray-100 flex items-center justify-center min-h-[360px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
