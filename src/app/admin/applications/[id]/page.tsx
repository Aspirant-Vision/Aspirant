import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getAdminApplicationDetailAction } from "@/lib/applications/actions";
import { DOCUMENT_TYPE_LABELS, DocumentType } from "@/lib/validation/application";
import { PageHeader } from "@/components/crm/page-header";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Building2,
  BookOpen,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ExternalLink,
  ShieldCheck,
  Award,
} from "lucide-react";

interface AdminApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminApplicationDetailPage({
  params,
}: AdminApplicationDetailPageProps) {
  await requireAuth("/admin/login");
  const { id } = await params;
  const res = await getAdminApplicationDetailAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const app = res.data;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Applications", href: "/admin/applications" },
          { label: app.application_number },
        ]}
        title={`Application ${app.application_number}`}
        description={`${app.college?.name} • ${app.college_course?.course_name_override || app.college_course?.course?.name}`}
      >
        <Link href={`/admin/applications/${app.id}/review`}>
          <Button variant="primary" size="sm" className="text-xs">
            <span>Open Review Workspace</span>
          </Button>
        </Link>
      </PageHeader>

      {/* Header Overview Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-gray-100 shadow-xs shrink-0">
              {app.college?.logo_url ? (
                <img
                  src={app.college.logo_url}
                  alt={app.college.name}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-red-100 text-primary font-bold text-xl flex items-center justify-center rounded-xl">
                  {app.college?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Official Reference #{app.application_number}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">{app.college?.name}</h2>
              <p className="text-xs text-gray-500">
                {app.college_course?.course_name_override || app.college_course?.course?.name}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 capitalize border border-blue-200">
              Status: {app.application_status.replace(/_/g, " ")}
            </span>
            <span className="text-[11px] text-gray-400">
              Assigned Staff: {app.counsellor?.full_name || "Unassigned"}
            </span>
          </div>
        </div>

        {/* Staff Review Notes if present */}
        {app.review_notes && (
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 text-xs text-gray-700 space-y-1">
            <span className="font-bold text-gray-900 block">Internal Staff Review Notes</span>
            <p className="leading-relaxed">{app.review_notes}</p>
          </div>
        )}

        {/* Decision Reason if present */}
        {app.decision_reason && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
            <span className="font-bold block">Decision Remarks / Document Request</span>
            <p className="leading-relaxed">{app.decision_reason}</p>
          </div>
        )}
      </div>

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applicant Profile */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
            Applicant Personal Coordinates
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Applicant Name:</span>
              <span className="font-semibold text-gray-900">{app.personal_details?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="font-semibold text-gray-900">{app.personal_details?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mobile Phone:</span>
              <span className="font-semibold text-gray-900">{app.personal_details?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date of Birth:</span>
              <span className="font-semibold text-gray-900">{app.personal_details?.dateOfBirth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gender:</span>
              <span className="font-semibold text-gray-900 capitalize">{app.personal_details?.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Address:</span>
              <span className="font-semibold text-gray-900">
                {app.personal_details?.city}, {app.personal_details?.state} - {app.personal_details?.pinCode}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Qualifications */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
            Academic Performance
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Qualification:</span>
              <span className="font-semibold text-gray-900">{app.academic_details?.highestQualification}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">School / College:</span>
              <span className="font-semibold text-gray-900">{app.academic_details?.institutionName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Board / University:</span>
              <span className="font-semibold text-gray-900">{app.academic_details?.boardOrUniversity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Passing Year:</span>
              <span className="font-semibold text-gray-900">{app.academic_details?.passingYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Percentage / CGPA:</span>
              <span className="font-semibold text-emerald-700">{app.academic_details?.percentageOrCgpa}%</span>
            </div>
            {app.academic_details?.entranceExamName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Competitive Exam:</span>
                <span className="font-semibold text-gray-900">
                  {app.academic_details.entranceExamName} ({app.academic_details.entranceExamScore})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documents Dossier */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Submitted Documents</h3>
            <p className="text-xs text-gray-500">Transcripts and certificates attached by applicant</p>
          </div>
          <Link href={`/admin/applications/${app.id}/review`}>
            <Button variant="secondary" size="sm" className="text-xs">
              Verify Documents
            </Button>
          </Link>
        </div>

        {app.documents && app.documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {app.documents.map((doc: any) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 truncate">
                    {DOCUMENT_TYPE_LABELS[doc.document_type as DocumentType] || doc.document_type}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      doc.verification_status === "verified"
                        ? "bg-emerald-100 text-emerald-800"
                        : doc.verification_status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {doc.verification_status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate">{doc.original_filename}</p>
                {doc.verified_at && (
                  <p className="text-[10px] text-gray-400">
                    Verified on {new Date(doc.verified_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-3">No documents uploaded.</p>
        )}
      </div>
    </div>
  );
}
