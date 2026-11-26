import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getStudentEnquiryDetailAction } from "@/lib/student/actions";
import {
  MessageSquare,
  Building2,
  BookOpen,
  Calendar,
  Clock,
  ArrowLeft,
  UserCheck,
  Mail,
  Phone,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentEnquiryDetailPage({
  params,
}: EnquiryDetailPageProps) {
  await requireAuth();
  const { id } = await params;
  const res = await getStudentEnquiryDetailAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const { enquiry, visibleActivities, studentFollowUps } = res.data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/student/enquiries"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Enquiries</span>
        </Link>
      </div>

      {/* Header Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Enquiry ID #{enquiry.id.slice(0, 8)}
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">
              {enquiry.colleges?.name || "General Admission Counselling"}
            </h1>
            <p className="text-xs text-gray-500">
              {enquiry.courses?.name || "Multiple / Career Consultation"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 capitalize border border-blue-200">
              Status: {enquiry.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-gray-700">Submitted Query Message</span>
          <p className="text-xs text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
            {enquiry.enquiry_message}
          </p>
        </div>

        <div className="text-[11px] text-gray-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Created on {new Date(enquiry.created_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Grid: Assigned Counsellor & Scheduled Interactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assigned Counsellor Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <UserCheck className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-gray-900">Assigned Admission Expert</h2>
          </div>

          {enquiry.assigned_counsellor ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-primary font-bold text-base flex items-center justify-center border border-red-200">
                  {enquiry.assigned_counsellor.full_name?.charAt(0) || "C"}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {enquiry.assigned_counsellor.full_name}
                  </h3>
                  <span className="text-[11px] text-gray-500">Dedicated Admission Counsellor</span>
                </div>
              </div>

              <div className="pt-2 space-y-2 text-xs text-gray-600">
                {enquiry.assigned_counsellor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{enquiry.assigned_counsellor.email}</span>
                  </div>
                )}
                {enquiry.assigned_counsellor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{enquiry.assigned_counsellor.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4">
              Your enquiry has been queued and will be assigned to a specialized counsellor shortly.
            </p>
          )}
        </div>

        {/* Scheduled Sessions / Follow-Ups */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-900">Scheduled Follow-ups</h2>
          </div>

          {studentFollowUps.length > 0 ? (
            <div className="space-y-3">
              {studentFollowUps.map((fu: any) => (
                <div
                  key={fu.id}
                  className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{fu.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 capitalize">
                      {fu.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{new Date(fu.scheduled_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4">
              No upcoming calls or appointments scheduled. Your counsellor will schedule a call based on your availability.
            </p>
          )}
        </div>
      </div>

      {/* Student Activity Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
          Activity & Progress Updates
        </h2>

        {visibleActivities.length > 0 ? (
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-gray-200">
            {visibleActivities.map((act: any) => (
              <div key={act.id} className="relative pl-8 space-y-1">
                <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-xs" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 capitalize">
                    {act.activity_type.replace(/_/g, " ")}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(act.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{act.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-2">No timeline updates recorded yet.</p>
        )}
      </div>
    </div>
  );
}
