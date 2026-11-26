import { z } from "zod";
import { generateSlug } from "@/lib/validation/college";

export { generateSlug };

export const COURSE_CATEGORIES = [
  "Engineering",
  "Management",
  "Medical & Allied Health",
  "Computer Applications & IT",
  "Commerce & Banking",
  "Science",
  "Arts & Humanities",
  "Law & Legal Studies",
  "Pharmacy",
  "Design & Architecture",
  "Agriculture & Forestry",
  "Vocational & Skill Courses",
  "Other",
] as const;

export const DEGREE_TYPES = [
  "B.Tech / B.E.",
  "M.Tech / M.E.",
  "BBA",
  "MBA / PGDM",
  "BCA",
  "MCA",
  "MBBS",
  "BDS",
  "B.Sc",
  "M.Sc",
  "B.Com",
  "M.Com",
  "BA",
  "MA",
  "LLB",
  "LLM",
  "B.Pharm",
  "M.Pharm",
  "Ph.D / Doctorate",
  "Diploma",
  "Certificate",
  "Other",
] as const;

export const STUDY_MODES = [
  "full_time",
  "part_time",
  "online",
  "distance",
  "hybrid",
] as const;

export const COURSE_LEVELS = [
  "undergraduate",
  "postgraduate",
  "diploma",
  "doctoral",
  "certificate",
] as const;

export const DURATION_UNITS = [
  "years",
  "months",
  "semesters",
] as const;

export const COURSE_PUBLICATION_STATUSES = [
  "draft",
  "published",
  "archived",
] as const;

export const FEE_TYPES = [
  "tuition",
  "admission",
  "registration",
  "examination",
  "hostel",
  "laboratory",
  "composite",
  "other",
] as const;

export const PAYMENT_FREQUENCIES = [
  "annual",
  "semester",
  "one_time",
  "monthly",
] as const;

export const STUDENT_CATEGORIES = [
  "all",
  "general",
  "reserved",
  "management",
  "nri",
] as const;

export const SCHOLARSHIP_CATEGORIES = [
  "merit",
  "need_based",
  "government",
  "institution",
  "minority",
  "sports",
  "research",
  "other",
] as const;

/**
 * Main Course Zod Schema
 */
export const courseSchema = z.object({
  // Basic Information
  name: z.string().min(2, "Course name must be at least 2 characters").max(200).trim(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase alphanumeric characters and hyphens")
    .trim(),
  code: z.string().max(50).optional().nullable(),
  category: z.string().min(1, "Please select a course category"),
  degreeType: z.string().min(1, "Please select a degree type"),
  stream: z.string().min(1, "Specialization / Stream is required").trim(),
  specialization: z.string().optional().nullable(),
  shortDescription: z.string().max(500, "Short description cannot exceed 500 characters").optional().nullable(),
  description: z.string().optional().nullable(),

  // Course Details
  duration: z.number().min(0.1, "Duration must be greater than 0").max(10, "Duration cannot exceed 10 years"),
  durationUnit: z.enum(DURATION_UNITS).default("years"),
  studyMode: z.enum(STUDY_MODES).default("full_time"),
  level: z.enum(COURSE_LEVELS).default("undergraduate"),
  intake: z.union([z.number().int().min(1), z.nan(), z.null()]).optional(),
  language: z.string().default("English"),

  // Eligibility Criteria
  minQualification: z.string().optional().nullable(),
  minPercentage: z.union([z.number().min(0).max(100), z.nan(), z.null()]).optional(),
  requiredSubjects: z.string().optional().nullable(),
  entranceExamInformation: z.string().optional().nullable(),
  ageCriteria: z.string().optional().nullable(),
  additionalRequirements: z.string().optional().nullable(),

  // Media
  thumbnailUrl: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
  galleryImages: z.array(z.string()).default([]),

  // SEO
  seoTitle: z.string().max(120).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
  ogImageUrl: z.string().optional().nullable(),
  noIndex: z.boolean().default(false),

  // Publishing
  publicationStatus: z.enum(COURSE_PUBLICATION_STATUSES).default("draft"),
  isFeatured: z.boolean().default(false),
});

export type CourseInput = z.infer<typeof courseSchema>;

/**
 * College Course Association Schema
 */
export const collegeCourseAssociationSchema = z.object({
  collegeId: z.string().uuid("Please select a valid college"),
  courseId: z.string().uuid("Please select a valid course"),
  courseCode: z.string().max(50).optional().nullable(),
  courseNameOverride: z.string().max(200).optional().nullable(),
  intakeCapacity: z.union([z.number().int().min(1), z.nan(), z.null()]).optional(),
  admissionStatus: z.enum(["open", "closing_soon", "closed", "upcoming"]).default("open"),
  eligibilityOverride: z.string().optional().nullable(),
  feeNotesOverride: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CollegeCourseAssociationInput = z.infer<typeof collegeCourseAssociationSchema>;

/**
 * Fee Record Schema
 */
export const feeRecordSchema = z.object({
  collegeCourseId: z.string().uuid("Please select a valid college course association"),
  academicYear: z
    .string()
    .min(4, "Academic year required (e.g. 2025-26)")
    .max(20)
    .trim(),
  feeType: z.enum(FEE_TYPES).default("tuition"),
  amount: z.number().min(0, "Amount cannot be negative"),
  currency: z.string().default("INR"),
  paymentFrequency: z.enum(PAYMENT_FREQUENCIES).default("annual"),
  studentCategory: z.string().default("all"),
  tuitionFee: z.number().min(0).default(0),
  admissionFee: z.number().min(0).default(0),
  hostelFee: z.number().min(0).default(0),
  otherFees: z.number().min(0).default(0),
  feeNotes: z.string().optional().nullable(),
  effectiveDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  status: z.enum(["active", "archived"]).default("active"),
});

export type FeeRecordInput = z.infer<typeof feeRecordSchema>;

/**
 * Scholarship Schema
 */
export const scholarshipSchema = z.object({
  name: z.string().min(2, "Scholarship name must be at least 2 characters").max(250).trim(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase alphanumeric characters and hyphens")
    .trim(),
  provider: z.string().min(2, "Provider organization is required").max(200).trim(),
  category: z.enum(SCHOLARSHIP_CATEGORIES).default("merit"),
  description: z.string().optional().nullable(),
  eligibility: z.string().optional().nullable(),
  collegeId: z.string().uuid().optional().nullable(),
  collegeCourseId: z.string().uuid().optional().nullable(),
  scholarshipAmount: z.number().min(0, "Benefit amount cannot be negative").default(0),
  scholarshipPercentage: z.union([z.number().min(0).max(100), z.nan(), z.null()]).optional(),
  maxBenefit: z.union([z.number().min(0), z.nan(), z.null()]).optional(),
  currency: z.string().default("INR"),
  applicationStartDate: z.string().optional().nullable(),
  applicationDeadline: z.string().optional().nullable(),
  applicationInstructions: z.string().optional().nullable(),
  officialUrl: z
    .string()
    .url("Must be a valid URL (e.g. https://scholarships.gov.in)")
    .optional()
    .or(z.literal(""))
    .nullable(),
  requiredDocuments: z.array(z.string()).default([]),
  contactInfo: z.string().optional().nullable(),
  publicationStatus: z.enum(["draft", "published", "archived"]).default("draft"),
  isFeatured: z.boolean().default(false),
});

export type ScholarshipInput = z.infer<typeof scholarshipSchema>;
