import { create } from "zustand"
import type { Transaction, TransactionFilters, PaginatedResponse, DashboardStats, CategorySummary, MonthlyTrend } from "@/types"
import type { TransactionType } from "@/types"
import { MOCK_TRANSACTIONS } from "@/data/mock"

interface TransactionState {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  filters: TransactionFilters
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  selectedTransaction: Transaction | null
  dashboardStats: DashboardStats | null
  categorySummaries: CategorySummary[]
  monthlyTrends: MonthlyTrend[]
  setTransactions: (transactions: Transaction[]) => void
  setFilters: (filters: TransactionFilters) => void
  setPagination: (pagination: Partial<TransactionState["pagination"]>) => void
  setSelectedTransaction: (transaction: Transaction | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setDashboardStats: (stats: DashboardStats | null) => void
  setCategorySummaries: (summaries: CategorySummary[]) => void
  setMonthlyTrends: (trends: MonthlyTrend[]) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, data: Partial<Transaction>) => void
  removeTransaction: (id: string) => void
  resetFilters: () => void
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: MOCK_TRANSACTIONS,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  selectedTransaction: null,
  dashboardStats: null,
  categorySummaries: [],
  monthlyTrends: [],
  setTransactions: (transactions) => set({ transactions }),
  setFilters: (filters) => set({ filters }),
  setPagination: (pagination) => set((state) => ({ pagination: { ...state.pagination, ...pagination } })),
  setSelectedTransaction: (selectedTransaction) => set({ selectedTransaction }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setDashboardStats: (dashboardStats) => set({ dashboardStats }),
  setCategorySummaries: (categorySummaries) => set({ categorySummaries }),
  setMonthlyTrends: (monthlyTrends) => set({ monthlyTrends }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),
  updateTransaction: (id, data) =>
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
  resetFilters: () => set({ filters: {} }),
}))