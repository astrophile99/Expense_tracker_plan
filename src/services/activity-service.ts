import { ActivityRepository } from "@/repositories"
import type { ActivityLog, ActivityType } from "@/types"
import type { CreateActivityLogInput } from "@/schemas/validation"

export class ActivityService {
  constructor(private repo: ActivityRepository) {}

  async log(input: CreateActivityLogInput): Promise<ActivityLog> {
    return this.repo.create({ ...input, type: input.type as ActivityType })
  }

  async getByWorkspace(workspaceId: string, limit = 20): Promise<ActivityLog[]> {
    return this.repo.getByWorkspace(workspaceId, limit)
  }

  async getByUser(userId: string, limit = 20): Promise<ActivityLog[]> {
    return this.repo.getByUser(userId, limit)
  }

  async list(filters: { workspaceId?: string; userId?: string; type?: string }, page = 1, limit = 20): Promise<{
    data: ActivityLog[]
    total: number
    page: number
    limit: number
  }> {
    const result = await this.repo.findAll({
      filters: filters as Record<string, unknown>,
      pagination: { page, limit },
    })

    return {
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    }
  }
}
