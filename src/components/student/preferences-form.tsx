"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentPreferencesSchema, StudentPreferencesInput } from "@/lib/validation/student";
import { updateStudentPreferencesAction } from "@/lib/student/actions";
import { Button } from "@/components/ui/button";
import {
  Sliders,
  DollarSign,
  MapPin,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
} from "lucide-react";

interface PreferencesFormProps {
  initialData?: {
    preferredStudyLevel?: string | null;
    preferredStream?: string | null;
    preferredSpecialization?: string | null;
    preferredCollegeType?: string | null;
    preferredStudyMode?: string | null;
    preferredState?: string | null;
    preferredCity?: string | null;
    budgetMin?: number | null;
    budgetMax?: number | null;
    preferredAdmissionYear?: number | null;
    entranceExamPreference?: string | null;
  } | null;
}

export function PreferencesForm({ initialData }: PreferencesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentPreferencesInput>({
    resolver: zodResolver(studentPreferencesSchema),
    defaultValues: {
      preferredStudyLevel: initialData?.preferredStudyLevel || "Undergraduate",
      preferredStream: initialData?.preferredStream || "Engineering",
      preferredSpecialization: initialData?.preferredSpecialization || "",
      preferredCollegeType: initialData?.preferredCollegeType || "",
      preferredStudyMode: initialData?.preferredStudyMode || "Full-Time",
      preferredState: initialData?.preferredState || "",
      preferredCity: initialData?.preferredCity || "",
      budgetMin: initialData?.budgetMin || undefined,
      budgetMax: initialData?.budgetMax || undefined,
      preferredAdmissionYear: initialData?.preferredAdmissionYear || 2026,
      entranceExamPreference: initialData?.entranceExamPreference || "",
    },
  });

  const onSubmit = async (values: StudentPreferencesInput) => {
    try {
      setIsSubmitting(true);
      setStatusMessage(null);

      const res = await updateStudentPreferencesAction(values);
      if (res.success) {
        setStatusMessage({ type: "success", text: "Admission preferences saved successfully!" });
      } else {
        setStatusMessage({ type: "error", text: res.error?.message || "Failed to update preferences" });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Target Program & Domain */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-gray-900">Target Degree & Course</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Study Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Target Degree Level</label>
            <select
              {...register("preferredStudyLevel")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
            >
              <option value="Undergraduate">Undergraduate (UG)</option>
              <option value="Postgraduate">Postgraduate (PG)</option>
              <option value="Diploma">Diploma / Polytechnic</option>
              <option value="Doctorate">Doctoral / Ph.D</option>
            </select>
          </div>

          {/* Stream */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Broad Stream</label>
            <select
              {...register("preferredStream")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
            >
              <option value="Engineering">Engineering & Technology</option>
              <option value="Management">Management (BBA / MBA)</option>
              <option value="Medical">Medical / Healthcare / Pharma</option>
              <option value="Science">Computer Applications & IT (BCA / MCA)</option>
              <option value="Law">Law (LLB / BA-LLB)</option>
              <option value="Design">Design & Architecture</option>
              <option value="Commerce">Commerce & Banking</option>
            </select>
          </div>

          {/* Specialization */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Preferred Specialization</label>
            <input
              type="text"
              {...register("preferredSpecialization")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. AI & Data Science, Finance, Cyber Security"
            />
          </div>

          {/* Target Admission Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Target Admission Year</label>
            <select
              {...register("preferredAdmissionYear", { valueAsNumber: true })}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
              <option value={2028}>2028</option>
            </select>
          </div>

          {/* Study Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Study Mode</label>
            <select
              {...register("preferredStudyMode")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
            >
              <option value="Full-Time">Regular / Full-Time</option>
              <option value="Online">Online / Distance Education</option>
              <option value="Hybrid">Hybrid / Blended Learning</option>
            </select>
          </div>

          {/* College Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Institution Ownership</label>
            <select
              {...register("preferredCollegeType")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
            >
              <option value="">Any Ownership</option>
              <option value="Government">Government / State University</option>
              <option value="Private">Private / Autonomous University</option>
              <option value="Deemed">Deemed University</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location & Budget Preferences */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-gray-900">Location & Annual Fee Budget</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Target State */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Target State</label>
            <input
              type="text"
              {...register("preferredState")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. Uttar Pradesh, Karnataka, Delhi"
            />
          </div>

          {/* Target City */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Target City</label>
            <input
              type="text"
              {...register("preferredCity")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. Noida, Bangalore, Lucknow"
            />
          </div>

          {/* Budget Min */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Minimum Annual Budget (₹)</label>
            <input
              type="number"
              {...register("budgetMin", { valueAsNumber: true })}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. 50000"
            />
            {errors.budgetMin && (
              <p className="text-[11px] text-red-600 font-medium">{errors.budgetMin.message}</p>
            )}
          </div>

          {/* Budget Max */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Maximum Annual Budget (₹)</label>
            <input
              type="number"
              {...register("budgetMax", { valueAsNumber: true })}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. 250000"
            />
            {errors.budgetMax && (
              <p className="text-[11px] text-red-600 font-medium">{errors.budgetMax.message}</p>
            )}
          </div>

          {/* Entrance Exam Preference */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Admission Channel Preference</label>
            <input
              type="text"
              {...register("entranceExamPreference")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. Entrance Exam Merit, Direct Admission / Management Quota, Scholarship Seats"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
          className="min-w-36 text-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Preferences</span>
          )}
        </Button>
      </div>
    </form>
  );
}
