"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentAcademicSchema, StudentAcademicInput } from "@/lib/validation/student";
import { updateStudentAcademicsAction } from "@/lib/student/actions";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
} from "lucide-react";

interface AcademicFormProps {
  initialData?: {
    educationLevel?: "10th" | "12th" | "Diploma" | "Undergraduate" | "Postgraduate" | "Doctorate";
    highestQualification?: string | null;
    institutionName?: string | null;
    boardOrUniversity?: string | null;
    passingYear?: number | null;
    percentageOrCgpa?: number | null;
    stream?: string | null;
    entranceExamName?: string | null;
    entranceExamScore?: string | null;
    additionalDetails?: string | null;
  } | null;
}

export function AcademicForm({ initialData }: AcademicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentAcademicInput>({
    resolver: zodResolver(studentAcademicSchema),
    defaultValues: {
      educationLevel: initialData?.educationLevel || "12th",
      highestQualification: initialData?.highestQualification || "",
      institutionName: initialData?.institutionName || "",
      boardOrUniversity: initialData?.boardOrUniversity || "",
      passingYear: initialData?.passingYear || undefined,
      percentageOrCgpa: initialData?.percentageOrCgpa || undefined,
      stream: initialData?.stream || "",
      entranceExamName: initialData?.entranceExamName || "",
      entranceExamScore: initialData?.entranceExamScore || "",
      additionalDetails: initialData?.additionalDetails || "",
    },
  });

  const onSubmit = async (values: StudentAcademicInput) => {
    try {
      setIsSubmitting(true);
      setStatusMessage(null);

      const res = await updateStudentAcademicsAction(values);
      if (res.success) {
        setStatusMessage({ type: "success", text: "Academic record updated successfully!" });
      } else {
        setStatusMessage({ type: "error", text: res.error?.message || "Failed to update academic details" });
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

      {/* Primary Qualification Section */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <GraduationCap className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-gray-900">Education Background</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Current Education Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Highest Education Level *</label>
            <select
              {...register("educationLevel")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
            >
              <option value="10th">10th Standard / Matriculation</option>
              <option value="12th">12th Standard / Intermediate</option>
              <option value="Diploma">Polytechnic / Diploma</option>
              <option value="Undergraduate">Undergraduate Degree (B.Tech / B.Sc / B.Com)</option>
              <option value="Postgraduate">Postgraduate Degree (M.Tech / MBA / M.Sc)</option>
              <option value="Doctorate">Doctorate / Ph.D</option>
            </select>
            {errors.educationLevel && (
              <p className="text-[11px] text-red-600 font-medium">{errors.educationLevel.message}</p>
            )}
          </div>

          {/* Qualification Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Course / Degree Title</label>
            <input
              type="text"
              {...register("highestQualification")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. Senior Secondary (Science) or B.Tech"
            />
          </div>

          {/* Stream */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Stream / Specialization</label>
            <input
              type="text"
              {...register("stream")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. PCM, PCB, Commerce, CS"
            />
          </div>

          {/* School / College Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">School / College Name</label>
            <input
              type="text"
              {...register("institutionName")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. Delhi Public School"
            />
          </div>

          {/* Board or University */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Board / University</label>
            <input
              type="text"
              {...register("boardOrUniversity")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. CBSE, ICSE, UP Board, AKTU"
            />
          </div>

          {/* Passing Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Passing / Appearing Year</label>
            <input
              type="number"
              {...register("passingYear", { valueAsNumber: true })}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. 2025"
            />
            {errors.passingYear && (
              <p className="text-[11px] text-red-600 font-medium">{errors.passingYear.message}</p>
            )}
          </div>

          {/* Percentage or CGPA */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Percentage / CGPA (%)</label>
            <input
              type="number"
              step="0.01"
              {...register("percentageOrCgpa", { valueAsNumber: true })}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. 88.5"
            />
            {errors.percentageOrCgpa && (
              <p className="text-[11px] text-red-600 font-medium">{errors.percentageOrCgpa.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Entrance Exam Details */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Award className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-gray-900">Entrance Examinations</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Competitive Exam Appeared / Target</label>
            <input
              type="text"
              {...register("entranceExamName")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. JEE Main, NEET UG, CUET, CAT"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Score / Rank / Percentile</label>
            <input
              type="text"
              {...register("entranceExamScore")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. 96.4 Percentile or AIR 14,200"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Additional Remarks & Certifications</label>
            <textarea
              {...register("additionalDetails")}
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="State level sports, Olympiads, coding achievements, diploma credentials, etc."
            />
          </div>
        </div>
      </div>

      {/* Submission Actions */}
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
            <span>Save Academic Details</span>
          )}
        </Button>
      </div>
    </form>
  );
}
