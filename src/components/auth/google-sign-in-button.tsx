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

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        setIsLoading(false);
        const msg = error.message.includes("provider is not enabled")
          ? "Google OAuth is not enabled in your Supabase project. Please enable Google in Supabase Dashboard > Authentication > Providers."
          : error.message;
        if (onError) onError(msg);
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : "Failed to connect to Google authentication.";
      if (onError) onError(message);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 text-xs sm:text-sm font-semibold transition-all duration-200 shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
      ) : (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
      <span>{label}</span>
    </button>
  );
}
