import { BaseRepository, type FindAllOptions } from "./base"
import type { Budget, PaginatedResponse } from "@/types"
import { BudgetPeriod } from "@/types"
import { NotFoundError } from "@/config/errors"

export class BudgetRepository extends BaseRepository<Budget> {
  protected entityName = "Budget"

  private store: Budget[] = []

  async findAll(options?: FindAllOptions): Promise<PaginatedResponse<Budget>> {
    let filtered = [...this.store]

    if (options?.filters) {
      const { userId, workspaceId, categoryId, period } = options.filters as Record<string, unknown>
      if (userId) filtered = filtered.filter((b) => b.userId === userId)
      if (workspaceId) filtered = filtered.filter((b) => b.workspaceId === workspaceId)
      if (categoryId) filtered = filtered.filter((b) => b.categoryId === categoryId)
      if (period) filtered = filtered.filter((b) => b.period === period)
    }

    return this.applyPagination(filtered, options?.pagination)
  }

  async findById(id: string): Promise<Budget | null> {
    return this.store.find((b) => b.id === id) ?? null
  }

  async create(data: Partial<Budget>): Promise<Budget> {
    const now = this.timestamps()
    const budget: Budget = {
      id: this.generateId(),
      categoryId: "",
      userId: "",
      amount: 0,
      currency: "USD" as const,
      period: BudgetPeriod.MONTHLY,
      startDate: now.createdAt.split("T")[0],
      isAlertEnabled: true,
      alertThreshold: 80,
      ...data,
      ...now,
    } as Budget

    this.store.push(budget)
    return budget
  }

  async update(id: string, data: Partial<Budget>): Promise<Budget> {
    const index = this.store.findIndex((b) => b.id === id)
    if (index === -1) throw new NotFoundError("Budget", id)
    const updated = { ...this.store[index], ...this.touch(data) } as Budget
    this.store[index] = updated
    return updated
  }

  async delete(id: string): Promise<void> {
    const index = this.store.findIndex((b) => b.id === id)
    if (index === -1) throw new NotFoundError("Budget", id)
    this.store.splice(index, 1)
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    let filtered = [...this.store]
    if (filters?.userId) filtered = filtered.filter((b) => b.userId === filters.userId)
    if (filters?.workspaceId) filtered = filtered.filter((b) => b.workspaceId === filters.workspaceId)
    return filtered.length
  }

  async getByUser(userId: string): Promise<Budget[]> {
    return this.store.filter((b) => b.userId === userId)
  }

  async getByWorkspace(workspaceId: string): Promise<Budget[]> {
    return this.store.filter((b) => b.workspaceId === workspaceId)
  }

  async getByCategory(categoryId: string): Promise<Budget | null> {
    return this.store.find((b) => b.categoryId === categoryId) ?? null
  }
}
