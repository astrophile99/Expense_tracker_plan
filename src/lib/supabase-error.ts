import { AppError } from "@/types"

const SUPABASE_ERROR_MAP: Record<string, { code: string; message: string; statusCode: number }> = {
  PGRST116: { code: "NOT_FOUND", message: "Resource not found", statusCode: 404 },
  PGRST200: { code: "UNPROCESSABLE_ENTITY", message: "Request could not be processed", statusCode: 422 },
  PGRST201: { code: "UNPROCESSABLE_ENTITY", message: "Request could not be processed", statusCode: 422 },
  PGRST204: { code: "UNPROCESSABLE_ENTITY", message: "Invalid request constraints", statusCode: 422 },
  "23502": { code: "VALIDATION_ERROR", message: "A required field is missing", statusCode: 400 },
  "23503": { code: "FOREIGN_KEY_VIOLATION", message: "Referenced resource does not exist", statusCode: 409 },
  "23505": { code: "CONFLICT", message: "Resource already exists", statusCode: 409 },
  "23514": { code: "VALIDATION_ERROR", message: "Check constraint violation", statusCode: 400 },
  "42P01": { code: "INTERNAL_ERROR", message: "Table does not exist", statusCode: 500 },
  "42703": { code: "INTERNAL_ERROR", message: "Column does not exist", statusCode: 500 },
  "42501": { code: "FORBIDDEN", message: "Insufficient permissions", statusCode: 403 },
  "PGRST301": { code: "FORBIDDEN", message: "Row-level security policy violation", statusCode: 403 },
  "PGRST106": { code: "AUTH_ERROR", message: "Authentication required", statusCode: 401 },
  "PGRST107": { code: "FORBIDDEN", message: "Access denied", statusCode: 403 },
}

export function mapSupabaseError(error: { code?: string; message?: string; details?: string }): AppError {
  const mapped = error.code ? SUPABASE_ERROR_MAP[error.code] : undefined

  if (mapped) {
    return {
      code: mapped.code,
      message: error.message ?? mapped.message,
      details: error.details ? { detail: [error.details] } : undefined,
      statusCode: mapped.statusCode,
    }
  }

  if (error.message?.toLowerCase().includes("duplicate key")) {
    return { code: "CONFLICT", message: "Resource already exists", statusCode: 409 }
  }
  if (error.message?.toLowerCase().includes("violates foreign key")) {
    return { code: "FOREIGN_KEY_VIOLATION", message: "Referenced resource does not exist", statusCode: 409 }
  }
  if (error.message?.toLowerCase().includes("violates row-level security")) {
    return { code: "FORBIDDEN", message: "Insufficient permissions", statusCode: 403 }
  }
  if (error.message?.toLowerCase().includes("new row violates")) {
    return { code: "VALIDATION_ERROR", message: "Invalid data", statusCode: 400 }
  }

  return {
    code: "INTERNAL_ERROR",
    message: error.message ?? "An unexpected database error occurred",
    statusCode: 500,
  }
}

export function handleSupabaseError(error: unknown): never {
  if (typeof error === "object" && error !== null && "code" in error) {
    const appError = mapSupabaseError(error as { code?: string; message?: string; details?: string })
    throw appError
  }
  throw {
    code: "INTERNAL_ERROR",
    message: error instanceof Error ? error.message : "An unexpected error occurred",
    statusCode: 500,
  }
}

export function throwIfError(error: unknown): void {
  if (!error) return
  handleSupabaseError(error)
}
