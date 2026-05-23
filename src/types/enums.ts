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

export enum ActivityType {
  TRANSACTION_CREATED = "transaction_created",
  TRANSACTION_UPDATED = "transaction_updated",
  TRANSACTION_DELETED = "transaction_deleted",
  WORKSPACE_CREATED = "workspace_created",
  WORKSPACE_JOINED = "workspace_joined",
  WORKSPACE_LEFT = "workspace_left",
  MEMBER_INVITED = "member_invited",
  MEMBER_REMOVED = "member_removed",
  ROLE_CHANGED = "role_changed",
  BUDGET_CREATED = "budget_created",
  BUDGET_UPDATED = "budget_updated",
  CATEGORY_CREATED = "category_created",
  CATEGORY_UPDATED = "category_updated",
}

export enum RecurrenceFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export enum NotificationType {
  TRANSACTION_ADDED = "transaction_added",
  MEMBER_JOINED = "member_joined",
  BUDGET_ALERT = "budget_alert",
  RECURRING_TRANSACTION = "recurring_transaction",
}