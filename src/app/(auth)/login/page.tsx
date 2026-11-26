"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentLoginSchema, StudentLoginInput, getSafeRedirectUrl } from "@/lib/validation/auth";
import { loginAction } from "@/lib/auth/actions";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
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
      redirectUrl: nextParam ? getSafeRedirectUrl(nextParam) : "/profile",
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

      const target = result.data.redirectTo || "/profile";
      window.location.href = target;
    } catch (err: unknown) {
      console.error("Login unexpected error:", err);
      setServerError("An unexpected network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Student Login
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your details to access your admissions portal.
        </p>
      </div>

      {/* Error Alert Box */}
      {serverError && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{serverError}</div>
        </div>
      )}

      {/* Google One-Click Login */}
      <div className="mb-4">
        <GoogleSignInButton
          label="Continue with Google"
          redirectUrl={nextParam ? getSafeRedirectUrl(nextParam) : "/profile"}
          onError={(msg) => setServerError(msg)}
        />
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-slate-400 text-[11px]">
              or continue with email
            </span>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
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

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className={`w-full pl-3.5 pr-10 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none transition-colors ${
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
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="w-3.5 h-3.5 rounded text-red-600 border-slate-300 focus:ring-red-500/20 accent-red-600 cursor-pointer"
            />
            <span className="text-xs text-slate-600">Keep me signed in</span>
          </label>
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
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </div>
      </form>

      {/* Switch to Register */}
      <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-slate-900 hover:text-red-600 transition-colors ml-0.5"
        >
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
        <div className="w-full p-8 flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
