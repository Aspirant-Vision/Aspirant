/**
 * Security & Sanitization Utilities
 * Defends against XSS, input pollution, and invalid character sets.
 */

export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>]/g, ""); // strip angle brackets to prevent inline HTML injection
}

export function sanitizeEmail(email: unknown): string {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== "string") return "";
  // Keep only digits, +, and standard separators
  return phone.trim().replace(/[^0-9+\-\s]/g, "");
}
