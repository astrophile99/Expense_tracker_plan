export class DomainError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: Record<string, string[]>

  constructor(code: string, message: string, statusCode = 400, details?: Record<string, string[]>) {
    super(message)
    this.name = "DomainError"
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id?: string) {
    super(
      `${entity.toUpperCase()}_NOT_FOUND`,
      id ? `${entity} with id "${id}" not found` : `${entity} not found`,
      404
    )
    this.name = "NotFoundError"
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, string[]>) {
    super("VALIDATION_ERROR", message, 400, details)
    this.name = "ValidationError"
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", message, 401)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "Forbidden") {
    super("FORBIDDEN", message, 403)
    this.name = "ForbiddenError"
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super("CONFLICT", message, 409)
    this.name = "ConflictError"
  }
}

export class RateLimitError extends DomainError {
  constructor(retryAfterSeconds = 60) {
    super("RATE_LIMITED", `Too many requests. Retry after ${retryAfterSeconds}s`, 429)
    this.name = "RateLimitError"
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super("BUSINESS_RULE_VIOLATION", message, 422)
    this.name = "BusinessRuleError"
  }
}

export const ErrorCodes = {
  USER_NOT_FOUND: "USER_NOT_FOUND",
  PROFILE_NOT_FOUND: "PROFILE_NOT_FOUND",
  WORKSPACE_NOT_FOUND: "WORKSPACE_NOT_FOUND",
  WORKSPACE_MEMBER_NOT_FOUND: "WORKSPACE_MEMBER_NOT_FOUND",
  TRANSACTION_NOT_FOUND: "TRANSACTION_NOT_FOUND",
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
  BUDGET_NOT_FOUND: "BUDGET_NOT_FOUND",
  RECURRING_NOT_FOUND: "RECURRING_NOT_FOUND",
  NOTIFICATION_NOT_FOUND: "NOTIFICATION_NOT_FOUND",

  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",
  INTERNAL_ERROR: "INTERNAL_ERROR",

  DUPLICATE_EMAIL: "DUPLICATE_EMAIL",
  DUPLICATE_CATEGORY: "DUPLICATE_CATEGORY",
  DUPLICATE_MEMBERSHIP: "DUPLICATE_MEMBERSHIP",
  WORKSPACE_LIMIT_REACHED: "WORKSPACE_LIMIT_REACHED",
  MEMBER_LIMIT_REACHED: "MEMBER_LIMIT_REACHED",
  CANNOT_REMOVE_OWNER: "CANNOT_REMOVE_OWNER",
  CANNOT_DELETE_DEFAULT_CATEGORY: "CANNOT_DELETE_DEFAULT_CATEGORY",
  BUDGET_EXCEEDS_LIMIT: "BUDGET_EXCEEDS_LIMIT",
  INVALID_TRANSACTION_TYPE: "INVALID_TRANSACTION_TYPE",
  RECURRING_CONFIG_REQUIRED: "RECURRING_CONFIG_REQUIRED",
  INVITATION_EXPIRED: "INVITATION_EXPIRED",
  INVITATION_ALREADY_USED: "INVITATION_ALREADY_USED",
  CURRENCY_MISMATCH: "CURRENCY_MISMATCH",
  INVALID_DATE_RANGE: "INVALID_DATE_RANGE",
} as const

export function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    [ErrorCodes.USER_NOT_FOUND]: "User not found",
    [ErrorCodes.WORKSPACE_NOT_FOUND]: "Workspace not found",
    [ErrorCodes.TRANSACTION_NOT_FOUND]: "Transaction not found",
    [ErrorCodes.CATEGORY_NOT_FOUND]: "Category not found",
    [ErrorCodes.BUDGET_NOT_FOUND]: "Budget not found",
    [ErrorCodes.FORBIDDEN]: "You do not have permission to perform this action",
    [ErrorCodes.RATE_LIMITED]: "Too many requests. Please try again later",
    [ErrorCodes.DUPLICATE_EMAIL]: "A user with this email already exists",
    [ErrorCodes.DUPLICATE_CATEGORY]: "A category with this name already exists",
    [ErrorCodes.DUPLICATE_MEMBERSHIP]: "User is already a member of this workspace",
    [ErrorCodes.CANNOT_REMOVE_OWNER]: "Cannot remove the workspace owner",
    [ErrorCodes.INVALID_TRANSACTION_TYPE]: "Invalid transaction type for this operation",
    [ErrorCodes.INVITATION_EXPIRED]: "This invitation has expired",
    [ErrorCodes.INVITATION_ALREADY_USED]: "This invitation has already been used",
    [ErrorCodes.INVALID_DATE_RANGE]: "Invalid date range: start must be before end",
  }
  return messages[code] ?? "An unexpected error occurred"
}
