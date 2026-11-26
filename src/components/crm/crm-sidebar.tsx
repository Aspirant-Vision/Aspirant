"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types/auth.types";
import { hasPermission } from "@/lib/auth/roles";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  DollarSign,
  GraduationCap,
  Inbox,
  Users,
  FileCheck2,
  Award,
  UserCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarClock,
  UserCheck2,
  TrendingUp,
  Bell,
} from "lucide-react";

interface CrmSidebarProps {
  primaryRole: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  allowed: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function CrmSidebar({
  primaryRole,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}: CrmSidebarProps) {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      label: "OVERVIEW",
      items: [
        {
          title: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          allowed: true,
        },
        {
          title: "Analytics",
          href: "/admin/analytics",
          icon: BarChart3,
          allowed: true,
        },
        {
          title: "Alert Center",
          href: "/admin/notifications",
          icon: Bell,
          allowed: true,
        },
      ],
    },
    {
      label: "LEADS & COUNSELLING",
      items: [
        {
          title: "Leads CRM",
          href: "/admin/leads",
          icon: Inbox,
          allowed: hasPermission(primaryRole, "canManageLeads"),
        },
        {
          title: "My Assigned Leads",
          href: "/admin/my-leads",
          icon: UserCheck2,
          allowed: hasPermission(primaryRole, "canManageLeads"),
        },
        {
          title: "Follow-ups",
          href: "/admin/follow-ups",
          icon: CalendarClock,
          allowed: hasPermission(primaryRole, "canManageLeads"),
        },
        {
          title: "Counsellor Performance",
          href: "/admin/leads/performance",
          icon: TrendingUp,
          allowed:
            hasPermission(primaryRole, "canManageUsers") ||
            primaryRole === "admin" ||
            primaryRole === "super_admin",
        },
      ],
    },
    {
      label: "ADMISSIONS & STUDENTS",
      items: [
        {
          title: "All Applications",
          href: "/admin/applications",
          icon: FileCheck2,
          allowed: true,
        },
        {
          title: "My Applications",
          href: "/admin/my-applications",
          icon: UserCheck2,
          allowed:
            primaryRole === "counsellor" ||
            hasPermission(primaryRole, "canAccessCounseling"),
        },
        {
          title: "Admissions",
          href: "/admin/admissions",
          icon: Award,
          allowed: true,
        },
        {
          title: "Students",
          href: "/admin/students",
          icon: Users,
          allowed: true,
        },
      ],
    },
    {
      label: "INSTITUTE DIRECTORY",
      items: [
        {
          title: "Colleges",
          href: "/admin/colleges",
          icon: Building2,
          allowed: hasPermission(primaryRole, "canManageColleges"),
        },
        {
          title: "Courses",
          href: "/admin/courses",
          icon: BookOpen,
          allowed: hasPermission(primaryRole, "canManageColleges"),
        },
        {
          title: "Fees",
          href: "/admin/fees",
          icon: DollarSign,
          allowed: hasPermission(primaryRole, "canManageColleges"),
        },
        {
          title: "Scholarships",
          href: "/admin/scholarships",
          icon: GraduationCap,
          allowed: hasPermission(primaryRole, "canManageColleges"),
        },
      ],
    },
    {
      label: "MANAGEMENT",
      items: [
        {
          title: "Admins & Counsellors",
          href: "/admin/counsellors",
          icon: UserCheck,
          allowed:
            hasPermission(primaryRole, "canManageUsers") || primaryRole === "admin",
        },
        {
          title: "Reports",
          href: "/admin/reports",
          icon: BarChart3,
          allowed: true,
        },
        {
          title: "Settings",
          href: "/admin/settings",
          icon: Settings,
          allowed: primaryRole === "super_admin" || primaryRole === "admin",
        },
      ],
    },
  ];

  // Close mobile drawer on route transition
  useEffect(() => {
    onCloseMobile();
  }, [pathname, onCloseMobile]);

  const SidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-gray-200/90 text-gray-700">
      {/* 1. Brand Header */}
      <div>
        <div
          className={cn(
            "h-16 flex items-center border-b border-gray-100 px-4 transition-all duration-300",
            isCollapsed ? "justify-center px-2" : "justify-between"
          )}
        >
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Logo className="scale-90 origin-left" />
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 text-[#E31E2B] border border-red-200/80 text-[10px] font-bold tracking-wider uppercase">
                CRM
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center font-black text-white text-xs shadow-xs">
              AV
            </div>
          )}

          {/* Close button for Mobile Drawer */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Scope Indicator */}
        {!isCollapsed && (
          <div className="px-3.5 py-2 mx-3 mt-3 mb-1 rounded-xl bg-gray-50/80 border border-gray-200/70 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-bold text-gray-800 capitalize truncate">
                {primaryRole.replace("_", " ")}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded tracking-wider">
              Live
            </span>
          </div>
        )}
      </div>

      {/* 2. Scrollable Navigation Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
        {navGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter((item) => item.allowed);
          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {group.label}
                </div>
              )}

              <nav className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin/dashboard"
                      ? pathname === "/admin/dashboard"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      title={isCollapsed ? item.title : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 select-none",
                        isActive
                          ? "bg-red-50 text-[#E31E2B] border border-red-200/80 shadow-2xs font-bold"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80",
                        isCollapsed && "justify-center px-0 py-2.5"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive
                            ? "text-[#E31E2B]"
                            : "text-gray-400 group-hover:text-gray-600"
                        )}
                      />

                      {!isCollapsed && (
                        <span className="truncate flex-1">{item.title}</span>
                      )}

                      {/* Active Indicator Pip */}
                      {isActive && !isCollapsed && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E31E2B] shrink-0" />
                      )}

                      {/* Tooltip Flyout for Collapsed Sidebar */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-gray-800 z-50">
                          {item.title}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Collapse Toggle (Desktop only) */}
      <div className="p-3 border-t border-gray-100 hidden lg:block">
        <button
          onClick={onToggleCollapse}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-300 ease-in-out sticky top-0 h-screen z-30",
          isCollapsed ? "w-18" : "w-64"
        )}
      >
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
