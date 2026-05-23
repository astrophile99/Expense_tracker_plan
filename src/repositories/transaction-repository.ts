import type { SupabaseClient } from "@supabase/supabase-js"
import { SupabaseRepository, mapRow, type FindAllOptions } from "./supabase-repository"
import type { Transaction, TransactionFilters, PaginatedResponse, CategorySummary, MonthlyTrend } from "@/types"
import { TransactionType } from "@/types"
import { mapSupabaseError } from "@/lib/supabase-error"

export class TransactionRepository extends SupabaseRepository<Transaction> {
  protected entityName = "Transaction"
  protected tableName = "transactions"
  protected supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    super()
    this.supabase = supabase
  }

  async findAll(options?: FindAllOptions): Promise<PaginatedResponse<Transaction>> {
    const page = options?.pagination?.page ?? 1
    const limit = options?.pagination?.limit ?? 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = this.supabase
      .from(this.tableName)
      .select("*", { count: "exact" })

    const filters = options?.filters as TransactionFilters | undefined
    if (filters) {
      if (filters.type) query = query.eq("type", filters.type)
      if (filters.categoryId) query = query.eq("category_id", filters.categoryId)
      if (filters.startDate) query = query.gte("transaction_date", filters.startDate)
      if (filters.endDate) query = query.lte("transaction_date", filters.endDate)
      if (filters.search) {
        query = query.or(
          `description.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
        )
      }
      if (filters.paymentMethod) query = query.eq("payment_method", filters.paymentMethod)
      if (filters.minAmount !== undefined) query = query.gte("amount", filters.minAmount)
      if (filters.maxAmount !== undefined) query = query.lte("amount", filters.maxAmount)
      if (filters.workspaceId) query = query.eq("workspace_id", filters.workspaceId)
      if (filters.createdBy) query = query.eq("created_by", filters.createdBy)
      if (filters.visibility) query = query.eq("visibility", filters.visibility)
      if (filters.tags && filters.tags.length > 0) {
        query = query.contains("tags", filters.tags)
      }
    }

    if (options?.pagination?.sortBy) {
      query = query.order(options.pagination.sortBy === "transactionDate" ? "transaction_date" : options.pagination.sortBy, {
        ascending: options.pagination.sortOrder === "asc",
      })
    } else {
      query = query.order("transaction_date", { ascending: false })
    }

    query = query.range(from, to)

    const { data, count, error } = await query

    if (error) throw mapSupabaseError(error)

    const items = (data ?? []).map((row) => mapRow(row as Record<string, unknown>) as Transaction)

    return {
      data: items,
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
      hasNextPage: page * limit < (count ?? 0),
      hasPrevPage: page > 1,
    }
  }

  async getDashboardStats(userId: string): Promise<{
    totalExpenses: number
    totalIncome: number
    totalCashback: number
    totalRefunds: number
    totalDebt: number
    totalTransfers: number
    netCashflow: number
    transactionCount: number
  }> {
    const { data, error } = await this.supabase
      .rpc("get_dashboard_stats", { p_user_id: userId })

    if (error) {
      if (error.message?.includes("function") && error.message?.includes("not found")) {
        return this.getDashboardStatsInline(userId)
      }
      throw mapSupabaseError(error)
    }

    const row = (data as Record<string, unknown>) ?? {}
    return {
      totalExpenses: Number(row.total_expenses ?? row.totalExpenses ?? 0),
      totalIncome: Number(row.total_income ?? row.totalIncome ?? 0),
      totalCashback: Number(row.total_cashback ?? row.totalCashback ?? 0),
      totalRefunds: Number(row.total_refunds ?? row.totalRefunds ?? 0),
      totalDebt: Number(row.total_debt ?? row.totalDebt ?? 0),
      totalTransfers: Number(row.total_transfers ?? row.totalTransfers ?? 0),
      netCashflow: Number(row.net_cashflow ?? row.netCashflow ?? 0),
      transactionCount: Number(row.transaction_count ?? row.transactionCount ?? 0),
    }
  }

  private async getDashboardStatsInline(userId: string): Promise<{
    totalExpenses: number
    totalIncome: number
    totalCashback: number
    totalRefunds: number
    totalDebt: number
    totalTransfers: number
    netCashflow: number
    transactionCount: number
  }> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("type, amount", { count: "exact" })
      .eq("created_by", userId)

    if (error) throw mapSupabaseError(error)

    const stats = {
      totalExpenses: 0,
      totalIncome: 0,
      totalCashback: 0,
      totalRefunds: 0,
      totalDebt: 0,
      totalTransfers: 0,
      netCashflow: 0,
      transactionCount: data?.length ?? 0,
    }

    for (const tx of data ?? []) {
      const amount = Number(tx.amount)
      switch (tx.type) {
        case "expense": stats.totalExpenses += amount; break
        case "income": stats.totalIncome += amount; break
        case "cashback": stats.totalCashback += amount; break
        case "refund": stats.totalRefunds += amount; break
        case "debt": stats.totalDebt += amount; break
        case "transfer": stats.totalTransfers += amount; break
      }
    }

    stats.netCashflow = stats.totalIncome - stats.totalExpenses
    return stats
  }

  async getExpenseTotals(
    userId: string,
    categoryIds: string[],
    startDate: string,
    endDate: string
  ): Promise<Record<string, number>> {
    if (categoryIds.length === 0) return {}

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("category_id, amount")
      .eq("created_by", userId)
      .eq("type", "expense")
      .in("category_id", categoryIds)
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate)

    if (error) throw mapSupabaseError(error)

    const totals: Record<string, number> = {}
    for (const row of data ?? []) {
      totals[row.category_id] = (totals[row.category_id] ?? 0) + Number(row.amount)
    }

    return totals
  }

  async getCategorySummaries(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<CategorySummary[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        category_id,
        amount,
        type,
        categories!inner(name, icon, color)
      `)
      .eq("created_by", userId)
      .eq("type", "expense")
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate)

    if (error) throw mapSupabaseError(error)

    const grouped: Record<string, { total: number; count: number; name: string; icon: string; color: string }> = {}

    for (const row of data ?? []) {
      const catId = row.category_id
      const categoryRow = (Array.isArray(row.categories)
        ? (row.categories as unknown as Record<string, unknown>[])[0]
        : row.categories) as Record<string, unknown> | undefined
      if (!grouped[catId]) {
        grouped[catId] = {
          total: 0,
          count: 0,
          name: (categoryRow?.name as string) ?? "Unknown",
          icon: (categoryRow?.icon as string) ?? "circle",
          color: (categoryRow?.color as string) ?? "#6366f1",
        }
      }
      grouped[catId].total += Number(row.amount)
      grouped[catId].count++
    }

    const totalExpenses = Object.values(grouped).reduce((sum, g) => sum + g.total, 0)

    return Object.entries(grouped).map(([categoryId, g]) => ({
      categoryId,
      categoryName: g.name,
      categoryIcon: g.icon,
      categoryColor: g.color,
      total: Math.round(g.total * 100) / 100,
      count: g.count,
      percentage: totalExpenses > 0 ? Math.round((g.total / totalExpenses) * 1000) / 10 : 0,
    }))
  }

  async getMonthlyTrends(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<MonthlyTrend[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("amount, type, transaction_date")
      .eq("created_by", userId)
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate)
      .order("transaction_date", { ascending: true })

    if (error) throw mapSupabaseError(error)

    const monthly: Record<string, { expenses: number; income: number }> = {}

    for (const row of data ?? []) {
      const date = new Date(row.transaction_date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      if (!monthly[key]) monthly[key] = { expenses: 0, income: 0 }

      const amount = Number(row.amount)
      if (row.type === "expense") monthly[key].expenses += amount
      else if (row.type === "income") monthly[key].income += amount
    }

    return Object.entries(monthly).map(([key, values]) => {
      const [year, month] = key.split("-").map(Number)
      return {
        month: key,
        year,
        monthIndex: month - 1,
        expenses: Math.round(values.expenses * 100) / 100,
        income: Math.round(values.income * 100) / 100,
        net: Math.round((values.income - values.expenses) * 100) / 100,
      }
    })
  }
}
