"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  Building,
  GraduationCap,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  MessageSquare,
  PhoneCall,
  Video,
  FileText,
  UserCheck,
  TrendingUp,
  Loader2,
  CalendarClock,
  Sparkles,
  Award,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/crm/status-badge";
import {
  updateLeadStatusAction,
  updateLeadPriorityAction,
  assignLeadAction,
  addLeadNoteAction,
  recordLeadInteractionAction,
  createFollowUpAction,
  completeFollowUpAction,
} from "@/lib/crm/actions";
import { LeadPriority, LeadStatus } from "@/types/database.types";
import { cn } from "@/lib/utils";

interface LeadDetailClientProps {
  lead: any;
  activities: any[];
  followUps: any[];
  assignments: any[];
  counsellors: Array<{ id: string; full_name: string; email: string }>;
  studentApplications: any[];
  currentUserRole: string;
}

export function LeadDetailClient({
  lead,
  activities: initialActivities,
  followUps: initialFollowUps,
  assignments,
  counsellors,
  studentApplications,
  currentUserRole,
}: LeadDetailClientProps) {
  const router = useRouter();

  const [currentLead, setCurrentLead] = useState(lead);
  const [activities, setActivities] = useState(initialActivities);
  const [followUps, setFollowUps] = useState(initialFollowUps);

  // Note State
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Status Change Dialog
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(currentLead.status);
  const [statusReason, setStatusReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Priority Change Dialog
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<LeadPriority>(currentLead.priority);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);

  // Assign Dialog
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCounsellor, setSelectedCounsellor] = useState(currentLead.assigned_counsellor_id || "");
  const [assignNotes, setAssignNotes] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Follow-up Dialog
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [fuType, setFuType] = useState<any>("phone_call");
  const [fuTitle, setFuTitle] = useState("");
  const [fuScheduledAt, setFuScheduledAt] = useState("");
  const [fuNotes, setFuNotes] = useState("");
  const [isCreatingFu, setIsCreatingFu] = useState(false);

  // Complete Follow-up Dialog
  const [completingFuId, setCompletingFuId] = useState<string | null>(null);
  const [fuCompletionNotes, setFuCompletionNotes] = useState("");
  const [isCompletingFu, setIsCompletingFu] = useState(false);

  // Record Interaction Dialog
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [interactionType, setInteractionType] = useState<any>("phone_call");
  const [interactionOutcome, setInteractionOutcome] = useState("");
  const [durationMin, setDurationMin] = useState<number>(5);
  const [isLoggingInteraction, setIsLoggingInteraction] = useState(false);

  // Handlers
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    try {
      const res = await addLeadNoteAction({
        leadId: currentLead.id,
        note: newNote,
      });

      if (res.success) {
        setNewNote("");
        router.refresh();
      } else {
        alert(res.error?.message || "Failed to add note");
      }
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    try {
      const res = await updateLeadStatusAction({
        leadId: currentLead.id,
        status: selectedStatus,
        reason: statusReason,
      });

      if (res.success) {
        setCurrentLead((prev: any) => ({ ...prev, status: selectedStatus }));
        setShowStatusModal(false);
        router.refresh();
      } else {
        alert(res.error?.message || "Failed to update status");
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdatePriority = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPriority(true);
    try {
      const res = await updateLeadPriorityAction({
        leadId: currentLead.id,
        priority: selectedPriority,
      });

      if (res.success) {
        setCurrentLead((prev: any) => ({ ...prev, priority: selectedPriority }));
        setShowPriorityModal(false);
        router.refresh();
      } else {
        alert(res.error?.message || "Failed to update priority");
      }
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const handleAssignCounsellor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssigning(true);
    try {
      const res = await assignLeadAction({
        leadId: currentLead.id,
        counsellorId: selectedCounsellor || null,
        notes: assignNotes,
      });

      if (res.success) {
        setShowAssignModal(false);
        router.refresh();
      } else {
        alert(res.error?.message || "Failed to assign counsellor");
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuScheduledAt) {
      alert("Please choose date & time");
      return;
    }

    setIsCreatingFu(true);
    try {
      const res = await createFollowUpAction({
        leadId: currentLead.id,
        followUpType: fuType,
        title: fuTitle,
        scheduledAt: new Date(fuScheduledAt).toISOString(),
        notes: fuNotes,
        priority: "medium",
      });

      if (res.success) {
        setShowFollowUpModal(false);
        setFuTitle("");
        setFuNotes("");
        setFuScheduledAt("");
        router.refresh();
      } else {
        alert(res.error?.message || "Failed to create follow-up");
      }
    } finally {
      setIsCreatingFu(false);
    }
  };

  const handleCompleteFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingFuId) return;

    setIsCompletingFu(true);
    try {
      const res = await completeFollowUpAction({
        followUpId: completingFuId,
        completionNotes: fuCompletionNotes,
      });

      if (res.success) {
        setCompletingFuId(null);
        setFuCompletionNotes("");
        router.refresh();
      } else {
        alert(res.error?.message || "Failed to complete follow-up");
      }
    } finally {
      setIsCompletingFu(false);
    }
  };

  const handleLogInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactionOutcome.trim()) return;

    setIsLoggingInteraction(true);
    try {
      const res = await recordLeadInteractionAction({
        leadId: currentLead.id,
        interactionType,
        outcome: interactionOutcome,
        durationMinutes: durationMin || undefined,
      });

      if (res.success) {
        setShowInteractionModal(false);
        setInteractionOutcome("");
        router.refresh();
      } else {
        alert(res.error?.message || "Failed to log interaction");
      }
    } finally {
      setIsLoggingInteraction(false);
    }
  };

  const getPriorityBadgeClass = (p: LeadPriority) => {
    switch (p) {
      case "urgent":
        return "bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse";
      case "high":
        return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
      case "medium":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "low":
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER RIBBON: STUDENT SUMMARY & QUICK ACTION BAR */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-display">
                {currentLead.full_name}
              </h1>
              <button
                type="button"
                onClick={() => setShowStatusModal(true)}
                className="cursor-pointer"
                title="Click to update lead status"
              >
                <StatusBadge status={currentLead.status} />
              </button>
              <button
                type="button"
                onClick={() => setShowPriorityModal(true)}
                className={cn(
                  "text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border cursor-pointer",
                  getPriorityBadgeClass(currentLead.priority)
                )}
                title="Click to update priority"
              >
                {currentLead.priority}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <a href={`tel:${currentLead.phone}`} className="hover:text-[#E31E2B] font-medium">
                  {currentLead.phone}
                </a>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <a href={`mailto:${currentLead.email}`} className="hover:text-[#E31E2B] font-medium">
                  {currentLead.email}
                </a>
              </span>
              {currentLead.preferred_location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{currentLead.preferred_location}</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Received: {new Date(currentLead.created_at).toLocaleString()}</span>
              </span>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInteractionModal(true)}
              className="text-xs"
            >
              <PhoneCall className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              <span>Log Call / Interaction</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFollowUpModal(true)}
              className="text-xs"
            >
              <CalendarClock className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
              <span>Schedule Follow-up</span>
            </Button>

            {currentUserRole !== "counsellor" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssignModal(true)}
                className="text-xs"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                <span>Assign Counsellor</span>
              </Button>
            )}

            <Link href={`/admin/leads/${currentLead.id}/edit`}>
              <Button variant="primary" size="sm" className="text-xs">
                <span>Edit Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT: DETAILS & TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: METADATA, ASSIGNMENT, ACADEMICS & FOLLOW-UPS */}
        <div className="space-y-6">
          {/* A. COUNSELLOR ASSIGNMENT CARD */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#E31E2B]" />
                <span>Assigned Counsellor</span>
              </h3>
              {currentUserRole !== "counsellor" && (
                <button
                  type="button"
                  onClick={() => setShowAssignModal(true)}
                  className="text-[11px] font-bold text-[#E31E2B] hover:underline cursor-pointer"
                >
                  Change
                </button>
              )}
            </div>

            {currentLead.assigned_counsellor ? (
              <div className="flex items-center gap-3 pt-1">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  {currentLead.assigned_counsellor.full_name?.charAt(0) || "C"}
                </div>
                <div>
                  <div className="font-bold text-xs text-gray-900">
                    {currentLead.assigned_counsellor.full_name}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {currentLead.assigned_counsellor.email}
                  </div>
                  {currentLead.assigned_counsellor.phone && (
                    <div className="text-[10px] text-gray-400">
                      {currentLead.assigned_counsellor.phone}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                <span>No counsellor currently assigned.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAssignModal(true)}
                  className="h-6 text-[10px]"
                >
                  Assign Now
                </Button>
              </div>
            )}
          </div>

          {/* B. ADMISSION PREFERENCES & ACADEMICS */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3.5">
            <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider border-b pb-2.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#E31E2B]" />
              <span>Academic Interests</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Preferred College
                </span>
                <span className="font-bold text-gray-800">
                  {currentLead.colleges?.name || "General Admission"}
                </span>
                {currentLead.colleges?.city && (
                  <span className="text-gray-500 text-[11px] block">
                    {currentLead.colleges.city}, {currentLead.colleges.state}
                  </span>
                )}
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Target Course
                </span>
                <span className="font-bold text-gray-800">
                  {currentLead.courses?.name || "Open Stream"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Qualification
                  </span>
                  <span className="font-medium text-gray-800">
                    {currentLead.current_qualification || "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Passing Year
                  </span>
                  <span className="font-medium text-gray-800">
                    {currentLead.passing_year || "Not provided"}
                  </span>
                </div>
              </div>

              {currentLead.enquiry_message && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Original Message
                  </span>
                  <p className="text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-1 italic">
                    &quot;{currentLead.enquiry_message}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* C. STUDENT ACCOUNT & APPLICATION LINKAGE */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider border-b pb-2.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#E31E2B]" />
              <span>Portal Registration & Applications</span>
            </h3>

            {currentLead.student_user_id ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Registered Student User</span>
                </div>
                <div className="text-gray-500 text-[11px]">
                  User ID: <code className="text-gray-700">{currentLead.student_user_id}</code>
                </div>

                {studentApplications && studentApplications.length > 0 ? (
                  <div className="pt-2 space-y-1.5 border-t border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Submitted Applications ({studentApplications.length})
                    </span>
                    {studentApplications.map((app: any) => (
                      <div
                        key={app.id}
                        className="p-2 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-gray-800">
                          {app.college?.name || "College"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold uppercase">
                          {app.application_status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs italic pt-1">
                    No admission applications initiated yet.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500 space-y-1">
                <p>Prospective student has not registered a student portal account yet.</p>
                <div className="text-[10px] text-gray-400">
                  When the student signs up with {currentLead.email}, their portal profile will link automatically.
                </div>
              </div>
            )}
          </div>

          {/* D. SCHEDULED FOLLOW-UPS CARD */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5 text-[#E31E2B]" />
                <span>Follow-ups ({followUps.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowFollowUpModal(true)}
                className="text-[11px] font-bold text-[#E31E2B] hover:underline cursor-pointer"
              >
                + Schedule
              </button>
            </div>

            {followUps.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-xs italic">
                No follow-ups scheduled for this lead.
              </div>
            ) : (
              <div className="space-y-2">
                {followUps.map((fu: any) => {
                  const isPending = fu.status === "pending";
                  const isOverdue = isPending && new Date(fu.scheduled_at) < new Date();

                  return (
                    <div
                      key={fu.id}
                      className={cn(
                        "p-3 rounded-xl border text-xs space-y-1.5 transition-colors",
                        isOverdue
                          ? "bg-rose-50/60 border-rose-200"
                          : fu.status === "completed"
                          ? "bg-emerald-50/40 border-emerald-200"
                          : "bg-gray-50 border-gray-200/70"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 capitalize flex items-center gap-1">
                          {fu.follow_up_type.replace("_", " ")}
                          {isOverdue && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-200 text-rose-800 font-extrabold uppercase">
                              Overdue
                            </span>
                          )}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase",
                            fu.status === "completed"
                              ? "text-emerald-700"
                              : fu.status === "cancelled"
                              ? "text-gray-400"
                              : "text-blue-700"
                          )}
                        >
                          {fu.status}
                        </span>
                      </div>

                      <div className="text-gray-500 text-[11px]">
                        📅 {new Date(fu.scheduled_at).toLocaleString()}
                      </div>

                      {fu.notes && (
                        <p className="text-gray-600 text-[11px] italic">&quot;{fu.notes}&quot;</p>
                      )}

                      {fu.completion_notes && (
                        <div className="text-emerald-800 text-[11px] bg-emerald-100/50 p-1.5 rounded-lg">
                          ✓ {fu.completion_notes}
                        </div>
                      )}

                      {isPending && (
                        <div className="pt-1 flex items-center justify-end">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setCompletingFuId(fu.id)}
                            className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700"
                          >
                            Mark Completed
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: TIMELINE & INTERNAL NOTES (2-COL SPAN) */}
        <div className="lg:col-span-2 space-y-6">
          {/* A. INTERNAL NOTES COMPOSER */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#E31E2B]" />
              <span>Add Private Staff Note</span>
            </h3>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={3}
                placeholder="Internal confidential remark (e.g. Student prefers morning batches, father called regarding scholarship discount)..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
              />
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>🔒 Private note. Never visible to students.</span>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isAddingNote || !newNote.trim()}
                  className="bg-[#E31E2B] text-white text-xs h-8"
                >
                  {isAddingNote ? "Saving..." : "Post Note"}
                </Button>
              </div>
            </form>
          </div>

          {/* B. CHRONOLOGICAL ACTIVITY TIMELINE */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E31E2B]" />
                <span>Interaction & Activity Timeline ({activities.length})</span>
              </h3>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs italic">
                No activity records logged for this lead yet.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {activities.map((act: any) => {
                  let icon = <Clock className="w-3 h-3 text-gray-500" />;
                  let bg = "bg-gray-100";

                  if (act.activity_type === "internal_note") {
                    icon = <FileText className="w-3 h-3 text-amber-600" />;
                    bg = "bg-amber-100";
                  } else if (act.activity_type === "phone_call") {
                    icon = <PhoneCall className="w-3 h-3 text-emerald-600" />;
                    bg = "bg-emerald-100";
                  } else if (act.activity_type === "whatsapp") {
                    icon = <MessageSquare className="w-3 h-3 text-green-600" />;
                    bg = "bg-green-100";
                  } else if (act.activity_type === "status_changed") {
                    icon = <TrendingUp className="w-3 h-3 text-blue-600" />;
                    bg = "bg-blue-100";
                  } else if (act.activity_type === "lead_assigned") {
                    icon = <UserCheck className="w-3 h-3 text-purple-600" />;
                    bg = "bg-purple-100";
                  }

                  return (
                    <div key={act.id} className="relative group">
                      {/* Timeline Dot Icon */}
                      <div
                        className={cn(
                          "absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white shadow-2xs",
                          bg
                        )}
                      >
                        {icon}
                      </div>

                      {/* Content Card */}
                      <div className="bg-gray-50/70 group-hover:bg-gray-100/70 transition-colors p-3.5 rounded-xl border border-gray-200/60 text-xs space-y-1">
                        <div className="flex items-center justify-between text-gray-400 text-[10px]">
                          <span className="font-bold text-gray-700 capitalize">
                            {act.activity_type.replace("_", " ")}
                          </span>
                          <span>{new Date(act.created_at).toLocaleString()}</span>
                        </div>

                        <p className="text-gray-800 font-medium whitespace-pre-line">
                          {act.description}
                        </p>

                        {act.actor && (
                          <div className="text-[10px] text-gray-400 pt-0.5">
                            Logged by: <strong>{act.actor.full_name || "Staff"}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. MODAL: STATUS UPDATE */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">Update Lead Status</h3>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Status *
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="counselling_scheduled">Counselling Scheduled</option>
                  <option value="application_started">Application Started</option>
                  <option value="admitted">Admitted</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              {(selectedStatus === "lost" || selectedStatus === "not_interested") && (
                <div>
                  <label className="block text-xs font-semibold text-red-700 mb-1">
                    Reason Required *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide specific reason..."
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-red-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isUpdatingStatus}
                  className="bg-[#E31E2B] text-white"
                >
                  {isUpdatingStatus ? "Updating..." : "Confirm Status"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: PRIORITY UPDATE */}
      {showPriorityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">Change Lead Priority</h3>
              <button
                type="button"
                onClick={() => setShowPriorityModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePriority} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Priority *
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as LeadPriority)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPriorityModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isUpdatingPriority}
                  className="bg-[#E31E2B] text-white"
                >
                  {isUpdatingPriority ? "Saving..." : "Save Priority"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: ASSIGN COUNSELLOR */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">Assign Counsellor</h3>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignCounsellor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Counsellor *
                </label>
                <select
                  value={selectedCounsellor}
                  onChange={(e) => setSelectedCounsellor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                >
                  <option value="">Unassigned (Remove Counsellor)</option>
                  {counsellors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name || c.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assignment Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes for the newly assigned counsellor..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isAssigning}
                  className="bg-[#E31E2B] text-white"
                >
                  {isAssigning ? "Assigning..." : "Confirm Assignment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: SCHEDULE FOLLOW-UP */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">Schedule Counsellor Follow-up</h3>
              <button
                type="button"
                onClick={() => setShowFollowUpModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Follow-up Type *
                  </label>
                  <select
                    value={fuType}
                    onChange={(e) => setFuType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                  >
                    <option value="phone_call">Phone Call</option>
                    <option value="whatsapp">WhatsApp Message</option>
                    <option value="counselling_session">Counselling Session</option>
                    <option value="video_meeting">Video Meeting</option>
                    <option value="email">Email</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={fuScheduledAt}
                    onChange={(e) => setFuScheduledAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subject / Goal
                </label>
                <input
                  type="text"
                  placeholder="e.g. Discuss fee structure & hostel facilities"
                  value={fuTitle}
                  onChange={(e) => setFuTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Preparation Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Points to cover during this call..."
                  value={fuNotes}
                  onChange={(e) => setFuNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFollowUpModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isCreatingFu}
                  className="bg-[#E31E2B] text-white"
                >
                  {isCreatingFu ? "Scheduling..." : "Schedule Follow-up"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: COMPLETE FOLLOW-UP */}
      {completingFuId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">Mark Follow-up Completed</h3>
              <button
                type="button"
                onClick={() => setCompletingFuId(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteFollowUp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Completion Notes / Outcome *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summary of conversation, outcome, student interest level..."
                  value={fuCompletionNotes}
                  onChange={(e) => setFuCompletionNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCompletingFuId(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isCompletingFu}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isCompletingFu ? "Saving..." : "Confirm Completed"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: LOG INTERACTION */}
      {showInteractionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900">Log Interaction (Call / Meeting)</h3>
              <button
                type="button"
                onClick={() => setShowInteractionModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogInteraction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Channel *
                  </label>
                  <select
                    value={interactionType}
                    onChange={(e) => setInteractionType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                  >
                    <option value="phone_call">Phone Call</option>
                    <option value="whatsapp">WhatsApp Message</option>
                    <option value="video_meeting">Video Meeting</option>
                    <option value="in_person">In-Person Counselling</option>
                    <option value="email">Email</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Interaction Summary / Outcome *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Key discussion points, answers provided, student reaction..."
                  value={interactionOutcome}
                  onChange={(e) => setInteractionOutcome(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInteractionModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isLoggingInteraction}
                  className="bg-[#E31E2B] text-white"
                >
                  {isLoggingInteraction ? "Logging..." : "Save Interaction"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
