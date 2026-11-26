"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { ApiResponse } from "@/types/api.types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

export interface UploadResult {
  publicUrl: string;
  storagePath: string;
  filename: string;
}

/**
 * Server Action to securely upload college assets to Supabase Storage.
 * Restricts access to authenticated staff members.
 */
export async function uploadCollegeAssetAction(
  formData: FormData
): Promise<ApiResponse<UploadResult>> {
  try {
    await requireAuth("/admin/login");

    const file = formData.get("file") as File | null;
    const collegeId = (formData.get("collegeId") as string) || "general";
    const category = (formData.get("category") as string) || "misc"; // logo | cover | gallery

    if (!file) {
      return { success: false, error: { code: "NO_FILE", message: "No image file provided." } };
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: { code: "FILE_TOO_LARGE", message: "File exceeds 5MB size limit." },
      };
    }

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: {
          code: "INVALID_MIME_TYPE",
          message: "Unsupported file type. Please upload JPEG, PNG, WebP, or SVG.",
        },
      };
    }

    const supabase = await createClient();

    // Clean file extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const timestamp = Date.now();
    const cleanFileName = `${timestamp}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const storagePath = `${collegeId}/${category}/${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("college-assets")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[Supabase Storage Upload Error]:", uploadError);
      return {
        success: false,
        error: { code: "STORAGE_UPLOAD_FAILED", message: uploadError.message },
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from("college-assets")
      .getPublicUrl(storagePath);

    return {
      success: true,
      data: {
        publicUrl: publicUrlData.publicUrl,
        storagePath,
        filename: file.name,
      },
    };
  } catch (err: unknown) {
    console.error("[uploadCollegeAssetAction Exception]:", err);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to upload asset." },
    };
  }
}

/**
 * Deletes a storage asset from college-assets
 */
export async function deleteCollegeAssetAction(
  storagePath: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  try {
    await requireAuth("/admin/login");

    const supabase = await createClient();
    const { error } = await supabase.storage.from("college-assets").remove([storagePath]);

    if (error) {
      return { success: false, error: { code: "DELETE_FAILED", message: error.message } };
    }

    return { success: true, data: { deleted: true } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to remove asset." },
    };
  }
}
