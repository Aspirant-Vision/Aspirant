"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Module Error Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-gray-200/90 p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
            Operations Module Notice
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-2">
            Unable to Load Operations View
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
            A temporary runtime error occurred while retrieving this section. Your credentials and session remain secure.
          </p>
        </div>

        {error.message && (
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/80 text-left">
            <p className="text-[11px] font-mono text-gray-700 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-gray-400 mt-1">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            variant="primary"
            size="sm"
            className="w-full sm:w-auto text-xs px-5 py-2.5 bg-red-600 hover:bg-red-700"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Retry Section</span>
          </Button>

          <Link href="/admin/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-xs px-5 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
