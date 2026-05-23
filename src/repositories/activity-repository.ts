import { BaseRepository, type FindAllOptions } from "./base"
import type { ActivityLog, PaginatedResponse } from "@/types"
import { ActivityType } from "@/types"

export class ActivityRepository extends BaseRepository<ActivityLog> {
  protected entityName = "ActivityLog"

  private store: ActivityLog[] = []

  async findAll(options?: FindAllOptions): Promise<PaginatedResponse<ActivityLog>> {
    let filtered = [...this.store]

    if (options?.filters) {
      const { workspaceId, userId, type } = options.filters as Record<string, unknown>
      if (workspaceId) filtered = filtered.filter((a) => a.workspaceId === workspaceId)
      if (userId) filtered = filtered.filter((a) => a.userId === userId)
      if (type) filtered = filtered.filter((a) => a.type === type)
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return this.applyPagination(filtered, options?.pagination)
  }

  async findById(id: string): Promise<ActivityLog | null> {
    return this.store.find((a) => a.id === id) ?? null
  }

  async create(data: Partial<ActivityLog>): Promise<ActivityLog> {
    const log: ActivityLog = {
      id: this.generateId(),
      userId: data.userId!,
      type: data.type as ActivityType,
      metadata: data.metadata ?? {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.store.unshift(log)
    return log
  }

  async update(_id: string, _data: Partial<ActivityLog>): Promise<ActivityLog> {
    throw new Error("Activity logs cannot be updated")
  }

  async delete(_id: string): Promise<void> {
    throw new Error("Activity logs cannot be deleted")
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    let filtered = [...this.store]
    if (filters?.workspaceId) filtered = filtered.filter((a) => a.workspaceId === filters.workspaceId)
    return filtered.length
  }

  async getByWorkspace(workspaceId: string, limit = 20): Promise<ActivityLog[]> {
    return this.store
      .filter((a) => a.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  async getByUser(userId: string, limit = 20): Promise<ActivityLog[]> {
    return this.store
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }
}
