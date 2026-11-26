"use client";

import React, { useState } from "react";
import Link from "next/link";
import { updateNotificationPreferenceAction } from "@/lib/notifications/actions";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Mail,
  Clock,
  ShieldAlert,
  ArrowLeft,
  Check,
  Loader2,
  Lock,
} from "lucide-react";

interface PreferenceItem {
  category: string;
  label: string;
  description: string;
  essential: boolean;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  reminderEnabled: boolean;
}

interface NotificationPreferencesViewProps {
  initialPreferences: PreferenceItem[];
  backUrl?: string;
}

export function NotificationPreferencesView({
  initialPreferences,
  backUrl = "/student/notifications",
}: NotificationPreferencesViewProps) {
  const [preferences, setPreferences] = useState<PreferenceItem[]>(initialPreferences);
  const [savingCategory, setSavingCategory] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggle = async (
    category: string,
    field: "inAppEnabled" | "emailEnabled" | "reminderEnabled",
    newValue: boolean
  ) => {
    const target = preferences.find((p) => p.category === category);
    if (!target) return;
    if (field === "inAppEnabled" && target.essential) return; // Cannot disable essential in-app alerts

    const updated = {
      ...target,
      [field]: newValue,
    };

    // Optimistic UI update
    setPreferences((prev) =>
      prev.map((p) => (p.category === category ? updated : p))
    );

    setSavingCategory(category);
    setFeedback(null);

    try {
      const res = await updateNotificationPreferenceAction({
        category,
        inAppEnabled: updated.inAppEnabled,
        emailEnabled: updated.emailEnabled,
        reminderEnabled: updated.reminderEnabled,
      });

      if (res.success) {
        setFeedback("Preferences saved successfully.");
      } else {
        setFeedback("Failed to update preferences. Reverting change.");
        // Revert on failure
        setPreferences((prev) =>
          prev.map((p) => (p.category === category ? target : p))
        );
      }
    } catch (err: unknown) {
      setFeedback("An unexpected error occurred while saving preferences.");
      setPreferences((prev) =>
        prev.map((p) => (p.category === category ? target : p))
      );
    } finally {
      setSavingCategory(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href={backUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Notifications</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Notification Preferences
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Choose what alerts you want to receive across in-app banners, email summaries, and scheduled reminders.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <span>{feedback}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-2 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Preferences List */}
      <div className="bg-white rounded-2xl border border-gray-200/80 divide-y divide-gray-100 shadow-xs overflow-hidden">
        {preferences.map((pref) => {
          const isSaving = savingCategory === pref.category;

          return (
            <div
              key={pref.category}
              className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900">{pref.label}</h3>
                  {pref.essential && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Essential</span>
                    </span>
                  )}
                  {isSaving && (
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {pref.description}
                </p>
              </div>

              {/* Channel Toggles */}
              <div className="flex items-center gap-4 sm:gap-6 self-start md:self-auto pt-2 md:pt-0">
                {/* In-App Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pref.inAppEnabled}
                    disabled={pref.essential}
                    onChange={(e) =>
                      handleToggle(pref.category, "inAppEnabled", e.target.checked)
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                    <Bell className="w-3.5 h-3.5 text-gray-400" />
                    <span>In-App</span>
                  </div>
                </label>

                {/* Email Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pref.emailEnabled}
                    onChange={(e) =>
                      handleToggle(pref.category, "emailEnabled", e.target.checked)
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                  />
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>Email</span>
                  </div>
                </label>

                {/* Reminders Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pref.reminderEnabled}
                    onChange={(e) =>
                      handleToggle(pref.category, "reminderEnabled", e.target.checked)
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                  />
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Alerts</span>
                  </div>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p>
          <strong>Security Note:</strong> Account verification, password security alerts, and binding admission confirmation milestones cannot be turned off. Other preferences will take effect immediately.
        </p>
      </div>
    </div>
  );
}
