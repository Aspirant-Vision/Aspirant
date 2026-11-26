import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getStudentApplicationDetailAction } from "@/lib/applications/actions";
import { DOCUMENT_TYPE_LABELS, DocumentType } from "@/lib/validation/application";
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
  Upload,
  MapPin,
  ExternalLink,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  await requireAuth();
  const { id } = await params;
  const res = await getStudentApplicationDetailAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const app = res.data;

  // Stepper milestones
  const steps = [
    { title: "Draft", key: "draft" },
    { title: "Submitted", key: "submitted" },
    { title: "Under Review", key: "under_review" },
    { title: "Verified", key: "verified" },
    { title: "Forwarded", key: "forwarded" },
    { title: "Decision", key: "accepted" },
  ];

  const getStepState = (stepKey: string) => {
    const order = ["draft", "submitted", "under_review", "documents_required", "verified", "forwarded", "accepted"];
    const currentStatus = app.application_status;

    if (currentStatus === "rejected") {
      if (stepKey === "accepted") return "rejected";
    }
    if (currentStatus === "waitlisted") {
      if (stepKey === "accepted") return "waitlisted";
    }

    const currentIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(stepKey);

    if (currentIdx >= stepIdx) return "completed";
    return "pending";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/student/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Applications</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-6">
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
                Application #{app.application_number}
              </span>
              <h1 className="text-xl font-bold text-gray-900 mt-0.5">{app.college?.name}</h1>
              <p className="text-xs text-gray-500">
                {app.college_course?.course_name_override || app.college_course?.course?.name}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full capitalize border self-start sm:self-auto ${
                app.application_status === "accepted"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : app.application_status === "documents_required"
                  ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {app.application_status.replace(/_/g, " ")}
            </span>
            <span className="text-[11px] text-gray-400">
              Academic Session: {app.academic_year || "2026-27"}
            </span>
          </div>
        </div>

        {/* Stepper Progress Track */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-700">Application Milestone Timeline</span>
          <div className="grid grid-cols-6 gap-2 pt-2">
            {steps.map((st) => {
              const state = getStepState(st.key);
              const isCompleted = state === "completed";
              const isRejected = state === "rejected";
              const isWaitlisted = state === "waitlisted";

              return (
                <div key={st.key} className="space-y-2 text-center">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isRejected
                        ? "bg-red-500"
                        : isWaitlisted
                        ? "bg-amber-500"
                        : isCompleted
                        ? "bg-emerald-500"
                        : "bg-gray-200"
                    }`}
                  />
                  <span
                    className={`text-[10px] sm:text-xs block font-bold capitalize ${
                      isRejected
                        ? "text-red-700 font-black"
                        : isWaitlisted
                        ? "text-amber-700 font-black"
                        : isCompleted
                        ? "text-emerald-700"
                        : "text-gray-400"
                    }`}
                  >
                    {isRejected ? "Rejected" : isWaitlisted ? "Waitlisted" : st.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Alert for Documents Required */}
        {app.application_status === "documents_required" && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-800">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Replacement or Additional Documents Required</span>
              </div>
              <p className="text-[11px] text-red-700">
                {app.decision_reason || "The verification team has requested updated documents to proceed with seat evaluation."}
              </p>
            </div>
            <Link href={`/student/applications/${app.id}/documents`}>
              <Button variant="primary" size="sm" className="text-xs shrink-0">
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                <span>Upload Documents</span>
              </Button>
            </Link>
          </div>
        )}

        {/* Action Alert for Accepted / Admission Confirmed */}
        {app.application_status === "accepted" && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Congratulations! Your admission has been approved.</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Our counsellors and university admission office will coordinate official seat enrollment and reporting schedules.
              </p>
            </div>
          </div>
        )}

        {/* Application Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="space-y-1">
            <span className="text-[11px] text-gray-500 font-medium">Submission Timestamp</span>
            <p className="text-xs font-bold text-gray-900">
              {app.submitted_at ? new Date(app.submitted_at).toLocaleString() : "Draft"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-gray-500 font-medium">Assigned Counsellor</span>
            <p className="text-xs font-bold text-gray-900">
              {app.counsellor?.full_name || "Admission Committee"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-gray-500 font-medium">Documents Attached</span>
            <p className="text-xs font-bold text-gray-900">
              {app.documents?.length || 0} Files Verified / In Review
            </p>
          </div>
        </div>
      </div>

      {/* Submitted Dossier Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Coordinates */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
            Applicant Personal Snapshot
          </h2>
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
              <span className="text-gray-500">Contact Phone:</span>
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
              <span className="text-gray-500">Location:</span>
              <span className="font-semibold text-gray-900">
                {app.personal_details?.city}, {app.personal_details?.state} - {app.personal_details?.pinCode}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Snapshot */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
            Academic Qualifications
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Highest Qualification:</span>
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
              <span className="text-gray-500">Score / Percentage:</span>
              <span className="font-semibold text-emerald-700">{app.academic_details?.percentageOrCgpa}%</span>
            </div>
            {app.academic_details?.entranceExamName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Entrance Score:</span>
                <span className="font-semibold text-gray-900">
                  {app.academic_details.entranceExamName}: {app.academic_details.entranceExamScore}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documents Dossier Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Attached Verification Documents</h2>
            <p className="text-xs text-gray-500">Official transcripts, identity proof, and scorecards</p>
          </div>
          <Link
            href={`/student/applications/${app.id}/documents`}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Manage Documents
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
                {doc.rejection_reason && (
                  <p className="text-[11px] text-red-600 font-semibold">{doc.rejection_reason}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-3">No documents attached.</p>
        )}
      </div>
    </div>
  );
}
