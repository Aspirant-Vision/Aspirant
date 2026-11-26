"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  reviewApplicationAction,
  verifyApplicationDocumentAction,
  confirmAdmissionAction,
  getSignedDocumentUrlAction,
} from "@/lib/applications/actions";
import { DOCUMENT_TYPE_LABELS, DocumentType } from "@/lib/validation/application";
import { Button } from "@/components/ui/button";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Award,
  Send,
  Loader2,
  ArrowLeft,
  UserCheck,
  FileText,
  Building2,
  ChevronRight,
} from "lucide-react";

interface ApplicationReviewWorkspaceProps {
  application: any;
  counsellors: Array<{ id: string; full_name: string }>;
}

export function ApplicationReviewWorkspace({
  application,
  counsellors,
}: ApplicationReviewWorkspaceProps) {
  const router = useRouter();
  const [app, setApp] = useState(application);
  const [reviewNotes, setReviewNotes] = useState(application.review_notes || "");
  const [decisionReason, setDecisionReason] = useState(application.decision_reason || "");
  const [forwardedTo, setForwardedTo] = useState(application.forwarded_to || "University Central Admission Cell");
  const [selectedCounsellorId, setSelectedCounsellorId] = useState(application.assigned_counsellor_id || "");
  const [academicYear, setAcademicYear] = useState(application.academic_year || "2026-27");

  // Document verification modal / rejection state
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [docRejectionReason, setDocRejectionReason] = useState("");

  // Loading & Feedback
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Status transition handler
  const handleStatusAction = async (action: any) => {
    try {
      setIsProcessingAction(true);
      setStatusMessage(null);

      const res = await reviewApplicationAction(app.id, {
        action,
        assignedCounsellorId: selectedCounsellorId,
        reviewNotes,
        decisionReason: action === "reject" || action === "request_documents" ? decisionReason : undefined,
        forwardedTo: action === "forward" ? forwardedTo : undefined,
      });

      if (!res.success) {
        setStatusMessage({
          type: "error",
          text: res.error.message || "Failed to update application status",
        });
        return;
      }

      setApp((prev: any) => ({ ...prev, application_status: res.data.newStatus }));
      setStatusMessage({
        type: "success",
        text: `Application status transitioned to ${res.data.newStatus.replace(/_/g, " ")}. Notification sent to student!`,
      });
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Action failed" });
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Document verification toggle
  const handleVerifyDocument = async (docId: string, status: "verified" | "rejected", reason?: string) => {
    try {
      setIsProcessingAction(true);
      setStatusMessage(null);

      const res = await verifyApplicationDocumentAction({
        documentId: docId,
        verificationStatus: status,
        rejectionReason: reason,
      });

      if (res.success) {
        setApp((prev: any) => ({
          ...prev,
          documents: prev.documents.map((d: any) =>
            d.id === docId
              ? {
                  ...d,
                  verification_status: status,
                  rejection_reason: status === "rejected" ? reason : null,
                  verified_at: new Date().toISOString(),
                }
              : d
          ),
        }));
        setRejectingDocId(null);
        setDocRejectionReason("");
        setStatusMessage({
          type: "success",
          text: `Document marked as ${status}.`,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error?.message || "Failed to verify document",
        });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Verification failed" });
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Confirm Admission & Allot Seat
  const handleConfirmAdmission = async () => {
    try {
      setIsProcessingAction(true);
      setStatusMessage(null);

      const res = await confirmAdmissionAction({
        applicationId: app.id,
        academicYear,
        remarks: reviewNotes,
      });

      if (!res.success) {
        setStatusMessage({
          type: "error",
          text: res.error.message || "Failed to confirm admission",
        });
        return;
      }

      setApp((prev: any) => ({
        ...prev,
        application_status: "accepted",
        admission: {
          id: res.data.admissionId,
          admission_reference: res.data.admissionReference,
          academic_year: academicYear,
        },
      }));
      setStatusMessage({
        type: "success",
        text: `Admission successfully confirmed! Reference #${res.data.admissionReference} issued.`,
      });
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Failed to confirm admission" });
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Safe preview URL handler
  const handlePreviewDocument = async (storagePath: string) => {
    try {
      setPreviewLoading(storagePath);
      const res = await getSignedDocumentUrlAction(storagePath);
      if (res.success && res.data?.signedUrl) {
        window.open(res.data.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        setStatusMessage({ type: "error", text: "Unable to generate document signed preview URL." });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Failed to open document" });
    } finally {
      setPreviewLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status Bar */}
      <div>
        <Link
          href={`/admin/applications/${app.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Application Overview</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Application Review Workspace</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Applicant: <span className="font-bold text-gray-900">{app.personal_details?.fullName}</span> • Ref:{" "}
              <span className="font-mono font-bold text-primary">{app.application_number}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                app.application_status === "accepted"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : app.application_status === "documents_required"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              Current Status: {app.application_status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Confirmed Admission Banner if present */}
      {app.admission && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4 text-emerald-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm">Admission Confirmed & Seat Allotted</p>
              <p className="text-xs text-emerald-700">
                Official Allotment Reference: <span className="font-mono font-bold">{app.admission.admission_reference}</span> • Session {app.admission.academic_year}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Documents Verification + Dossier Snapshot */}
        <div className="lg:col-span-8 space-y-6">
          {/* Document Verification Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Document Verification Queue</h2>
                <p className="text-xs text-gray-500">
                  Inspect attached transcripts and certify authenticity before forwarding.
                </p>
              </div>
            </div>

            {app.documents && app.documents.length > 0 ? (
              <div className="space-y-3">
                {app.documents.map((doc: any) => {
                  const isPreviewing = previewLoading === doc.storage_path;
                  const isRejecting = rejectingDocId === doc.id;

                  return (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        doc.verification_status === "verified"
                          ? "bg-emerald-50/20 border-emerald-200"
                          : doc.verification_status === "rejected"
                          ? "bg-red-50/20 border-red-200"
                          : "bg-gray-50/60 border-gray-200/80"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900">
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
                        </div>

                        {/* Document Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isPreviewing}
                            onClick={() => handlePreviewDocument(doc.storage_path)}
                            className="text-xs"
                          >
                            {isPreviewing ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                <span>Preview</span>
                              </>
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={isProcessingAction || doc.verification_status === "verified"}
                            onClick={() => handleVerifyDocument(doc.id, "verified")}
                            className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            <span>Verify</span>
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isProcessingAction || doc.verification_status === "rejected"}
                            onClick={() => {
                              setRejectingDocId(doc.id);
                              setDocRejectionReason(doc.rejection_reason || "");
                            }}
                            className="text-xs text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            <span>Reject</span>
                          </Button>
                        </div>
                      </div>

                      {/* Document Rejection Prompt Drawer */}
                      {isRejecting && (
                        <div className="p-3 bg-white rounded-xl border border-red-200 space-y-2">
                          <label className="text-[11px] font-bold text-red-700 block">
                            Specify Rejection / Replacement Reason for Student
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Unreadable scan / Missing official stamp / Incorrect session mark-sheet"
                            value={docRejectionReason}
                            onChange={(e) => setDocRejectionReason(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                          />
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setRejectingDocId(null)}
                              className="text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              disabled={isProcessingAction}
                              onClick={() => handleVerifyDocument(doc.id, "rejected", docRejectionReason)}
                              className="text-xs bg-red-600 hover:bg-red-700"
                            >
                              Confirm Rejection
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-4 text-center">
                No documents uploaded by applicant for verification yet.
              </p>
            )}
          </div>

          {/* Academic & Target Program Dossier */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              Academic Eligibility Evaluation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-gray-50 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Target Program & College
                </span>
                <p className="font-bold text-gray-900">{app.college?.name}</p>
                <p className="text-primary font-semibold">
                  {app.college_course?.course_name_override || app.college_course?.course?.name}
                </p>
                <p className="text-gray-500">
                  Eligibility Criteria: {app.college_course?.course?.eligibility_criteria || "Standard Merit"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Applicant Score & Merit
                </span>
                <p className="font-bold text-gray-900">
                  {app.academic_details?.highestQualification} ({app.academic_details?.passingYear})
                </p>
                <p className="text-emerald-700 font-bold text-sm">
                  Qualifying Percentage: {app.academic_details?.percentageOrCgpa}%
                </p>
                {app.academic_details?.entranceExamName && (
                  <p className="text-gray-700 font-semibold">
                    {app.academic_details.entranceExamName}: {app.academic_details.entranceExamScore}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Status Machine Controls & Staff Notes */}
        <div className="lg:col-span-4 space-y-6">
          {/* Action Decision Control Box */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
              Application Actions & Workflow
            </h2>

            {/* Counsellor Assignment Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Assign Reviewing Counsellor</label>
              <select
                value={selectedCounsellorId}
                onChange={(e) => setSelectedCounsellorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
              >
                <option value="">Unassigned</option>
                {counsellors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Trigger Buttons */}
            <div className="space-y-2 pt-2">
              {/* Start Review */}
              {app.application_status === "submitted" && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={isProcessingAction}
                  onClick={() => handleStatusAction("start_review")}
                  className="w-full text-xs"
                >
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  <span>Start Review (Mark In Progress)</span>
                </Button>
              )}

              {/* Request Missing Documents */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isProcessingAction}
                onClick={() => handleStatusAction("request_documents")}
                className="w-full text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
              >
                <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                <span>Request Documents from Student</span>
              </Button>

              {/* Mark Verified */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isProcessingAction}
                onClick={() => handleStatusAction("mark_verified")}
                className="w-full text-xs bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Mark Dossier Verified</span>
              </Button>

              {/* Forward to University */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isProcessingAction}
                onClick={() => handleStatusAction("forward")}
                className="w-full text-xs bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>Forward to University Admission Desk</span>
              </Button>

              {/* Accept & Confirm Admission */}
              {!app.admission && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={isProcessingAction}
                  onClick={handleConfirmAdmission}
                  className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 font-bold"
                >
                  <Award className="w-3.5 h-3.5 mr-1.5" />
                  <span>Confirm Admission & Allot Seat</span>
                </Button>
              )}

              {/* Waitlist */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isProcessingAction}
                onClick={() => handleStatusAction("waitlist")}
                className="w-full text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                <span>Place on Waiting List</span>
              </Button>

              {/* Reject */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isProcessingAction}
                onClick={() => handleStatusAction("reject")}
                className="w-full text-xs text-red-600 hover:bg-red-50"
              >
                <span>Reject Application</span>
              </Button>
            </div>

            {/* Decision Reason Input */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-700">
                Decision Remarks / Student-Visible Feedback
              </label>
              <textarea
                rows={3}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Reason for rejection, waitlist notes, or specific documents requested from applicant..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Internal Staff Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Internal Staff Review Notes (Private)
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Private counsellor observations, committee remarks..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
