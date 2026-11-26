"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  uploadApplicationDocumentAction,
  deleteApplicationDocumentDraftAction,
  getSignedDocumentUrlAction,
} from "@/lib/applications/actions";
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, DocumentType } from "@/lib/validation/application";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  ExternalLink,
  Loader2,
  ArrowLeft,
  FileCheck2,
} from "lucide-react";

interface ApplicationDocumentsManagerProps {
  applicationId: string;
  applicationNumber: string;
  applicationStatus: string;
  collegeName: string;
  initialDocuments: any[];
}

export function ApplicationDocumentsManager({
  applicationId,
  applicationNumber,
  applicationStatus,
  collegeName,
  initialDocuments,
}: ApplicationDocumentsManagerProps) {
  const [documents, setDocuments] = useState<any[]>(initialDocuments);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isEditable =
    applicationStatus === "draft" || applicationStatus === "documents_required";

  const handleUpload = async (docType: DocumentType, file: File) => {
    setStatusMessage(null);
    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({ type: "error", text: "File size exceeds 10MB limit." });
      return;
    }

    try {
      setUploadingType(docType);
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Authentication required");

      const fileExt = file.name.split(".").pop();
      const storagePath = `${userData.user.id}/${applicationId}/${docType}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("application-documents")
        .upload(storagePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const recordRes = await uploadApplicationDocumentAction({
        applicationId,
        documentType: docType,
        storagePath,
        originalFilename: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type || "application/octet-stream",
      });

      if (recordRes.success) {
        setDocuments((prev) => [
          ...prev.filter((d) => d.document_type !== docType),
          {
            id: recordRes.data?.documentId,
            document_type: docType,
            original_filename: file.name,
            storage_path: storagePath,
            verification_status: "pending",
            rejection_reason: null,
            uploaded_at: new Date().toISOString(),
          },
        ]);
        setStatusMessage({
          type: "success",
          text: `${DOCUMENT_TYPE_LABELS[docType]} uploaded successfully!`,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: recordRes.error?.message || "Failed to record document",
        });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Failed to upload document" });
    } finally {
      setUploadingType(null);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      const res = await deleteApplicationDocumentDraftAction(docId);
      if (res.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        setStatusMessage({ type: "success", text: "Document removed successfully." });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Failed to remove document" });
    }
  };

  const handlePreview = async (storagePath: string) => {
    try {
      setPreviewLoading(storagePath);
      const res = await getSignedDocumentUrlAction(storagePath);
      if (res.success && res.data?.signedUrl) {
        window.open(res.data.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        setStatusMessage({ type: "error", text: "Unable to generate document preview link." });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Failed to open document preview" });
    } finally {
      setPreviewLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <Link
          href={`/student/applications/${applicationId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Application Tracker</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Application Documents Dossier</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {collegeName} • Application #{applicationNumber}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold capitalize border self-start sm:self-auto ${
              applicationStatus === "documents_required"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {applicationStatus.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Status Feedback */}
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

      {/* Documents Grid / Checklist */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm font-bold text-gray-900">Document Checklist & Verification Status</h2>
          <p className="text-xs text-gray-500">
            Files must be legible, untampered, and smaller than 10MB (PDF, PNG, JPG).
          </p>
        </div>

        <div className="space-y-3">
          {DOCUMENT_TYPES.map((docType) => {
            const doc = documents.find((d) => d.document_type === docType);
            const isUploading = uploadingType === docType;
            const isPreviewing = previewLoading === doc?.storage_path;

            return (
              <div
                key={docType}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  doc?.verification_status === "verified"
                    ? "bg-emerald-50/20 border-emerald-200"
                    : doc?.verification_status === "rejected"
                    ? "bg-red-50/20 border-red-200"
                    : "bg-gray-50/50 border-gray-200/80"
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">
                      {DOCUMENT_TYPE_LABELS[docType]}
                    </span>
                    {doc && (
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
                    )}
                  </div>

                  {doc ? (
                    <div>
                      <p className="text-[11px] text-gray-600 truncate">{doc.original_filename}</p>
                      {doc.rejection_reason && (
                        <p className="text-[11px] text-red-600 font-semibold mt-0.5">
                          Reason: {doc.rejection_reason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400">Not uploaded</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {doc && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isPreviewing}
                      onClick={() => handlePreview(doc.storage_path)}
                      className="text-xs text-primary"
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
                  )}

                  {isEditable && (
                    <>
                      <input
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/webp"
                        id={`upload-manage-${docType}`}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(docType, file);
                        }}
                      />
                      <label htmlFor={`upload-manage-${docType}`}>
                        <Button
                          type="button"
                          variant={doc ? "outline" : "secondary"}
                          size="sm"
                          disabled={isUploading}
                          className="text-xs cursor-pointer"
                          onClick={() => document.getElementById(`upload-manage-${docType}`)?.click()}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : doc ? (
                            <>
                              <Upload className="w-3.5 h-3.5 mr-1" />
                              <span>Replace</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 mr-1" />
                              <span>Upload</span>
                            </>
                          )}
                        </Button>
                      </label>

                      {doc && applicationStatus === "draft" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                          className="text-xs text-red-600 hover:bg-red-50 p-1.5"
                          title="Remove draft document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
