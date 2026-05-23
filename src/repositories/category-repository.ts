import { BaseRepository, type FindAllOptions } from "./base"
import type { Category, PaginatedResponse } from "@/types"
import { NotFoundError, BusinessRuleError } from "@/config/errors"

export class CategoryRepository extends BaseRepository<Category> {
  protected entityName = "Category"

  private store: Category[] = []

  async findAll(options?: FindAllOptions): Promise<PaginatedResponse<Category>> {
    let filtered = [...this.store]

    if (options?.filters) {
      const { workspaceId, userId, group, isArchived } = options.filters as Record<string, unknown>
      if (workspaceId) filtered = filtered.filter((c) => c.workspaceId === workspaceId)
      if (userId) filtered = filtered.filter((c) => c.userId === userId)
      if (group) filtered = filtered.filter((c) => c.group === group)
      if (isArchived !== undefined) filtered = filtered.filter((c) => c.isArchived === isArchived)
    }

    filtered.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

    return this.applyPagination(filtered, options?.pagination)
  }

  async findById(id: string): Promise<Category | null> {
    return this.store.find((c) => c.id === id) ?? null
  }

  async create(data: Partial<Category>): Promise<Category> {
    const now = this.timestamps()
    const category: Category = {
      id: this.generateId(),
      name: "",
      icon: "circle",
      color: "#6366f1",
      group: "other",
      isDefault: false,
      sortOrder: this.store.length,
      isArchived: false,
      ...data,
      ...now,
    } as Category

    this.store.push(category)
    return category
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const index = this.store.findIndex((c) => c.id === id)
    if (index === -1) throw new NotFoundError("Category", id)

    const existing = this.store[index]
    if (existing.isDefault && data.isArchived) {
      throw new BusinessRuleError("Cannot archive a default category")
    }

    const updated = { ...existing, ...this.touch(data) } as Category
    this.store[index] = updated
    return updated
  }

  async delete(id: string): Promise<void> {
    const index = this.store.findIndex((c) => c.id === id)
    if (index === -1) throw new NotFoundError("Category", id)
    if (this.store[index].isDefault) {
      throw new BusinessRuleError("Cannot delete a default category")
    }
    this.store.splice(index, 1)
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    let filtered = [...this.store]
    if (filters?.workspaceId) filtered = filtered.filter((c) => c.workspaceId === filters.workspaceId)
    if (filters?.userId) filtered = filtered.filter((c) => c.userId === filters.userId)
    return filtered.length
  }

  async getByGroup(group: string): Promise<Category[]> {
    return this.store.filter((c) => c.group === group && !c.isArchived)
  }

  async getDefaults(): Promise<Category[]> {
    return this.store.filter((c) => c.isDefault && !c.isArchived)
  }
}
