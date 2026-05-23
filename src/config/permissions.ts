import { WorkspaceRole, ActivityType } from "@/types"

export enum Permission {
  // Workspace
  VIEW_WORKSPACE = "workspace:view",
  UPDATE_WORKSPACE = "workspace:update",
  DELETE_WORKSPACE = "workspace:delete",
  MANAGE_WORKSPACE_SETTINGS = "workspace:manage_settings",

  // Members
  VIEW_MEMBERS = "members:view",
  INVITE_MEMBERS = "members:invite",
  REMOVE_MEMBERS = "members:remove",
  MANAGE_ROLES = "members:manage_roles",

  // Transactions
  CREATE_TRANSACTION = "transactions:create",
  VIEW_TRANSACTIONS = "transactions:view",
  UPDATE_TRANSACTION = "transactions:update",
  DELETE_TRANSACTION = "transactions:delete",
  VIEW_WORKSPACE_TRANSACTIONS = "transactions:view_workspace",
  VIEW_ALL_TRANSACTIONS = "transactions:view_all",

  // Categories
  CREATE_CATEGORY = "categories:create",
  VIEW_CATEGORIES = "categories:view",
  UPDATE_CATEGORY = "categories:update",
  DELETE_CATEGORY = "categories:delete",

  // Budgets
  CREATE_BUDGET = "budgets:create",
  VIEW_BUDGETS = "budgets:view",
  UPDATE_BUDGET = "budgets:update",
  DELETE_BUDGET = "budgets:delete",

  // Activity
  VIEW_ACTIVITY = "activity:view",

  // Notifications
  VIEW_NOTIFICATIONS = "notifications:view",
  MANAGE_NOTIFICATIONS = "notifications:manage",

  // Recurring
  CREATE_RECURRING = "recurring:create",
  MANAGE_RECURRING = "recurring:manage",

  // Export
  EXPORT_DATA = "export:data",
}

export const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  [WorkspaceRole.OWNER]: [
    Permission.VIEW_WORKSPACE,
    Permission.UPDATE_WORKSPACE,
    Permission.DELETE_WORKSPACE,
    Permission.MANAGE_WORKSPACE_SETTINGS,
    Permission.VIEW_MEMBERS,
    Permission.INVITE_MEMBERS,
    Permission.REMOVE_MEMBERS,
    Permission.MANAGE_ROLES,
    Permission.CREATE_TRANSACTION,
    Permission.VIEW_TRANSACTIONS,
    Permission.UPDATE_TRANSACTION,
    Permission.DELETE_TRANSACTION,
    Permission.VIEW_WORKSPACE_TRANSACTIONS,
    Permission.VIEW_ALL_TRANSACTIONS,
    Permission.CREATE_CATEGORY,
    Permission.VIEW_CATEGORIES,
    Permission.UPDATE_CATEGORY,
    Permission.DELETE_CATEGORY,
    Permission.CREATE_BUDGET,
    Permission.VIEW_BUDGETS,
    Permission.UPDATE_BUDGET,
    Permission.DELETE_BUDGET,
    Permission.VIEW_ACTIVITY,
    Permission.VIEW_NOTIFICATIONS,
    Permission.MANAGE_NOTIFICATIONS,
    Permission.CREATE_RECURRING,
    Permission.MANAGE_RECURRING,
    Permission.EXPORT_DATA,
  ],

  [WorkspaceRole.ADMIN]: [
    Permission.VIEW_WORKSPACE,
    Permission.UPDATE_WORKSPACE,
    Permission.MANAGE_WORKSPACE_SETTINGS,
    Permission.VIEW_MEMBERS,
    Permission.INVITE_MEMBERS,
    Permission.REMOVE_MEMBERS,
    Permission.MANAGE_ROLES,
    Permission.CREATE_TRANSACTION,
    Permission.VIEW_TRANSACTIONS,
    Permission.UPDATE_TRANSACTION,
    Permission.DELETE_TRANSACTION,
    Permission.VIEW_WORKSPACE_TRANSACTIONS,
    Permission.VIEW_ALL_TRANSACTIONS,
    Permission.CREATE_CATEGORY,
    Permission.VIEW_CATEGORIES,
    Permission.UPDATE_CATEGORY,
    Permission.DELETE_CATEGORY,
    Permission.CREATE_BUDGET,
    Permission.VIEW_BUDGETS,
    Permission.UPDATE_BUDGET,
    Permission.DELETE_BUDGET,
    Permission.VIEW_ACTIVITY,
    Permission.VIEW_NOTIFICATIONS,
    Permission.MANAGE_NOTIFICATIONS,
    Permission.CREATE_RECURRING,
    Permission.MANAGE_RECURRING,
    Permission.EXPORT_DATA,
  ],

  [WorkspaceRole.MEMBER]: [
    Permission.VIEW_WORKSPACE,
    Permission.VIEW_MEMBERS,
    Permission.CREATE_TRANSACTION,
    Permission.VIEW_TRANSACTIONS,
    Permission.UPDATE_TRANSACTION,
    Permission.DELETE_TRANSACTION,
    Permission.VIEW_WORKSPACE_TRANSACTIONS,
    Permission.VIEW_CATEGORIES,
    Permission.VIEW_BUDGETS,
    Permission.VIEW_ACTIVITY,
    Permission.VIEW_NOTIFICATIONS,
    Permission.CREATE_RECURRING,
    Permission.MANAGE_RECURRING,
  ],

  [WorkspaceRole.VIEWER]: [
    Permission.VIEW_WORKSPACE,
    Permission.VIEW_MEMBERS,
    Permission.VIEW_TRANSACTIONS,
    Permission.VIEW_WORKSPACE_TRANSACTIONS,
    Permission.VIEW_CATEGORIES,
    Permission.VIEW_BUDGETS,
    Permission.VIEW_ACTIVITY,
    Permission.VIEW_NOTIFICATIONS,
  ],
}

export const ACTIVITY_TYPE_PERMISSIONS: Record<ActivityType, Permission | null> = {
  [ActivityType.TRANSACTION_CREATED]: Permission.VIEW_TRANSACTIONS,
  [ActivityType.TRANSACTION_UPDATED]: Permission.VIEW_TRANSACTIONS,
  [ActivityType.TRANSACTION_DELETED]: Permission.VIEW_TRANSACTIONS,
  [ActivityType.WORKSPACE_CREATED]: Permission.VIEW_WORKSPACE,
  [ActivityType.WORKSPACE_UPDATED]: Permission.VIEW_WORKSPACE,
  [ActivityType.WORKSPACE_DELETED]: Permission.VIEW_WORKSPACE,
  [ActivityType.MEMBER_INVITED]: Permission.VIEW_MEMBERS,
  [ActivityType.MEMBER_JOINED]: Permission.VIEW_MEMBERS,
  [ActivityType.MEMBER_LEFT]: Permission.VIEW_MEMBERS,
  [ActivityType.MEMBER_REMOVED]: Permission.VIEW_MEMBERS,
  [ActivityType.ROLE_CHANGED]: Permission.VIEW_MEMBERS,
  [ActivityType.BUDGET_CREATED]: Permission.VIEW_BUDGETS,
  [ActivityType.BUDGET_UPDATED]: Permission.VIEW_BUDGETS,
  [ActivityType.BUDGET_DELETED]: Permission.VIEW_BUDGETS,
  [ActivityType.BUDGET_ALERT]: Permission.VIEW_BUDGETS,
  [ActivityType.CATEGORY_CREATED]: Permission.VIEW_CATEGORIES,
  [ActivityType.CATEGORY_UPDATED]: Permission.VIEW_CATEGORIES,
  [ActivityType.CATEGORY_DELETED]: Permission.VIEW_CATEGORIES,
  [ActivityType.RECURRING_TRANSACTION_CREATED]: Permission.VIEW_TRANSACTIONS,
  [ActivityType.RECURRING_TRANSACTION_EXECUTED]: Permission.VIEW_TRANSACTIONS,
  [ActivityType.RECURRING_TRANSACTION_PAUSED]: Permission.VIEW_TRANSACTIONS,
  [ActivityType.RECURRING_TRANSACTION_CANCELLED]: Permission.VIEW_TRANSACTIONS,
}

export function hasPermission(role: WorkspaceRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: WorkspaceRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

export function hasAllPermissions(role: WorkspaceRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p))
}
