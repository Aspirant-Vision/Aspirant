"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  LogOut,
} from "lucide-react";

interface SettingsClientViewProps {
  email: string;
  fullName: string;
  emailConfirmed: boolean;
}

export function SettingsClientView({
  email,
  fullName,
  emailConfirmed,
}: SettingsClientViewProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordStatus({
        type: "error",
        text: "New password must be at least 8 characters long",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", text: "Passwords do not match" });
      return;
    }

    try {
      setIsUpdatingPassword(true);
      setPasswordStatus(null);
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordStatus({ type: "error", text: error.message });
      } else {
        setPasswordStatus({
          type: "success",
          text: "Password updated successfully!",
        });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setPasswordStatus({
        type: "error",
        text: err.message || "Failed to update password",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your credentials, security preferences, and session controls.
        </p>
      </div>

      {/* Account Verification & Security Status */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-gray-900">Security & Account Status</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
            <span className="text-[11px] font-semibold text-gray-500">Registered Student Email</span>
            <p className="text-xs font-bold text-gray-900">{email}</p>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Email Verified</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
            <span className="text-[11px] font-semibold text-gray-500">Account Access Role</span>
            <p className="text-xs font-bold text-gray-900">Aspirant Student</p>
            <p className="text-[11px] text-gray-500 pt-1">
              Active student session protected by PostgreSQL Row Level Security.
            </p>
          </div>
        </div>
      </div>

      {/* Password Change Form */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <KeyRound className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-gray-900">Change Password</h2>
        </div>

        {passwordStatus && (
          <div
            className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
              passwordStatus.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {passwordStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{passwordStatus.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isUpdatingPassword}
              className="text-xs min-w-36"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Session Management Card */}
      <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Sign Out of Session</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Safely terminate your authenticated student portal session across this browser.
          </p>
        </div>

        <SignOutButton
          variant="outline"
          redirectTo="/login"
          className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
        />
      </div>
    </div>
  );
}
