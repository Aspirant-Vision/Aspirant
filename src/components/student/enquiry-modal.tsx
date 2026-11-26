"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentEnquirySchema, StudentEnquiryInput } from "@/lib/validation/student";
import { submitStudentPortalEnquiryAction } from "@/lib/student/actions";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Building2,
  BookOpen,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
} from "lucide-react";

interface EnquiryModalProps {
  colleges: Array<{ id: string; name: string }>;
  courses: Array<{ id: string; name: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EnquiryModal({
  colleges,
  courses,
  isOpen,
  onClose,
  onSuccess,
}: EnquiryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentEnquiryInput>({
    resolver: zodResolver(studentEnquirySchema),
    defaultValues: {
      collegeId: "",
      courseId: "",
      message: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (values: StudentEnquiryInput) => {
    try {
      setIsSubmitting(true);
      setStatusMessage(null);

      const res = await submitStudentPortalEnquiryAction(values);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Your enquiry has been submitted! An admission counsellor will connect with you soon.",
        });
        reset();
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setStatusMessage({
          type: "error",
          text: res.error?.message || "Failed to submit enquiry",
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-50 text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Ask Counsellor / New Enquiry</h3>
              <p className="text-[11px] text-gray-500">
                Direct enquiry to our expert admission desk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
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

          {/* College Selection (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              <span>Target College (Optional)</span>
            </label>
            <select
              {...register("collegeId")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
            >
              <option value="">General Counselling (No Specific College)</option>
              {colleges.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Selection (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-gray-400" />
              <span>Target Course / Degree (Optional)</span>
            </label>
            <select
              {...register("courseId")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
            >
              <option value="">Multiple / Undecided Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Enquiry Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Your Questions / Admission Query *
            </label>
            <textarea
              {...register("message")}
              rows={4}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Tell us what you'd like guidance on: cutoffs, fee structure, scholarships, eligibility, hostel facilities, or direct admission procedures..."
            />
            {errors.message && (
              <p className="text-[11px] text-red-600 font-medium">{errors.message.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>Submit Query</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
