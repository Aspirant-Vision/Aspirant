import { z } from "zod";

/**
 * Standard College Types available in Aspirant Vision
 */
export const COLLEGE_TYPES = [
  "Engineering",
  "Medical",
  "Management",
  "Arts & Science",
  "Law",
  "Pharmacy",
  "Polytechnic",
  "University",
  "Design & Media",
  "Agriculture",
  "Other",
] as const;

export const OWNERSHIP_TYPES = [
  "Government / Public",
  "Private",
  "Deemed to be University",
  "Autonomous Institute",
  "State University",
  "Central University",
  "Other",
] as const;

export const ADMISSION_STATUSES = [
  "open",
  "closing_soon",
  "closed",
  "upcoming",
] as const;

export const PUBLICATION_STATUSES = [
  "draft",
  "published",
  "archived",
] as const;

/**
 * Generates a clean, URL-safe slug from a college name.
 * e.g., "IIT Delhi - Indian Institute of Technology" -> "iit-delhi-indian-institute-of-technology"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word characters except hyphens
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with single hyphen
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}

/**
 * Comprehensive College Form Validation Schema
 */
export const collegeSchema = z.object({
  // SECTION A: Basic Information
  name: z
    .string()
    .min(2, "College name must be at least 2 characters")
    .max(250, "College name cannot exceed 250 characters")
    .trim(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(150, "Slug cannot exceed 150 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase alphanumeric characters and hyphens")
    .trim(),
  shortDescription: z.string().max(500, "Short description cannot exceed 500 characters").optional().nullable(),
  description: z.string().optional().nullable(),
  collegeType: z.string().min(1, "Please select a college category"),
  ownershipType: z.string().optional().nullable(),
  establishedYear: z
    .union([z.number().int().min(1800).max(new Date().getFullYear() + 2), z.nan(), z.null()])
    .optional(),
  affiliation: z.string().optional().nullable(),

  // SECTION B: Location Details
  country: z.string().default("India"),
  state: z.string().min(2, "State is required").trim(),
  city: z.string().min(2, "City is required").trim(),
  address: z.string().optional().nullable(),
  pincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit Indian PIN code")
    .optional()
    .or(z.literal(""))
    .nullable(),
  latitude: z.union([z.number().min(-90).max(90), z.nan(), z.null()]).optional(),
  longitude: z.union([z.number().min(-180).max(180), z.nan(), z.null()]).optional(),

  // SECTION C: Contact Information
  websiteUrl: z
    .string()
    .url("Please enter a valid URL (e.g. https://example.edu.in)")
    .optional()
    .or(z.literal(""))
    .nullable(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal(""))
    .nullable(),
  phone: z.string().optional().nullable(),
  alternatePhone: z.string().optional().nullable(),
  admissionContact: z.string().optional().nullable(),
  admissionEmail: z
    .string()
    .email("Please enter a valid admission email")
    .optional()
    .or(z.literal(""))
    .nullable(),

  // SECTION D: Images & Assets
  logoUrl: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  galleryImages: z.array(z.string()).default([]),

  // SECTION E: Accreditation & Rankings
  accreditation: z.string().optional().nullable(),
  accreditationBody: z.string().optional().nullable(),
  accreditationGrade: z.string().optional().nullable(),
  naacGrade: z.string().optional().nullable(),
  nirfRank: z
    .union([z.number().int().min(1).max(1000), z.nan(), z.null()])
    .optional(),
  otherRankings: z.string().optional().nullable(),
  recognitionDetails: z.string().optional().nullable(),
  averagePlacement: z
    .union([z.number().min(0).max(200), z.nan(), z.null()])
    .optional(),
  highestPlacement: z
    .union([z.number().min(0).max(500), z.nan(), z.null()])
    .optional(),
  placementPercentage: z
    .union([z.number().min(0).max(100), z.nan(), z.null()])
    .optional(),

  // SECTION F: Facilities & Highlights
  facilities: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),

  // SECTION G: Admission Information
  admissionStatus: z.enum(ADMISSION_STATUSES).default("open"),
  admissionProcess: z.string().optional().nullable(),
  eligibilityOverview: z.string().optional().nullable(),
  entranceExams: z.string().optional().nullable(),
  admissionStartDate: z.string().optional().nullable(),
  admissionEndDate: z.string().optional().nullable(),

  // SECTION H: SEO Settings
  seoTitle: z.string().max(120, "SEO Title cannot exceed 120 characters").optional().nullable(),
  seoDescription: z.string().max(320, "SEO Description cannot exceed 320 characters").optional().nullable(),
  canonicalUrl: z
    .string()
    .url("Canonical URL must be a valid URL")
    .optional()
    .or(z.literal(""))
    .nullable(),
  ogImageUrl: z.string().optional().nullable(),
  noIndex: z.boolean().default(false),

  // SECTION I: Publishing Settings
  publicationStatus: z.enum(PUBLICATION_STATUSES).default("draft"),
  isFeatured: z.boolean().default(false),
});

export type CollegeInput = z.infer<typeof collegeSchema>;
