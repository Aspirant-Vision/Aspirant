import { z } from "zod";

/**
 * Password Strength Policy:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (!@#$%^&*...)");

/**
 * Mobile Phone Validation:
 * Validates standard 10-digit Indian numbers with optional +91 prefix.
 */
export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .regex(/^(?:\+91|0)?[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number");

// ------------------------------------------------------------------------------
// 1. STUDENT REGISTRATION SCHEMA
// ------------------------------------------------------------------------------
export const studentRegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name cannot exceed 100 characters")
      .trim(),
    email: z
      .string()
      .email("Please enter a valid email address")
      .toLowerCase()
      .trim(),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    termsConsent: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms of service and privacy policy to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;

// ------------------------------------------------------------------------------
// 2. STUDENT LOGIN SCHEMA
// ------------------------------------------------------------------------------
export const studentLoginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
  redirectUrl: z.string().optional(),
});

export type StudentLoginInput = z.infer<typeof studentLoginSchema>;

// ------------------------------------------------------------------------------
// 3. ADMIN & STAFF LOGIN SCHEMA
// ------------------------------------------------------------------------------
export const staffLoginSchema = z.object({
  email: z
    .string()
    .email("Please enter your official staff email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Staff password is required"),
  redirectUrl: z.string().optional(),
});

export type StaffLoginInput = z.infer<typeof staffLoginSchema>;

// ------------------------------------------------------------------------------
// 4. PASSWORD RECOVERY SCHEMAS
// ------------------------------------------------------------------------------
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ------------------------------------------------------------------------------
// 5. STAFF INVITATION SCHEMAS
// ------------------------------------------------------------------------------
export const staffInviteSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid staff email address")
    .toLowerCase()
    .trim(),
  role: z.enum(["admin", "counsellor"], {
    message: "Role must be either 'admin' or 'counsellor'",
  }),
});

export type StaffInviteInput = z.infer<typeof staffInviteSchema>;

export const acceptStaffInviteSchema = z
  .object({
    token: z.string().min(10, "Invalid invitation token"),
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name cannot exceed 100 characters")
      .trim(),
    phone: phoneSchema.optional(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AcceptStaffInviteInput = z.infer<typeof acceptStaffInviteSchema>;

// ------------------------------------------------------------------------------
// 6. SAFE INTERNAL REDIRECT VALIDATOR (Prevents Open Redirect Vulnerabilities)
// ------------------------------------------------------------------------------
export function getSafeRedirectUrl(
  requestedUrl?: string | null,
  fallback = "/student/dashboard"
): string {
  if (!requestedUrl) return fallback;

  // Must start with '/' and must NOT start with '//' or contain 'http://' or 'https://'
  if (
    requestedUrl.startsWith("/") &&
    !requestedUrl.startsWith("//") &&
    !requestedUrl.includes("://")
  ) {
    return requestedUrl;
  }

  return fallback;
}
