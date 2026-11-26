import React from "react";
import Link from "next/link";
import { getStudentDashboardDataAction } from "@/lib/student/actions";
import {
  BookmarkCheck,
  BookOpen,
  MessageSquare,
  FileText,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Building2,
  Calendar,
  Clock,
  Compass,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function StudentDashboardPage() {
  const result = await getStudentDashboardDataAction();

  if (!result.success) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-gray-900">Failed to load dashboard</h2>
        <p className="text-xs text-gray-500 mt-1">{result.error.message || "Unknown error"}</p>
      </div>
    );
  }

  const {
    profile,
    profileCompletionPercentage,
    missingProfileFields,
    recommendedSteps,
    shortlistedCollegesCount,
    shortlistedCoursesCount,
    activeEnquiriesCount,
    applicationsInProgressCount,
    recentShortlists,
    recentEnquiries,
    recentApplications,
  } = result.data;

  const firstName = profile.full_name?.split(" ")[0] || "Aspirant";

  return (
    <div className="space-y-8">
      {/* 1. Welcome Banner & Profile Completion Progress */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-red-700 to-[#0C102C] text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Admission Session 2026-27</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome back, {firstName}!
            </h1>

            <p className="text-xs sm:text-sm text-red-100 max-w-xl leading-relaxed">
              Your admission hub is active. Review college cutoffs, monitor enquiry updates from assigned counsellors, and complete your profile for prioritized counselling.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link href="/">
                <Button
                  variant="accent"
                  size="sm"
                  className="bg-white text-primary hover:bg-gray-100 font-bold shadow-md"
                >
                  <Search className="w-4 h-4 mr-1.5" />
                  <span>Search Top Colleges</span>
                </Button>
              </Link>
              <Link href="/student/enquiries">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white bg-white/10 hover:bg-white/20"
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  <span>Ask Counsellor</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Profile Completion Dial / Widget */}
          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-100">
                Profile Readiness
              </span>
              <span className="text-lg font-black text-white">
                {profileCompletionPercentage}%
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletionPercentage}%` }}
              />
            </div>

            {missingProfileFields.length > 0 ? (
              <p className="text-[11px] text-red-100">
                Complete: <span className="text-white font-semibold">{missingProfileFields.slice(0, 2).join(", ")}</span>
                {missingProfileFields.length > 2 && ` +${missingProfileFields.length - 2} more`}
              </p>
            ) : (
              <p className="text-[11px] text-emerald-200 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Your profile is 100% complete!</span>
              </p>
            )}

            <Link
              href="/student/profile"
              className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-yellow-200 transition-colors pt-1"
            >
              <span>Update Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Ambient decorative glow */}
        <div className="absolute -right-12 -bottom-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          href="/student/shortlist/colleges"
          className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md hover:border-red-200 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Shortlisted Colleges</span>
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 group-hover:scale-110 transition-transform">
              <BookmarkCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {shortlistedCollegesCount}
            </span>
            <span className="text-xs font-semibold text-primary flex items-center gap-0.5 group-hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        <Link
          href="/student/shortlist/courses"
          className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md hover:border-red-200 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Saved Courses</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {shortlistedCoursesCount}
            </span>
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-0.5 group-hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        <Link
          href="/student/enquiries"
          className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md hover:border-red-200 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Active Enquiries</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {activeEnquiriesCount}
            </span>
            <span className="text-xs font-semibold text-purple-600 flex items-center gap-0.5 group-hover:underline">
              Track <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        <Link
          href="/student/applications"
          className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md hover:border-red-200 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Applications</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {applicationsInProgressCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5 group-hover:underline">
              Track <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* 3. Recommended Next Steps */}
      {recommendedSteps.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Recommended Actions
              </h2>
              <p className="text-xs text-gray-500">
                Complete these steps to speed up counselling and admission processing
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedSteps.map((step, idx) => (
              <Link
                key={idx}
                href={step.href}
                className="bg-white rounded-2xl p-5 border border-gray-200/80 hover:border-primary shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-md">
                      Step {idx + 1}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-semibold text-primary">
                  <span>Take action</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 4. Active Enquiries & Recent Shortlists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enquiries Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-gray-900">My Recent Enquiries</h2>
            </div>
            <Link
              href="/student/enquiries"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {recentEnquiries && recentEnquiries.length > 0 ? (
            <div className="space-y-3">
              {recentEnquiries.slice(0, 4).map((enq) => (
                <Link
                  key={enq.id}
                  href={`/student/enquiries/${enq.id}`}
                  className="p-3.5 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/20 transition-all flex items-start justify-between gap-3 block group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 group-hover:text-primary truncate">
                      {enq.college?.name || "General Admission Counselling"}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {enq.course?.name || "Multiple Courses Enquiry"}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Submitted on {new Date(enq.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-700 capitalize shrink-0">
                    {enq.status.replace("_", " ")}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-gray-500">You haven't submitted any admission enquiries yet.</p>
              <Link href="/student/enquiries">
                <Button variant="secondary" size="sm" className="mt-2 text-xs">
                  Submit Admission Query
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Shortlisted Colleges Preview */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-gray-900">Saved Colleges</h2>
            </div>
            <Link
              href="/student/shortlist/colleges"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {recentShortlists && recentShortlists.length > 0 ? (
            <div className="space-y-3">
              {recentShortlists.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-gray-100 flex items-center justify-between gap-3 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.college?.logo_url ? (
                      <img
                        src={item.college.logo_url}
                        alt={item.college.name}
                        className="w-10 h-10 rounded-lg object-contain border border-gray-100 p-0.5 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs shrink-0">
                        {item.college?.name?.charAt(0) || "C"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {item.college?.name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {item.college?.city}, {item.college?.state}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/student/shortlist/colleges`}
                    className="p-2 text-gray-400 hover:text-primary rounded-lg transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-gray-500">You haven't saved any colleges to your shortlist yet.</p>
              <Link href="/">
                <Button variant="secondary" size="sm" className="mt-2 text-xs">
                  Discover Colleges
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
