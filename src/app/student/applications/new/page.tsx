import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ApplicationWizard } from "@/components/student/application-wizard";
import { ArrowLeft } from "lucide-react";

interface NewApplicationPageProps {
  searchParams: Promise<{ draftId?: string; collegeId?: string; courseId?: string }>;
}

export default async function NewApplicationPage({ searchParams }: NewApplicationPageProps) {
  const user = await requireAuth();
  const supabase = await createClient();
  const params = await searchParams;

  // Load published colleges and offered courses
  const [collegesRes, coursesRes, profileRes, academicsRes] = await Promise.all([
    supabase
      .from("colleges")
      .select("id, name, slug, logo_url, city, state, college_type, average_placement")
      .eq("publication_status", "published")
      .order("name", { ascending: true }),
    supabase
      .from("college_courses")
      .select(
        `
        id,
        college_id,
        course_id,
        course_name_override,
        course:courses(id, name, slug, stream, degree_type, duration_years, eligibility_criteria)
      `
      ),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("student_academics").select("*").eq("student_id", user.id).maybeSingle(),
  ]);

  let existingDraft: any = null;
  if (params.draftId) {
    const { data: draftData } = await supabase
      .from("applications")
      .select("*, documents:application_documents(*)")
      .eq("id", params.draftId)
      .eq("student_id", user.id)
      .maybeSingle();

    existingDraft = draftData;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <Link
          href="/student/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">University Application Wizard</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Complete your college admission application in 7 simple steps. You can save your draft and return anytime.
        </p>
      </div>

      <ApplicationWizard
        colleges={collegesRes.data || []}
        collegeCourses={coursesRes.data || []}
        initialProfile={profileRes.data}
        initialAcademics={academicsRes.data}
        existingDraft={existingDraft}
      />
    </div>
  );
}
