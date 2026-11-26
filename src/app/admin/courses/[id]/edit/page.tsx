import React from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getCourseByIdAction } from "@/lib/course/actions";
import { CourseForm } from "@/components/crm/course-form";

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditCoursePageProps) {
  const { id } = await params;
  const res = await getCourseByIdAction(id);
  return {
    title: res.success ? `Edit ${res.data.name} | Aspirant Vision Admin` : "Edit Course",
  };
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  await requireAdmin("/admin/login");

  const { id } = await params;
  const res = await getCourseByIdAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <CourseForm mode="edit" initialData={res.data} />
    </div>
  );
}
