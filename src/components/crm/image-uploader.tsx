"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";
import { uploadCollegeAssetAction } from "@/lib/college/storage";
import { Button } from "@/components/ui/button";

interface SingleImageUploaderProps {
  label: string;
  description?: string;
  currentValue?: string | null;
  category: "logo" | "cover";
  collegeId?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved: () => void;
  aspectRatio?: "square" | "banner";
}

export function SingleImageUploader({
  label,
  description,
  currentValue,
  category,
  collegeId = "temp",
  onImageUploaded,
  onImageRemoved,
  aspectRatio = "square",
}: SingleImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage(null);
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("collegeId", collegeId);

      const res = await uploadCollegeAssetAction(formData);

      if (!res.success) {
        setErrorMessage(res.error.message);
        setIsUploading(false);
        return;
      }

      onImageUploaded(res.data.publicUrl);
      setIsUploading(false);
    } catch {
      setErrorMessage("An unexpected network error occurred while uploading.");
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-semibold text-gray-800">{label}</label>
        {description && <p className="text-[11px] text-gray-500">{description}</p>}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-50 text-red-700 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {currentValue ? (
        <div className="relative group rounded-xl border border-gray-200 overflow-hidden bg-gray-50 w-full max-w-sm">
          <div
            className={`relative ${
              aspectRatio === "banner" ? "h-36 sm:h-44 w-full" : "h-28 w-28 mx-auto"
            }`}
          >
            <Image
              src={currentValue}
              alt={label}
              fill
              className="object-contain p-2"
              sizes="(max-width: 640px) 100vw, 320px"
            />
          </div>

          {/* Remove / Replace Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-white text-gray-900 text-xs font-semibold shadow hover:bg-gray-100"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={onImageRemoved}
              className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold shadow hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-gray-50 max-w-sm"
        >
          {isUploading ? (
            <div className="py-3 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs text-gray-500 font-medium">Uploading to storage...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Click to upload</span>
              <span className="text-[10px] text-gray-400">PNG, JPG, WebP up to 5MB</span>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

interface GalleryUploaderProps {
  galleryImages: string[];
  collegeId?: string;
  onImagesChange: (images: string[]) => void;
}

export function GalleryUploader({
  galleryImages,
  collegeId = "temp",
  onImagesChange,
}: GalleryUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleMultipleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setErrorMessage(null);
      setIsUploading(true);
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "gallery");
        formData.append("collegeId", collegeId);

        const res = await uploadCollegeAssetAction(formData);
        if (res.success) {
          newUrls.push(res.data.publicUrl);
        }
      }

      onImagesChange([...galleryImages, ...newUrls]);
      setIsUploading(false);
    } catch {
      setErrorMessage("Failed to upload some gallery assets.");
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onImagesChange(galleryImages.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-800">
          Campus Gallery Images ({galleryImages.length})
        </label>
        <p className="text-[11px] text-gray-500">
          Upload high-resolution photographs of classrooms, labs, libraries, hostels, and sports grounds.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-50 text-red-700 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid of Existing Gallery Images */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {galleryImages.map((url, idx) => (
          <div
            key={idx}
            className="group relative h-28 rounded-xl border border-gray-200 overflow-hidden bg-gray-50"
          >
            <Image
              src={url}
              alt={`Gallery image ${idx + 1}`}
              fill
              className="object-cover"
              sizes="160px"
            />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Upload Slot */}
        <div
          onClick={() => galleryInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-xl h-28 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-gray-50/50 hover:bg-gray-50 p-2 text-center"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <>
              <ImageIcon className="w-5 h-5 text-gray-400" />
              <span className="text-[11px] font-semibold text-gray-700">+ Add Photos</span>
            </>
          )}
        </div>
      </div>

      <input
        ref={galleryInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        onChange={handleMultipleFiles}
        className="hidden"
      />
    </div>
  );
}
