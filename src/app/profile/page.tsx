"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateStudentProfileAction, logoutAction } from "@/lib/auth/actions";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Edit3,
  Check,
  X,
  LogOut,
  AlertCircle,
  Loader2,
  GraduationCap,
  Building2,
  ArrowRight,
  Headphones,
  CheckCircle2,
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
  account_status?: string;
  created_at?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form inputs
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function fetchProfile() {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push("/login?next=/profile");
          return;
        }

        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("id, email, full_name, phone, city, state, avatar_url, role, account_status, created_at")
          .eq("id", session.user.id)
          .maybeSingle();

        const resolvedProfile: StudentProfile = {
          id: session.user.id,
          email: session.user.email || "",
          full_name:
            dbProfile?.full_name ||
            (session.user.user_metadata?.full_name as string) ||
            (session.user.user_metadata?.name as string) ||
            null,
          phone: dbProfile?.phone || (session.user.user_metadata?.phone as string) || null,
          city: dbProfile?.city || (session.user.user_metadata?.city as string) || null,
          state: dbProfile?.state || (session.user.user_metadata?.state as string) || null,
          avatar_url:
            dbProfile?.avatar_url ||
            (session.user.user_metadata?.avatar_url as string) ||
            null,
          role: dbProfile?.role || "student",
          account_status: dbProfile?.account_status || "active",
          created_at: dbProfile?.created_at,
        };

        setProfile(resolvedProfile);
        setFullName(resolvedProfile.full_name || "");
        setPhone(resolvedProfile.phone || "");
        
        const locParts = [resolvedProfile.city, resolvedProfile.state].filter(Boolean);
        setLocation(locParts.join(", "));

        // If phone or location is missing, automatically prompt edit
        if (!resolvedProfile.phone || !locParts.length) {
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    const cleanPhone = phone.trim().replace(/\s+/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    const cleanLocation = location.trim();
    if (!cleanLocation || cleanLocation.length < 2) {
      setErrorMessage("Please enter your Location (City and State).");
      return;
    }

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Full Name must be at least 2 characters.");
      return;
    }

    try {
      setIsSaving(true);
      const res = await updateStudentProfileAction({
        fullName: fullName.trim(),
        phone: cleanPhone,
        location: cleanLocation,
      });

      if (!res.success) {
        setErrorMessage(res.error.message || "Failed to save profile.");
        setIsSaving(false);
        return;
      }

      let parsedCity = cleanLocation;
      let parsedState = cleanLocation;
      if (cleanLocation.includes(",")) {
        const parts = cleanLocation.split(",").map((s) => s.trim());
        parsedCity = parts[0] || cleanLocation;
        parsedState = parts.slice(1).join(", ") || cleanLocation;
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: fullName.trim(),
              phone: cleanPhone,
              city: parsedCity,
              state: parsedState,
            }
          : null
      );

      setSuccessMessage("Profile updated successfully!");
      setIsSaving(false);
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMessage(null);
      }, 1200);
    } catch (err: unknown) {
      console.error("Save error:", err);
      setErrorMessage("An unexpected error occurred while updating profile.");
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await logoutAction();
    } catch {
      // Continue to home
    }
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const displayName = profile.full_name || profile.email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();
  const displayLocation = [profile.city, profile.state].filter(Boolean).join(", ");
  const isMissingDetails = !profile.phone || !displayLocation;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-800 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">My Profile</span>
        </div>

        {/* Missing Required Fields Alert */}
        {isMissingDetails && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <span className="font-bold">Required Details Missing:</span> Mobile number and location are mandatory to match you with verified university admissions and direct merit seats. Please complete your profile below.
            </div>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Card Banner Scrim */}
          <div className="h-24 sm:h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-6 flex items-end justify-between" />

          {/* Card Content */}
          <div className="px-6 pb-6 pt-0 relative">
            {/* Avatar & Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-6">
              <div className="flex items-end gap-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-red-600 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center border-4 border-white shadow-md">
                    {initial}
                  </div>
                )}
                <div className="mb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {displayName}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profile.email}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Profile</span>
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 hover:border-red-300 bg-red-50/50 hover:bg-red-50 text-xs font-semibold text-red-700 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>

            {/* Error / Success Feedback */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* VIEW MODE vs EDIT MODE */}
            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                {/* Mobile Number Box */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Mobile Number
                    </span>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      Mandatory
                    </span>
                  </div>
                  {profile.phone ? (
                    <p className="text-sm font-bold text-slate-900 tracking-wide">
                      {profile.phone}
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 font-medium italic">
                      Not set — Please enter mobile number
                    </p>
                  )}
                </div>

                {/* Location Box */}
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Location
                    </span>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      Mandatory
                    </span>
                  </div>
                  {displayLocation ? (
                    <p className="text-sm font-bold text-slate-900">
                      {displayLocation}
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 font-medium italic">
                      Not set — Please enter city & state
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* EDIT FORM */
              <form onSubmit={handleSave} className="pt-4 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="profileFullName">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="profileFullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors bg-white"
                      required
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="profilePhone">
                      Mobile Number <span className="text-red-500">* (10 Digits)</span>
                    </label>
                    <input
                      id="profilePhone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      maxLength={14}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors bg-white"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="profileLocation">
                      Location (City, State) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="profileLocation"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Bhubaneswar, Odisha"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 transition-colors bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  {!isMissingDetails && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Coordinates</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Minimal Quick Actions & University Hub (Simple & Non-bloated) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {/* Card 1: Direct Admission Network */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Explore 2,500+ Top Colleges
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct merit seats and official cutoffs for B.Tech, MBA, Medical, Law, and more across India.
              </p>
            </div>
            <div className="pt-4">
              <Link
                href="/colleges"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                <span>Browse Colleges</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: 1-on-1 Certified Counselling */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Priority Admission Support
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect directly with certified senior counsellors for seat reservation and scholarship allocation.
              </p>
            </div>
            <div className="pt-4">
              <a
                href="https://wa.me/919876543210?text=Hi%20Aspirant%20Vision%2C%20I%20need%20expert%20admission%20guidance."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span>Talk to Counsellor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-400 mt-8">
          © 2026 Aspirant Vision Educational Network. Direct AICTE & UGC Recognized Admission Guidance.
        </p>
      </div>
    </div>
  );
}
