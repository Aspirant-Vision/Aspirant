"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  feeRecordSchema,
  FeeRecordInput,
  FEE_TYPES,
  PAYMENT_FREQUENCIES,
  STUDENT_CATEGORIES,
} from "@/lib/validation/course";
import { createFeeRecordAction, updateFeeRecordAction, CollegeFeeRow } from "@/lib/course/actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, IndianRupee, Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface FeeFormProps {
  mode: "create" | "edit";
  initialData?: CollegeFeeRow;
  collegeCourses: {
    id: string;
    collegeName: string;
    courseName: string;
  }[];
}

export function FeeForm({ mode, initialData, collegeCourses }: FeeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const defaultValues: Partial<FeeRecordInput> = {
    collegeCourseId: initialData?.college_course_id || collegeCourses[0]?.id || "",
    academicYear: initialData?.academic_year || "2025-26",
    feeType: (initialData?.fee_type as any) || "tuition",
    amount: Number(initialData?.amount ?? initialData?.tuition_fee ?? 0),
    currency: initialData?.currency || "INR",
    paymentFrequency: (initialData?.payment_frequency as any) || "annual",
    studentCategory: (initialData?.student_category as any) || "all",
    tuitionFee: Number(initialData?.tuition_fee ?? 0),
    admissionFee: Number(initialData?.admission_fee ?? 0),
    hostelFee: Number(initialData?.hostel_fee ?? 0),
    otherFees: Number(initialData?.other_fees ?? 0),
    feeNotes: initialData?.fee_notes || "",
    effectiveDate: initialData?.effective_date || "",
    expiryDate: initialData?.expiry_date || "",
    status: (initialData?.status as any) || "active",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FeeRecordInput>({
    resolver: zodResolver(feeRecordSchema) as any,
    defaultValues: defaultValues as any,
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      const typedData = data as FeeRecordInput;

      if (mode === "create") {
        const res = await createFeeRecordAction(typedData);
        if (!res.success) {
          setSubmitError(res.error?.message || "Failed to create fee record");
          setIsSubmitting(false);
          return;
        }

        setSubmitSuccess("Fee structure saved successfully! Redirecting...");
        setTimeout(() => {
          router.push("/admin/fees");
          router.refresh();
        }, 1000);
      } else {
        if (!initialData?.id) throw new Error("Missing fee ID for update");
        const res = await updateFeeRecordAction(initialData.id, typedData);
        if (!res.success) {
          setSubmitError(res.error?.message || "Failed to update fee record");
          setIsSubmitting(false);
          return;
        }

        setSubmitSuccess("Fee structure updated successfully!");
        setIsSubmitting(false);
        router.refresh();
      }
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto pb-20">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/fees"
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {mode === "create" ? "Configure Course Fee Structure" : "Edit Fee Record"}
            </h1>
            <p className="text-xs text-gray-500">
              Manage tuition, admission, hostel, laboratory, and composite fee amounts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/fees")}
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
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
            Save Fee Structure
          </Button>
        </div>
      </div>

      {submitError && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {submitSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{submitSuccess}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <IndianRupee className="w-4 h-4 text-[#E31E2B]" />
          <h2 className="text-sm font-bold text-gray-900">Fee Details & Allocation</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Select College & Offering Course <span className="text-red-500">*</span>
            </label>
            <select
              {...register("collegeCourseId")}
              disabled={mode === "edit"}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B] disabled:bg-gray-100"
            >
              {collegeCourses.map((cc) => (
                <option key={cc.id} value={cc.id}>
                  {cc.collegeName} — {cc.courseName}
                </option>
              ))}
            </select>
            {errors.collegeCourseId && (
              <p className="text-[10px] text-red-600 mt-0.5">{errors.collegeCourseId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("academicYear")}
              placeholder="e.g. 2025-26"
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            />
            {errors.academicYear && (
              <p className="text-[10px] text-red-600 mt-0.5">{errors.academicYear.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Fee Category / Type</label>
            <select
              {...register("feeType")}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              {FEE_TYPES.map((f) => (
                <option key={f} value={f}>
                  {f.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Fee Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="100"
              {...register("amount", { valueAsNumber: true })}
              placeholder="e.g. 125000"
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            />
            {errors.amount && <p className="text-[10px] text-red-600 mt-0.5">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Frequency</label>
            <select
              {...register("paymentFrequency")}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              {PAYMENT_FREQUENCIES.map((pf) => (
                <option key={pf} value={pf}>
                  {pf.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Target Student Category</label>
            <select
              {...register("studentCategory")}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            >
              {STUDENT_CATEGORIES.map((sc) => (
                <option key={sc} value={sc}>
                  {sc.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Effective Date</label>
            <input
              type="date"
              {...register("effectiveDate")}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Fee Description / Notes</label>
            <textarea
              {...register("feeNotes")}
              rows={3}
              placeholder="e.g. Includes laboratory charges, library membership, and examination fees. Refundable caution deposit of ₹10,000 extra..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
