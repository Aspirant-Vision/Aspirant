import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { getStudentAcademicsAction } from "@/lib/student/actions";
import { AcademicForm } from "@/components/student/academic-form";

export default async function StudentAcademicDetailsPage() {
  await requireAuth();
  const academicsRes = await getStudentAcademicsAction();

  const initialData = academicsRes.success && academicsRes.data ? {
    educationLevel: academicsRes.data.education_level as any,
    highestQualification: academicsRes.data.highest_qualification,
    institutionName: academicsRes.data.institution_name,
    boardOrUniversity: academicsRes.data.board_or_university,
    passingYear: academicsRes.data.passing_year,
    percentageOrCgpa: academicsRes.data.percentage_or_cgpa ? Number(academicsRes.data.percentage_or_cgpa) : null,
    stream: academicsRes.data.stream,
    entranceExamName: academicsRes.data.entrance_exam_name,
    entranceExamScore: academicsRes.data.entrance_exam_score,
    additionalDetails: academicsRes.data.additional_details,
  } : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Qualifications</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Provide your previous educational records and entrance exam scores to match with college cutoffs and eligibility criteria.
        </p>
      </div>

      {/* Main Academic Form */}
      <AcademicForm initialData={initialData} />
    </div>
  );
}
