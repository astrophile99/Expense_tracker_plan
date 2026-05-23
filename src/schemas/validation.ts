import { z } from "zod"
import { TransactionType, TransactionVisibility, WorkspaceRole, RecurrenceFrequency } from "@/types"

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const profileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  fullName: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
  currency: z.string().default("USD"),
  timezone: z.string().default("UTC"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const workspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const workspaceMemberSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.nativeEnum(WorkspaceRole),
  joinedAt: z.string().datetime(),
})

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  icon: z.string(),
  color: z.string(),
  group: z.string(),
  isDefault: z.boolean().default(false),
  workspaceId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const recurringConfigSchema = z.object({
  frequency: z.nativeEnum(RecurrenceFrequency),
  interval: z.number().int().positive().default(1),
  endDate: z.string().datetime().optional(),
  nextExecutionDate: z.string().datetime(),
})

export const transactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  type: z.nativeEnum(TransactionType),
  categoryId: z.string().uuid(),
  subcategory: z.string().max(50).optional(),
  description: z.string().min(1).max(200),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
  paymentMethod: z.string().optional(),
  transactionDate: z.string().datetime(),
  createdBy: z.string().uuid(),
  workspaceId: z.string().uuid().optional(),
  visibility: z.nativeEnum(TransactionVisibility).default(TransactionVisibility.PRIVATE),
  isRecurring: z.boolean().default(false),
  recurringConfig: recurringConfigSchema.optional(),
  receiptUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const budgetSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid(),
  workspaceId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  amount: z.number().positive(),
  period: z.enum(["weekly", "monthly", "yearly"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const activityLogSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  type: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime(),
})

export const notificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean().default(false),
  actionUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
})

export const createTransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  type: z.nativeEnum(TransactionType),
  categoryId: z.string().uuid(),
  subcategory: z.string().max(50).optional(),
  description: z.string().min(1).max(200),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
  paymentMethod: z.string().optional(),
  transactionDate: z.string().datetime(),
  createdBy: z.string().uuid(),
  workspaceId: z.string().uuid().optional(),
  visibility: z.nativeEnum(TransactionVisibility).default(TransactionVisibility.PRIVATE),
  isRecurring: z.boolean().default(false),
  recurringConfig: recurringConfigSchema.optional(),
  receiptUrl: z.string().url().optional(),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const createWorkspaceSchema = workspaceSchema.omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
})

export const updateWorkspaceSchema = createWorkspaceSchema.partial()

export const createCategorySchema = categorySchema.omit({
  id: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
})

export const updateCategorySchema = createCategorySchema.partial()

export const createBudgetSchema = budgetSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateBudgetSchema = createBudgetSchema.partial()

export const createProfileSchema = profileSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export const updateProfileSchema = createProfileSchema.partial()

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).max(100),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
export type CreateProfileInput = z.infer<typeof createProfileSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>