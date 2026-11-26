"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationItem } from "@/lib/notifications/types";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  FileText,
  Settings,
} from "lucide-react";

interface NotificationsClientViewProps {
  userId: string;
  initialNotifications: NotificationItem[];
}

export function NotificationsClientView({
  userId,
  initialNotifications,
}: NotificationsClientViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications({
    userId,
    initialNotifications,
    pageSize: 50,
  });

  const filteredNotifications = notifications.filter((n) => {
    if (unreadOnly && n.is_read) return false;
    if (selectedCategory === "all") return true;
    if (selectedCategory === "applications") return n.category === "application";
    if (selectedCategory === "counselling") return n.category === "student" || n.category === "follow_up";
    if (selectedCategory === "system") return n.category === "system";
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "application":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "student":
      case "follow_up":
        return <Clock className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  const categories = [
    { id: "all", label: "All Alerts" },
    { id: "applications", label: "Applications" },
    { id: "counselling", label: "Counselling" },
    { id: "system", label: "System & Announcements" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Stay updated with admission milestones, document checks, and counsellor follow-ups in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {unreadCount > 0 && (
            <Button
              onClick={() => markAllAsRead()}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              <span>Mark All Read</span>
            </Button>
          )}

          <Link href="/student/settings/notifications">
            <Button variant="outline" size="sm" className="text-xs">
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              <span>Preferences</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-primary text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Unread Only Toggle */}
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
          />
          <span>Unread alerts only</span>
        </label>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                n.is_read
                  ? "bg-white border-gray-200/80 hover:border-gray-300"
                  : "bg-red-50/20 border-red-200 shadow-xs hover:border-red-300"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  n.is_read
                    ? "bg-gray-100 text-gray-500 border-gray-200"
                    : "bg-red-100 text-primary border-red-200"
                }`}
              >
                {getCategoryIcon(n.category)}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3
                      className={`text-xs sm:text-sm font-bold truncate ${
                        n.is_read ? "text-gray-800" : "text-gray-900"
                      }`}
                    >
                      {n.title}
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 border border-gray-200/60 hidden sm:inline">
                      {n.category}
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(n.created_at).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>

                <div className="pt-2 flex items-center gap-3">
                  {n.destination_url && (
                    <Link
                      href={n.destination_url}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}

                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>

              {!n.is_read && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl mx-auto flex items-center justify-center">
            <Bell className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-gray-900">No Notifications Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            {unreadOnly
              ? "You have no unread notifications matching this filter."
              : "You're all caught up! Real-time alerts regarding your admission queries and university applications will appear here."}
          </p>
        </div>
      )}
    </div>
  );
}
