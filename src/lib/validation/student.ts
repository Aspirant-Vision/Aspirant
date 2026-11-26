import { z } from "zod";

/**
 * Student Personal & Contact Profile Schema
 */
export const studentProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  phone: z
    .string()
    .min(10, "Phone number must have at least 10 digits")
    .max(20, "Phone number too long")
    .optional()
    .nullable()
    .or(z.literal("")),
  alternatePhone: z.string().max(20).optional().nullable().or(z.literal("")),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD")
    .optional()
    .nullable()
    .or(z.literal("")),
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional()
    .nullable()
    .or(z.literal("")),
  city: z.string().max(100).optional().nullable().or(z.literal("")),
  state: z.string().max(100).optional().nullable().or(z.literal("")),
  country: z.string().max(100).optional().nullable().or(z.literal("")),
  pinCode: z
    .string()
    .regex(/^\d{6}$/, "Must be a valid 6-digit Indian PIN code")
    .optional()
    .nullable()
    .or(z.literal("")),
  avatarUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;

/**
 * Student Academic Information Schema
 */
export const studentAcademicSchema = z.object({
  educationLevel: z.enum(["10th", "12th", "Diploma", "Undergraduate", "Postgraduate", "Doctorate"]),
  highestQualification: z.string().max(150).optional().nullable().or(z.literal("")),
  institutionName: z.string().max(200).optional().nullable().or(z.literal("")),
  boardOrUniversity: z.string().max(200).optional().nullable().or(z.literal("")),
  passingYear: z.number().int().min(1980).max(2035).optional().nullable(),
  percentageOrCgpa: z
    .number()
    .min(0, "Score cannot be negative")
    .max(100, "Maximum score is 100%")
    .optional()
    .nullable(),
  stream: z.string().max(100).optional().nullable().or(z.literal("")),
  entranceExamName: z.string().max(100).optional().nullable().or(z.literal("")),
  entranceExamScore: z.string().max(100).optional().nullable().or(z.literal("")),
  additionalDetails: z.string().max(1000).optional().nullable().or(z.literal("")),
});

export type StudentAcademicInput = z.infer<typeof studentAcademicSchema>;

/**
 * Student Admission Preferences Schema
 */
export const studentPreferencesSchema = z.object({
  preferredStudyLevel: z.string().max(100).optional().nullable().or(z.literal("")),
  preferredStream: z.string().max(100).optional().nullable().or(z.literal("")),
  preferredCourseId: z.string().uuid().optional().nullable().or(z.literal("")),
  preferredSpecialization: z.string().max(100).optional().nullable().or(z.literal("")),
  preferredCollegeType: z.string().max(100).optional().nullable().or(z.literal("")),
  preferredStudyMode: z.string().max(100).optional().nullable().or(z.literal("")),
  preferredState: z.string().max(100).optional().nullable().or(z.literal("")),
  preferredCity: z.string().max(100).optional().nullable().or(z.literal("")),
  budgetMin: z.number().min(0).optional().nullable(),
  budgetMax: z.number().min(0).optional().nullable(),
  preferredAdmissionYear: z.number().int().min(2024).max(2032).optional().nullable(),
  entranceExamPreference: z.string().max(100).optional().nullable().or(z.literal("")),
});

export type StudentPreferencesInput = z.infer<typeof studentPreferencesSchema>;

/**
 * Student Enquiry Submission Schema
 */
export const studentEnquirySchema = z.object({
  collegeId: z.string().uuid().optional().nullable().or(z.literal("")),
  courseId: z.string().uuid().optional().nullable().or(z.literal("")),
  message: z.string().min(5, "Please describe your admission query (min 5 characters)").max(2000),
});

export type StudentEnquiryInput = z.infer<typeof studentEnquirySchema>;
