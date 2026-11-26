import React from "react";
import { requireAuth } from "@/lib/auth/session";
import { getStudentPreferencesAction } from "@/lib/student/actions";
import { PreferencesForm } from "@/components/student/preferences-form";

export default async function StudentPreferencesPage() {
  await requireAuth();
  const prefRes = await getStudentPreferencesAction();

  const initialData = prefRes.success && prefRes.data ? {
    preferredStudyLevel: prefRes.data.preferred_study_level,
    preferredStream: prefRes.data.preferred_stream,
    preferredSpecialization: prefRes.data.preferred_specialization,
    preferredCollegeType: prefRes.data.preferred_college_type,
    preferredStudyMode: prefRes.data.preferred_study_mode,
    preferredState: prefRes.data.preferred_state,
    preferredCity: prefRes.data.preferred_city,
    budgetMin: prefRes.data.budget_min ? Number(prefRes.data.budget_min) : null,
    budgetMax: prefRes.data.budget_max ? Number(prefRes.data.budget_max) : null,
    preferredAdmissionYear: prefRes.data.preferred_admission_year,
    entranceExamPreference: prefRes.data.entrance_exam_preference,
  } : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admission Preferences</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Specify your ideal degree, target location, and annual tuition budget so counsellors can recommend matching colleges and scholarships.
        </p>
      </div>

      {/* Main Preferences Form */}
      <PreferencesForm initialData={initialData} />
    </div>
  );
}
