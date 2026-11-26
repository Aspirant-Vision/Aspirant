"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireAuth, getCurrentUser } from "@/lib/auth/session";
import { collegeSchema, CollegeInput, generateSlug } from "@/lib/validation/college";
import { ApiResponse } from "@/types/api.types";
import { Database, CollegePublicationStatus } from "@/types/database.types";

export type CollegeRow = Database["public"]["Tables"]["colleges"]["Row"];

export interface CollegeListingParams {
  search?: string;
  status?: string; // "all" | "draft" | "published" | "archived"
  collegeType?: string;
  state?: string;
  isFeatured?: boolean;
  sortBy?: "name" | "updated_at" | "created_at";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface CollegeListingResult {
  colleges: CollegeRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ------------------------------------------------------------------------------
// 1. CREATE COLLEGE
// ------------------------------------------------------------------------------
export async function createCollegeAction(
  input: CollegeInput
): Promise<ApiResponse<{ id: string; slug: string }>> {
  try {
    const adminUser = await requireAdmin();

    const parsed = collegeSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Invalid college data",
        },
      };
    }

    const data = parsed.data;
    const supabase = await createClient();

    // Check slug uniqueness; append counter if duplicate
    let targetSlug = data.slug || generateSlug(data.name);
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from("colleges")
        .select("id")
        .eq("slug", targetSlug)
        .maybeSingle();

      if (!existing) break;
      targetSlug = `${generateSlug(data.name)}-${counter}`;
      counter++;
    }

    const nowIso = new Date().toISOString();
    const publishedAt = data.publicationStatus === "published" ? nowIso : null;

    const { data: inserted, error: insertError } = await supabase
      .from("colleges")
      .insert({
        name: data.name,
        slug: targetSlug,
        short_description: data.shortDescription,
        description: data.description,
        college_type: data.collegeType,
        ownership_type: data.ownershipType,
        established_year: Number.isNaN(data.establishedYear) ? null : data.establishedYear,
        affiliation: data.affiliation,

        country: data.country || "India",
        state: data.state,
        city: data.city,
        address: data.address,
        pincode: data.pincode,
        latitude: Number.isNaN(data.latitude) ? null : data.latitude,
        longitude: Number.isNaN(data.longitude) ? null : data.longitude,

        website_url: data.websiteUrl,
        email: data.email,
        phone: data.phone,
        alternate_phone: data.alternatePhone,
        admission_contact: data.admissionContact,
        admission_email: data.admissionEmail,

        logo_url: data.logoUrl,
        cover_image_url: data.coverImageUrl,
        gallery_images: data.galleryImages || [],

        accreditation: data.accreditation,
        accreditation_body: data.accreditationBody,
        accreditation_grade: data.accreditationGrade,
        naac_grade: data.naacGrade,
        nirf_rank: Number.isNaN(data.nirfRank) ? null : data.nirfRank,
        other_rankings: data.otherRankings,
        recognition_details: data.recognitionDetails,
        average_placement: Number.isNaN(data.averagePlacement) ? null : data.averagePlacement,
        highest_placement: Number.isNaN(data.highestPlacement) ? null : data.highestPlacement,
        placement_percentage: Number.isNaN(data.placementPercentage) ? null : data.placementPercentage,

        facilities: data.facilities || [],
        highlights: data.highlights || [],

        admission_status: data.admissionStatus,
        admission_process: data.admissionProcess,
        eligibility_overview: data.eligibilityOverview,
        entrance_exams: data.entranceExams,
        admission_start_date: data.admissionStartDate || null,
        admission_end_date: data.admissionEndDate || null,

        seo_title: data.seoTitle,
        seo_description: data.seoDescription,
        canonical_url: data.canonicalUrl,
        og_image_url: data.ogImageUrl,
        no_index: data.noIndex,

        publication_status: data.publicationStatus,
        is_featured: data.isFeatured,
        published_at: publishedAt,
        created_by: adminUser.id,
        updated_by: adminUser.id,
      })
      .select("id, slug")
      .single();

    if (insertError || !inserted) {
      return {
        success: false,
        error: {
          code: "INSERT_FAILED",
          message: insertError?.message || "Failed to create college profile.",
        },
      };
    }

    // Record audit log
    await supabase.from("audit_logs").insert({
      actor_id: adminUser.id,
      action: "COLLEGE_CREATED",
      entity_type: "colleges",
      entity_id: inserted.id,
      new_values: { name: data.name, slug: targetSlug, status: data.publicationStatus },
    });

    // Revalidate affected routes
    revalidatePath("/admin/colleges");
    revalidatePath("/admin/dashboard");
    revalidatePath("/colleges");
    revalidatePath("/");

    return {
      success: true,
      data: {
        id: inserted.id,
        slug: inserted.slug,
      },
    };
  } catch (err: unknown) {
    console.error("[createCollegeAction error]:", err);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "An unexpected error occurred." },
    };
  }
}

// ------------------------------------------------------------------------------
// 2. UPDATE COLLEGE
// ------------------------------------------------------------------------------
export async function updateCollegeAction(
  id: string,
  input: CollegeInput
): Promise<ApiResponse<{ id: string; slug: string }>> {
  try {
    const adminUser = await requireAdmin();

    const parsed = collegeSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message || "Invalid college data",
        },
      };
    }

    const data = parsed.data;
    const supabase = await createClient();

    // Check slug uniqueness excluding current record
    const { data: conflict } = await supabase
      .from("colleges")
      .select("id")
      .eq("slug", data.slug)
      .neq("id", id)
      .maybeSingle();

    if (conflict) {
      return {
        success: false,
        error: {
          code: "SLUG_CONFLICT",
          message: `The slug "${data.slug}" is already in use by another college. Please choose a unique slug.`,
        },
      };
    }

    // Get current publication status
    const { data: current } = await supabase
      .from("colleges")
      .select("publication_status, published_at, slug")
      .eq("id", id)
      .single();

    let publishedAt = current?.published_at;
    if (data.publicationStatus === "published" && current?.publication_status !== "published") {
      publishedAt = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("colleges")
      .update({
        name: data.name,
        slug: data.slug,
        short_description: data.shortDescription,
        description: data.description,
        college_type: data.collegeType,
        ownership_type: data.ownershipType,
        established_year: Number.isNaN(data.establishedYear) ? null : data.establishedYear,
        affiliation: data.affiliation,

        country: data.country || "India",
        state: data.state,
        city: data.city,
        address: data.address,
        pincode: data.pincode,
        latitude: Number.isNaN(data.latitude) ? null : data.latitude,
        longitude: Number.isNaN(data.longitude) ? null : data.longitude,

        website_url: data.websiteUrl,
        email: data.email,
        phone: data.phone,
        alternate_phone: data.alternatePhone,
        admission_contact: data.admissionContact,
        admission_email: data.admissionEmail,

        logo_url: data.logoUrl,
        cover_image_url: data.coverImageUrl,
        gallery_images: data.galleryImages || [],

        accreditation: data.accreditation,
        accreditation_body: data.accreditationBody,
        accreditation_grade: data.accreditationGrade,
        naac_grade: data.naacGrade,
        nirf_rank: Number.isNaN(data.nirfRank) ? null : data.nirfRank,
        other_rankings: data.otherRankings,
        recognition_details: data.recognitionDetails,
        average_placement: Number.isNaN(data.averagePlacement) ? null : data.averagePlacement,
        highest_placement: Number.isNaN(data.highestPlacement) ? null : data.highestPlacement,
        placement_percentage: Number.isNaN(data.placementPercentage) ? null : data.placementPercentage,

        facilities: data.facilities || [],
        highlights: data.highlights || [],

        admission_status: data.admissionStatus,
        admission_process: data.admissionProcess,
        eligibility_overview: data.eligibilityOverview,
        entrance_exams: data.entranceExams,
        admission_start_date: data.admissionStartDate || null,
        admission_end_date: data.admissionEndDate || null,

        seo_title: data.seoTitle,
        seo_description: data.seoDescription,
        canonical_url: data.canonicalUrl,
        og_image_url: data.ogImageUrl,
        no_index: data.noIndex,

        publication_status: data.publicationStatus,
        is_featured: data.isFeatured,
        published_at: publishedAt,
        updated_by: adminUser.id,
      })
      .eq("id", id);

    if (updateError) {
      return {
        success: false,
        error: { code: "UPDATE_FAILED", message: updateError.message },
      };
    }

    // Record audit log
    await supabase.from("audit_logs").insert({
      actor_id: adminUser.id,
      action: "COLLEGE_UPDATED",
      entity_type: "colleges",
      entity_id: id,
      new_values: { name: data.name, slug: data.slug, status: data.publicationStatus },
    });

    // Revalidate affected routes
    revalidatePath("/admin/colleges");
    revalidatePath(`/admin/colleges/${id}`);
    revalidatePath(`/admin/colleges/${id}/edit`);
    revalidatePath("/admin/dashboard");
    revalidatePath("/colleges");
    revalidatePath(`/colleges/${data.slug}`);
    if (current?.slug && current.slug !== data.slug) {
      revalidatePath(`/colleges/${current.slug}`);
    }
    revalidatePath("/");

    return {
      success: true,
      data: { id, slug: data.slug },
    };
  } catch (err: unknown) {
    console.error("[updateCollegeAction error]:", err);
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "An unexpected error occurred." },
    };
  }
}

// ------------------------------------------------------------------------------
// 3. TOGGLE PUBLISH / UNPUBLISH
// ------------------------------------------------------------------------------
export async function togglePublishCollegeAction(
  id: string,
  publish: boolean
): Promise<ApiResponse<{ id: string; status: CollegePublicationStatus }>> {
  try {
    const adminUser = await requireAdmin();
    const supabase = await createClient();

    // If publishing, check minimum required fields
    if (publish) {
      const { data: college } = await supabase
        .from("colleges")
        .select("name, slug, state, city")
        .eq("id", id)
        .single();

      if (!college || !college.name || !college.slug || !college.state || !college.city) {
        return {
          success: false,
          error: {
            code: "INCOMPLETE_RECORD",
            message: "Cannot publish college. Name, unique slug, state, and city are mandatory.",
          },
        };
      }
    }

    const targetStatus: CollegePublicationStatus = publish ? "published" : "draft";
    const publishedAt = publish ? new Date().toISOString() : null;

    const { data: updated, error } = await supabase
      .from("colleges")
      .update({
        publication_status: targetStatus,
        published_at: publishedAt,
        deleted_at: null, // Clear archival if publishing
        updated_by: adminUser.id,
      })
      .eq("id", id)
      .select("slug")
      .single();

    if (error) {
      return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
    }

    // Revalidation
    revalidatePath("/admin/colleges");
    revalidatePath(`/admin/colleges/${id}`);
    revalidatePath("/admin/dashboard");
    revalidatePath("/colleges");
    if (updated?.slug) revalidatePath(`/colleges/${updated.slug}`);
    revalidatePath("/");

    return {
      success: true,
      data: { id, status: targetStatus },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to update publication status." },
    };
  }
}

// ------------------------------------------------------------------------------
// 4. TOGGLE FEATURED
// ------------------------------------------------------------------------------
export async function toggleFeaturedCollegeAction(
  id: string,
  isFeatured: boolean
): Promise<ApiResponse<{ id: string; isFeatured: boolean }>> {
  try {
    const adminUser = await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("colleges")
      .update({
        is_featured: isFeatured,
        updated_by: adminUser.id,
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
    }

    revalidatePath("/admin/colleges");
    revalidatePath(`/admin/colleges/${id}`);
    revalidatePath("/colleges");
    revalidatePath("/");

    return {
      success: true,
      data: { id, isFeatured },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to update featured flag." },
    };
  }
}

// ------------------------------------------------------------------------------
// 5. ARCHIVE COLLEGE (Soft-Delete)
// ------------------------------------------------------------------------------
export async function archiveCollegeAction(
  id: string
): Promise<ApiResponse<{ id: string }>> {
  try {
    const adminUser = await requireAdmin();
    const supabase = await createClient();

    const { data: updated, error } = await supabase
      .from("colleges")
      .update({
        publication_status: "archived",
        deleted_at: new Date().toISOString(),
        updated_by: adminUser.id,
      })
      .eq("id", id)
      .select("slug")
      .single();

    if (error) {
      return { success: false, error: { code: "ARCHIVE_FAILED", message: error.message } };
    }

    await supabase.from("audit_logs").insert({
      actor_id: adminUser.id,
      action: "COLLEGE_ARCHIVED",
      entity_type: "colleges",
      entity_id: id,
    });

    revalidatePath("/admin/colleges");
    revalidatePath(`/admin/colleges/${id}`);
    revalidatePath("/admin/dashboard");
    revalidatePath("/colleges");
    if (updated?.slug) revalidatePath(`/colleges/${updated.slug}`);
    revalidatePath("/");

    return { success: true, data: { id } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to archive college." },
    };
  }
}

// ------------------------------------------------------------------------------
// 6. RESTORE COLLEGE
// ------------------------------------------------------------------------------
export async function restoreCollegeAction(
  id: string
): Promise<ApiResponse<{ id: string }>> {
  try {
    const adminUser = await requireAdmin();
    const supabase = await createClient();

    const { data: updated, error } = await supabase
      .from("colleges")
      .update({
        publication_status: "draft",
        deleted_at: null,
        updated_by: adminUser.id,
      })
      .eq("id", id)
      .select("slug")
      .single();

    if (error) {
      return { success: false, error: { code: "RESTORE_FAILED", message: error.message } };
    }

    revalidatePath("/admin/colleges");
    revalidatePath(`/admin/colleges/${id}`);
    revalidatePath("/admin/dashboard");

    return { success: true, data: { id } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to restore college." },
    };
  }
}

// ------------------------------------------------------------------------------
// 7. GET COLLEGES LISTING (Admin CRM - Filtered & Paginated)
// ------------------------------------------------------------------------------
export async function getCollegesListingAction(
  params: CollegeListingParams = {}
): Promise<ApiResponse<CollegeListingResult>> {
  try {
    await requireAuth("/admin/login");

    const {
      search,
      status = "all",
      collegeType,
      state,
      isFeatured,
      sortBy = "updated_at",
      sortOrder = "desc",
      page = 1,
      pageSize = 10,
    } = params;

    const supabase = await createClient();
    let query = supabase.from("colleges").select("*", { count: "exact" });

    // Status filter
    if (status && status !== "all") {
      query = query.eq("publication_status", status as CollegePublicationStatus);
    }

    // Type filter
    if (collegeType && collegeType !== "all") {
      query = query.eq("college_type", collegeType);
    }

    // State filter
    if (state && state !== "all") {
      query = query.eq("state", state);
    }

    // Featured filter
    if (isFeatured !== undefined) {
      query = query.eq("is_featured", isFeatured);
    }

    // Search query (name, city, state)
    if (search && search.trim().length > 0) {
      const trimmed = search.trim();
      query = query.or(`name.ilike.%${trimmed}%,city.ilike.%${trimmed}%,state.ilike.%${trimmed}%`);
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    const totalCount = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
      success: true,
      data: {
        colleges: data || [],
        totalCount,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to fetch colleges." },
    };
  }
}

// ------------------------------------------------------------------------------
// 8. GET COLLEGE BY ID (Admin CRM)
// ------------------------------------------------------------------------------
export async function getCollegeByIdAction(
  id: string
): Promise<ApiResponse<CollegeRow>> {
  try {
    await requireAuth("/admin/login");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("colleges")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "College record not found." },
      };
    }

    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to load college." },
    };
  }
}

// ------------------------------------------------------------------------------
// 9. GET COLLEGE BY SLUG (Public Website - Published Only)
// ------------------------------------------------------------------------------
export async function getCollegeBySlugPublicAction(
  slug: string
): Promise<ApiResponse<CollegeRow>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("colleges")
      .select("*")
      .eq("slug", slug)
      .eq("publication_status", "published")
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !data) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "College not found or not currently published." },
      };
    }

    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to load public college." },
    };
  }
}

// ------------------------------------------------------------------------------
// 10. GET PUBLIC COLLEGES (Catalog Listing - Published Only)
// ------------------------------------------------------------------------------
export async function getPublicCollegesAction(params: {
  search?: string;
  collegeType?: string;
  state?: string;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
} = {}): Promise<ApiResponse<{ colleges: CollegeRow[]; totalCount: number }>> {
  try {
    const {
      search,
      collegeType,
      state,
      isFeatured,
      page = 1,
      pageSize = 12,
    } = params;

    const supabase = await createClient();
    let query = supabase
      .from("colleges")
      .select("*", { count: "exact" })
      .eq("publication_status", "published")
      .is("deleted_at", null);

    if (collegeType && collegeType !== "all") {
      query = query.eq("college_type", collegeType);
    }

    if (state && state !== "all") {
      query = query.eq("state", state);
    }

    if (isFeatured) {
      query = query.eq("is_featured", true);
    }

    if (search && search.trim().length > 0) {
      const trimmed = search.trim();
      query = query.or(`name.ilike.%${trimmed}%,city.ilike.%${trimmed}%,state.ilike.%${trimmed}%`);
    }

    query = query
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true });

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    return {
      success: true,
      data: {
        colleges: data || [],
        totalCount: count ?? 0,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to fetch colleges." },
    };
  }
}
