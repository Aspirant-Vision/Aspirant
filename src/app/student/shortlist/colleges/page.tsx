import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { getStudentShortlistsAction } from "@/lib/student/actions";
import { CollegeShortlistCard } from "@/components/student/shortlist-card-college";
import { BookmarkCheck, Search, Building2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function StudentShortlistCollegesPage() {
  await requireAuth();
  const res = await getStudentShortlistsAction("colleges");
  const colleges = (res.success && res.data ? res.data : []) || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Saved Colleges</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Colleges you've marked for admission shortlisting, counselling discussions, and comparisons.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <Link
            href="/student/shortlist/colleges"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-900 shadow-xs flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span>Colleges ({colleges.length})</span>
          </Link>
          <Link
            href="/student/shortlist/courses"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Courses</span>
          </Link>
        </div>
      </div>

      {/* Grid or Empty State */}
      {colleges.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleges.map((item) => (
            <CollegeShortlistCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-red-50 text-primary rounded-2xl mx-auto flex items-center justify-center border border-red-100">
            <BookmarkCheck className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-gray-900">No Colleges in Shortlist</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Browse our catalog of verified universities and click the bookmark button to save institutions to your shortlist.
          </p>

          <div className="pt-2">
            <Link href="/" target="_blank">
              <Button variant="primary" size="sm" className="text-xs">
                <Search className="w-3.5 h-3.5 mr-1.5" />
                <span>Explore Verified Colleges</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
