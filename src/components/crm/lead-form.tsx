"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadFormSchema, LeadFormInput } from "@/lib/validation/lead";
import { createLeadAction, updateLeadAction } from "@/lib/crm/actions";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  MapPin,
  Clock,
  Sparkles,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadFormProps {
  initialData?: any;
  leadId?: string;
  counsellors: Array<{ id: string; full_name: string; email: string }>;
  colleges: Array<{ id: string; name: string }>;
  courses: Array<{ id: string; name: string }>;
  isEditMode?: boolean;
}

export function LeadForm({
  initialData,
  leadId,
  counsellors,
  colleges,
  courses,
  isEditMode = false,
}: LeadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: initialData?.full_name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      preferredLocation: initialData?.preferred_location || "",
      currentQualification: initialData?.current_qualification || "",
      passingYear: initialData?.passing_year || undefined,
      interestedCollegeId: initialData?.interested_college_id || "",
      interestedCourseId: initialData?.interested_course_id || "",
      source: initialData?.source || "organic",
      status: initialData?.status || "new",
      priority: initialData?.priority || "medium",
      assignedCounsellorId: initialData?.assigned_counsellor_id || "",
      enquiryMessage: initialData?.enquiry_message || "",
      statusReason: initialData?.status_reason || "",
      lostReason: initialData?.lost_reason || "",
    },
  });

  const selectedStatus = watch("status");

  const onSubmit = async (values: LeadFormInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isEditMode && leadId) {
        const res = await updateLeadAction(leadId, values);
        if (!res.success) {
          setErrorMessage(res.error?.message || "Failed to update lead");
        } else {
          router.push(`/admin/leads/${leadId}`);
          router.refresh();
        }
      } else {
        const res = await createLeadAction(values);
        if (!res.success) {
          setErrorMessage(res.error?.message || "Failed to create lead");
        } else if (res.data) {
          router.push(`/admin/leads/${res.data.id}`);
          router.refresh();
        }
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. STUDENT IDENTITY & CONTACT */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <User className="w-4 h-4 text-[#E31E2B]" />
          <span>Student Contact Information</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Priyanshu Mohanty"
              {...register("fullName")}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            />
            {errors.fullName && (
              <p className="text-[11px] text-red-600 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="e.g. priyanshu@gmail.com"
              {...register("email")}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            />
            {errors.email && (
              <p className="text-[11px] text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              {...register("phone")}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            />
            {errors.phone && (
              <p className="text-[11px] text-red-600 mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Location / City
            </label>
            <input
              type="text"
              placeholder="e.g. Bhubaneswar, Odisha"
              {...register("preferredLocation")}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Current Qualification
            </label>
            <input
              type="text"
              placeholder="e.g. 12th Science (PCM) / Diploma"
              {...register("currentQualification")}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Passing Year
            </label>
            <input
              type="number"
              placeholder="e.g. 2025"
              {...register("passingYear", { valueAsNumber: true })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            />
          </div>
        </div>
      </div>

      {/* 2. ADMISSION PREFERENCES */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <Building className="w-4 h-4 text-[#E31E2B]" />
          <span>Admission & Academic Preferences</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Preferred College
            </label>
            <select
              {...register("interestedCollegeId")}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              <option value="">General (No College Selected)</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Interested Course
            </label>
            <select
              {...register("interestedCourseId")}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              <option value="">General (No Course Selected)</option>
              {courses.map((co) => (
                <option key={co.id} value={co.id}>
                  {co.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Student Enquiry Message / Notes
          </label>
          <textarea
            rows={3}
            placeholder="Student's background, questions or preferences..."
            {...register("enquiryMessage")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
          />
        </div>
      </div>

      {/* 3. CRM STATUS & ASSIGNMENT */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E31E2B]" />
          <span>CRM Triage & Assignment</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Lead Status *
            </label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
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

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Priority Level *
            </label>
            <select
              {...register("priority")}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Lead Source *
            </label>
            <select
              {...register("source")}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              <option value="website_modal">Website Modal</option>
              <option value="organic">Organic Search</option>
              <option value="referral">Referral</option>
              <option value="direct">Direct Contact</option>
              <option value="social">Social Media</option>
              <option value="call_in">Inbound Call</option>
              <option value="event">Education Fair / Event</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Assigned Counsellor
            </label>
            <select
              {...register("assignedCounsellorId")}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              <option value="">Unassigned</option>
              {counsellors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name || c.email}
                </option>
              ))}
            </select>
          </div>

          {(selectedStatus === "lost" || selectedStatus === "not_interested") && (
            <div>
              <label className="block text-xs font-semibold text-red-700 mb-1">
                Reason for Lost / Not Interested
              </label>
              <input
                type="text"
                placeholder="e.g. Budget constraints / Local college chosen"
                {...register("lostReason")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-red-300 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. ACTIONS */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isSubmitting}
          className="bg-[#E31E2B] text-white px-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              <span>Saving Lead...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" />
              <span>{isEditMode ? "Save Changes" : "Create Lead"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
