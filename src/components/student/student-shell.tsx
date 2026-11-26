"use client";

import React, { useState } from "react";
import { StudentSidebar } from "./student-sidebar";
import { StudentTopNav } from "./student-top-nav";

interface StudentShellProps {
  userId?: string;
  displayName: string;
  userEmail: string;
  avatarUrl?: string | null;
  unreadCount?: number;
  children: React.ReactNode;
}

export function StudentShell({
  userId = "",
  displayName,
  userEmail,
  avatarUrl,
  unreadCount = 0,
  children,
}: StudentShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex selection:bg-red-100 selection:text-red-700">
      {/* 1. Responsive Sidebar Navigation */}
      <StudentSidebar
        displayName={displayName}
        userEmail={userEmail}
        avatarUrl={avatarUrl}
        unreadCount={unreadCount}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Top Bar */}
        <StudentTopNav
          userId={userId}
          displayName={displayName}
          avatarUrl={avatarUrl}
          unreadCount={unreadCount}
          onOpenMobile={() => setIsMobileOpen(true)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200/80 bg-white py-4 px-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Aspirant Vision • Empowering Student Admissions Across India</p>
        </footer>
      </div>
    </div>
  );
}
