import React from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getCollegeByIdAction } from "@/lib/college/actions";
import { CollegeForm } from "@/components/crm/college-form";

interface EditCollegePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditCollegePageProps) {
  const { id } = await params;
  const res = await getCollegeByIdAction(id);
  return {
    title: res.success ? `Edit ${res.data.name} | Aspirant Vision Admin` : "Edit College",
  };
}

export default async function EditCollegePage({ params }: EditCollegePageProps) {
  await requireAdmin("/admin/login");

  const { id } = await params;
  const res = await getCollegeByIdAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <CollegeForm mode="edit" initialData={res.data} />
    </div>
  );
}
