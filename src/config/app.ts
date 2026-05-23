import { TransactionVisibility, PaymentMethod } from "@/types"

export const appConfig = {
  name: "Finance Tracker",
  description: "Track your finances with ease",
  version: "0.1.0",
  defaultCurrency: "USD" as const,
  defaultTimezone: "UTC" as const,
  defaultLocale: "en-US" as const,
  dateFormat: "MM/dd/yyyy" as const,
  dateTimeFormat: "MMM d, yyyy h:mm a" as const,

  limits: {
    maxWorkspacesPerUser: 10,
    maxMembersPerWorkspace: 50,
    maxCategoriesPerWorkspace: 100,
    maxBudgetsPerWorkspace: 50,
    maxTagsPerTransaction: 20,
    maxDescriptionLength: 200,
    maxNotesLength: 2000,
    maxTransactionAmount: 999999999.99,
    maxFileSizeBytes: 10 * 1024 * 1024,
    transactionPageSize: 20,
    maxActiveRecurringTransactions: 50,
    invitationExpiryDays: 7,
  },

  defaults: {
    transactionVisibility: TransactionVisibility.PRIVATE,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100] as number[],
    budgetAlertThreshold: 80,
    paymentMethods: Object.values(PaymentMethod),
  },

  sidebar: {
    defaultCollapsed: false,
    width: 280,
    collapsedWidth: 80,
  },

  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100],
  },

  theme: {
    primaryColor: "#0ea5e9",
    borderRadius: "0.5rem",
  },

  storage: {
    receiptsBucket: "receipts",
    maxFilesPerTransaction: 5,
    allowedFileTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  },

  recurring: {
    maxExecutions: 365,
    minInterval: 1,
    maxInterval: 365,
  },

  audit: {
    enabled: true,
    retentionDays: 365,
  },
} as const

export type AppConfig = typeof appConfig
