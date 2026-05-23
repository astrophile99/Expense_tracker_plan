import type {
  TransactionType, TransactionVisibility, WorkspaceRole,
  ActivityType, RecurrenceFrequency, NotificationType,
  BudgetPeriod, PaymentMethod, InvitationStatus, Currency,
} from "./enums"

export interface Timestamps {
  createdAt: string
  updatedAt: string
}

export interface SoftDeletable {
  deletedAt?: string
}

// ──────────────────────────────────────────
// User & Profile
// ──────────────────────────────────────────

export interface User extends Timestamps {
  id: string
  email: string
}

export interface Profile extends Timestamps {
  id: string
  userId: string
  fullName: string
  avatarUrl?: string
  currency: Currency
  timezone: string
  locale: string
}

// ──────────────────────────────────────────
// Workspace
// ──────────────────────────────────────────

export interface Workspace extends Timestamps {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  createdBy: string
  memberCount?: number
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: WorkspaceRole
  joinedAt: string
  invitedBy?: string
  user?: User
  profile?: Profile
}

export interface WorkspaceInvitation extends Timestamps {
  id: string
  workspaceId: string
  email: string
  role: WorkspaceRole
  invitedBy: string
  status: InvitationStatus
  expiresAt: string
}

// ──────────────────────────────────────────
// Category
// ──────────────────────────────────────────

export interface Category extends Timestamps {
  id: string
  name: string
  icon: string
  color: string
  group: string
  isDefault: boolean
  workspaceId?: string
  userId?: string
  sortOrder?: number
  isArchived?: boolean
}

// ──────────────────────────────────────────
// Transaction
// ──────────────────────────────────────────

export interface Transaction extends Timestamps {
  id: string
  amount: number
  currency: Currency
  type: TransactionType
  categoryId: string
  subcategory?: string
  description: string
  notes?: string
  tags: string[]
  paymentMethod?: PaymentMethod
  transactionDate: string
  createdBy: string
  workspaceId?: string
  visibility: TransactionVisibility
  isRecurring?: boolean
  recurringConfig?: RecurringConfig
  isReconciled?: boolean
  receiptUrl?: string
  receiptFileName?: string

  category?: Category
  creator?: User
}

export interface RecurringConfig {
  frequency: RecurrenceFrequency
  interval: number
  endDate?: string
  nextExecutionDate: string
  maxExecutions?: number
  executionsCount?: number
  isPaused?: boolean
}

export interface RecurringTransaction extends Timestamps, SoftDeletable {
  id: string
  transactionId?: string
  amount: number
  currency: Currency
  type: TransactionType
  categoryId: string
  subcategory?: string
  description: string
  notes?: string
  tags: string[]
  paymentMethod?: PaymentMethod
  createdBy: string
  workspaceId?: string
  visibility: TransactionVisibility
  frequency: RecurrenceFrequency
  interval: number
  startDate: string
  endDate?: string
  lastExecuted?: string
  nextExecution: string
  maxExecutions?: number
  executionsCount: number
  isPaused: boolean
  isActive: boolean

  category?: Category
  creator?: User
}

// ──────────────────────────────────────────
// Budget
// ──────────────────────────────────────────

export interface Budget extends Timestamps {
  id: string
  categoryId: string
  workspaceId?: string
  userId: string
  amount: number
  currency: Currency
  period: BudgetPeriod
  startDate: string
  endDate?: string
  isAlertEnabled?: boolean
  alertThreshold?: number

  category?: Category
  spent?: number
  remaining?: number
  percentageUsed?: number
}

// ──────────────────────────────────────────
// Activity & Notifications
// ──────────────────────────────────────────

export interface ActivityLog {
  id: string
  workspaceId?: string
  userId: string
  type: ActivityType
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  user?: User
}

export interface Notification extends Timestamps {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  actionUrl?: string
  actionLabel?: string
}

// ──────────────────────────────────────────
// Aggregations & Queries
// ──────────────────────────────────────────

export interface DashboardStats {
  totalExpenses: number
  totalIncome: number
  totalCashback: number
  totalRefunds: number
  totalDebt: number
  netCashflow: number
  savingsRate: number
  transactionCount: number
  recurringCount: number
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  total: number
  count: number
  percentage: number
}

export interface MonthlyTrend {
  month: string
  year: number
  monthIndex: number
  expenses: number
  income: number
  net: number
}

export interface TransactionFilters {
  type?: TransactionType
  categoryId?: string
  startDate?: string
  endDate?: string
  search?: string
  tags?: string[]
  paymentMethod?: PaymentMethod
  minAmount?: number
  maxAmount?: number
  currency?: Currency
  visibility?: TransactionVisibility
  workspaceId?: string
  createdBy?: string
  isRecurring?: boolean
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// ──────────────────────────────────────────
// API Response wrapper
// ──────────────────────────────────────────

export type ApiResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: AppError }

export interface AppError {
  code: string
  message: string
  details?: Record<string, string[]>
  statusCode: number
}
