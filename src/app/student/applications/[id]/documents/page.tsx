import React from "react";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getStudentApplicationDetailAction } from "@/lib/applications/actions";
import { ApplicationDocumentsManager } from "@/components/student/application-documents-manager";

interface DocumentsPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentApplicationDocumentsPage({
  params,
}: DocumentsPageProps) {
  await requireAuth();
  const { id } = await params;
  const res = await getStudentApplicationDetailAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const app = res.data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ApplicationDocumentsManager
        applicationId={app.id}
        applicationNumber={app.application_number}
        applicationStatus={app.application_status}
        collegeName={app.college?.name || "University"}
        initialDocuments={app.documents || []}
      />
    </div>
  );
}
