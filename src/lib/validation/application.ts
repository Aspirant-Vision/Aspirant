import { z } from "zod";

/**
 * Supported Application Document Types
 */
export const DOCUMENT_TYPES = [
  "passport_photo",
  "id_proof",
  "class_10_marksheet",
  "class_12_marksheet",
  "graduation_marksheet",
  "transfer_certificate",
  "migration_certificate",
  "caste_certificate",
  "income_certificate",
  "entrance_scorecard",
  "other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  passport_photo: "Passport-size Photograph",
  id_proof: "Identity Proof (Aadhaar / Voter ID / Passport)",
  class_10_marksheet: "Class 10 Marksheet & Passing Certificate",
  class_12_marksheet: "Class 12 / Intermediate Marksheet",
  graduation_marksheet: "Graduation Marksheet / Degree Transcript",
  transfer_certificate: "Transfer Certificate (TC)",
  migration_certificate: "Migration Certificate",
  caste_certificate: "Caste / Category Certificate (if applicable)",
  income_certificate: "Income Certificate (for Fee Concessions)",
  entrance_scorecard: "Entrance Examination Scorecard / Rank Card",
  other: "Other Supporting Document",
};

/**
 * 1. Personal Details Schema for Application
 */
export const applicationPersonalDetailsSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must have at least 10 digits").max(20),
  alternatePhone: z.string().max(20).optional().nullable().or(z.literal("")),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  address: z.string().max(300).optional().nullable().or(z.literal("")),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  country: z.string().max(100).optional().nullable().or(z.literal("")),
  pinCode: z.string().regex(/^\d{6}$/, "Must be a 6-digit Indian PIN code"),
});

export type ApplicationPersonalDetails = z.infer<typeof applicationPersonalDetailsSchema>;

/**
 * 2. Academic Details Schema for Application
 */
export const applicationAcademicDetailsSchema = z.object({
  highestQualification: z.string().min(2, "Qualification is required").max(150),
  institutionName: z.string().min(2, "School / College name is required").max(200),
  boardOrUniversity: z.string().min(2, "Board or University is required").max(200),
  passingYear: z.number().int().min(1980).max(2035),
  percentageOrCgpa: z.number().min(0, "Score cannot be negative").max(100, "Maximum score is 100%"),
  stream: z.string().max(100).optional().nullable().or(z.literal("")),
  entranceExamName: z.string().max(100).optional().nullable().or(z.literal("")),
  entranceExamScore: z.string().max(100).optional().nullable().or(z.literal("")),
});

export type ApplicationAcademicDetails = z.infer<typeof applicationAcademicDetailsSchema>;

/**
 * 3. Additional Course-Specific Information Schema
 */
export const applicationAdditionalInfoSchema = z.object({
  category: z.enum(["General", "OBC", "SC", "ST", "EWS"]).optional().nullable(),
  hostelRequired: z.boolean().optional().nullable(),
  statementOfPurpose: z.string().max(2000).optional().nullable().or(z.literal("")),
  remarks: z.string().max(1000).optional().nullable().or(z.literal("")),
});

export type ApplicationAdditionalInfo = z.infer<typeof applicationAdditionalInfoSchema>;

/**
 * 4. Application Draft Update Schema
 */
export const applicationDraftSchema = z.object({
  applicationId: z.string().uuid("Invalid application ID"),
  collegeId: z.string().uuid("Invalid college ID").optional(),
  collegeCourseId: z.string().uuid("Invalid college course ID").optional(),
  personalDetails: applicationPersonalDetailsSchema.partial().optional().nullable(),
  academicDetails: applicationAcademicDetailsSchema.partial().optional().nullable(),
  additionalInfo: applicationAdditionalInfoSchema.optional().nullable(),
});

export type ApplicationDraftInput = z.infer<typeof applicationDraftSchema>;

/**
 * 5. Application Submit Schema
 */
export const applicationSubmitSchema = z.object({
  applicationId: z.string().uuid("Invalid application ID"),
  personalDetails: applicationPersonalDetailsSchema,
  academicDetails: applicationAcademicDetailsSchema,
  additionalInfo: applicationAdditionalInfoSchema.optional().nullable(),
  declarationAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and declare information is authentic",
  }),
});

export type ApplicationSubmitInput = z.infer<typeof applicationSubmitSchema>;

/**
 * 6. Document Upload Record Schema
 */
export const documentUploadSchema = z.object({
  applicationId: z.string().uuid("Invalid application ID"),
  documentType: z.enum(DOCUMENT_TYPES),
  storagePath: z.string().min(5, "Storage path required"),
  originalFilename: z.string().min(1, "Filename required"),
  fileSizeBytes: z.number().int().min(1).max(10485760, "Maximum file size is 10MB"),
  mimeType: z.string().min(3),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;

/**
 * 7. Admin / Counsellor Application Review Action Schema
 */
export const applicationReviewActionSchema = z.object({
  action: z.enum([
    "start_review",
    "request_documents",
    "mark_verified",
    "forward",
    "accept",
    "reject",
    "waitlist",
    "withdraw",
  ]),
  assignedCounsellorId: z.string().uuid().optional().nullable().or(z.literal("")),
  reviewNotes: z.string().max(2000).optional().nullable().or(z.literal("")),
  decisionReason: z.string().max(1000).optional().nullable().or(z.literal("")),
  forwardedTo: z.string().max(200).optional().nullable().or(z.literal("")),
});

export type ApplicationReviewActionInput = z.infer<typeof applicationReviewActionSchema>;

/**
 * 8. Document Verification Status Schema
 */
export const documentVerificationSchema = z.object({
  documentId: z.string().uuid("Invalid document ID"),
  verificationStatus: z.enum(["verified", "rejected"]),
  rejectionReason: z.string().max(500).optional().nullable().or(z.literal("")),
});

export type DocumentVerificationInput = z.infer<typeof documentVerificationSchema>;

/**
 * 9. Admission Confirmation Schema
 */
export const admissionConfirmSchema = z.object({
  applicationId: z.string().uuid("Invalid application ID"),
  academicYear: z.string().min(4, "Academic year required").max(20),
  admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD").optional(),
  remarks: z.string().max(1000).optional().nullable().or(z.literal("")),
});

export type AdmissionConfirmInput = z.infer<typeof admissionConfirmSchema>;
