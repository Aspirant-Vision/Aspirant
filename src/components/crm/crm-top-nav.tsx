"use client";

import React from "react";
import { UserProfile } from "@/types/auth.types";
import { GlobalSearch } from "./global-search";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
import { Menu } from "lucide-react";

interface CrmTopNavProps {
  profile: UserProfile;
  onOpenMobile: () => void;
}

export function CrmTopNav({ profile, onOpenMobile }: CrmTopNavProps) {
  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Drawer Trigger & Workspace Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="font-bold text-gray-900">Operations Console</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500 font-medium capitalize">
            {profile.role.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 flex justify-center max-w-md">
        <GlobalSearch />
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationBell userId={profile.id} />
        <div className="h-5 w-px bg-gray-200 hidden sm:block" />
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
