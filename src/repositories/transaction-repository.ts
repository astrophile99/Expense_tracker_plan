import { BaseRepository, type FindAllOptions } from "./base"
import type { Transaction, TransactionFilters, PaginatedResponse } from "@/types"
import { NotFoundError } from "@/config/errors"

export class TransactionRepository extends BaseRepository<Transaction> {
  protected entityName = "Transaction"

  private store: Transaction[]

  constructor(initialData: Transaction[] = []) {
    super()
    this.store = [...initialData]
  }

  async findAll(options?: FindAllOptions): Promise<PaginatedResponse<Transaction>> {
    let filtered = [...this.store]

    const filters = options?.filters as TransactionFilters | undefined
    if (filters) {
      if (filters.type) filtered = filtered.filter((t) => t.type === filters.type)
      if (filters.categoryId) filtered = filtered.filter((t) => t.categoryId === filters.categoryId)
      if (filters.startDate) filtered = filtered.filter((t) => new Date(t.transactionDate) >= new Date(filters.startDate!))
      if (filters.endDate) filtered = filtered.filter((t) => new Date(t.transactionDate) <= new Date(filters.endDate!))
      if (filters.search) {
        const q = filters.search.toLowerCase()
        filtered = filtered.filter(
          (t) =>
            t.description.toLowerCase().includes(q) ||
            t.notes?.toLowerCase().includes(q) ||
            t.tags?.some((tag) => tag.toLowerCase().includes(q))
        )
      }
      if (filters.paymentMethod) filtered = filtered.filter((t) => t.paymentMethod === filters.paymentMethod)
      if (filters.minAmount !== undefined) filtered = filtered.filter((t) => t.amount >= filters.minAmount!)
      if (filters.maxAmount !== undefined) filtered = filtered.filter((t) => t.amount <= filters.maxAmount!)
      if (filters.workspaceId) filtered = filtered.filter((t) => t.workspaceId === filters.workspaceId)
      if (filters.createdBy) filtered = filtered.filter((t) => t.createdBy === filters.createdBy)
    }

    const pagination = options?.pagination
    if (pagination?.sortBy) {
      const dir = pagination.sortOrder === "asc" ? 1 : -1
      filtered.sort((a, b) => {
        const field = pagination.sortBy as keyof Transaction
        const aVal = a[field]
        const bVal = b[field]
        if (typeof aVal === "string" && typeof bVal === "string") {
          return aVal.localeCompare(bVal) * dir
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
          return (aVal - bVal) * dir
        }
        return 0
      })
    } else {
      filtered.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
    }

    return this.applyPagination(filtered, pagination)
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.store.find((t) => t.id === id) ?? null
  }

  async create(data: Partial<Transaction>): Promise<Transaction> {
    const now = this.timestamps()
    const transaction: Transaction = {
      id: this.generateId(),
      amount: 0,
      currency: "USD" as const,
      type: "expense" as Transaction["type"],
      categoryId: "",
      description: "",
      tags: [],
      transactionDate: new Date().toISOString(),
      createdBy: "",
      visibility: "private" as Transaction["visibility"],
      isRecurring: false,
      ...data,
      ...now,
    } as Transaction

    this.store.unshift(transaction)
    return transaction
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const index = this.store.findIndex((t) => t.id === id)
    if (index === -1) throw new NotFoundError("Transaction", id)

    const updated = { ...this.store[index], ...this.touch(data) } as Transaction
    this.store[index] = updated
    return updated
  }

  async delete(id: string): Promise<void> {
    const index = this.store.findIndex((t) => t.id === id)
    if (index === -1) throw new NotFoundError("Transaction", id)
    this.store.splice(index, 1)
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    let filtered = [...this.store]
    if (filters?.type) filtered = filtered.filter((t) => t.type === filters.type as Transaction["type"])
    if (filters?.categoryId) filtered = filtered.filter((t) => t.categoryId === filters.categoryId as string)
    return filtered.length
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
    const userTx = this.store.filter((t) => t.createdBy === userId)
    const stats = {
      totalExpenses: 0,
      totalIncome: 0,
      totalCashback: 0,
      totalRefunds: 0,
      totalDebt: 0,
      totalTransfers: 0,
      netCashflow: 0,
      transactionCount: userTx.length,
    }

    for (const tx of userTx) {
      switch (tx.type) {
        case "expense": stats.totalExpenses += tx.amount; break
        case "income": stats.totalIncome += tx.amount; break
        case "cashback": stats.totalCashback += tx.amount; break
        case "refund": stats.totalRefunds += tx.amount; break
        case "debt": stats.totalDebt += tx.amount; break
        case "transfer": stats.totalTransfers += tx.amount; break
      }
    }

    stats.netCashflow = stats.totalIncome - stats.totalExpenses
    return stats
  }

  getStore() {
    return this.store
  }
}
