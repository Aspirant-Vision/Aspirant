"use client";

import React, { useState, useCallback } from "react";
import { UserProfile, UserRole } from "@/types/auth.types";
import { CrmSidebar } from "./crm-sidebar";
import { CrmTopNav } from "./crm-top-nav";

interface CrmShellProps {
  profile: UserProfile;
  primaryRole: UserRole;
  children: React.ReactNode;
}

export function CrmShell({ profile, primaryRole, children }: CrmShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCloseMobile = useCallback(() => setIsMobileOpen(false), []);
  const handleOpenMobile = useCallback(() => setIsMobileOpen(true), []);

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex selection:bg-red-100 selection:text-red-700">
      {/* 1. Sidebar Navigation (Desktop Persistent + Mobile Drawer) */}
      <CrmSidebar
        primaryRole={primaryRole}
        isMobileOpen={isMobileOpen}
        onCloseMobile={handleCloseMobile}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* 2. Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Top Bar */}
        <CrmTopNav
          profile={profile}
          onOpenMobile={handleOpenMobile}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
