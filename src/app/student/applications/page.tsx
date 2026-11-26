import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { getStudentApplicationsAction } from "@/lib/applications/actions";
import {
  FileText,
  Building2,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function StudentApplicationsPage() {
  await requireAuth();
  const res = await getStudentApplicationsAction();
  const applications = (res.success && res.data ? res.data : []) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "submitted":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "under_review":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "documents_required":
        return "bg-red-50 text-red-700 border-red-200 animate-pulse";
      case "verified":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "forwarded":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "accepted":
        return "bg-emerald-600 text-white border-emerald-600";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "waitlisted":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "withdrawn":
        return "bg-gray-200 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with New Application CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My University Applications</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track admission dossiers, document verification statuses, and university approvals.
          </p>
        </div>

        <Link href="/student/applications/new">
          <Button variant="primary" size="sm" className="text-xs">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Start New Application</span>
          </Button>
        </Link>
      </div>

      {/* Applications List */}
      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app: any) => {
            const isDraft = app.application_status === "draft";
            const isDocsNeeded = app.application_status === "documents_required";

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md hover:border-red-200 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white p-1 border border-gray-100 shrink-0 shadow-xs">
                      {app.college?.logo_url ? (
                        <img
                          src={app.college.logo_url}
                          alt={app.college.name}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-red-100 text-primary font-bold text-base flex items-center justify-center rounded-lg">
                          {app.college?.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        {app.application_number}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900">{app.college?.name}</h3>
                      <p className="text-xs text-gray-500">
                        {app.college_course?.course_name_override ||
                          app.college_course?.course?.name ||
                          "Degree Program"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full border capitalize ${getStatusBadge(
                        app.application_status
                      )}`}
                    >
                      {app.application_status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* If replacement documents needed */}
                {isDocsNeeded && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-xs text-red-800">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{app.decision_reason || "Additional documents or replacements requested by the review team."}</span>
                    </div>
                    <Link
                      href={`/student/applications/${app.id}/documents`}
                      className="font-bold underline shrink-0 hover:text-red-900"
                    >
                      Upload Documents →
                    </Link>
                  </div>
                )}

                {/* Footer Strip */}
                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {isDraft
                          ? `Draft saved on ${new Date(app.updated_at).toLocaleDateString()}`
                          : `Submitted on ${new Date(app.submitted_at || app.created_at).toLocaleDateString()}`}
                      </span>
                    </span>

                    {app.documents && (
                      <span className="text-gray-400">
                        {app.documents.length} document{app.documents.length === 1 ? "" : "s"} attached
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isDraft ? (
                      <Link
                        href={`/student/applications/new?draftId=${app.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        <span>Resume Application</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href={`/student/applications/${app.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        <span>Track Application Status</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-red-50 text-primary rounded-2xl mx-auto flex items-center justify-center border border-red-100">
            <FileText className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-gray-900">No Applications Started Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Ready to secure your admission seat? Launch an application in our easy multi-step wizard, attach documents, and receive real-time counselling reviews.
          </p>

          <div className="pt-2">
            <Link href="/student/applications/new">
              <Button variant="primary" size="sm" className="text-xs">
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Start Your First Application</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
