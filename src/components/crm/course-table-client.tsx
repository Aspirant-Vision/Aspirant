"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  GraduationCap,
  Building2,
  ExternalLink,
  Edit,
  Eye,
  Star,
  Archive,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Globe2,
} from "lucide-react";
import {
  CourseRow,
  getCoursesListingAction,
  togglePublishCourseAction,
  toggleFeaturedCourseAction,
  archiveCourseAction,
  restoreCourseAction,
} from "@/lib/course/actions";
import { COURSE_CATEGORIES, DEGREE_TYPES } from "@/lib/validation/course";
import { Button } from "@/components/ui/button";

interface CourseTableClientProps {
  initialCourses: (CourseRow & { college_courses?: { count: number }[] })[];
  initialTotal: number;
}

export function CourseTableClient({ initialCourses, initialTotal }: CourseTableClientProps) {
  const [isPending, startTransition] = useTransition();

  const [courses, setCourses] = useState<any[]>(initialCourses);
  const [totalCount, setTotalCount] = useState<number>(initialTotal);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [degreeType, setDegreeType] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"updated_at" | "name" | "created_at">("updated_at");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const fetchFilteredData = (
    newSearch = search,
    newCategory = category,
    newDegree = degreeType,
    newStatus = status,
    newSort = sortBy,
    newPage = page
  ) => {
    startTransition(async () => {
      const res = await getCoursesListingAction({
        search: newSearch,
        category: newCategory,
        degreeType: newDegree,
        status: newStatus,
        sortBy: newSort,
        page: newPage,
        pageSize,
      });

      if (res.success) {
        setCourses(res.data.courses);
        setTotalCount(res.data.totalCount);
        setPage(res.data.page);
      } else {
        setActionFeedback({ type: "error", message: res.error.message });
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFilteredData(search, category, degreeType, status, sortBy, 1);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    fetchFilteredData(search, category, degreeType, newStatus, sortBy, 1);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    fetchFilteredData(search, newCategory, degreeType, status, sortBy, 1);
  };

  const handleDegreeChange = (newDegree: string) => {
    setDegreeType(newDegree);
    fetchFilteredData(search, category, newDegree, status, sortBy, 1);
  };

  const handleSortChange = (newSort: "updated_at" | "name" | "created_at") => {
    setSortBy(newSort);
    fetchFilteredData(search, category, degreeType, status, newSort, 1);
  };

  const handlePageChange = (newPage: number) => {
    fetchFilteredData(search, category, degreeType, status, sortBy, newPage);
  };

  const handleTogglePublish = async (course: any) => {
    const willPublish = course.publication_status !== "published";
    try {
      setActiveActionId(course.id);
      setActionFeedback(null);
      const res = await togglePublishCourseAction(course.id, willPublish);
      if (!res.success) {
        setActionFeedback({ type: "error", message: res.error.message });
      } else {
        setActionFeedback({
          type: "success",
          message: willPublish ? `"${course.name}" is now live!` : `"${course.name}" moved to draft.`,
        });
        fetchFilteredData();
      }
    } catch {
      setActionFeedback({ type: "error", message: "Failed to update publication status." });
    } finally {
      setActiveActionId(null);
    }
  };

  const handleToggleFeatured = async (course: any) => {
    const nextFeatured = !course.is_featured;
    try {
      setActiveActionId(course.id);
      setActionFeedback(null);
      const res = await toggleFeaturedCourseAction(course.id, nextFeatured);
      if (!res.success) {
        setActionFeedback({ type: "error", message: res.error.message });
      } else {
        setActionFeedback({
          type: "success",
          message: nextFeatured ? `"${course.name}" marked as featured!` : `"${course.name}" unfeatured.`,
        });
        fetchFilteredData();
      }
    } catch {
      setActionFeedback({ type: "error", message: "Failed to update featured state." });
    } finally {
      setActiveActionId(null);
    }
  };

  const handleArchive = async (course: any) => {
    if (!confirm(`Are you sure you want to archive "${course.name}"?`)) return;
    try {
      setActiveActionId(course.id);
      setActionFeedback(null);
      const res = await archiveCourseAction(course.id);
      if (!res.success) {
        setActionFeedback({ type: "error", message: res.error.message });
      } else {
        setActionFeedback({ type: "success", message: `"${course.name}" archived.` });
        fetchFilteredData();
      }
    } catch {
      setActionFeedback({ type: "error", message: "Failed to archive course." });
    } finally {
      setActiveActionId(null);
    }
  };

  const handleRestore = async (course: any) => {
    try {
      setActiveActionId(course.id);
      setActionFeedback(null);
      const res = await restoreCourseAction(course.id);
      if (!res.success) {
        setActionFeedback({ type: "error", message: res.error.message });
      } else {
        setActionFeedback({ type: "success", message: `"${course.name}" restored to draft.` });
        fetchFilteredData();
      }
    } catch {
      setActionFeedback({ type: "error", message: "Failed to restore course." });
    } finally {
      setActiveActionId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-4">
      {actionFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            actionFeedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-gray-400 hover:text-gray-600 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by title, code or specialization..."
              className="w-full pl-9 pr-20 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-xs h-7 px-2.5 text-[#E31E2B] font-semibold"
            >
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              <option value="all">All Categories</option>
              {COURSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={degreeType}
              onChange={(e) => handleDegreeChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              <option value="all">All Degrees</option>
              {DEGREE_TYPES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              <option value="updated_at">Recently Updated</option>
              <option value="name">Name (A-Z)</option>
              <option value="created_at">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Status Tab Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {[
            { id: "all", label: "All Courses" },
            { id: "published", label: "Published (Live)" },
            { id: "draft", label: "Drafts" },
            { id: "archived", label: "Archived" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleStatusChange(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                status === tab.id ? "bg-[#15182D] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* COURSES TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {isPending && (
          <div className="h-1 bg-red-100 overflow-hidden">
            <div className="h-full bg-[#E31E2B] animate-pulse w-full" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Course & Degree</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Duration & Mode</th>
                <th className="px-3 py-3">Colleges</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Featured</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-gray-600">No courses found</p>
                    <p className="text-xs text-gray-400 mt-1">Adjust filters or create a new course curriculum.</p>
                  </td>
                </tr>
              ) : (
                courses.map((course) => {
                  const isActionLoading = activeActionId === course.id;
                  const isPublished = course.publication_status === "published";
                  const isArchived = course.publication_status === "archived";
                  const collegeCount = course.college_courses?.[0]?.count ?? 0;

                  return (
                    <tr key={course.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <Link
                            href={`/admin/courses/${course.id}`}
                            className="font-bold text-gray-900 hover:text-[#E31E2B] transition-colors truncate block max-w-xs sm:max-w-md"
                          >
                            {course.name}
                          </Link>
                          <div className="flex items-center gap-2 text-gray-400 text-[11px] mt-0.5">
                            <span className="font-semibold text-gray-700">{course.degree_type}</span>
                            {course.code && <span>• Code: {course.code}</span>}
                            <span>• /{course.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <span className="font-medium text-gray-900">{course.category || "General"}</span>
                        {course.stream && <span className="block text-[10px] text-gray-400">{course.stream}</span>}
                      </td>

                      <td className="px-3 py-3">
                        <span className="font-medium text-gray-800">
                          {course.duration} {course.duration_unit}
                        </span>
                        <span className="block text-[10px] text-gray-400 uppercase">
                          {course.study_mode?.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
                        >
                          <Building2 className="w-3 h-3" />
                          <span>{collegeCount} Colleges</span>
                        </Link>
                      </td>

                      <td className="px-3 py-3">
                        {course.publication_status === "published" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
                          </span>
                        )}
                        {course.publication_status === "draft" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Draft
                          </span>
                        )}
                        {course.publication_status === "archived" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                            Archived
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(course)}
                          disabled={isActionLoading}
                          className={`p-1.5 rounded-lg transition-colors ${
                            course.is_featured ? "text-amber-500 hover:bg-amber-50" : "text-gray-300 hover:text-amber-400"
                          }`}
                        >
                          <Star className={`w-4 h-4 ${course.is_featured ? "fill-amber-400" : ""}`} />
                        </button>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isActionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <>
                              {isPublished && (
                                <Link
                                  href={`/courses/${course.slug}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#E31E2B] hover:bg-gray-100"
                                  title="View Public Page"
                                >
                                  <Globe2 className="w-3.5 h-3.5" />
                                </Link>
                              )}

                              <Link
                                href={`/admin/courses/${course.id}`}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                title="View Course Details & Associated Colleges"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>

                              <Link
                                href={`/admin/courses/${course.id}/edit`}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                title="Edit Course"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Link>

                              {!isArchived && (
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublish(course)}
                                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                                    isPublished
                                      ? "text-amber-700 hover:bg-amber-50 border border-amber-200"
                                      : "text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                                  }`}
                                >
                                  {isPublished ? "Unpublish" : "Publish"}
                                </button>
                              )}

                              {isArchived ? (
                                <button
                                  type="button"
                                  onClick={() => handleRestore(course)}
                                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                                  title="Restore to Draft"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleArchive(course)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  title="Archive Course"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div>
            Showing <span className="font-semibold text-gray-800">{totalCount === 0 ? 0 : (page - 1) * pageSize + 1}</span>{" "}
            to <span className="font-semibold text-gray-800">{Math.min(page * pageSize, totalCount)}</span> of{" "}
            <span className="font-semibold text-gray-800">{totalCount}</span> courses
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => handlePageChange(page - 1)}
              className="h-7 text-xs px-2"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
            </Button>
            <span className="px-2 font-medium text-gray-700">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              onClick={() => handlePageChange(page + 1)}
              className="h-7 text-xs px-2"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
