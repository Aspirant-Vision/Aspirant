import { ApiErrorResponse } from "@/types/api.types";

/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code = "INTERNAL_SERVER_ERROR", statusCode = 500, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "A database operation failed", details?: unknown) {
    super(message, "DATABASE_ERROR", 500, details);
  }
}

export class AuthError extends AppError {
  constructor(message = "Authentication required or invalid", details?: unknown) {
    super(message, "AUTH_ERROR", 401, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "You do not have permission to perform this action", details?: unknown) {
    super(message, "FORBIDDEN", 403, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed for provided input", details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", details?: unknown) {
    super(`${resource} was not found`, "NOT_FOUND", 404, details);
  }
}

/**
 * Sanitizes any internal error into a client-safe ApiErrorResponse.
 * Ensures PostgreSQL table schemas, query statements, and raw connection errors
 * are never exposed to public consumers.
 */
export function formatErrorResponse(error: unknown): ApiErrorResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: Array.isArray(error.details) ? error.details : undefined,
      },
    };
  }

  // Handle generic / unexpected server errors
  const isDev = process.env.NODE_ENV === "development";
  const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";

  return {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: isDev ? errorMessage : "An unexpected error occurred. Please try again later.",
    },
  };
}
