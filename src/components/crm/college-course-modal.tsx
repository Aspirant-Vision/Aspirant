"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  collegeCourseAssociationSchema,
  CollegeCourseAssociationInput,
} from "@/lib/validation/course";
import { associateCollegeCourseAction } from "@/lib/course/actions";
import { Button } from "@/components/ui/button";
import { Building2, X, Plus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface CollegeCourseModalProps {
  courseId: string;
  courseName: string;
  availableColleges: { id: string; name: string; city: string; state: string }[];
  onAssociated: () => void;
}

export function CollegeCourseModal({
  courseId,
  courseName,
  availableColleges,
  onAssociated,
}: CollegeCourseModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CollegeCourseAssociationInput>({
    resolver: zodResolver(collegeCourseAssociationSchema) as any,
    defaultValues: {
      courseId,
      collegeId: availableColleges[0]?.id || "",
      admissionStatus: "open",
      isActive: true,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await associateCollegeCourseAction({
        ...data,
        courseId,
      });

      if (!res.success) {
        setErrorMsg(res.error?.message || "Failed to associate college");
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg("College successfully associated with this course!");
      setTimeout(() => {
        setIsSubmitting(false);
        setIsOpen(false);
        reset();
        onAssociated();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to link college.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-xs bg-[#E31E2B] hover:bg-[#c91824] text-white"
      >
        <Plus className="w-3.5 h-3.5 mr-1.5" /> Associate College
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#E31E2B]" />
                <h3 className="text-sm font-bold text-gray-900">Associate Offering College</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Link <span className="font-bold text-gray-800">{courseName}</span> to an institution and configure college-specific intake or eligibility overrides.
            </p>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select College <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("collegeId")}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                >
                  {availableColleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city}, {c.state})
                    </option>
                  ))}
                </select>
                {errors.collegeId && <p className="text-[10px] text-red-600 mt-0.5">{errors.collegeId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">College Course Code</label>
                  <input
                    type="text"
                    {...register("courseCode")}
                    placeholder="e.g. CSE-2025"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Available Seats (Intake)</label>
                  <input
                    type="number"
                    {...register("intakeCapacity", { valueAsNumber: true })}
                    placeholder="e.g. 180"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Admission Status</label>
                <select
                  {...register("admissionStatus")}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                >
                  <option value="open">Open</option>
                  <option value="closing_soon">Closing Soon</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">College-specific Course Name Override</label>
                <input
                  type="text"
                  {...register("courseNameOverride")}
                  placeholder="Optional college specific variation"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Eligibility Difference (Override)</label>
                <textarea
                  {...register("eligibilityOverride")}
                  rows={2}
                  placeholder="Optional specific criteria for this institution..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="text-xs bg-[#E31E2B] hover:bg-[#c91824] text-white"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                  Save Association
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
