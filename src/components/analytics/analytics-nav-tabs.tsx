"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Users,
  FileCheck2,
  Award,
  Building2,
  FileSpreadsheet,
} from "lucide-react";

interface AnalyticsNavTabsProps {
  isCounsellorOnly?: boolean;
}

export function AnalyticsNavTabs({ isCounsellorOnly = false }: AnalyticsNavTabsProps) {
  const pathname = usePathname();

  const tabs = [
    { label: "Overview", href: "/admin/analytics", icon: LayoutDashboard },
    { label: "Leads Funnel", href: "/admin/analytics/leads", icon: Inbox },
    ...(!isCounsellorOnly
      ? [{ label: "Counsellors", href: "/admin/analytics/counsellors", icon: Users }]
      : []),
    { label: "Applications", href: "/admin/analytics/applications", icon: FileCheck2 },
    { label: "Admissions", href: "/admin/analytics/admissions", icon: Award },
    { label: "Colleges", href: "/admin/analytics/colleges", icon: Building2 },
    { label: "Reports & Export", href: "/admin/reports", icon: FileSpreadsheet },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200/80 scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200/60"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
