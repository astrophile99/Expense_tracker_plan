import type { TransactionType, TransactionVisibility, WorkspaceRole, ActivityType, RecurrenceFrequency, NotificationType } from "./enums"

export interface User {
  id: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface Profile {
  id: string
  userId: string
  fullName: string
  avatarUrl?: string
  currency: string
  timezone: string
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: WorkspaceRole
  joinedAt: string
  user?: User
  profile?: Profile
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  group: string
  isDefault: boolean
  workspaceId?: string
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  categoryId: string
  subcategory?: string
  description: string
  notes?: string
  tags: string[]
  paymentMethod?: string
  transactionDate: string
  createdBy: string
  workspaceId?: string
  visibility: TransactionVisibility
  isRecurring: boolean
  recurringConfig?: RecurringConfig
  receiptUrl?: string
  createdAt: string
  updatedAt: string
  category?: Category
  creator?: User
}

export interface RecurringConfig {
  frequency: RecurrenceFrequency
  interval: number
  endDate?: string
  nextExecutionDate: string
}

export interface Budget {
  id: string
  categoryId: string
  workspaceId?: string
  userId: string
  amount: number
  period: "weekly" | "monthly" | "yearly"
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
  category?: Category
}

export interface ActivityLog {
  id: string
  workspaceId?: string
  userId: string
  type: ActivityType
  metadata: Record<string, unknown>
  createdAt: string
  user?: User
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  actionUrl?: string
  createdAt: string
}

export interface DashboardStats {
  totalExpenses: number
  totalIncome: number
  totalCashback: number
  totalRefunds: number
  savingsRate: number
  transactionCount: number
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
  expenses: number
  income: number
}

export interface TransactionFilters {
  type?: TransactionType
  categoryId?: string
  startDate?: string
  endDate?: string
  search?: string
  tags?: string[]
  paymentMethod?: string
  minAmount?: number
  maxAmount?: number
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}