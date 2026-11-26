"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  scholarshipSchema,
  ScholarshipInput,
  generateSlug,
  SCHOLARSHIP_CATEGORIES,
} from "@/lib/validation/course";
import {
  createScholarshipAction,
  updateScholarshipAction,
  ScholarshipRow,
} from "@/lib/course/actions";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Award,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Plus,
  X,
  ExternalLink,
} from "lucide-react";

interface ScholarshipFormProps {
  mode: "create" | "edit";
  initialData?: ScholarshipRow;
  colleges: { id: string; name: string }[];
}

export function ScholarshipForm({ mode, initialData, colleges }: ScholarshipFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [newDoc, setNewDoc] = useState("");

  const defaultValues: Partial<ScholarshipInput> = {
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    provider: initialData?.provider ?? "",
    category: (initialData?.category as any) ?? "merit",
    description: initialData?.description ?? "",
    eligibility: initialData?.eligibility ?? "",
    collegeId: initialData?.college_id || undefined,
    scholarshipAmount: Number(initialData?.scholarship_amount ?? 0),
    scholarshipPercentage: initialData?.scholarship_percentage ?? undefined,
    maxBenefit: initialData?.max_benefit ?? undefined,
    currency: initialData?.currency || "INR",
    applicationStartDate: initialData?.application_start_date ?? "",
    applicationDeadline: initialData?.application_deadline ?? "",
    applicationInstructions: initialData?.application_instructions ?? "",
    officialUrl: initialData?.official_url ?? "",
    requiredDocuments: Array.isArray(initialData?.required_documents)
      ? (initialData.required_documents as string[])
      : ["10th & 12th Marksheet", "Income Certificate", "Aadhar Card"],
    contactInfo: initialData?.contact_info ?? "",
    publicationStatus: (initialData?.publication_status as any) ?? "draft",
    isFeatured: initialData?.is_featured ?? false,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ScholarshipInput>({
    resolver: zodResolver(scholarshipSchema) as any,
    defaultValues: defaultValues as any,
  });

  const watchedName = watch("name");
  const watchedSlug = watch("slug");
  const watchedDocs = watch("requiredDocuments") || [];
  const watchedStatus = watch("publicationStatus");

  const handleRegenerateSlug = () => {
    if (watchedName) {
      setValue("slug", generateSlug(watchedName), { shouldValidate: true });
    }
  };

  const addDoc = (doc: string) => {
    const trimmed = doc.trim();
    if (!trimmed || watchedDocs.includes(trimmed)) return;
    setValue("requiredDocuments", [...watchedDocs, trimmed]);
  };

  const removeDoc = (doc: string) => {
    setValue(
      "requiredDocuments",
      watchedDocs.filter((d) => d !== doc)
    );
  };

  const onSubmit = async (data: any, targetStatus?: "draft" | "published") => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      const typed = data as ScholarshipInput;
      const payload: ScholarshipInput = {
        ...typed,
        publicationStatus: targetStatus || typed.publicationStatus,
      };

      if (mode === "create") {
        const res = await createScholarshipAction(payload);
        if (!res.success) {
          setSubmitError(res.error?.message || "Failed to create scholarship");
          setIsSubmitting(false);
          return;
        }

        setSubmitSuccess("Scholarship created successfully! Redirecting...");
        setTimeout(() => {
          if (res.data) {
            router.push(`/admin/scholarships/${res.data.id}`);
            router.refresh();
          }
        }, 1000);
      } else {
        if (!initialData?.id) throw new Error("Missing ID for update");
        const res = await updateScholarshipAction(initialData.id, payload);
        if (!res.success) {
          setSubmitError(res.error?.message || "Failed to update scholarship");
          setIsSubmitting(false);
          return;
        }

        setSubmitSuccess("Scholarship updated successfully!");
        setIsSubmitting(false);
        router.refresh();
      }
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit((d: any) => onSubmit(d))} className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-white/95 backdrop-blur-md border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/scholarships"
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">
              {mode === "create" ? "Add Financial Aid & Scholarship" : `Edit: ${initialData?.name || "Scholarship"}`}
            </h1>
            <p className="text-xs text-gray-500">Configure merit rewards, government grants, and institutional financial aid</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/scholarships")}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSubmit((d: any) => onSubmit(d, "draft"))}
            disabled={isSubmitting}
            className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
            Save as Draft
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmit((d: any) => onSubmit(d, "published"))}
            disabled={isSubmitting}
            className="text-xs bg-[#E31E2B] hover:bg-[#c91824] text-white"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
            {mode === "create" ? "Publish Scholarship" : "Save Changes"}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Award className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">Scholarship Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Scholarship Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("name", {
                    onChange: (e) => {
                      if (mode === "create" && !watchedSlug) {
                        setValue("slug", generateSlug(e.target.value), { shouldValidate: true });
                      }
                    },
                  })}
                  placeholder="e.g. National Merit Means-cum-Scholarship 2025"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">URL Slug</label>
                  <button
                    type="button"
                    onClick={handleRegenerateSlug}
                    className="text-[11px] font-medium text-[#E31E2B] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-generate
                  </button>
                </div>
                <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-[#E31E2B]/20">
                  <span className="px-3 text-xs text-gray-400 select-none">/scholarships/</span>
                  <input
                    type="text"
                    {...register("slug")}
                    placeholder="national-merit-scholarship-2025"
                    className="flex-1 py-2 pr-3 text-sm bg-transparent outline-none text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Provider Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("provider")}
                  placeholder="e.g. Ministry of Education / Tata Trusts"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  {...register("category")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20"
                >
                  {SCHOLARSHIP_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Applicable College (Optional)</label>
                <select
                  {...register("collegeId")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20"
                >
                  <option value="">All Colleges (National / State Scheme)</option>
                  {colleges.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Scholarship Grant Amount (₹)</label>
                <input
                  type="number"
                  {...register("scholarshipAmount", { valueAsNumber: true })}
                  placeholder="e.g. 50000"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tuition Waiver (%)</label>
                <input
                  type="number"
                  step="1"
                  {...register("scholarshipPercentage", { valueAsNumber: true })}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Application Deadline</label>
                <input
                  type="date"
                  {...register("applicationDeadline")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Comprehensive description of the financial aid program and who it supports..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Eligibility Criteria</label>
                <textarea
                  {...register("eligibility")}
                  rows={3}
                  placeholder="e.g. Family income below ₹6 LPA, minimum 75% in 12th Board examinations..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Official Portal URL</label>
                <input
                  type="url"
                  {...register("officialUrl")}
                  placeholder="https://scholarships.gov.in"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Required Documents</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newDoc}
                    onChange={(e) => setNewDoc(e.target.value)}
                    placeholder="Add required document..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addDoc(newDoc);
                        setNewDoc("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      addDoc(newDoc);
                      setNewDoc("");
                    }}
                    className="text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {watchedDocs.map((doc) => (
                    <span
                      key={doc}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-red-50 text-red-700 border border-red-200"
                    >
                      {doc}
                      <button type="button" onClick={() => removeDoc(doc)} className="hover:text-red-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Publishing State</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                {...register("publicationStatus")}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white font-medium"
              >
                <option value="draft">Draft (Admin only)</option>
                <option value="published">Published (Live)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isFeatured")}
                  className="w-4 h-4 text-[#E31E2B] rounded border-gray-300"
                />
                <span className="text-xs font-bold text-gray-900">Featured Scholarship</span>
              </label>
              <p className="text-[10px] text-gray-500 pl-6">
                Featured awards appear prominent in applicant dashboards and student discovery.
              </p>
            </div>

            {mode === "edit" && initialData?.slug && watchedStatus === "published" && (
              <div className="pt-2 border-t border-gray-100">
                <Link
                  href={`/scholarships/${initialData.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E31E2B] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Public Page
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
