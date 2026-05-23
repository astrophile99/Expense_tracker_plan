import type {
  Transaction,
  Category,
  DashboardStats,
  CategorySummary,
  MonthlyTrend,
  Budget,
} from "@/types"
import { TransactionType, TransactionVisibility, RecurrenceFrequency } from "@/types"

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Food & Dining", icon: "utensils", color: "#ef4444", group: "essential", isDefault: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "cat-2", name: "Transportation", icon: "car", color: "#f97316", group: "essential", isDefault: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "cat-3", name: "Shopping", icon: "shopping-bag", color: "#eab308", group: "lifestyle", isDefault: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "cat-4", name: "Entertainment", icon: "film", color: "#a855f7", group: "lifestyle", isDefault: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "cat-5", name: "Bills & Utilities", icon: "zap", color: "#0ea5e9", group: "essential", isDefault: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "cat-6", name: "Healthcare", icon: "heart-pulse", color: "#ec4899", group: "essential", isDefault: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "cat-7", name: "Education", icon: "book-open", color: "#6366f1", group: "growth", isDefault: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "cat-8", name: "Income", icon: "briefcase", color: "#22c55e", group: "income", isDefault: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "cat-9", name: "Freelance", icon: "laptop", color: "#14b8a6", group: "income", isDefault: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "cat-10", name: "Investments", icon: "trending-up", color: "#8b5cf6", group: "income", isDefault: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "cat-11", name: "Cashback", icon: "gift", color: "#0ea5e9", group: "other", isDefault: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "cat-12", name: "Transfer", icon: "arrow-left-right", color: "#6366f1", group: "other", isDefault: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "cat-13", name: "Debt Payment", icon: "credit-card", color: "#f97316", group: "essential", isDefault: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "cat-14", name: "Refund", icon: "rotate-ccw", color: "#a855f7", group: "other", isDefault: true, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
]

const today = new Date()
function daysAgo(n: number): string {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "tx-1", amount: 4500, type: TransactionType.INCOME, categoryId: "cat-8", description: "Monthly Salary", notes: "May 2026 salary", tags: ["work", "monthly"], paymentMethod: "bank-transfer", transactionDate: daysAgo(1), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: true, recurringConfig: { frequency: RecurrenceFrequency.MONTHLY, interval: 1, nextExecutionDate: daysAgo(-27) }, createdAt: daysAgo(1), updatedAt: daysAgo(1), category: MOCK_CATEGORIES[7] },
  { id: "tx-2", amount: 89.50, type: TransactionType.EXPENSE, categoryId: "cat-1", description: "Grocery Store - Whole Foods", tags: ["groceries", "food"], paymentMethod: "credit-card", transactionDate: daysAgo(1), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: false, createdAt: daysAgo(1), updatedAt: daysAgo(1), category: MOCK_CATEGORIES[0] },
  { id: "tx-3", amount: 1200, type: TransactionType.EXPENSE, categoryId: "cat-5", description: "Rent Payment", tags: ["housing", "monthly"], paymentMethod: "bank-transfer", transactionDate: daysAgo(2), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: true, recurringConfig: { frequency: RecurrenceFrequency.MONTHLY, interval: 1, nextExecutionDate: daysAgo(-26) }, createdAt: daysAgo(2), updatedAt: daysAgo(2), category: MOCK_CATEGORIES[4] },
  { id: "tx-4", amount: 45.00, type: TransactionType.EXPENSE, categoryId: "cat-4", description: "Netflix Subscription", tags: ["streaming", "monthly"], paymentMethod: "credit-card", transactionDate: daysAgo(2), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: true, recurringConfig: { frequency: RecurrenceFrequency.MONTHLY, interval: 1, nextExecutionDate: daysAgo(-26) }, createdAt: daysAgo(2), updatedAt: daysAgo(2), category: MOCK_CATEGORIES[3] },
  { id: "tx-5", amount: 35.00, type: TransactionType.EXPENSE, categoryId: "cat-2", description: "Uber Ride - Downtown", tags: ["transport", "ride-share"], paymentMethod: "credit-card", transactionDate: daysAgo(3), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: false, createdAt: daysAgo(3), updatedAt: daysAgo(3), category: MOCK_CATEGORIES[1] },
  { id: "tx-6", amount: 2500, type: TransactionType.INCOME, categoryId: "cat-9", description: "Freelance Web Project", notes: "Redesign phase 2 completed", tags: ["freelance", "web-dev"], paymentMethod: "paypal", transactionDate: daysAgo(3), createdBy: "user-1", visibility: TransactionVisibility.WORKSPACE, isRecurring: false, createdAt: daysAgo(3), updatedAt: daysAgo(3), category: MOCK_CATEGORIES[8] },
  { id: "tx-7", amount: 299.99, type: TransactionType.EXPENSE, categoryId: "cat-3", description: "New Running Shoes - Nike", tags: ["shopping", "sports"], paymentMethod: "credit-card", transactionDate: daysAgo(4), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: false, createdAt: daysAgo(4), updatedAt: daysAgo(4), category: MOCK_CATEGORIES[2] },
  { id: "tx-8", amount: 15.99, type: TransactionType.EXPENSE, categoryId: "cat-4", description: "Spotify Premium", tags: ["music", "subscription"], paymentMethod: "credit-card", transactionDate: daysAgo(5), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: true, recurringConfig: { frequency: RecurrenceFrequency.MONTHLY, interval: 1, nextExecutionDate: daysAgo(-24) }, createdAt: daysAgo(5), updatedAt: daysAgo(5), category: MOCK_CATEGORIES[3] },
  { id: "tx-9", amount: 2340.50, type: TransactionType.INCOME, categoryId: "cat-10", description: "Stock Dividends", notes: "Q2 dividend payout", tags: ["investments", "passive"], paymentMethod: "bank-transfer", transactionDate: daysAgo(5), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: false, createdAt: daysAgo(5), updatedAt: daysAgo(5), category: MOCK_CATEGORIES[9] },
  { id: "tx-10", amount: 75.00, type: TransactionType.EXPENSE, categoryId: "cat-6", description: "Pharmacy - Prescription", tags: ["health", "medicine"], paymentMethod: "debit-card", transactionDate: daysAgo(6), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: false, createdAt: daysAgo(6), updatedAt: daysAgo(6), category: MOCK_CATEGORIES[5] },
  { id: "tx-11", amount: 200.00, type: TransactionType.EXPENSE, categoryId: "cat-7", description: "Online Course - React Mastery", tags: ["education", "course"], paymentMethod: "credit-card", transactionDate: daysAgo(7), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: false, createdAt: daysAgo(7), updatedAt: daysAgo(7), category: MOCK_CATEGORIES[6] },
  { id: "tx-12", amount: 50.00, type: TransactionType.CASHBACK, categoryId: "cat-11", description: "Credit Card Cashback Reward", tags: ["rewards", "cashback"], paymentMethod: "credit-card", transactionDate: daysAgo(8), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: false, createdAt: daysAgo(8), updatedAt: daysAgo(8), category: MOCK_CATEGORIES[10] },
  { id: "tx-13", amount: 500, type: TransactionType.TRANSFER, categoryId: "cat-12", description: "Transfer to Savings Account", tags: ["savings", "transfer"], paymentMethod: "bank-transfer", transactionDate: daysAgo(9), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: true, recurringConfig: { frequency: RecurrenceFrequency.MONTHLY, interval: 1, nextExecutionDate: daysAgo(-20) }, createdAt: daysAgo(9), updatedAt: daysAgo(9), category: MOCK_CATEGORIES[11] },
  { id: "tx-14", amount: 350.00, type: TransactionType.DEBT, categoryId: "cat-13", description: "Credit Card Payment", tags: ["debt", "payment"], paymentMethod: "bank-transfer", transactionDate: daysAgo(10), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: true, recurringConfig: { frequency: RecurrenceFrequency.MONTHLY, interval: 1, nextExecutionDate: daysAgo(-19) }, createdAt: daysAgo(10), updatedAt: daysAgo(10), category: MOCK_CATEGORIES[12] },
  { id: "tx-15", amount: 89.99, type: TransactionType.REFUND, categoryId: "cat-14", description: "Amazon Return - Headphones", tags: ["return", "refund"], paymentMethod: "credit-card", transactionDate: daysAgo(11), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: false, createdAt: daysAgo(11), updatedAt: daysAgo(11), category: MOCK_CATEGORIES[13] },
  { id: "tx-16", amount: 12.50, type: TransactionType.EXPENSE, categoryId: "cat-1", description: "Morning Coffee - Starbucks", tags: ["coffee", "food"], paymentMethod: "credit-card", transactionDate: daysAgo(0), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: false, createdAt: daysAgo(0), updatedAt: daysAgo(0), category: MOCK_CATEGORIES[0] },
  { id: "tx-17", amount: 65.00, type: TransactionType.EXPENSE, categoryId: "cat-2", description: "Gas Station - Shell", tags: ["gas", "transport"], paymentMethod: "credit-card", transactionDate: daysAgo(0), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: false, createdAt: daysAgo(0), updatedAt: daysAgo(0), category: MOCK_CATEGORIES[1] },
  { id: "tx-18", amount: 180.00, type: TransactionType.EXPENSE, categoryId: "cat-5", description: "Electric Bill - May", tags: ["utilities", "electricity"], paymentMethod: "bank-transfer", transactionDate: daysAgo(3), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: true, recurringConfig: { frequency: RecurrenceFrequency.MONTHLY, interval: 1, nextExecutionDate: daysAgo(-26) }, createdAt: daysAgo(3), updatedAt: daysAgo(3), category: MOCK_CATEGORIES[4] },
  { id: "tx-19", amount: 55.00, type: TransactionType.EXPENSE, categoryId: "cat-5", description: "Internet - Xfinity", tags: ["utilities", "internet"], paymentMethod: "bank-transfer", transactionDate: daysAgo(4), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: true, recurringConfig: { frequency: RecurrenceFrequency.MONTHLY, interval: 1, nextExecutionDate: daysAgo(-25) }, createdAt: daysAgo(4), updatedAt: daysAgo(4), category: MOCK_CATEGORIES[4] },
  { id: "tx-20", amount: 22.99, type: TransactionType.EXPENSE, categoryId: "cat-4", description: "Movie Tickets - Oppenheimer", tags: ["movies", "entertainment"], paymentMethod: "credit-card", transactionDate: daysAgo(6), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: false, createdAt: daysAgo(6), updatedAt: daysAgo(6), category: MOCK_CATEGORIES[3] },
  { id: "tx-21", amount: 150.00, type: TransactionType.INCOME, categoryId: "cat-9", description: "Freelance - Logo Design", tags: ["freelance", "design"], paymentMethod: "paypal", transactionDate: daysAgo(7), createdBy: "user-1", visibility: TransactionVisibility.WORKSPACE, isRecurring: false, createdAt: daysAgo(7), updatedAt: daysAgo(7), category: MOCK_CATEGORIES[8] },
  { id: "tx-22", amount: 850, type: TransactionType.INCOME, categoryId: "cat-10", description: "Crypto Sale - BTC", notes: "Sold 0.01 BTC", tags: ["crypto", "investment"], paymentMethod: "bank-transfer", transactionDate: daysAgo(10), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: false, createdAt: daysAgo(10), updatedAt: daysAgo(10), category: MOCK_CATEGORIES[9] },
  { id: "tx-23", amount: 5.99, type: TransactionType.EXPENSE, categoryId: "cat-4", description: "iCloud+ Storage", tags: ["apple", "cloud"], paymentMethod: "credit-card", transactionDate: daysAgo(0), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: true, recurringConfig: { frequency: RecurrenceFrequency.MONTHLY, interval: 1, nextExecutionDate: daysAgo(-29) }, createdAt: daysAgo(0), updatedAt: daysAgo(0), category: MOCK_CATEGORIES[3] },
  { id: "tx-24", amount: 79.00, type: TransactionType.EXPENSE, categoryId: "cat-1", description: "Dinner at Italian Restaurant", tags: ["dining", "food"], paymentMethod: "credit-card", transactionDate: daysAgo(0), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: false, createdAt: daysAgo(0), updatedAt: daysAgo(0), category: MOCK_CATEGORIES[0] },
  { id: "tx-25", amount: 1000, type: TransactionType.TRANSFER, categoryId: "cat-12", description: "Transfer to Investment Account", tags: ["investment", "transfer"], paymentMethod: "bank-transfer", transactionDate: daysAgo(12), createdBy: "user-1", visibility: TransactionVisibility.PRIVATE, isRecurring: false, createdAt: daysAgo(12), updatedAt: daysAgo(12), category: MOCK_CATEGORIES[11] },
]

export const MOCK_BUDGETS: Budget[] = [
  { id: "budget-1", categoryId: "cat-1", userId: "user-1", amount: 800, period: "monthly", startDate: "2026-05-01T00:00:00Z", createdAt: "2026-05-01T00:00:00Z", updatedAt: "2026-05-01T00:00:00Z", category: MOCK_CATEGORIES[0] },
  { id: "budget-2", categoryId: "cat-2", userId: "user-1", amount: 300, period: "monthly", startDate: "2026-05-01T00:00:00Z", createdAt: "2026-05-01T00:00:00Z", updatedAt: "2026-05-01T00:00:00Z", category: MOCK_CATEGORIES[1] },
  { id: "budget-3", categoryId: "cat-3", userId: "user-1", amount: 500, period: "monthly", startDate: "2026-05-01T00:00:00Z", createdAt: "2026-05-01T00:00:00Z", updatedAt: "2026-05-01T00:00:00Z", category: MOCK_CATEGORIES[2] },
  { id: "budget-4", categoryId: "cat-4", userId: "user-1", amount: 200, period: "monthly", startDate: "2026-05-01T00:00:00Z", createdAt: "2026-05-01T00:00:00Z", updatedAt: "2026-05-01T00:00:00Z", category: MOCK_CATEGORIES[3] },
  { id: "budget-5", categoryId: "cat-5", userId: "user-1", amount: 1500, period: "monthly", startDate: "2026-05-01T00:00:00Z", createdAt: "2026-05-01T00:00:00Z", updatedAt: "2026-05-01T00:00:00Z", category: MOCK_CATEGORIES[4] },
]

export function getDashboardStats(transactions: Transaction[]): DashboardStats {
  const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0)
  const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0)
  const cashback = transactions.filter(t => t.type === TransactionType.CASHBACK).reduce((s, t) => s + t.amount, 0)
  const refunds = transactions.filter(t => t.type === TransactionType.REFUND).reduce((s, t) => s + t.amount, 0)
  return {
    totalExpenses: expenses,
    totalIncome: income,
    totalCashback: cashback,
    totalRefunds: refunds,
    savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100 * 10) / 10 : 0,
    transactionCount: transactions.length,
  }
}

export function getCategorySummaries(transactions: Transaction[], categories: Category[]): CategorySummary[] {
  const map = new Map<string, { total: number; count: number }>()
  const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE)
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0)
  for (const t of expenses) {
    const existing = map.get(t.categoryId)
    if (existing) {
      existing.total += t.amount
      existing.count++
    } else {
      map.set(t.categoryId, { total: t.amount, count: 1 })
    }
  }
  return Array.from(map.entries()).map(([categoryId, data]) => {
    const cat = categories.find(c => c.id === categoryId)
    return {
      categoryId,
      categoryName: cat?.name ?? "Unknown",
      categoryIcon: cat?.icon ?? "circle",
      categoryColor: cat?.color ?? "#a3a3a3",
      total: data.total,
      count: data.count,
      percentage: totalExpense > 0 ? Math.round((data.total / totalExpense) * 100 * 10) / 10 : 0,
    }
  }).sort((a, b) => b.total - a.total)
}

export function getMonthlyTrends(): MonthlyTrend[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May"]
  return [
    { month: "Jan", expenses: 3200, income: 7800 },
    { month: "Feb", expenses: 2900, income: 7200 },
    { month: "Mar", expenses: 3500, income: 8500 },
    { month: "Apr", expenses: 3100, income: 8200 },
    { month: "May", expenses: 3340, income: 8200 },
  ]
}

export const PAYMENT_METHODS = [
  { value: "credit-card", label: "Credit Card", icon: "credit-card" },
  { value: "debit-card", label: "Debit Card", icon: "credit-card" },
  { value: "bank-transfer", label: "Bank Transfer", icon: "building-bank" },
  { value: "paypal", label: "PayPal", icon: "wallet" },
  { value: "cash", label: "Cash", icon: "banknote" },
  { value: "apple-pay", label: "Apple Pay", icon: "smartphone" },
  { value: "google-pay", label: "Google Pay", icon: "smartphone" },
]
