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
  Compass,
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
  const [isStaffRole, setIsStaffRole] = useState(false);
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

        // If an administrator or counsellor visits the student profile, show staff account screen
        if (
          resolvedProfile.role === "super_admin" ||
          resolvedProfile.role === "admin" ||
          resolvedProfile.role === "counsellor"
        ) {
          setIsStaffRole(true);
          setProfile(resolvedProfile);
          setIsLoading(false);
          return;
        }

        setProfile(resolvedProfile);
        setFullName(resolvedProfile.full_name || "");
        setPhone(resolvedProfile.phone || "");

        const locParts = [resolvedProfile.city, resolvedProfile.state].filter(Boolean);
        setLocation(locParts.join(", "));

        if (dashRes.success && dashRes.data) {
          setDashboardData(dashRes.data);
        }

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
      }, 1000);
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
        <Loader2 className="w-7 h-7 text-red-600 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium tracking-wide">Loading your admissions dashboard...</p>
      </div>
    );
  }

  if (isStaffRole) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-gray-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-[#E31E2B] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Staff Account Detected</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            You are currently authenticated as <strong>{profile?.email}</strong> with staff role (
            <span className="capitalize font-semibold text-gray-800">{profile?.role}</span>). The public admissions portal is reserved for student applicants.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/admin/dashboard"
              className="w-full py-2.5 rounded-xl bg-[#15182D] text-white text-xs font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Go to Admin Operations Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Sign Out Staff Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const displayName = profile.full_name || profile.email.split("@")[0];
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
    <div className="min-h-screen bg-[#FAFAFA] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">

        {/* ============================================================================== */}
        {/* HEADER: CLEAN IDENTITY HERO (Zero empty banner image waste, Apple/Linear style) */}
        {/* ============================================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left: Avatar + Identity + Essential Coordinates */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center border border-red-200/50 shadow-xs shrink-0">
                  {initial}
                </div>
              )}

              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Student
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Session 2026–27
                  </span>
                </div>

                {/* Email, Phone & Location Strip */}
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 pt-0.5">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-800">{profile.email}</span>
                  </span>

                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {profile.phone ? (
                      <span className="font-semibold text-slate-900">{profile.phone}</span>
                    ) : (
                      <span className="font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-[11px]">
                        Phone required
                      </span>
                    )}
                  </span>

                  <span className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {displayLocation ? (
                      <span className="font-semibold text-slate-900">{displayLocation}</span>
                    ) : (
                      <span className="font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-[11px]">
                        Location required
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
              {!isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Profile</span>
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50/40 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Missing Details Notice */}
          {isMissingDetails && !isEditing && (
            <div className="mt-5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Action Required:</strong> Mobile number & location are mandatory for university admissions and counselling.
                </span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
              >
                Complete Now
              </button>
            </div>
          )}

          {/* Inline Edit Form */}
          {isEditing && (
            <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Update Personal Information
                </h3>
                <span className="text-[11px] text-slate-400">
                  <span className="text-red-500 font-bold">*</span> Mandatory fields
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1" htmlFor="editName">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="editName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition-colors bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1" htmlFor="editPhone">
                    Mobile Number <span className="text-red-500">* (10 digits)</span>
                  </label>
                  <input
                    id="editPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    maxLength={14}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition-colors bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1" htmlFor="editLocation">
                    Location (City, State) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="editLocation"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bhubaneswar, Odisha"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition-colors bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                {!isMissingDetails && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="px-4 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
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
          )}
        </div>

        {/* ============================================================================== */}
        {/* SECTION 2: ADMISSION SNAPSHOT & METRICS (Airy 5-Column Clean Layout)          */}
        {/* ============================================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Readiness Card */}
          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span>Profile Readiness</span>
                <span className="text-slate-900 font-bold">{profileReadiness}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${profileReadiness}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              {profileReadiness === 100 ? (
                <span className="text-emerald-700 font-medium">Profile 100% complete</span>
              ) : (
                <span>Complete for priority seats</span>
              )}
            </p>
          </div>

          {/* Shortlisted Colleges */}
          <Link
            href="/colleges"
            className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Shortlisted</span>
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <BookmarkCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {shortlistedColleges}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 group-hover:text-red-600 transition-colors">
                Colleges saved
              </p>
            </div>
          </Link>

          {/* Saved Courses */}
          <Link
            href="/courses"
            className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Courses</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {shortlistedCourses}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 group-hover:text-blue-600 transition-colors">
                Degrees saved
              </p>
            </div>
          </Link>

          {/* Active Enquiries */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Enquiries</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {activeEnquiries}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Counsellor queries
              </p>
            </div>
          </div>

          {/* Applications */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Applications</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {applicationsInProgress}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                In progress
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* SECTION 3: RECOMMENDED ACTIONS (Minimalist Step Cards)                         */}
        {/* ============================================================================== */}
        {recommendedSteps.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Recommended Actions
              </h2>
              <span className="text-xs text-slate-400">
                Accelerate your verified admissions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {recommendedSteps.map((step, idx) => (
                <Link
                  key={idx}
                  href="/colleges"
                  className="bg-white rounded-2xl p-5 border border-slate-200/70 hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-sm transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                        Step {idx + 1}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-red-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-slate-700 group-hover:text-red-600 transition-colors">
                    <span>Take action</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================================== */}
        {/* SECTION 4: TWO-COLUMN RECENT APPLICATIONS & ADMISSION ENQUIRIES               */}
        {/* ============================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          
          {/* Applications Card */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Recent Applications</h2>
              </div>
              <Link href="/colleges" className="text-xs font-semibold text-red-600 hover:underline">
                Apply to more
              </Link>
            </div>

            {recentApplications.length > 0 ? (
              <div className="space-y-2.5">
                {recentApplications.map((app: any) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex items-start justify-between gap-3 bg-slate-50/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {app.college?.name || "College Application"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {app.college_course?.course_name_override || "Direct Admission Stream"}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Submitted on {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize shrink-0">
                      {(app.status || "submitted").replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs text-slate-500">No active applications in progress.</p>
                <Link
                  href="/colleges"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-800 transition-colors"
                >
                  <Search className="w-3 h-3 text-slate-400" />
                  <span>Browse Top Colleges</span>
                </Link>
              </div>
            )}
          </div>

          {/* Enquiries Card */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Admission Enquiries</h2>
              </div>
              <a
                href="https://wa.me/919876543210?text=Hi%20Aspirant%20Vision%2C%20I%20have%20an%20admission%20query."
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-slate-700 hover:text-red-600 transition-colors"
              >
                Ask Counsellor
              </a>
            </div>

            {recentEnquiries.length > 0 ? (
              <div className="space-y-2.5">
                {recentEnquiries.map((enq: any) => (
                  <div
                    key={enq.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex items-start justify-between gap-3 bg-slate-50/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {enq.college?.name || "General Admission Counselling"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {enq.course?.name || "Cutoff & Seat Guidance"}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Submitted on {new Date(enq.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 capitalize shrink-0">
                      {(enq.status || "pending").replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs text-slate-500">Have questions regarding merit cutoffs or fees?</p>
                <a
                  href="https://wa.me/919876543210?text=Hi%20Aspirant%20Vision%2C%20I%20need%20admission%20guidance."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-800 transition-colors"
                >
                  <Headphones className="w-3 h-3 text-slate-400" />
                  <span>Start Counsellor Chat</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================================== */}
        {/* SECTION 5: SAVED & SHORTLISTED COLLEGES                                       */}
        {/* ============================================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-slate-900">Saved Colleges</h2>
            </div>
            <Link href="/colleges" className="text-xs font-semibold text-red-600 hover:underline">
              View all 2,500+ colleges
            </Link>
          </div>

          {recentShortlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {recentShortlists.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between gap-3 bg-slate-50/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.college?.logo_url ? (
                      <img
                        src={item.college.logo_url}
                        alt={item.college.name}
                        className="w-9 h-9 rounded-lg object-contain border border-slate-200 p-0.5 shrink-0 bg-white"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-red-600 font-bold text-xs shrink-0">
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
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-slate-500">You haven't saved any colleges to your shortlist yet.</p>
              <Link
                href="/colleges"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Top Universities</span>
              </Link>
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <p className="text-center text-[11px] text-slate-400 pt-2 pb-6">
          © 2026 Aspirant Vision Educational Network. Direct AICTE & UGC Recognized Admission Guidance.
        </p>
      </div>
    </div>
  );
}
