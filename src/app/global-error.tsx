"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error Boundary Caught Exception]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900">
              Critical System Error
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              A fatal application exception was encountered. Please refresh the page or return to the main dashboard.
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-slate-400 bg-slate-100 py-1 px-3 rounded inline-block">
                Digest: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
