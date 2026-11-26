import React from "react";
import { requireAdmin } from "@/lib/auth/session";
import { CollegeForm } from "@/components/crm/college-form";

export const metadata = {
  title: "Add New College | Aspirant Vision Admin",
  description: "Create and publish a new institution to the discovery platform",
};

export default async function NewCollegePage() {
  await requireAdmin("/admin/login");

  return (
    <div className="max-w-6xl mx-auto">
      <CollegeForm mode="create" />
    </div>
  );
}
