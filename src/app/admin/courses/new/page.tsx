import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { CourseForm } from "@/components/crm/course-form";

export const metadata = {
  title: "Add New Course | Aspirant Vision Admin",
  description: "Create and publish a new course program to the discovery portal",
};

export default async function NewCoursePage() {
  await requireAdmin("/admin/login");

  return (
    <div className="max-w-6xl mx-auto">
      <CourseForm mode="create" />
    </div>
  );
}
