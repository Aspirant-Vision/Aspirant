"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Image as ImageIcon,
  Award,
  Sparkles,
  FileCheck,
  Globe,
  Settings2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  X,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  collegeSchema,
  CollegeInput,
  generateSlug,
  COLLEGE_TYPES,
  OWNERSHIP_TYPES,
  ADMISSION_STATUSES,
  PUBLICATION_STATUSES,
} from "@/lib/validation/college";
import { createCollegeAction, updateCollegeAction, CollegeRow } from "@/lib/college/actions";
import { SingleImageUploader, GalleryUploader } from "@/components/crm/image-uploader";
import { Button } from "@/components/ui/button";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi NCR",
  "Chandigarh",
  "Puducherry",
  "Other",
];

const NAAC_GRADES = ["A++", "A+", "A", "B++", "B+", "B", "C", "Not Accredited"];

const FACILITY_PRESETS = [
  "Wi-Fi Campus",
  "Central Library",
  "Hostel (Boys/Girls)",
  "Sports Complex",
  "Cafeteria & Food Court",
  "Advanced Laboratories",
  "Auditorium",
  "Gymnasium",
  "Transport Service",
  "Medical Center",
  "Placement Cell",
  "Incubation Center",
  "Smart Classrooms",
  "ATM Facility",
];

interface CollegeFormProps {
  mode: "create" | "edit";
  initialData?: CollegeRow;
}

export function CollegeForm({ mode, initialData }: CollegeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Quick custom input state for facilities & highlights
  const [newFacility, setNewFacility] = useState("");
  const [newHighlight, setNewHighlight] = useState("");

  const defaultValues: Partial<CollegeInput> = {
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    shortDescription: initialData?.short_description ?? "",
    description: initialData?.description ?? "",
    collegeType: initialData?.college_type ?? "Engineering",
    ownershipType: initialData?.ownership_type ?? "Private",
    establishedYear: initialData?.established_year ?? undefined,
    affiliation: initialData?.affiliation ?? "",

    country: initialData?.country ?? "India",
    state: initialData?.state ?? "",
    city: initialData?.city ?? "",
    address: initialData?.address ?? "",
    pincode: initialData?.pincode ?? "",
    latitude: initialData?.latitude ?? undefined,
    longitude: initialData?.longitude ?? undefined,

    websiteUrl: initialData?.website_url ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    alternatePhone: initialData?.alternate_phone ?? "",
    admissionContact: initialData?.admission_contact ?? "",
    admissionEmail: initialData?.admission_email ?? "",

    logoUrl: initialData?.logo_url ?? null,
    coverImageUrl: initialData?.cover_image_url ?? null,
    galleryImages: Array.isArray(initialData?.gallery_images)
      ? (initialData.gallery_images as string[])
      : [],

    accreditation: initialData?.accreditation ?? "",
    accreditationBody: initialData?.accreditation_body ?? "",
    accreditationGrade: initialData?.accreditation_grade ?? "",
    naacGrade: initialData?.naac_grade ?? "",
    nirfRank: initialData?.nirf_rank ?? undefined,
    otherRankings: initialData?.other_rankings ?? "",
    recognitionDetails: initialData?.recognition_details ?? "",
    averagePlacement: initialData?.average_placement ?? undefined,
    highestPlacement: initialData?.highest_placement ?? undefined,
    placementPercentage: initialData?.placement_percentage ?? undefined,

    facilities: Array.isArray(initialData?.facilities)
      ? (initialData.facilities as string[])
      : [],
    highlights: Array.isArray(initialData?.highlights)
      ? (initialData.highlights as string[])
      : [],

    admissionStatus: (initialData?.admission_status as any) ?? "open",
    admissionProcess: initialData?.admission_process ?? "",
    eligibilityOverview: initialData?.eligibility_overview ?? "",
    entranceExams: initialData?.entrance_exams ?? "",
    admissionStartDate: initialData?.admission_start_date ?? "",
    admissionEndDate: initialData?.admission_end_date ?? "",

    seoTitle: initialData?.seo_title ?? "",
    seoDescription: initialData?.seo_description ?? "",
    canonicalUrl: initialData?.canonical_url ?? "",
    ogImageUrl: initialData?.og_image_url ?? null,
    noIndex: initialData?.no_index ?? false,

    publicationStatus: initialData?.publication_status ?? "draft",
    isFeatured: initialData?.is_featured ?? false,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CollegeInput>({
    resolver: zodResolver(collegeSchema) as any,
    defaultValues: defaultValues as any,
  });

  const watchedName = watch("name");
  const watchedSlug = watch("slug");
  const watchedLogoUrl = watch("logoUrl");
  const watchedCoverImageUrl = watch("coverImageUrl");
  const watchedGalleryImages = watch("galleryImages") || [];
  const watchedFacilities = watch("facilities") || [];
  const watchedHighlights = watch("highlights") || [];
  const watchedPublicationStatus = watch("publicationStatus");
  const watchedIsFeatured = watch("isFeatured");

  const collegeIdForUpload = initialData?.id || "temp";

  // Slug auto-generation handler
  const handleRegenerateSlug = () => {
    if (watchedName) {
      setValue("slug", generateSlug(watchedName), { shouldValidate: true });
    }
  };

  // Facility Helpers
  const addFacility = (fac: string) => {
    const trimmed = fac.trim();
    if (!trimmed || watchedFacilities.includes(trimmed)) return;
    setValue("facilities", [...watchedFacilities, trimmed], { shouldValidate: true });
  };

  const removeFacility = (fac: string) => {
    setValue(
      "facilities",
      watchedFacilities.filter((f) => f !== fac),
      { shouldValidate: true }
    );
  };

  // Highlight Helpers
  const addHighlight = (hl: string) => {
    const trimmed = hl.trim();
    if (!trimmed || watchedHighlights.includes(trimmed)) return;
    setValue("highlights", [...watchedHighlights, trimmed], { shouldValidate: true });
  };

  const removeHighlight = (hl: string) => {
    setValue(
      "highlights",
      watchedHighlights.filter((h) => h !== hl),
      { shouldValidate: true }
    );
  };

  // Submit Handler
  const onSubmit = async (data: any, targetStatus?: "draft" | "published") => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      const typedData = data as CollegeInput;
      const payload: CollegeInput = {
        ...typedData,
        publicationStatus: targetStatus || typedData.publicationStatus,
      };

      if (mode === "create") {
        const res = await createCollegeAction(payload);
        if (!res.success) {
          setSubmitError(res.error.message);
          setIsSubmitting(false);
          return;
        }

        setSubmitSuccess("College successfully created! Redirecting to college record...");
        setTimeout(() => {
          router.push(`/admin/colleges/${res.data.id}`);
          router.refresh();
        }, 1000);
      } else {
        if (!initialData?.id) throw new Error("Missing college ID for update");
        const res = await updateCollegeAction(initialData.id, payload);
        if (!res.success) {
          setSubmitError(res.error.message);
          setIsSubmitting(false);
          return;
        }

        setSubmitSuccess("College details updated successfully!");
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
            href="/admin/colleges"
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">
              {mode === "create" ? "Add New College" : `Edit: ${initialData?.name || "College"}`}
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              {mode === "create"
                ? "Create and publish an institution to the Aspirant Vision discovery portal"
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
            onClick={() => router.push("/admin/colleges")}
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
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1" />
            )}
            {mode === "create" ? "Publish College" : "Save & Update"}
          </Button>
        </div>
      </div>

      {/* 2. ALERTS */}
      {submitError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <div>
            <span className="font-bold">Error saving college:</span> {submitError}
          </div>
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
          {/* SECTION A: Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Building2 className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">A. Basic College Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* College Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  College Name <span className="text-red-500">*</span>
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
                  placeholder="e.g. Indian Institute of Technology Delhi"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name.message}</p>}
              </div>

              {/* URL Slug */}
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
                    <RefreshCw className="w-3 h-3" /> Auto-generate from Name
                  </button>
                </div>
                <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-[#E31E2B]/20 focus-within:border-[#E31E2B]">
                  <span className="px-3 text-xs text-gray-400 select-none">/colleges/</span>
                  <input
                    type="text"
                    {...register("slug")}
                    placeholder="iit-delhi"
                    className="flex-1 py-2 pr-3 text-sm bg-transparent outline-none text-gray-900"
                  />
                </div>
                {errors.slug && <p className="text-[11px] text-red-600 mt-1">{errors.slug.message}</p>}
              </div>

              {/* College Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  College Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("collegeType")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                >
                  {COLLEGE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.collegeType && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.collegeType.message}</p>
                )}
              </div>

              {/* Ownership Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ownership Type</label>
                <select
                  {...register("ownershipType")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                >
                  <option value="">Select Ownership</option>
                  {OWNERSHIP_TYPES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              {/* Established Year */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Established Year</label>
                <input
                  type="number"
                  {...register("establishedYear", { valueAsNumber: true })}
                  placeholder="e.g. 1961"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              {/* University Affiliation / Approval */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Affiliation / Approval</label>
                <input
                  type="text"
                  {...register("affiliation")}
                  placeholder="e.g. AICTE, UGC, Autonomous"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              {/* Short Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Short Description (Catalog summary)
                </label>
                <textarea
                  {...register("shortDescription")}
                  rows={2}
                  placeholder="A concise 1-2 sentence overview of the institution..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              {/* Full Detailed Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Institution Profile & History
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder="Detailed institution history, campus environment, academic philosophy..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>
            </div>
          </div>

          {/* SECTION B: Location Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <MapPin className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">B. Campus Location</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("state")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.state && <p className="text-[11px] text-red-600 mt-1">{errors.state.message}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("city")}
                  placeholder="e.g. New Delhi"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
                {errors.city && <p className="text-[11px] text-red-600 mt-1">{errors.city.message}</p>}
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  {...register("pincode")}
                  placeholder="e.g. 110016"
                  maxLength={6}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
                {errors.pincode && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.pincode.message}</p>
                )}
              </div>

              {/* Full Address */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Campus Address</label>
                <input
                  type="text"
                  {...register("address")}
                  placeholder="Hauz Khas, New Delhi, Delhi 110016"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              {/* Latitude & Longitude */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  {...register("latitude", { valueAsNumber: true })}
                  placeholder="e.g. 28.5450"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  {...register("longitude", { valueAsNumber: true })}
                  placeholder="e.g. 77.1926"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>
            </div>
          </div>

          {/* SECTION C: Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Phone className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">C. Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Official Website</label>
                <input
                  type="url"
                  {...register("websiteUrl")}
                  placeholder="https://home.iitd.ac.in"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
                {errors.websiteUrl && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.websiteUrl.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">General Office Email</label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="info@iitd.ac.in"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
                {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Telephone</label>
                <input
                  type="text"
                  {...register("phone")}
                  placeholder="+91 11 2659 7135"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Alternate Phone</label>
                <input
                  type="text"
                  {...register("alternatePhone")}
                  placeholder="+91 11 2659 1000"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Admission Desk Contact Person / Phone
                </label>
                <input
                  type="text"
                  {...register("admissionContact")}
                  placeholder="Admission Cell / +91 98765 43210"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Admission Desk Email</label>
                <input
                  type="email"
                  {...register("admissionEmail")}
                  placeholder="admissions@iitd.ac.in"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
                {errors.admissionEmail && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.admissionEmail.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION D: Images & Visual Assets */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <ImageIcon className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">D. Images & Campus Media</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* College Logo */}
              <SingleImageUploader
                label="College Official Logo"
                description="Square emblem (1:1), PNG or WebP recommended"
                currentValue={watchedLogoUrl}
                category="logo"
                collegeId={collegeIdForUpload}
                aspectRatio="square"
                onImageUploaded={(url) => setValue("logoUrl", url, { shouldValidate: true })}
                onImageRemoved={() => setValue("logoUrl", null, { shouldValidate: true })}
              />

              {/* Cover Banner */}
              <SingleImageUploader
                label="Campus Cover Banner"
                description="Landscape banner (16:9), shown at top of profile"
                currentValue={watchedCoverImageUrl}
                category="cover"
                collegeId={collegeIdForUpload}
                aspectRatio="banner"
                onImageUploaded={(url) => setValue("coverImageUrl", url, { shouldValidate: true })}
                onImageRemoved={() => setValue("coverImageUrl", null, { shouldValidate: true })}
              />
            </div>

            {/* Campus Gallery */}
            <div className="pt-2 border-t border-gray-100">
              <GalleryUploader
                galleryImages={watchedGalleryImages}
                collegeId={collegeIdForUpload}
                onImagesChange={(imgs) => setValue("galleryImages", imgs, { shouldValidate: true })}
              />
            </div>
          </div>

          {/* SECTION E: Accreditation, Rankings & Placements */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Award className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">
                E. Accreditation, Rankings & Placements
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">NAAC Grade</label>
                <select
                  {...register("naacGrade")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                >
                  <option value="">Select NAAC Grade</option>
                  {NAAC_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">NIRF National Rank</label>
                <input
                  type="number"
                  {...register("nirfRank", { valueAsNumber: true })}
                  placeholder="e.g. 2"
                  min={1}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Accreditation Body
                </label>
                <input
                  type="text"
                  {...register("accreditationBody")}
                  placeholder="e.g. NBA, NAAC, ABET"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Average Placement (LPA)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("averagePlacement", { valueAsNumber: true })}
                  placeholder="e.g. 18.5"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Highest Placement (LPA)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("highestPlacement", { valueAsNumber: true })}
                  placeholder="e.g. 120.0"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Placement Rate (%)
                </label>
                <input
                  type="number"
                  {...register("placementPercentage", { valueAsNumber: true })}
                  placeholder="e.g. 96"
                  min={0}
                  max={100}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Other Notable Rankings & Honors
                </label>
                <input
                  type="text"
                  {...register("otherRankings")}
                  placeholder="e.g. QS World University Rank #185, Outlook #1 in Engineering"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>
            </div>
          </div>

          {/* SECTION F: Facilities & Highlights */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Sparkles className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">F. Campus Facilities & Highlights</h2>
            </div>

            {/* Quick Facility Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Campus Facilities</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {FACILITY_PRESETS.map((preset) => {
                  const isSelected = watchedFacilities.includes(preset);
                  return (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => (isSelected ? removeFacility(preset) : addFacility(preset))}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        isSelected
                          ? "bg-[#E31E2B] text-white border-[#E31E2B]"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {preset}
                    </button>
                  );
                })}
              </div>

              {/* Add custom facility */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  placeholder="Add custom facility..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFacility(newFacility);
                      setNewFacility("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addFacility(newFacility);
                    setNewFacility("");
                  }}
                  className="text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>

              {/* Selected facilities chips */}
              {watchedFacilities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {watchedFacilities.map((fac) => (
                    <span
                      key={fac}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-red-50 text-red-700 border border-red-200 font-medium"
                    >
                      {fac}
                      <button
                        type="button"
                        onClick={() => removeFacility(fac)}
                        className="hover:text-red-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Highlights */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-700">
                Key Selling Highlights (Bullet Points for Students)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  placeholder="e.g. 100% Internship Assistance with Fortune 500 companies"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E31E2B]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addHighlight(newHighlight);
                      setNewHighlight("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addHighlight(newHighlight);
                    setNewHighlight("");
                  }}
                  className="text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>

              {watchedHighlights.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {watchedHighlights.map((hl, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-800"
                    >
                      <span className="font-medium">• {hl}</span>
                      <button
                        type="button"
                        onClick={() => removeHighlight(hl)}
                        className="text-gray-400 hover:text-red-600 ml-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION G: Admission Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <FileCheck className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">G. Admission Guidelines & Cycle</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Current Admission Status
                </label>
                <select
                  {...register("admissionStatus")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                >
                  {ADMISSION_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Admission Start Date
                </label>
                <input
                  type="date"
                  {...register("admissionStartDate")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Admission End Date
                </label>
                <input
                  type="date"
                  {...register("admissionEndDate")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Accepted Entrance Exams
                </label>
                <input
                  type="text"
                  {...register("entranceExams")}
                  placeholder="e.g. JEE Advanced, JEE Main, GATE, CAT, NEET"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Eligibility Overview
                </label>
                <textarea
                  {...register("eligibilityOverview")}
                  rows={2}
                  placeholder="Minimum 75% in 10+2 with Physics, Chemistry, Math and qualifying score in JEE Advanced..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Admission Process Summary
                </label>
                <textarea
                  {...register("admissionProcess")}
                  rows={2}
                  placeholder="Step-by-step guidance on how students can apply through Aspirant Vision counselling..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT / SIDEBAR COLUMN (1 COL) */}
        <div className="space-y-6">
          {/* SECTION I: Publishing & Status Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Settings2 className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">Publishing Settings</h2>
            </div>

            {/* Publication Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Publication Status
              </label>
              <select
                {...register("publicationStatus")}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
              >
                <option value="draft">Draft (Hidden from public)</option>
                <option value="published">Published (Live on portal)</option>
                <option value="archived">Archived (Soft deleted)</option>
              </select>
            </div>

            {/* Featured Toggle */}
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isFeatured")}
                  className="w-4 h-4 text-[#E31E2B] rounded border-gray-300 focus:ring-[#E31E2B]"
                />
                <span className="text-xs font-bold text-gray-900">Featured Institution</span>
              </label>
              <p className="text-[11px] text-gray-500 pl-6">
                Featured institutions appear highlighted in hero cards and search discovery rankings.
              </p>
            </div>

            {/* Live Link if already published */}
            {mode === "edit" && initialData?.slug && watchedPublicationStatus === "published" && (
              <div className="pt-2 border-t border-gray-100">
                <Link
                  href={`/colleges/${initialData.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E31E2B] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Public Page
                </Link>
              </div>
            )}
          </div>

          {/* SECTION H: SEO & Social Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Globe className="w-4 h-4 text-[#E31E2B]" />
              <h2 className="text-sm font-bold text-gray-900">H. SEO & Meta Tags</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Meta Title (Page Title)
              </label>
              <input
                type="text"
                {...register("seoTitle")}
                placeholder="e.g. IIT Delhi - Admissions, Cutoff, Fees & Placements"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
              />
              <p className="text-[10px] text-gray-400 mt-1">Recommended: 50-60 characters</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Meta Description</label>
              <textarea
                {...register("seoDescription")}
                rows={3}
                placeholder="Explore IIT Delhi admissions, ranking, courses, fees, scholarships, and placement statistics..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
              />
              <p className="text-[10px] text-gray-400 mt-1">Recommended: 120-160 characters</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Canonical URL</label>
              <input
                type="url"
                {...register("canonicalUrl")}
                placeholder="https://aspirantvision.com/colleges/iit-delhi"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E31E2B]/20 focus:border-[#E31E2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">OG Share Image URL</label>
              <input
                type="url"
                {...register("ogImageUrl")}
                placeholder="https://.../og-banner.jpg"
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
                <span className="text-xs text-gray-700 font-medium">
                  No-Index (Hide from Google Search)
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
