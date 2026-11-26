import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getCourseByIdAction, getCollegesForCourseAction } from "@/lib/course/actions";
import { CollegeCourseModal } from "@/components/crm/college-course-modal";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  FileCheck,
  Edit,
  ExternalLink,
  Layers,
  Star,
  Trash2,
} from "lucide-react";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CourseDetailPageProps) {
  const { id } = await params;
  const res = await getCourseByIdAction(id);
  return {
    title: res.success ? `${res.data.name} | Aspirant Vision Admin` : "Course Details",
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  await requireAuth("/admin/login");

  const { id } = await params;
  const [courseRes, collegesRes] = await Promise.all([
    getCourseByIdAction(id),
    getCollegesForCourseAction(id),
  ]);

  if (!courseRes.success || !courseRes.data) {
    notFound();
  }

  const course = courseRes.data;
  const associatedColleges: any[] = (collegesRes.success && collegesRes.data ? collegesRes.data : []) || [];

  // Fetch all colleges for association dropdown
  const supabase = await createClient();
  const { data: allColleges } = await supabase
    .from("colleges")
    .select("id, name, city, state")
    .order("name", { ascending: true });

  const isPublished = course.publication_status === "published";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{course.name}</h1>
              {course.is_featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Featured
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
              <span className="font-semibold text-gray-700">{course.degree_type}</span>
              <span>•</span>
              <span>Category: {course.category}</span>
              <span>•</span>
              <span className="font-mono text-gray-400">/{course.slug}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPublished && (
            <Link href={`/courses/${course.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                <span>View Public Page</span>
              </Button>
            </Link>
          )}

          <Link href={`/admin/courses/${course.id}/edit`}>
            <Button size="sm" className="text-xs bg-[#E31E2B] hover:bg-[#c91824] text-white">
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              <span>Edit Course</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 mb-1">Duration</div>
          <div className="text-lg font-bold text-gray-900">
            {course.duration} {course.duration_unit}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 mb-1">Study Mode</div>
          <div className="text-lg font-bold text-gray-900 uppercase">
            {course.study_mode?.replace("_", " ")}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 mb-1">Academic Level</div>
          <div className="text-lg font-bold text-gray-900 uppercase">
            {course.level}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 mb-1">Offering Colleges</div>
          <div className="text-lg font-bold text-blue-600">
            {associatedColleges.length} Campuses
          </div>
        </div>
      </div>

      {/* 3. DETAILS & ASSOCIATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Associated Colleges Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#E31E2B]" />
                <h2 className="text-sm font-bold text-gray-900">
                  Institutions Offering This Program ({associatedColleges.length})
                </h2>
              </div>

              <CollegeCourseModal
                courseId={course.id}
                courseName={course.name}
                availableColleges={allColleges || []}
                onAssociated={() => {}}
              />
            </div>

            {associatedColleges.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-gray-600">No colleges associated yet</p>
                <p className="mt-1">Link colleges that offer this curriculum.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {associatedColleges.map((assoc: any) => (
                  <div key={assoc.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <Link
                        href={`/admin/colleges/${assoc.colleges?.id}`}
                        className="font-bold text-xs text-gray-900 hover:text-[#E31E2B]"
                      >
                        {assoc.colleges?.name}
                      </Link>
                      <div className="text-[11px] text-gray-500">
                        {assoc.colleges?.city}, {assoc.colleges?.state} • Intake: {assoc.intake_capacity || "Standard"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/admin/fees/new`}>
                        <Button variant="outline" size="sm" className="text-[11px] h-7 px-2">
                          + Add Fee
                        </Button>
                      </Link>

                      <Link href={`/admin/colleges/${assoc.colleges?.id}`}>
                        <Button variant="outline" size="sm" className="text-[11px] h-7 px-2">
                          View College
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Curriculum & Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#E31E2B]" /> Course Overview
            </h3>
            {course.short_description && (
              <p className="p-3 rounded-lg bg-gray-50 border border-gray-200 font-medium text-gray-700">
                {course.short_description}
              </p>
            )}
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {course.description || "No full description entered."}
            </p>
          </div>
        </div>

        {/* Right Column (1 col) */}
        <div className="space-y-6">
          {/* Eligibility & Exams */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#E31E2B]" /> Eligibility Overview
            </h3>
            <div>
              <span className="font-semibold text-gray-700 block">Min. Qualification</span>
              <span className="text-gray-600">{course.min_qualification || "10+2 or equivalent"}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 block">Minimum Marks</span>
              <span className="text-gray-600">
                {course.min_percentage ? `${course.min_percentage}% aggregate` : "Passing grade"}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 block">Required Subjects</span>
              <span className="text-gray-600">{course.required_subjects || "Not specified"}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 block">Accepted Entrance Exams</span>
              <span className="text-gray-600 font-medium">{course.entrance_exam_information || "National & State CETs"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
