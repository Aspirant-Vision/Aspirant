"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Award,
  FileCheck,
  Globe,
  Settings2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  courseSchema,
  CourseInput,
  generateSlug,
  COURSE_CATEGORIES,
  DEGREE_TYPES,
  STUDY_MODES,
  COURSE_LEVELS,
  DURATION_UNITS,
} from "@/lib/validation/course";
import { createCourseAction, updateCourseAction, CourseRow } from "@/lib/course/actions";
import { SingleImageUploader } from "@/components/crm/image-uploader";
import { Button } from "@/components/ui/button";

interface CourseFormProps {
  mode: "create" | "edit";
  initialData?: CourseRow;
}

export function CourseForm({ mode, initialData }: CourseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const defaultValues: Partial<CourseInput> = {
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    code: initialData?.code ?? "",
    category: initialData?.category ?? "Engineering",
    degreeType: initialData?.degree_type ?? "B.Tech / B.E.",
    stream: initialData?.stream ?? "",
    specialization: initialData?.specialization ?? "",
    shortDescription: initialData?.short_description ?? "",
    description: initialData?.description ?? "",

    duration: Number(initialData?.duration ?? 4),
    durationUnit: (initialData?.duration_unit as any) ?? "years",
    studyMode: (initialData?.study_mode as any) ?? "full_time",
    level: (initialData?.level as any) ?? "undergraduate",
    intake: initialData?.intake ?? undefined,
    language: initialData?.language ?? "English",

    minQualification: initialData?.min_qualification ?? "",
    minPercentage: initialData?.min_percentage ?? undefined,
    requiredSubjects: initialData?.required_subjects ?? "",
    entranceExamInformation: initialData?.entrance_exam_information ?? "",
    ageCriteria: initialData?.age_criteria ?? "",
    additionalRequirements: initialData?.additional_requirements ?? "",

    thumbnailUrl: initialData?.thumbnail_url ?? null,
    bannerUrl: initialData?.banner_url ?? null,
    galleryImages: Array.isArray(initialData?.gallery_images) ? (initialData.gallery_images as string[]) : [],

    seoTitle: initialData?.seo_title ?? "",
    seoDescription: initialData?.seo_description ?? "",
    ogImageUrl: initialData?.og_image_url ?? null,
    noIndex: initialData?.no_index ?? false,

    publicationStatus: (initialData?.publication_status as any) ?? "draft",
    isFeatured: initialData?.is_featured ?? false,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: defaultValues as any,
  });

  const watchedName = watch("name");
  const watchedSlug = watch("slug");
  const watchedThumbnail = watch("thumbnailUrl");
  const watchedBanner = watch("bannerUrl");
  const watchedPublicationStatus = watch("publicationStatus");

  const handleRegenerateSlug = () => {
    if (watchedName) {
      setValue("slug", generateSlug(watchedName), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: any, targetStatus?: "draft" | "published") => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      const typedData = data as CourseInput;
      const payload: CourseInput = {
        ...typedData,
        publicationStatus: targetStatus || typedData.publicationStatus,
      };

      if (mode === "create") {
        const res = await createCourseAction(payload);
        if (!res.success) {
          setSubmitError(res.error.message);
          setIsSubmitting(false);
          return;
        }

        setSubmitSuccess("Course created successfully! Redirecting...");
        setTimeout(() => {
          router.push(`/admin/courses/${res.data.id}`);
          router.refresh();
        }, 1000);
      } else {
        if (!initialData?.id) throw new Error("Missing course ID for update");
        const res = await updateCourseAction(initialData.id, payload);
        if (!res.success) {
          setSubmitError(res.error.message);
          setIsSubmitting(false);
          return;
        }

        setSubmitSuccess("Course updated successfully!");
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
      {/* 1. TOP STICKY HEADER */}
      <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-white/95 backdrop-blur-md border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">
              {mode === "create" ? "Add New Academic Course" : `Edit: ${initialData?.name || "Course"}`}
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              {mode === "create"
                ? "Configure curricula, duration, eligibility, and multi-college associations"
                : `Last updated: ${new Date(initialData?.updated_at || Date.now()).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/courses")}
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
            {mode === "create" ? "Publish Course" : "Save & Update"}
          </Button>
        </div>
      </div>

      {/* 2. ALERTS */}
      {submitError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <div><span className="font-bold">Error:</span> {submitError}</div>
        </div>
      )}

      {submitSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <div>{submitSuccess}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / MAIN COLUMN (2 COLS) */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION A: Basic Course Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <GraduationCap className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">A. Course Identification</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Course Title <span className="text-red-500">*</span>
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
                  placeholder="e.g. B.Tech in Computer Science and Engineering"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name.message}</p>}
              </div>

              {/* Slug */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRegenerateSlug}
                    className="text-[11px] font-medium text-[#E31E2B] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-generate from Title
                  </button>
                </div>
                <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-[#E31E2B]/20 focus-within:border-[#E31E2B]">
                  <span className="px-3 text-xs text-gray-400 select-none">/courses/</span>
                  <input
                    type="text"
                    {...register("slug")}
                    placeholder="btech-computer-science-and-engineering"
                    className="flex-1 py-2 pr-3 text-sm bg-transparent outline-none text-gray-900"
                  />
                </div>
                {errors.slug && <p className="text-[11px] text-red-600 mt-1">{errors.slug.message}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Academic Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("category")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                >
                  {COURSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Degree Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Degree / Award <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("degreeType")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                >
                  {DEGREE_TYPES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stream */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Primary Stream <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("stream")}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
                {errors.stream && <p className="text-[11px] text-red-600 mt-1">{errors.stream.message}</p>}
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Specialization (Optional)
                </label>
                <input
                  type="text"
                  {...register("specialization")}
                  placeholder="e.g. AI & Machine Learning, Data Science"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              {/* Course Code */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Standard Course Code</label>
                <input
                  type="text"
                  {...register("code")}
                  placeholder="e.g. BTECH-CSE-01"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Instruction Language</label>
                <input
                  type="text"
                  {...register("language")}
                  placeholder="e.g. English"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              {/* Short Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Short Summary (Catalog)</label>
                <textarea
                  {...register("shortDescription")}
                  rows={2}
                  placeholder="1-2 sentence high-level overview of the course and career prospects..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              {/* Full Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Complete Curriculum & Overview</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder="Detailed syllabus highlights, laboratory infrastructure, electives, career pathways..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>
            </div>
          </div>

          {/* SECTION B: Duration & Academic Delivery */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <BookOpen className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">B. Duration & Delivery Mode</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  {...register("duration", { valueAsNumber: true })}
                  placeholder="e.g. 4"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Duration Unit</label>
                <select
                  {...register("durationUnit")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                >
                  {DURATION_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Study Mode</label>
                <select
                  {...register("studyMode")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                >
                  {STUDY_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Academic Level</label>
                <select
                  {...register("level")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                >
                  {COURSE_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Intake Capacity (Default)</label>
                <input
                  type="number"
                  {...register("intake", { valueAsNumber: true })}
                  placeholder="e.g. 120"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>
            </div>
          </div>

          {/* SECTION C: Eligibility Criteria */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <FileCheck className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">C. Admission & Eligibility Criteria</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Minimum Qualification</label>
                <input
                  type="text"
                  {...register("minQualification")}
                  placeholder="e.g. 10+2 / Intermediate or equivalent"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Minimum Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register("minPercentage", { valueAsNumber: true })}
                  placeholder="e.g. 60.0"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mandatory Subjects</label>
                <input
                  type="text"
                  {...register("requiredSubjects")}
                  placeholder="e.g. Physics, Mathematics, Chemistry / Computer Science"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Accepted Entrance Examinations
                </label>
                <input
                  type="text"
                  {...register("entranceExamInformation")}
                  placeholder="e.g. JEE Main, JEE Advanced, OJEE, WBJEE, State CETs"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Additional Criteria / Age</label>
                <textarea
                  {...register("additionalRequirements")}
                  rows={2}
                  placeholder="e.g. Candidates must be at least 17 years old at time of admission..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>
            </div>
          </div>

          {/* SECTION D: Course Media */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Award className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">D. Course Media Assets</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <SingleImageUploader
                label="Course Thumbnail"
                description="Square preview image (1:1), shown in search cards"
                currentValue={watchedThumbnail}
                category="logo"
                collegeId="courses"
                aspectRatio="square"
                onImageUploaded={(url) => setValue("thumbnailUrl", url, { shouldValidate: true })}
                onImageRemoved={() => setValue("thumbnailUrl", null, { shouldValidate: true })}
              />

              <SingleImageUploader
                label="Course Banner"
                description="Landscape header image (16:9), shown on public detail page"
                currentValue={watchedBanner}
                category="cover"
                collegeId="courses"
                aspectRatio="banner"
                onImageUploaded={(url) => setValue("bannerUrl", url, { shouldValidate: true })}
                onImageRemoved={() => setValue("bannerUrl", null, { shouldValidate: true })}
              />
            </div>
          </div>
        </div>

        {/* RIGHT / SIDEBAR COLUMN (1 COL) */}
        <div className="space-y-6">
          {/* SECTION E: Publishing Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Settings2 className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">Publishing Status</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Publication State</label>
              <select
                {...register("publicationStatus")}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
              >
                <option value="draft">Draft (Admin only)</option>
                <option value="published">Published (Live on portal)</option>
                <option value="archived">Archived (Soft deleted)</option>
              </select>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isFeatured")}
                  className="w-4 h-4 text-[#E31E2B] rounded border-gray-300 focus:ring-[#E31E2B]"
                />
                <span className="text-xs font-bold text-gray-900">Featured Course</span>
              </label>
              <p className="text-[11px] text-gray-500 pl-6">
                Featured courses appear highlighted in discovery filters and course leaderboards.
              </p>
            </div>

            {mode === "edit" && initialData?.slug && watchedPublicationStatus === "published" && (
              <div className="pt-2 border-t border-gray-100">
                <Link
                  href={`/courses/${initialData.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E31E2B] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Public Course Page
                </Link>
              </div>
            )}
          </div>

          {/* SECTION F: SEO & Social Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Globe className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">SEO & Social Meta</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                {...register("seoTitle")}
                placeholder="e.g. B.Tech Computer Science: Admissions, Fees, Syllabus"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Meta Description</label>
              <textarea
                {...register("seoDescription")}
                rows={3}
                placeholder="Comprehensive guide to B.Tech Computer Science admissions in India..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("noIndex")}
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <span className="text-xs text-gray-700 font-medium">No-Index (Hide from Search)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
