"use client";

import React from "react";
import Link from "next/link";
import { Menu, ExternalLink, ShieldCheck } from "lucide-react";
import { HeaderNotificationDropdown } from "@/components/notifications/header-notification-dropdown";
import { Button } from "@/components/ui/button";

interface StudentTopNavProps {
  userId?: string;
  displayName: string;
  avatarUrl?: string | null;
  unreadCount?: number;
  onOpenMobile: () => void;
}

export function StudentTopNav({
  userId = "",
  displayName,
  avatarUrl,
  unreadCount = 0,
  onOpenMobile,
}: StudentTopNavProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Menu Trigger & Brand Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Student Account</span>
          </span>
        </div>
      </div>

      {/* Right: Quick Links, Notification Bell, Profile */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-gray-100"
        >
          <span>Explore Colleges</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Realtime Notifications Dropdown with Badge */}
        <HeaderNotificationDropdown
          userId={userId}
          historyUrl="/student/notifications"
          initialUnreadCount={unreadCount}
        />

        <div className="h-4 w-px bg-gray-200" />

        {/* Profile Pill Link */}
        <Link
          href="/student/profile"
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-100 transition-colors group"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border border-red-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-red-100 text-primary font-bold text-xs flex items-center justify-center border border-red-200 group-hover:border-primary">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-semibold text-gray-800 hidden sm:inline group-hover:text-primary transition-colors">
            {displayName}
          </span>
        </Link>
      </div>
    </header>
  );
}
