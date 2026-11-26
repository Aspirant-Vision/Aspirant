"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateStudentProfileAction, logoutAction } from "@/lib/auth/actions";
import { getStudentDashboardDataAction, StudentDashboardData } from "@/lib/student/actions";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Edit3,
  Check,
  LogOut,
  AlertCircle,
  Loader2,
  BookmarkCheck,
  BookOpen,
  MessageSquare,
  FileText,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Building2,
  Clock,
  ArrowUpRight,
  Headphones,
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
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
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

    async function loadData() {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push("/login?next=/profile");
          return;
        }

        // Fetch profile and full student dashboard data in parallel
        const [profileRes, dashRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, email, full_name, phone, city, state, avatar_url, role, account_status, created_at")
            .eq("id", session.user.id)
            .maybeSingle(),
          getStudentDashboardDataAction(),
        ]);

        const dbProfile = profileRes.data;
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

        if (dashRes.success && dashRes.data) {
          setDashboardData(dashRes.data);
        }

        // Prompt edit if mobile or location is missing
        if (!resolvedProfile.phone || !locParts.length) {
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

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
      // Continue
    }
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading your profile & admissions hub...</p>
      </div>
    );
  }

  if (!profile) return null;

  const displayName = profile.full_name || profile.email.split("@")[0];
  const firstName = displayName.split(" ")[0];
  const initial = displayName.charAt(0).toUpperCase();
  const displayLocation = [profile.city, profile.state].filter(Boolean).join(", ");
  const isMissingDetails = !profile.phone || !displayLocation;

  const profileReadiness = dashboardData?.profileCompletionPercentage || (isMissingDetails ? 40 : 80);
  const missingFields = dashboardData?.missingProfileFields || [];
  const shortlistedColleges = dashboardData?.shortlistedCollegesCount ?? 0;
  const shortlistedCourses = dashboardData?.shortlistedCoursesCount ?? 0;
  const activeEnquiries = dashboardData?.activeEnquiriesCount ?? 0;
  const applicationsInProgress = dashboardData?.applicationsInProgressCount ?? 0;
  const recentApplications = dashboardData?.recentApplications || [];
  const recentEnquiries = dashboardData?.recentEnquiries || [];
  const recentShortlists = dashboardData?.recentShortlists || [];
  const recommendedSteps = dashboardData?.recommendedSteps || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-800 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Student Profile</span>
        </div>

        {/* Missing Required Fields Alert */}
        {isMissingDetails && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <span className="font-bold">Mandatory Coordinates Required:</span> Mobile number and location are required to match you with top colleges, verified scholarship quotas, and direct admission counselling.
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* SECTION 1: PROFILE DETAILS CARD (With Mandatory Mobile Number & Location)     */}
        {/* ============================================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div className="h-24 sm:h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-6 flex items-end justify-between" />

          {/* Profile Body */}
          <div className="px-6 pb-6 pt-0 relative">
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
                      Verified Aspirant
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 hover:border-red-300 bg-red-50/50 hover:bg-red-50 text-xs font-semibold text-red-700 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
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

            {/* View Mode vs Edit Mode */}
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
              /* Inline Edit Form */
              <form onSubmit={handleSave} className="pt-4 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* ============================================================================== */}
        {/* SECTION 2: WELCOME BANNER & PROFILE READINESS (Original Sections Preserved)   */}
        {/* ============================================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-red-700 to-[#0C102C] text-white p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Admission Session 2026-27</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {firstName}!
              </h2>

              <p className="text-xs sm:text-sm text-red-100 max-w-xl leading-relaxed">
                Your admission hub is active. Review college cutoffs, monitor enquiry updates from assigned counsellors, and track your verified scholarship applications.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/colleges"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-red-600 hover:bg-slate-100 text-xs font-bold shadow-md transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Top Colleges</span>
                </Link>
                <a
                  href="https://wa.me/919876543210?text=Hi%20Aspirant%20Vision%2C%20I%20need%20expert%20admission%20guidance."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/30 text-white bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-sm transition-colors"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Ask Counsellor</span>
                </a>
              </div>
            </div>

            {/* Profile Completion Dial */}
            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-100">
                  Profile Readiness
                </span>
                <span className="text-lg font-black text-white">
                  {profileReadiness}%
                </span>
              </div>

              <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${profileReadiness}%` }}
                />
              </div>

              {missingFields.length > 0 ? (
                <p className="text-[11px] text-red-100">
                  Complete: <span className="text-white font-semibold">{missingFields.slice(0, 2).join(", ")}</span>
                  {missingFields.length > 2 && ` +${missingFields.length - 2} more`}
                </p>
              ) : (
                <p className="text-[11px] text-emerald-200 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Your profile is 100% complete!</span>
                </p>
              )}
            </div>
          </div>
          <div className="absolute -right-12 -bottom-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
        </div>

        {/* ============================================================================== */}
        {/* SECTION 3: KEY METRICS ROW (4 Cards)                                          */}
        {/* ============================================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link
            href="/colleges"
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-red-200 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Shortlisted Colleges</span>
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 group-hover:scale-110 transition-transform">
                <BookmarkCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {shortlistedColleges}
              </span>
              <span className="text-xs font-semibold text-red-600 flex items-center gap-0.5 group-hover:underline">
                Browse <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          <Link
            href="/courses"
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-red-200 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Saved Courses</span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {shortlistedCourses}
              </span>
              <span className="text-xs font-semibold text-blue-600 flex items-center gap-0.5 group-hover:underline">
                Explore <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Enquiries</span>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {activeEnquiries}
              </span>
              <span className="text-xs font-semibold text-purple-600">
                In Review
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Applications</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {applicationsInProgress}
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                Processing
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* SECTION 4: RECOMMENDED ACTIONS                                                */}
        {/* ============================================================================== */}
        {recommendedSteps.length > 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Recommended Actions
              </h3>
              <p className="text-xs text-slate-500">
                Complete these steps to speed up direct counselling and verified seat processing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedSteps.map((step, idx) => (
                <Link
                  key={idx}
                  href="/colleges"
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-red-600 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-md">
                        Step {idx + 1}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-red-600">
                    <span>Take action</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* SECTION 5: TWO-COLUMN RECENT APPLICATIONS & ENQUIRIES                         */}
        {/* ============================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Applications</h3>
              </div>
              <Link href="/colleges" className="text-xs font-semibold text-red-600 hover:underline">
                Apply to more
              </Link>
            </div>

            {recentApplications.length > 0 ? (
              <div className="space-y-3">
                {recentApplications.map((app: any) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {app.college?.name || "College Application"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {app.college_course?.course_name_override || "Merit Admission Stream"}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Submitted on {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 capitalize shrink-0">
                      {(app.status || "submitted").replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs text-slate-500">You haven't submitted any admission applications yet.</p>
                <Link
                  href="/colleges"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition-colors"
                >
                  <Search className="w-3 h-3" />
                  <span>Explore Direct Admissions</span>
                </Link>
              </div>
            )}
          </div>

          {/* Enquiries Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Admission Enquiries</h3>
              </div>
              <a
                href="https://wa.me/919876543210?text=Hi%20Aspirant%20Vision%2C%20I%20have%20an%20admission%20query."
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-purple-600 hover:underline"
              >
                Ask Counsellor
              </a>
            </div>

            {recentEnquiries.length > 0 ? (
              <div className="space-y-3">
                {recentEnquiries.map((enq: any) => (
                  <div
                    key={enq.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {enq.college?.name || "General Admission Counselling"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {enq.course?.name || "Cutoff & Scholarship Guidance"}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Submitted on {new Date(enq.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-700 capitalize shrink-0">
                      {(enq.status || "pending").replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs text-slate-500">You have no pending enquiries. Need cutoff or seat advice?</p>
                <a
                  href="https://wa.me/919876543210?text=Hi%20Aspirant%20Vision%2C%20I%20need%20admission%20guidance."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-colors"
                >
                  <Headphones className="w-3 h-3" />
                  <span>Start Counselling Chat</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================================== */}
        {/* SECTION 6: SHORTLISTED COLLEGES PREVIEW                                       */}
        {/* ============================================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-bold text-slate-900">Saved & Shortlisted Colleges</h3>
            </div>
            <Link href="/colleges" className="text-xs font-semibold text-red-600 hover:underline">
              View all colleges
            </Link>
          </div>

          {recentShortlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentShortlists.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-100 flex items-center justify-between gap-3 hover:border-slate-300 transition-all bg-slate-50/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.college?.logo_url ? (
                      <img
                        src={item.college.logo_url}
                        alt={item.college.name}
                        className="w-10 h-10 rounded-lg object-contain border border-slate-200 p-0.5 shrink-0 bg-white"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-red-600 font-bold text-xs shrink-0">
                        {item.college?.name?.charAt(0) || "C"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {item.college?.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.college?.city}, {item.college?.state}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/colleges/${item.college?.slug || ""}`}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-slate-500">You haven't saved any colleges to your shortlist yet.</p>
              <Link
                href="/colleges"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs font-bold transition-colors shadow-xs"
              >
                <Search className="w-3 h-3" />
                <span>Discover 2,500+ Colleges</span>
              </Link>
            </div>
          )}
        </div>

        {/* Footer Guarantee Note */}
        <p className="text-center text-[11px] text-slate-400 pt-4">
          © 2026 Aspirant Vision Educational Network. Direct AICTE & UGC Recognized Admission Guidance.
        </p>
      </div>
    </div>
  );
}
