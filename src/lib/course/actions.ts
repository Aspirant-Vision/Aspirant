"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireAuth } from "@/lib/auth/session";
import {
  courseSchema,
  CourseInput,
  collegeCourseAssociationSchema,
  CollegeCourseAssociationInput,
  feeRecordSchema,
  FeeRecordInput,
  scholarshipSchema,
  ScholarshipInput,
  generateSlug,
} from "@/lib/validation/course";
import { ApiResponse } from "@/types/api.types";
import { Database } from "@/types/database.types";

export type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
export type CollegeCourseRow = Database["public"]["Tables"]["college_courses"]["Row"];
export type CollegeFeeRow = Database["public"]["Tables"]["college_fees"]["Row"];
export type ScholarshipRow = Database["public"]["Tables"]["scholarships"]["Row"];

// ==============================================================================
// 1. COURSES SERVER ACTIONS
// ==============================================================================

export interface CourseListingParams {
  search?: string;
  category?: string;
  degreeType?: string;
  status?: string; // all | published | draft | archived
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "updated_at" | "created_at";
  sortOrder?: "asc" | "desc";
}

export async function createCourseAction(
  input: CourseInput
): Promise<ApiResponse<{ id: string; slug: string }>> {
  try {
    const adminUser = await requireAdmin();
    const parsed = courseSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid data" },
      };
    }

    const data = parsed.data;
    const supabase = await createClient();

    // Slug uniqueness
    let targetSlug = data.slug || generateSlug(data.name);
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", targetSlug)
        .maybeSingle();

      if (!existing) break;
      targetSlug = `${generateSlug(data.name)}-${counter}`;
      counter++;
    }

    const nowIso = new Date().toISOString();
    const publishedAt = data.publicationStatus === "published" ? nowIso : null;

    const { data: inserted, error } = await supabase
      .from("courses")
      .insert({
        name: data.name,
        slug: targetSlug,
        code: data.code,
        category: data.category,
        degree_type: data.degreeType,
        stream: data.stream,
        specialization: data.specialization,
        short_description: data.shortDescription,
        description: data.description,

        duration: data.duration,
        duration_unit: data.durationUnit,
        study_mode: data.studyMode,
        level: data.level,
        intake: Number.isNaN(data.intake) ? null : data.intake,
        language: data.language || "English",

        min_qualification: data.minQualification,
        min_percentage: Number.isNaN(data.minPercentage) ? null : data.minPercentage,
        required_subjects: data.requiredSubjects,
        entrance_exam_information: data.entranceExamInformation,
        age_criteria: data.ageCriteria,
        additional_requirements: data.additionalRequirements,

        thumbnail_url: data.thumbnailUrl,
        banner_url: data.bannerUrl,
        gallery_images: data.galleryImages,

        seo_title: data.seoTitle,
        seo_description: data.seoDescription,
        og_image_url: data.ogImageUrl,
        no_index: data.noIndex,

        publication_status: data.publicationStatus,
        status: data.publicationStatus === "published" ? "active" : "inactive",
        is_featured: data.isFeatured,
        published_at: publishedAt,
      })
      .select("id, slug")
      .single();

    if (error) {
      return { success: false, error: { code: "INSERT_FAILED", message: error.message } };
    }

    // Revalidation
    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/");

    return { success: true, data: { id: inserted.id, slug: inserted.slug } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to create course." },
    };
  }
}

export async function updateCourseAction(
  id: string,
  input: CourseInput
): Promise<ApiResponse<{ id: string; slug: string }>> {
  try {
    const adminUser = await requireAdmin();
    const parsed = courseSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid data" },
      };
    }

    const data = parsed.data;
    const supabase = await createClient();

    // Check slug conflict
    const { data: conflict } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", data.slug)
      .neq("id", id)
      .maybeSingle();

    if (conflict) {
      return {
        success: false,
        error: { code: "SLUG_CONFLICT", message: `The slug "${data.slug}" is already in use.` },
      };
    }

    const { data: current } = await supabase
      .from("courses")
      .select("publication_status, published_at")
      .eq("id", id)
      .single();

    let publishedAt = current?.published_at;
    if (data.publicationStatus === "published" && current?.publication_status !== "published") {
      publishedAt = new Date().toISOString();
    }

    const { error } = await supabase
      .from("courses")
      .update({
        name: data.name,
        slug: data.slug,
        code: data.code,
        category: data.category,
        degree_type: data.degreeType,
        stream: data.stream,
        specialization: data.specialization,
        short_description: data.shortDescription,
        description: data.description,

        duration: data.duration,
        duration_unit: data.durationUnit,
        study_mode: data.studyMode,
        level: data.level,
        intake: Number.isNaN(data.intake) ? null : data.intake,
        language: data.language || "English",

        min_qualification: data.minQualification,
        min_percentage: Number.isNaN(data.minPercentage) ? null : data.minPercentage,
        required_subjects: data.requiredSubjects,
        entrance_exam_information: data.entranceExamInformation,
        age_criteria: data.ageCriteria,
        additional_requirements: data.additionalRequirements,

        thumbnail_url: data.thumbnailUrl,
        banner_url: data.bannerUrl,
        gallery_images: data.galleryImages,

        seo_title: data.seoTitle,
        seo_description: data.seoDescription,
        og_image_url: data.ogImageUrl,
        no_index: data.noIndex,

        publication_status: data.publicationStatus,
        status: data.publicationStatus === "published" ? "active" : "inactive",
        is_featured: data.isFeatured,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
    }

    // Revalidation
    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${id}`);
    revalidatePath("/courses");
    revalidatePath(`/courses/${data.slug}`);
    revalidatePath("/");

    return { success: true, data: { id, slug: data.slug } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to update course." },
    };
  }
}

export async function togglePublishCourseAction(
  id: string,
  publish: boolean
): Promise<ApiResponse<{ id: string; status: string }>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const targetStatus = publish ? "published" : "draft";
    const publishedAt = publish ? new Date().toISOString() : null;

    const { data: updated, error } = await supabase
      .from("courses")
      .update({
        publication_status: targetStatus,
        status: publish ? "active" : "inactive",
        published_at: publishedAt,
        deleted_at: null,
      })
      .eq("id", id)
      .select("slug")
      .single();

    if (error) {
      return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
    }

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${id}`);
    revalidatePath("/courses");
    if (updated?.slug) revalidatePath(`/courses/${updated.slug}`);
    revalidatePath("/");

    return { success: true, data: { id, status: targetStatus } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to update status." },
    };
  }
}

export async function toggleFeaturedCourseAction(
  id: string,
  isFeatured: boolean
): Promise<ApiResponse<{ id: string; isFeatured: boolean }>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("courses")
      .update({ is_featured: isFeatured })
      .eq("id", id);

    if (error) {
      return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
    }

    revalidatePath("/admin/courses");
    revalidatePath("/courses");

    return { success: true, data: { id, isFeatured } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to update featured state." },
    };
  }
}

export async function archiveCourseAction(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("courses")
      .update({
        publication_status: "archived",
        status: "archived",
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: { code: "ARCHIVE_FAILED", message: error.message } };
    }

    revalidatePath("/admin/courses");
    revalidatePath("/courses");

    return { success: true, data: { id } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to archive course." },
    };
  }
}

export async function restoreCourseAction(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("courses")
      .update({
        publication_status: "draft",
        status: "inactive",
        deleted_at: null,
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: { code: "RESTORE_FAILED", message: error.message } };
    }

    revalidatePath("/admin/courses");
    revalidatePath("/courses");

    return { success: true, data: { id } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to restore course." },
    };
  }
}

export async function getCoursesListingAction(
  params: CourseListingParams = {}
): Promise<
  ApiResponse<{
    courses: any[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>
> {
  try {
    await requireAuth("/admin/login");

    const {
      search,
      category,
      degreeType,
      status = "all",
      page = 1,
      pageSize = 10,
      sortBy = "updated_at",
      sortOrder = "desc",
    } = params;

    const supabase = await createClient();
    let query = supabase.from("courses").select("*, college_courses(count)", { count: "exact" });

    if (status && status !== "all") {
      query = query.eq("publication_status", status);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (degreeType && degreeType !== "all") {
      query = query.eq("degree_type", degreeType);
    }

    if (search && search.trim().length > 0) {
      const trimmed = search.trim();
      query = query.or(`name.ilike.%${trimmed}%,stream.ilike.%${trimmed}%,code.ilike.%${trimmed}%`);
    }

    query = query.order(sortBy, { ascending: sortOrder === "asc" });

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
        courses: data || [],
        totalCount: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize) || 1,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to load courses." },
    };
  }
}

export async function getCourseByIdAction(id: string): Promise<ApiResponse<CourseRow>> {
  try {
    await requireAuth("/admin/login");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: { code: "NOT_FOUND", message: "Course not found." } };
    }

    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to load course." },
    };
  }
}

// Public Courses Catalog Query
export async function getPublicCoursesAction(params: {
  search?: string;
  category?: string;
  degreeType?: string;
  level?: string;
  duration?: number;
  sortBy?: "featured" | "name" | "duration";
  page?: number;
  pageSize?: number;
} = {}): Promise<
  ApiResponse<{
    courses: any[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>
> {
  try {
    const {
      search,
      category,
      degreeType,
      level,
      duration,
      sortBy = "featured",
      page = 1,
      pageSize = 12,
    } = params;
    const supabase = await createClient();

    let query = supabase
      .from("courses")
      .select("*, college_courses(count)", { count: "exact" })
      .eq("publication_status", "published")
      .is("deleted_at", null);

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (degreeType && degreeType !== "all") {
      query = query.eq("degree_type", degreeType);
    }

    if (level && level !== "all") {
      query = query.eq("level", level);
    }

    if (duration && duration > 0) {
      query = query.eq("duration", duration);
    }

    if (search && search.trim().length > 0) {
      const trimmed = search.trim();
      query = query.or(`name.ilike.%${trimmed}%,stream.ilike.%${trimmed}%`);
    }

    if (sortBy === "duration") {
      query = query.order("duration", { ascending: true, nullsFirst: false });
    } else if (sortBy === "name") {
      query = query.order("name", { ascending: true });
    } else {
      query = query.order("is_featured", { ascending: false }).order("name", { ascending: true });
    }

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
        courses: data || [],
        totalCount: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize) || 1,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to fetch public courses." },
    };
  }
}

// Public Course by Slug with Offering Colleges
export async function getCourseBySlugPublicAction(slug: string) {
  try {
    const supabase = await createClient();

    const { data: course, error } = await supabase
      .from("courses")
      .select("*, college_courses(*, colleges(*))")
      .eq("slug", slug)
      .eq("publication_status", "published")
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !course) {
      return { success: false, error: { code: "NOT_FOUND", message: "Course not found or unpublished." } };
    }

    return { success: true, data: course };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to load public course." },
    };
  }
}

// ==============================================================================
// 2. COLLEGE-COURSE ASSOCIATION ACTIONS
// ==============================================================================

export async function associateCollegeCourseAction(input: CollegeCourseAssociationInput) {
  try {
    await requireAdmin();
    const parsed = collegeCourseAssociationSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid data" } };
    }

    const data = parsed.data;
    const supabase = await createClient();

    const { data: inserted, error } = await supabase
      .from("college_courses")
      .upsert(
        {
          college_id: data.collegeId,
          course_id: data.courseId,
          course_code: data.courseCode,
          course_name_override: data.courseNameOverride,
          intake_capacity: Number.isNaN(data.intakeCapacity) ? null : data.intakeCapacity,
          admission_status: data.admissionStatus as any,
          eligibility_override: data.eligibilityOverride,
          fee_notes_override: data.feeNotesOverride,
          is_active: data.isActive,
        },
        { onConflict: "college_id,course_id" }
      )
      .select("id")
      .single();

    if (error) {
      return { success: false, error: { code: "ASSOCIATION_FAILED", message: error.message } };
    }

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${data.courseId}`);
    revalidatePath("/admin/colleges");
    revalidatePath(`/admin/colleges/${data.collegeId}`);
    revalidatePath("/colleges");
    revalidatePath("/courses");

    return { success: true, data: { id: inserted.id } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to associate college and course." },
    };
  }
}

export async function removeCollegeCourseAssociationAction(id: string) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("college_courses")
      .select("college_id, course_id")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("college_courses").delete().eq("id", id);

    if (error) {
      return { success: false, error: { code: "DELETE_FAILED", message: error.message } };
    }

    if (existing) {
      revalidatePath(`/admin/courses/${existing.course_id}`);
      revalidatePath(`/admin/colleges/${existing.college_id}`);
    }
    revalidatePath("/admin/courses");
    revalidatePath("/admin/colleges");

    return { success: true, data: { id } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to remove association." },
    };
  }
}

export async function getCollegesForCourseAction(courseId: string) {
  try {
    await requireAuth("/admin/login");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("college_courses")
      .select("*, colleges(*)")
      .eq("course_id", courseId);

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    return { success: true, data: data || [] };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to fetch colleges." },
    };
  }
}

export async function getCoursesForCollegeAction(collegeId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("college_courses")
      .select("*, courses(*), college_fees(*)")
      .eq("college_id", collegeId);

    if (error) {
      return { success: false, error: { code: "QUERY_FAILED", message: error.message } };
    }

    return { success: true, data: data || [] };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to fetch courses for college." },
    };
  }
}

// ==============================================================================
// 3. FEE MANAGEMENT ACTIONS
// ==============================================================================

export async function createFeeRecordAction(input: FeeRecordInput) {
  try {
    await requireAdmin();
    const parsed = feeRecordSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid data" } };
    }

    const data = parsed.data;
    const supabase = await createClient();

    const { data: inserted, error } = await supabase
      .from("college_fees")
      .insert({
        college_course_id: data.collegeCourseId,
        academic_year: data.academicYear,
        fee_type: data.feeType,
        amount: data.amount,
        currency: data.currency || "INR",
        payment_frequency: data.paymentFrequency,
        student_category: data.studentCategory,
        tuition_fee: data.tuitionFee || data.amount,
        admission_fee: data.admissionFee || 0,
        hostel_fee: data.hostelFee || 0,
        other_fees: data.otherFees || 0,
        fee_notes: data.feeNotes,
        effective_date: data.effectiveDate || null,
        expiry_date: data.expiryDate || null,
        status: data.status,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: { code: "INSERT_FAILED", message: error.message } };
    }

    revalidatePath("/admin/fees");
    revalidatePath("/admin/courses");
    revalidatePath("/admin/colleges");

    return { success: true, data: { id: inserted.id } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to create fee record." },
    };
  }
}

export async function updateFeeRecordAction(id: string, input: FeeRecordInput) {
  try {
    await requireAdmin();
    const parsed = feeRecordSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid data" } };
    }

    const data = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("college_fees")
      .update({
        academic_year: data.academicYear,
        fee_type: data.feeType,
        amount: data.amount,
        currency: data.currency || "INR",
        payment_frequency: data.paymentFrequency,
        student_category: data.studentCategory,
        tuition_fee: data.tuitionFee || data.amount,
        admission_fee: data.admissionFee || 0,
        hostel_fee: data.hostelFee || 0,
        other_fees: data.otherFees || 0,
        fee_notes: data.feeNotes,
        effective_date: data.effectiveDate || null,
        expiry_date: data.expiryDate || null,
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
    }

    revalidatePath("/admin/fees");

    return { success: true, data: { id } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to update fee record." },
    };
  }
}

export async function getFeesListingAction(params: {
  search?: string;
  collegeId?: string;
  feeType?: string;
  academicYear?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  try {
    await requireAuth("/admin/login");
    const { search, collegeId, feeType, academicYear, page = 1, pageSize = 10 } = params;

    const supabase = await createClient();
    let query = supabase
      .from("college_fees")
      .select("*, college_courses(*, colleges(*), courses(*))", { count: "exact" })
      .is("deleted_at", null);

    if (feeType && feeType !== "all") {
      query = query.eq("fee_type", feeType);
    }

    if (academicYear && academicYear !== "all") {
      query = query.eq("academic_year", academicYear);
    }

    query = query.order("created_at", { ascending: false });

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
        fees: data || [],
        totalCount: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize) || 1,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to load fees." },
    };
  }
}

// ==============================================================================
// 4. SCHOLARSHIP MANAGEMENT ACTIONS
// ==============================================================================

export async function createScholarshipAction(input: ScholarshipInput) {
  try {
    await requireAdmin();
    const parsed = scholarshipSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid data" } };
    }

    const data = parsed.data;
    const supabase = await createClient();

    let targetSlug = data.slug || generateSlug(data.name);
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from("scholarships")
        .select("id")
        .eq("slug", targetSlug)
        .maybeSingle();

      if (!existing) break;
      targetSlug = `${generateSlug(data.name)}-${counter}`;
      counter++;
    }

    const nowIso = new Date().toISOString();
    const publishedAt = data.publicationStatus === "published" ? nowIso : null;

    const { data: inserted, error } = await supabase
      .from("scholarships")
      .insert({
        name: data.name,
        slug: targetSlug,
        provider: data.provider,
        category: data.category,
        description: data.description,
        eligibility: data.eligibility,
        college_id: data.collegeId || null,
        college_course_id: data.collegeCourseId || null,
        scholarship_amount: data.scholarshipAmount,
        scholarship_percentage: Number.isNaN(data.scholarshipPercentage) ? null : data.scholarshipPercentage,
        max_benefit: Number.isNaN(data.maxBenefit) ? null : data.maxBenefit,
        currency: data.currency || "INR",
        application_start_date: data.applicationStartDate || null,
        application_deadline: data.applicationDeadline || null,
        application_instructions: data.applicationInstructions,
        official_url: data.officialUrl,
        required_documents: data.requiredDocuments,
        contact_info: data.contactInfo,
        publication_status: data.publicationStatus,
        status: data.publicationStatus === "published" ? "active" : "inactive",
        is_featured: data.isFeatured,
        published_at: publishedAt,
      })
      .select("id, slug")
      .single();

    if (error) {
      return { success: false, error: { code: "INSERT_FAILED", message: error.message } };
    }

    revalidatePath("/admin/scholarships");
    revalidatePath("/scholarships");
    revalidatePath("/");

    return { success: true, data: { id: inserted.id, slug: inserted.slug } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to create scholarship." },
    };
  }
}

export async function updateScholarshipAction(id: string, input: ScholarshipInput) {
  try {
    await requireAdmin();
    const parsed = scholarshipSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid data" } };
    }

    const data = parsed.data;
    const supabase = await createClient();

    const { data: current } = await supabase
      .from("scholarships")
      .select("publication_status, published_at")
      .eq("id", id)
      .single();

    let publishedAt = current?.published_at;
    if (data.publicationStatus === "published" && current?.publication_status !== "published") {
      publishedAt = new Date().toISOString();
    }

    const { error } = await supabase
      .from("scholarships")
      .update({
        name: data.name,
        slug: data.slug,
        provider: data.provider,
        category: data.category,
        description: data.description,
        eligibility: data.eligibility,
        college_id: data.collegeId || null,
        college_course_id: data.collegeCourseId || null,
        scholarship_amount: data.scholarshipAmount,
        scholarship_percentage: Number.isNaN(data.scholarshipPercentage) ? null : data.scholarshipPercentage,
        max_benefit: Number.isNaN(data.maxBenefit) ? null : data.maxBenefit,
        currency: data.currency || "INR",
        application_start_date: data.applicationStartDate || null,
        application_deadline: data.applicationDeadline || null,
        application_instructions: data.applicationInstructions,
        official_url: data.officialUrl,
        required_documents: data.requiredDocuments,
        contact_info: data.contactInfo,
        publication_status: data.publicationStatus,
        status: data.publicationStatus === "published" ? "active" : "inactive",
        is_featured: data.isFeatured,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
    }

    revalidatePath("/admin/scholarships");
    revalidatePath(`/admin/scholarships/${id}`);
    revalidatePath("/scholarships");
    if (data.slug) revalidatePath(`/scholarships/${data.slug}`);
    revalidatePath("/");

    return { success: true, data: { id, slug: data.slug } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to update scholarship." },
    };
  }
}

export async function togglePublishScholarshipAction(id: string, publish: boolean) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const targetStatus = publish ? "published" : "draft";
    const publishedAt = publish ? new Date().toISOString() : null;

    const { data: updated, error } = await supabase
      .from("scholarships")
      .update({
        publication_status: targetStatus,
        status: publish ? "active" : "inactive",
        published_at: publishedAt,
        deleted_at: null,
      })
      .eq("id", id)
      .select("slug")
      .single();

    if (error) {
      return { success: false, error: { code: "UPDATE_FAILED", message: error.message } };
    }

    revalidatePath("/admin/scholarships");
    revalidatePath(`/admin/scholarships/${id}`);
    revalidatePath("/scholarships");
    if (updated?.slug) revalidatePath(`/scholarships/${updated.slug}`);
    revalidatePath("/");

    return { success: true, data: { id, status: targetStatus } };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to toggle publication." },
    };
  }
}

export async function getScholarshipsListingAction(params: {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  try {
    await requireAuth("/admin/login");
    const { search, category, status = "all", page = 1, pageSize = 10 } = params;

    const supabase = await createClient();
    let query = supabase.from("scholarships").select("*, colleges(name)", { count: "exact" });

    if (status && status !== "all") {
      query = query.eq("publication_status", status);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (search && search.trim().length > 0) {
      const trimmed = search.trim();
      query = query.or(`name.ilike.%${trimmed}%,provider.ilike.%${trimmed}%`);
    }

    query = query.order("updated_at", { ascending: false });

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
        scholarships: data || [],
        totalCount: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize) || 1,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to load scholarships." },
    };
  }
}

export async function getScholarshipByIdAction(id: string) {
  try {
    await requireAuth("/admin/login");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("scholarships")
      .select("*, colleges(*), college_courses(*, courses(*))")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: { code: "NOT_FOUND", message: "Scholarship not found." } };
    }

    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to load scholarship." },
    };
  }
}

// Public Scholarships Catalog
export async function getPublicScholarshipsAction(params: {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  try {
    const { search, category, page = 1, pageSize = 12 } = params;
    const supabase = await createClient();

    let query = supabase
      .from("scholarships")
      .select("*, colleges(name, slug, logo_url)", { count: "exact" })
      .eq("publication_status", "published")
      .is("deleted_at", null);

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (search && search.trim().length > 0) {
      const trimmed = search.trim();
      query = query.or(`name.ilike.%${trimmed}%,provider.ilike.%${trimmed}%`);
    }

    query = query.order("is_featured", { ascending: false }).order("application_deadline", { ascending: true, nullsFirst: false });

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
        scholarships: data || [],
        totalCount: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize) || 1,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to fetch public scholarships." },
    };
  }
}

export async function getScholarshipBySlugPublicAction(slug: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("scholarships")
      .select("*, colleges(*), college_courses(*, courses(*))")
      .eq("slug", slug)
      .eq("publication_status", "published")
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: { code: "NOT_FOUND", message: "Scholarship not found or unpublished." } };
    }

    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: { code: "INTERNAL_ERROR", message: (err as Error).message || "Failed to load public scholarship." },
    };
  }
}
