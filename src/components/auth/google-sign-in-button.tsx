"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface GoogleSignInButtonProps {
  label?: string;
  redirectUrl?: string;
  onError?: (message: string) => void;
}

export function GoogleSignInButton({
  label = "Continue with Google",
  redirectUrl = "/student/dashboard",
  onError,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (redirectUrl) {
        callbackUrl.searchParams.set("next", redirectUrl);
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        setIsLoading(false);
        const msg = error.message.includes("provider is not enabled")
          ? "Google Sign-In is not enabled yet in your Supabase project. To enable it, open your Supabase Dashboard > Authentication > Providers > Google, toggle it ON, and paste your Google OAuth Client ID & Secret."
          : error.message;
        if (onError) onError(msg);
        return;
      }

      if (data?.url) {
        // Pre-check if Google OAuth provider is active in Supabase
        try {
          const probe = await fetch(data.url, {
            method: "GET",
            headers: { Accept: "application/json" },
          });

          if (!probe.ok) {
            const errJson = await probe.json().catch(() => null);
            if (
              errJson?.msg?.includes("provider is not enabled") ||
              errJson?.error_code === "validation_failed" ||
              probe.status === 400
            ) {
              setIsLoading(false);
              if (onError) {
                onError(
                  "Google Sign-In is not activated yet in Supabase. Please go to Supabase Dashboard > Authentication > Providers > Google, enable it, and add your Google Cloud OAuth Client ID & Secret."
                );
              }
              return;
            }
          }
        } catch {
          // Cross-origin redirects or network policies are expected when provider is active; proceed with navigation
        }

        // Navigate to Google account selection
        window.location.href = data.url;
      } else {
        setIsLoading(false);
        if (onError) onError("Unable to generate Google sign-in authorization link.");
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const message =
        err instanceof Error ? err.message : "Failed to initiate Google authentication.";
      if (onError) onError(message);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="group relative w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50/80 active:bg-slate-100/90 text-slate-700 text-sm font-semibold transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
      ) : (
        <svg
          className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
          />
        </svg>
      )}
      <span className="tracking-tight">{label}</span>
    </button>
  );
}
