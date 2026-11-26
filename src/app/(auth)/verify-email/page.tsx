"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email address";

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8 text-center space-y-5">
      {/* Icon */}
      <div className="w-16 h-16 bg-red-50 text-primary rounded-2xl mx-auto flex items-center justify-center border border-red-100 shadow-sm">
        <Mail className="w-8 h-8" />
      </div>

      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#151820]">
          Verify Your Email
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
          We have sent an activation link to:
          <br />
          <strong className="text-gray-900 font-semibold">{email}</strong>
        </p>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-600 text-left border border-gray-100 space-y-2">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>Click the confirmation link in the email to activate your student account.</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>If you don&apos;t see the message, check your Spam or Junk folder.</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 space-y-3">
        <Link href="/login" className="block w-full">
          <Button variant="primary" className="w-full py-3 text-sm font-semibold justify-center shadow-lg shadow-primary/20">
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-gray-100 flex items-center justify-center min-h-[300px]">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
