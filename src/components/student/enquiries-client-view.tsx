"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EnquiryModal } from "@/components/student/enquiry-modal";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Building2,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  UserCheck,
  Search,
} from "lucide-react";

interface EnquiriesClientViewProps {
  enquiries: any[];
  colleges: Array<{ id: string; name: string }>;
  courses: Array<{ id: string; name: string }>;
}

export function EnquiriesClientView({
  enquiries,
  colleges,
  courses,
}: EnquiriesClientViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredEnquiries = enquiries.filter((item) => {
    if (filterStatus === "all") return true;
    return item.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "assigned":
      case "in_progress":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "contacted":
      case "qualified":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "converted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cold":
      case "lost":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & New Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Admission Enquiries</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track status updates and communication with assigned counsellors for your college queries.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          size="sm"
          className="text-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Ask Admission Question</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["all", "new", "in_progress", "contacted", "qualified", "converted"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
              filterStatus === st
                ? "bg-red-600 text-white shadow-xs"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {st === "all" ? "All Enquiries" : st.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Enquiries List */}
      {filteredEnquiries.length > 0 ? (
        <div className="space-y-4">
          {filteredEnquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md hover:border-red-200 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center shrink-0 border border-red-100">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {enq.colleges?.name || "General Admission Counselling"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {enq.courses?.name || "Multiple / Career Path Advisory"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-full border capitalize ${getStatusColor(
                      enq.status
                    )}`}
                  >
                    {enq.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Message Snippet */}
              <p className="text-xs text-gray-600 bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 leading-relaxed italic">
                "{enq.enquiry_message}"
              </p>

              {/* Footer Row: Counsellor info, date, link to detail */}
              <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
                <div className="flex flex-wrap items-center gap-4">
                  {enq.assigned_counsellor ? (
                    <span className="inline-flex items-center gap-1.5 text-gray-700 font-semibold">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Counsellor: {enq.assigned_counsellor.full_name}</span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Awaiting counsellor assignment</span>
                  )}

                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Submitted on {new Date(enq.created_at).toLocaleDateString()}</span>
                  </span>
                </div>

                <Link
                  href={`/student/enquiries/${enq.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline self-end sm:self-auto"
                >
                  <span>View Timeline & Updates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-red-50 text-primary rounded-2xl mx-auto flex items-center justify-center border border-red-100">
            <MessageSquare className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-gray-900">No Enquiries Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Need guidance regarding colleges, eligibility cutoffs, scholarship criteria, or campus life? Submit a query and an admission counsellor will assist you.
          </p>

          <div className="pt-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="primary"
              size="sm"
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Ask Your First Question</span>
            </Button>
          </div>
        </div>
      )}

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        colleges={colleges}
        courses={courses}
        onSuccess={() => {
          // Window reload or revalidation trigger
          window.location.reload();
        }}
      />
    </div>
  );
}
