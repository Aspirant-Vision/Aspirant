"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Sliders,
  BookmarkCheck,
  BookOpen,
  MessageSquare,
  FileText,
  Bell,
  Settings,
  Compass,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface StudentSidebarProps {
  displayName: string;
  userEmail: string;
  avatarUrl?: string | null;
  unreadCount?: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  external?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function StudentSidebar({
  displayName,
  userEmail,
  avatarUrl,
  unreadCount = 0,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}: StudentSidebarProps) {
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      title: "My Portal",
      items: [
        {
          title: "Dashboard",
          href: "/student/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Personal Profile",
          href: "/student/profile",
          icon: User,
        },
        {
          title: "Academic Details",
          href: "/student/academic-details",
          icon: GraduationCap,
        },
        {
          title: "Admission Preferences",
          href: "/student/preferences",
          icon: Sliders,
        },
      ],
    },
    {
      title: "Shortlists & Discovery",
      items: [
        {
          title: "Shortlisted Colleges",
          href: "/student/shortlist/colleges",
          icon: BookmarkCheck,
        },
        {
          title: "Shortlisted Courses",
          href: "/student/shortlist/courses",
          icon: BookOpen,
        },
        {
          title: "Explore Colleges",
          href: "/",
          icon: Compass,
          external: true,
        },
      ],
    },
    {
      title: "Tracking & Support",
      items: [
        {
          title: "My Enquiries",
          href: "/student/enquiries",
          icon: MessageSquare,
        },
        {
          title: "My Applications",
          href: "/student/applications",
          icon: FileText,
        },
        {
          title: "Notifications",
          href: "/student/notifications",
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        {
          title: "Account Settings",
          href: "/student/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out lg:static shadow-sm",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header Strip with Branding */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <div className="flex items-center gap-3 overflow-hidden">
            {!isCollapsed ? (
              <div className="flex flex-col">
                <Logo />
                <span className="text-[10px] font-semibold text-primary uppercase tracking-widest pl-1 mt-0.5">
                  Student Portal
                </span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                AV
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {section.title}
                </div>
              )}

              {section.items.map((item) => {
                const isActive =
                  item.href === "/student/dashboard"
                    ? pathname === "/student/dashboard"
                    : pathname.startsWith(item.href) && !item.external;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    onClick={() => onCloseMobile()}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative",
                      isActive
                        ? "bg-red-50 text-primary border border-red-100 shadow-xs"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-gray-400 group-hover:text-gray-700"
                      )}
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.title}</span>
                    )}

                    {!isCollapsed && item.external && (
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    )}

                    {!isCollapsed && item.badge !== undefined && (
                      <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-600 text-white shadow-xs">
                        {item.badge}
                      </span>
                    )}

                    {isCollapsed && item.badge !== undefined && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Profile Summary & Desktop Collapse Toggle */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl bg-white border border-gray-200/80 shadow-xs mb-2",
              isCollapsed && "justify-center p-2"
            )}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-9 h-9 rounded-xl object-cover border border-red-100 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-red-100 text-primary font-bold text-sm flex items-center justify-center shrink-0 border border-red-200">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-gray-500 truncate">{userEmail}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-1">
            <div className={cn("w-full", isCollapsed && "hidden")}>
              <SignOutButton
                variant="ghost"
                redirectTo="/login"
                className="w-full text-xs text-gray-600 justify-start hover:text-red-700 hover:bg-red-50"
              />
            </div>

            {/* Desktop collapse button */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors ml-auto"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
