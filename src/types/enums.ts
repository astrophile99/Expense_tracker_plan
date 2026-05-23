export enum TransactionType {
  EXPENSE = "expense",
  INCOME = "income",
  CASHBACK = "cashback",
  REFUND = "refund",
  DEBT = "debt",
  TRANSFER = "transfer",
}

export enum TransactionVisibility {
  PRIVATE = "private",
  WORKSPACE = "workspace",
}

export enum WorkspaceRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  VIEWER = "viewer",
}

export enum RecurrenceFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export enum BudgetPeriod {
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  BANK_TRANSFER = "bank_transfer",
  PAYPAL = "paypal",
  CASH = "cash",
  APPLE_PAY = "apple_pay",
  GOOGLE_PAY = "google_pay",
  VENMO = "venmo",
  CRYPTO = "crypto",
  OTHER = "other",
}

export enum ActivityType {
  TRANSACTION_CREATED = "transaction_created",
  TRANSACTION_UPDATED = "transaction_updated",
  TRANSACTION_DELETED = "transaction_deleted",
  WORKSPACE_CREATED = "workspace_created",
  WORKSPACE_UPDATED = "workspace_updated",
  WORKSPACE_DELETED = "workspace_deleted",
  MEMBER_INVITED = "member_invited",
  MEMBER_JOINED = "member_joined",
  MEMBER_LEFT = "member_left",
  MEMBER_REMOVED = "member_removed",
  ROLE_CHANGED = "role_changed",
  BUDGET_CREATED = "budget_created",
  BUDGET_UPDATED = "budget_updated",
  BUDGET_DELETED = "budget_deleted",
  BUDGET_ALERT = "budget_alert",
  CATEGORY_CREATED = "category_created",
  CATEGORY_UPDATED = "category_updated",
  CATEGORY_DELETED = "category_deleted",
  RECURRING_TRANSACTION_CREATED = "recurring_transaction_created",
  RECURRING_TRANSACTION_EXECUTED = "recurring_transaction_executed",
  RECURRING_TRANSACTION_PAUSED = "recurring_transaction_paused",
  RECURRING_TRANSACTION_CANCELLED = "recurring_transaction_cancelled",
}

export enum NotificationType {
  TRANSACTION_ADDED = "transaction_added",
  TRANSACTION_UPDATED = "transaction_updated",
  TRANSACTION_DELETED = "transaction_deleted",
  MEMBER_JOINED = "member_joined",
  MEMBER_LEFT = "member_left",
  MEMBER_INVITED = "member_invited",
  BUDGET_ALERT = "budget_alert",
  BUDGET_EXCEEDED = "budget_exceeded",
  RECURRING_EXECUTED = "recurring_executed",
  RECURRING_FAILED = "recurring_failed",
  WORKSPACE_INVITATION = "workspace_invitation",
  ROLE_CHANGED = "role_changed",
  SYSTEM = "system",
}

export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.EXPENSE]: "Expense",
  [TransactionType.INCOME]: "Income",
  [TransactionType.CASHBACK]: "Cashback",
  [TransactionType.REFUND]: "Refund",
  [TransactionType.DEBT]: "Debt Payment",
  [TransactionType.TRANSFER]: "Transfer",
}

export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "BRL"] as const
export type Currency = (typeof CURRENCIES)[number]
