import { z } from "zod"
import {
  TransactionType, TransactionVisibility, WorkspaceRole,
  RecurrenceFrequency, BudgetPeriod, PaymentMethod,
} from "@/types"
import { appConfig } from "@/config/app"
import { CURRENCIES } from "@/types/enums"

// ──────────────────────────────────────────
// CUSTOM VALIDATORS
// ──────────────────────────────────────────

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color")
const uuid = z.string().uuid("Must be a valid UUID")
const currency = z.enum(CURRENCIES)
const positiveDecimal = z.number().positive("Must be positive").multipleOf(0.01, "Max 2 decimal places")
  .max(appConfig.limits.maxTransactionAmount, `Max ${appConfig.limits.maxTransactionAmount}`)

const description = z.string()
  .min(1, "Description is required")
  .max(appConfig.limits.maxDescriptionLength, `Max ${appConfig.limits.maxDescriptionLength} characters`)

const datetime = z.string().datetime({ offset: true })
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date (YYYY-MM-DD)")

const tags = z.array(z.string().max(50)).max(appConfig.limits.maxTagsPerTransaction).default([])

// ──────────────────────────────────────────
// TIMESTAMPS (for full entity schemas)
// ──────────────────────────────────────────

const timestamps = {
  createdAt: datetime,
  updatedAt: datetime,
}

// ──────────────────────────────────────────
// USER & PROFILE
// ──────────────────────────────────────────

export const userSchema = z.object({
  id: uuid,
  email: z.string().email("Invalid email"),
  ...timestamps,
})

export const profileSchema = z.object({
  id: uuid,
  userId: uuid,
  fullName: z.string().min(1, "Name is required").max(100, "Max 100 characters"),
  avatarUrl: z.string().url("Invalid URL").optional(),
  currency,
  timezone: z.string().min(1),
  locale: z.string().default("en-US"),
  ...timestamps,
})

export const createProfileSchema = profileSchema.omit({ id: true, userId: true, createdAt: true, updatedAt: true })
export const updateProfileSchema = createProfileSchema.partial()

// ──────────────────────────────────────────
// WORKSPACE
// ──────────────────────────────────────────

export const workspaceSchema = z.object({
  id: uuid,
  name: z.string().min(1, "Name is required").max(100, "Max 100 characters"),
  description: z.string().max(500, "Max 500 characters").optional(),
  icon: z.string().optional(),
  color: hexColor.optional(),
  createdBy: uuid,
  ...timestamps,
})

export const createWorkspaceSchema = workspaceSchema.omit({
  id: true, createdBy: true, createdAt: true, updatedAt: true,
})

export const updateWorkspaceSchema = createWorkspaceSchema.partial()

// ──────────────────────────────────────────
// WORKSPACE MEMBER
// ──────────────────────────────────────────

export const workspaceMemberSchema = z.object({
  id: uuid,
  workspaceId: uuid,
  userId: uuid,
  role: z.nativeEnum(WorkspaceRole),
  invitedBy: uuid.optional(),
  joinedAt: datetime,
})

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.nativeEnum(WorkspaceRole).default(WorkspaceRole.MEMBER),
})

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(WorkspaceRole),
})

// ──────────────────────────────────────────
// CATEGORY
// ──────────────────────────────────────────

export const categorySchema = z.object({
  id: uuid,
  name: z.string().min(1, "Name is required").max(50, "Max 50 characters"),
  icon: z.string().min(1, "Icon is required"),
  color: hexColor,
  group: z.string().min(1, "Group is required"),
  isDefault: z.boolean().default(false),
  workspaceId: uuid.optional(),
  userId: uuid.optional(),
  sortOrder: z.number().int().default(0),
  isArchived: z.boolean().default(false),
  ...timestamps,
})

export const createCategorySchema = categorySchema.omit({
  id: true, isDefault: true, createdAt: true, updatedAt: true,
})

export const updateCategorySchema = createCategorySchema.partial()

// ──────────────────────────────────────────
// RECURRING CONFIG
// ──────────────────────────────────────────

export const recurringConfigSchema = z.object({
  frequency: z.nativeEnum(RecurrenceFrequency),
  interval: z.number().int().positive().default(1),
  endDate: datetime.optional(),
  nextExecutionDate: datetime,
  maxExecutions: z.number().int().positive().max(365).optional(),
  isPaused: z.boolean().default(false),
})

// ──────────────────────────────────────────
// TRANSACTION
// ──────────────────────────────────────────

export const transactionSchema = z.object({
  id: uuid,
  amount: positiveDecimal,
  currency: currency.default("USD"),
  type: z.nativeEnum(TransactionType),
  categoryId: uuid,
  subcategory: z.string().max(50).optional(),
  description,
  notes: z.string().max(appConfig.limits.maxNotesLength).optional(),
  tags,
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  transactionDate: datetime,
  createdBy: uuid,
  workspaceId: uuid.optional(),
  visibility: z.nativeEnum(TransactionVisibility).default(TransactionVisibility.PRIVATE),
  isReconciled: z.boolean().default(false),
  receiptUrl: z.string().url().optional(),
  receiptFileName: z.string().optional(),
  ...timestamps,
})

export const createTransactionSchema = z.object({
  amount: positiveDecimal,
  currency: currency.default("USD"),
  type: z.nativeEnum(TransactionType),
  categoryId: uuid,
  subcategory: z.string().max(50).optional(),
  description,
  notes: z.string().max(appConfig.limits.maxNotesLength).optional(),
  tags,
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  transactionDate: datetime,
  workspaceId: uuid.optional(),
  visibility: z.nativeEnum(TransactionVisibility).default(TransactionVisibility.PRIVATE),
  isReconciled: z.boolean().default(false),
  receiptUrl: z.string().url().optional(),
  receiptFileName: z.string().optional(),
})

export const updateTransactionSchema = createTransactionSchema.partial()

// ──────────────────────────────────────────
// RECURRING TRANSACTION
// ──────────────────────────────────────────

export const recurringTransactionSchema = z.object({
  id: uuid,
  lastTransactionId: uuid.optional(),
  amount: positiveDecimal,
  currency: currency.default("USD"),
  type: z.nativeEnum(TransactionType),
  categoryId: uuid,
  subcategory: z.string().max(50).optional(),
  description,
  notes: z.string().max(appConfig.limits.maxNotesLength).optional(),
  tags,
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  createdBy: uuid,
  workspaceId: uuid.optional(),
  visibility: z.nativeEnum(TransactionVisibility).default(TransactionVisibility.PRIVATE),
  frequency: z.nativeEnum(RecurrenceFrequency),
  interval: z.number().int().min(1).max(365).default(1),
  startDate: dateOnly,
  endDate: dateOnly.optional(),
  lastExecuted: datetime.optional(),
  nextExecution: dateOnly,
  maxExecutions: z.number().int().positive().max(365).optional(),
  executionsCount: z.number().int().min(0).default(0),
  isPaused: z.boolean().default(false),
  isActive: z.boolean().default(true),
  deletedAt: datetime.optional(),
  ...timestamps,
}).refine(
  (data) => !data.endDate || data.endDate >= data.startDate,
  { message: "End date must be after start date", path: ["endDate"] }
)

export const createRecurringTransactionSchema = recurringTransactionSchema.omit({
  id: true, lastTransactionId: true, lastExecuted: true,
  executionsCount: true, isActive: true, deletedAt: true,
  createdAt: true, updatedAt: true, createdBy: true,
})

export const updateRecurringTransactionSchema = createRecurringTransactionSchema.partial()

// ──────────────────────────────────────────
// BUDGET
// ──────────────────────────────────────────

export const budgetSchema = z.object({
  id: uuid,
  categoryId: uuid,
  workspaceId: uuid.optional(),
  userId: uuid,
  amount: positiveDecimal,
  currency: currency.default("USD"),
  period: z.nativeEnum(BudgetPeriod),
  startDate: dateOnly,
  endDate: dateOnly.optional(),
  isAlertEnabled: z.boolean().default(true),
  alertThreshold: z.number().int().min(0).max(100).default(80),
  ...timestamps,
}).refine(
  (data) => !data.endDate || data.endDate >= data.startDate,
  { message: "End date must be after start date", path: ["endDate"] }
)

export const createBudgetSchema = budgetSchema.omit({
  id: true, createdAt: true, updatedAt: true, userId: true,
})

export const updateBudgetSchema = createBudgetSchema.partial()

// ──────────────────────────────────────────
// ACTIVITY LOG
// ──────────────────────────────────────────

export const activityLogSchema = z.object({
  id: uuid,
  workspaceId: uuid.optional(),
  userId: uuid,
  type: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: datetime,
})

export const createActivityLogSchema = activityLogSchema.omit({
  id: true, createdAt: true,
})

// ──────────────────────────────────────────
// NOTIFICATION
// ──────────────────────────────────────────

export const notificationSchema = z.object({
  id: uuid,
  userId: uuid,
  type: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  isRead: z.boolean().default(false),
  actionUrl: z.string().url().optional(),
  actionLabel: z.string().optional(),
  createdAt: datetime,
})

export const createNotificationSchema = notificationSchema.omit({
  id: true, isRead: true, createdAt: true,
})

export const markNotificationReadSchema = z.object({
  isRead: z.literal(true),
})

// ──────────────────────────────────────────
// AUTH SCHEMAS
// ──────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  fullName: z.string().min(1, "Name is required").max(100, "Max 100 characters"),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// ──────────────────────────────────────────
// COMMON
// ──────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(appConfig.pagination.maxPageSize).default(appConfig.pagination.defaultPageSize),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export const transactionFiltersSchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  categoryId: uuid.optional(),
  startDate: datetime.optional(),
  endDate: datetime.optional(),
  search: z.string().max(200).optional(),
  tags: tags.optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  currency: currency.optional(),
  visibility: z.nativeEnum(TransactionVisibility).optional(),
  workspaceId: uuid.optional(),
  createdBy: uuid.optional(),
  isRecurring: z.boolean().optional(),
})

export const idParamSchema = z.object({
  id: uuid,
})

// ──────────────────────────────────────────
// INFERRED TYPES
// ──────────────────────────────────────────

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type CreateRecurringTransactionInput = z.infer<typeof createRecurringTransactionSchema>
export type UpdateRecurringTransactionInput = z.infer<typeof updateRecurringTransactionSchema>
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
export type CreateProfileInput = z.infer<typeof createProfileSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type CreateActivityLogInput = z.infer<typeof createActivityLogSchema>
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type TransactionFiltersInput = z.infer<typeof transactionFiltersSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>
