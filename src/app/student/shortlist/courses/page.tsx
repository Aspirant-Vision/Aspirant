import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { getStudentShortlistsAction } from "@/lib/student/actions";
import { CourseShortlistCard } from "@/components/student/shortlist-card-course";
import { BookmarkCheck, Search, Building2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function StudentShortlistCoursesPage() {
  await requireAuth();
  const res = await getStudentShortlistsAction("courses");
  const courses = (res.success && res.data ? res.data : []) || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Saved Courses</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Undergraduate, postgraduate, and diploma degrees you have shortlisted for your academic career.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <Link
            href="/student/shortlist/colleges"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Colleges</span>
          </Link>
          <Link
            href="/student/shortlist/courses"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-900 shadow-xs flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>Courses ({courses.length})</span>
          </Link>
        </div>
      </div>

      {/* Grid or Empty State */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((item) => (
            <CourseShortlistCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center border border-blue-100">
            <BookOpen className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-gray-900">No Courses in Shortlist</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Search our extensive directory of degrees and save courses matching your career ambitions.
          </p>

          <div className="pt-2">
            <Link href="/" target="_blank">
              <Button variant="primary" size="sm" className="text-xs">
                <Search className="w-3.5 h-3.5 mr-1.5" />
                <span>Explore Available Courses</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
