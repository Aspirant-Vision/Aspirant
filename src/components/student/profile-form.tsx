"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentProfileSchema, StudentProfileInput } from "@/lib/validation/student";
import { updateStudentProfileAction } from "@/lib/student/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
} from "lucide-react";

interface ProfileFormProps {
  initialData: {
    fullName: string;
    phone?: string | null;
    alternatePhone?: string | null;
    dateOfBirth?: string | null;
    gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    pinCode?: string | null;
    avatarUrl?: string | null;
    email: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentProfileInput>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      fullName: initialData.fullName || "",
      phone: initialData.phone || "",
      alternatePhone: initialData.alternatePhone || "",
      dateOfBirth: initialData.dateOfBirth || "",
      gender: initialData.gender || undefined,
      city: initialData.city || "",
      state: initialData.state || "",
      country: initialData.country || "India",
      pinCode: initialData.pinCode || "",
      avatarUrl: initialData.avatarUrl || "",
    },
  });

  const avatarUrl = watch("avatarUrl");

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMessage({ type: "error", text: "Please upload a valid image file (PNG, JPG, WebP)" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage({ type: "error", text: "Image file size must be less than 2MB" });
      return;
    }

    try {
      setIsUploading(true);
      setStatusMessage(null);
      const supabase = createClient();

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Authentication required");

      const fileExt = file.name.split(".").pop();
      const fileName = `${userData.user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("student-avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("student-avatars")
        .getPublicUrl(fileName);

      setValue("avatarUrl", publicUrlData.publicUrl, { shouldDirty: true });
      setStatusMessage({ type: "success", text: "Avatar uploaded. Don't forget to save changes!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to upload avatar" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setValue("avatarUrl", "", { shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: StudentProfileInput) => {
    try {
      setIsSubmitting(true);
      setStatusMessage(null);

      const res = await updateStudentProfileAction(values);
      if (res.success) {
        setStatusMessage({ type: "success", text: "Profile details updated successfully!" });
      } else {
        setStatusMessage({ type: "error", text: res.error?.message || "Failed to update profile" });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Feedback Alert */}
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

      {/* Avatar Management Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Profile Photo</h3>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile Avatar"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-red-100 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-red-50 border-2 border-dashed border-red-200 text-primary flex items-center justify-center font-black text-2xl">
                {initialData.fullName.charAt(0).toUpperCase()}
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer text-xs"
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  <span>{avatarUrl ? "Change Photo" : "Upload Photo"}</span>
                </Button>
              </label>

              {avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  className="text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Remove</span>
                </Button>
              )}
            </div>
            <p className="text-[11px] text-gray-400">
              Supported formats: JPG, PNG, WebP (Max: 2MB). Direct upload to secure storage.
            </p>
          </div>
        </div>
      </div>

      {/* Personal & Contact Details */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Full Name *</label>
            <input
              type="text"
              {...register("fullName")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. Rahul Sharma"
            />
            {errors.fullName && (
              <p className="text-[11px] text-red-600 font-medium">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email (Read-Only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Email Address (Read-only)</label>
            <input
              type="email"
              value={initialData.email}
              disabled
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Mobile Phone</label>
            <input
              type="tel"
              {...register("phone")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. 9876543210"
            />
            {errors.phone && (
              <p className="text-[11px] text-red-600 font-medium">{errors.phone.message}</p>
            )}
          </div>

          {/* Alternate Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Alternate / Parent Phone</label>
            <input
              type="tel"
              {...register("alternatePhone")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. 9812345678"
            />
            {errors.alternatePhone && (
              <p className="text-[11px] text-red-600 font-medium">{errors.alternatePhone.message}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Date of Birth</label>
            <input
              type="date"
              {...register("dateOfBirth")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            {errors.dateOfBirth && (
              <p className="text-[11px] text-red-600 font-medium">{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Gender</label>
            <select
              {...register("gender")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="text-[11px] text-red-600 font-medium">{errors.gender.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address & Location */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
          Location & Domicile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* City */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">City</label>
            <input
              type="text"
              {...register("city")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. Lucknow"
            />
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">State</label>
            <input
              type="text"
              {...register("state")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. Uttar Pradesh"
            />
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Country</label>
            <input
              type="text"
              {...register("country")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="India"
            />
          </div>

          {/* PIN Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">PIN Code</label>
            <input
              type="text"
              {...register("pinCode")}
              maxLength={6}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. 226001"
            />
            {errors.pinCode && (
              <p className="text-[11px] text-red-600 font-medium">{errors.pinCode.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
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
            <span>Save Profile</span>
          )}
        </Button>
      </div>
    </form>
  );
}
