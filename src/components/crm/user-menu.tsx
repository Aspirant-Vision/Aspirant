"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UserProfile } from "@/types/auth.types";
import { logoutAction } from "@/lib/auth/actions";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Loader2,
} from "lucide-react";

interface UserMenuProps {
  profile: UserProfile;
}

export function UserMenu({ profile }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await logoutAction();
      window.location.href = "/admin/login";
    } catch {
      window.location.href = "/admin/login";
    }
  };

  const displayName = profile.fullName || profile.email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer select-none border border-transparent hover:border-gray-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center shadow-xs">
            {initial}
          </div>
        )}

        <div className="hidden md:block text-left">
          <div className="text-xs font-semibold text-gray-900 leading-tight truncate max-w-[120px]">
            {displayName}
          </div>
          <div className="text-[10px] text-gray-500 font-medium leading-tight capitalize">
            {profile.role.replace("_", " ")}
          </div>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gray-200 shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <p className="font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-[11px] text-gray-500 truncate mt-0.5">{profile.email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold">
              <ShieldCheck className="w-3 h-3 text-red-600" />
              <span>{profile.role.toUpperCase().replace("_", " ")}</span>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/admin/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span>My Staff Profile</span>
            </Link>

            <Link
              href="/admin/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-gray-400" />
              <span>Account Settings</span>
            </Link>
          </div>

          <div className="pt-1 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors font-medium disabled:opacity-50 cursor-pointer"
            >
              {isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
