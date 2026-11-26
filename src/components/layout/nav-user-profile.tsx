"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { logoutAction } from "@/lib/auth/actions";
import {
  User,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Check,
  X,
  LogOut,
  FileCheck2,
  Bookmark,
  LayoutDashboard,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface StudentProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  avatar_url: string | null;
  role: string;
  is_verified?: boolean;
}

export function NavUserProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Edit form state
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: dbProfile } = await supabase
            .from("profiles")
            .select("id, email, full_name, phone, city, state, avatar_url, role, is_verified")
            .eq("id", session.user.id)
            .maybeSingle();

          const currentProfile: StudentProfile = {
            id: session.user.id,
            email: session.user.email || "",
            full_name:
              dbProfile?.full_name ||
              (session.user.user_metadata?.full_name as string) ||
              (session.user.user_metadata?.name as string) ||
              null,
            phone: dbProfile?.phone || session.user.phone || null,
            city: dbProfile?.city || null,
            state: dbProfile?.state || null,
            avatar_url:
              dbProfile?.avatar_url ||
              (session.user.user_metadata?.avatar_url as string) ||
              null,
            role: dbProfile?.role || "student",
            is_verified: dbProfile?.is_verified ?? false,
          };

          setProfile(currentProfile);
          setEditFullName(currentProfile.full_name || "");
          setEditPhone(currentProfile.phone || "");
          setEditCity(currentProfile.city || "");
          setEditState(currentProfile.state || "");
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Failed to load user session in navbar:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();

    // Listen to Supabase auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser();
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartEdit = () => {
    if (profile) {
      setEditFullName(profile.full_name || "");
      setEditPhone(profile.phone || "");
      setEditCity(profile.city || "");
      setEditState(profile.state || "");
      setSaveError(null);
      setSaveSuccess(false);
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      const supabase = createClient();

      const updates = {
        full_name: editFullName.trim() || null,
        phone: editPhone.trim() || null,
        city: editCity.trim() || null,
        state: editState.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id);

      if (error) {
        setSaveError(error.message);
        setIsSaving(false);
        return;
      }

      setProfile({
        ...profile,
        full_name: updates.full_name,
        phone: updates.phone,
        city: updates.city,
        state: updates.state,
      });

      setSaveSuccess(true);
      setIsSaving(false);
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 1200);
    } catch (err: unknown) {
      console.error("Save profile error:", err);
      setSaveError("Failed to update profile coordinates.");
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await logoutAction();
    } catch {
      // Continue to reset local state
    }
    setProfile(null);
    setIsOpen(false);
    window.location.href = "/";
  };

  // 1. Loading state placeholder
  if (isLoading) {
    return (
      <div className="w-20 h-8 rounded-full bg-gray-100 animate-pulse" />
    );
  }

  // 2. Not logged in: Show tactile Login CTA
  if (!profile) {
    return (
      <Link
        href="/login"
        className="tactile-btn-white inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#15182D] transition-all hover:text-[#E31E2B]"
      >
        <User className="w-3.5 h-3.5 text-[#E31E2B]" />
        <span>Login</span>
      </Link>
    );
  }

  // 3. Logged in: Show Person / Avatar Icon
  const displayName = profile.full_name || profile.email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Clickable Person / Avatar Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-white border border-gray-200 hover:border-red-200 hover:shadow-xs transition-all cursor-pointer"
        aria-label="Student Profile Menu"
        aria-expanded={isOpen}
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-red-50 text-[#E31E2B] font-bold text-xs flex items-center justify-center border border-red-100 shadow-xs">
            {initial}
          </div>
        )}

        <span className="text-xs font-bold text-gray-800 hidden sm:inline max-w-[110px] truncate">
          {displayName}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Profile Details Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-gray-200/90 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          {!isEditing ? (
            /* VIEW MODE: All Profile Details Displayed */
            <div>
              {/* Profile Card Header */}
              <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-red-100 shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-50 text-[#E31E2B] font-black text-base flex items-center justify-center border-2 border-red-100 shadow-xs">
                      {initial}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {displayName}
                    </h4>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3 text-[#E31E2B]" />
                        Student Aspirant
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={handleStartEdit}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#E31E2B] hover:bg-red-50 transition-colors"
                  title="Edit Profile"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Details Grid */}
              <div className="py-3 space-y-2 border-b border-gray-100 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Phone className="w-3.5 h-3.5" />
                    Phone:
                  </span>
                  <span className="font-semibold text-gray-800">
                    {profile.phone || <span className="text-gray-400 italic">Not set</span>}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <MapPin className="w-3.5 h-3.5" />
                    Location:
                  </span>
                  <span className="font-semibold text-gray-800">
                    {[profile.city, profile.state].filter(Boolean).join(", ") || (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Quick Actions / Shortcuts */}
              <div className="py-2.5 space-y-1">
                <Link
                  href="/student/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-gray-400" />
                  <span>Student Dashboard</span>
                </Link>

                <Link
                  href="/student/applications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-gray-400" />
                  <span>My Applications</span>
                </Link>

                <Link
                  href="/student/shortlist/colleges"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5 text-gray-400" />
                  <span>Saved Shortlists</span>
                </Link>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={handleStartEdit}
                  className="text-xs font-semibold text-[#E31E2B] hover:underline cursor-pointer"
                >
                  Edit Profile Coordinates
                </button>

                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* EDIT MODE: Inline Form to Edit Profile Details */
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-primary" />
                  <span>Edit Profile Details</span>
                </h4>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {saveError && (
                <div className="my-2 p-2 rounded-lg bg-red-50 text-red-600 text-[11px] font-medium">
                  {saveError}
                </div>
              )}

              {saveSuccess && (
                <div className="my-2 p-2 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="py-3 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="e.g. Bhubaneswar"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      placeholder="e.g. Odisha"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#E31E2B] text-white hover:bg-red-700 transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
