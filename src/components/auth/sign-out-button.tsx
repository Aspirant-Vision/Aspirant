"use client";

import React, { useState } from "react";
import { logoutAction } from "@/lib/auth/actions";
import { LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
  variant?: "ghost" | "dark" | "outline";
  redirectTo?: string;
}

export function SignOutButton({
  className,
  variant = "ghost",
  redirectTo = "/login",
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await logoutAction();
    } catch (err) {
      console.error("Sign out error:", err);
      window.location.href = redirectTo;
    }
  };

  const variantStyles = {
    ghost: "text-gray-600 hover:text-red-600 hover:bg-red-50",
    dark: "text-gray-400 hover:text-red-400 hover:bg-white/5",
    outline: "border border-gray-200 text-gray-700 hover:bg-gray-50",
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50",
        variantStyles[variant],
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      <span>{isLoading ? "Signing out..." : "Sign Out"}</span>
    </button>
  );
}
